import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { removeThumbnailFile } from "./thumbnails.js";
import { startThumbnailWorker } from "./thumbnail-worker.js";
import { normaliseMediaRow, normaliseMediaRows, toBoundedByteNumber } from "./api-numbers.js";
import {
  CHUNK_SIZE,
  MAX_UPLOAD_BYTES,
  SESSION_TTL_MS,
  assembleSession,
  chunkCountFor,
  chunkPath,
  discardSessionFiles,
  sessionDir,
  startUploadSweeper
} from "./resumable-uploads.js";
import {
  AVATAR_SIZE,
  MAX_AVATAR_BYTES,
  MAX_PUBLIC_IMAGE_BYTES,
  detectImageType,
  makeAvatar,
  makeDisplayImage
} from "./images.js";
import { testDbConnection, pool } from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* SASA_ADMIN_V24 — avatars live on the same persistent volume as uploads, but
 * they are private family content and must never be readable without a
 * session. This block sits BEFORE the static mount, so /uploads/avatars/... is
 * a flat 404 no matter what path is requested; the only way to read an avatar
 * is GET /api/profiles/:id/avatar, which re-checks family membership. Order
 * matters here: express.static would otherwise happily serve the file. */
app.use("/uploads/avatars", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginal}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
});


const PORT = process.env.PORT || 4000;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is required");
  process.exit(1);
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:8081")
  .split(",")
  .map((origin) => origin.trim());

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

/* SASA_RATE_LIMIT_V20 — this API had no rate limiting on any route.
 *
 * That matters most for /api/child/login: a child PIN is four digits, so the
 * whole keyspace is 10,000 guesses and an unthrottled endpoint makes brute
 * forcing one trivial. Parent login and registration were equally open, and
 * set-kid-pin could be hammered as well.
 *
 * Two limiters: a strict one for anything that authenticates or changes a
 * credential, and a broad one for the rest of the API so a single client
 * cannot flood it. Limits are per-IP and deliberately generous enough that
 * ordinary family use never reaches them.
 */
/* SASA_ADMIN_V24 — the API sits behind the cluster's nginx ingress, which adds
 * X-Forwarded-For. Without trust proxy Express reports the ingress IP as the
 * client for every request, so express-rate-limit put the whole platform in a
 * single bucket: twenty sign-in attempts from anyone locked everyone out for
 * fifteen minutes. Observed exactly that while running the test suites.
 *
 * `1` trusts one hop - the value our own ingress appended - rather than the
 * whole header, so a client cannot spoof its address by sending its own
 * X-Forwarded-For. */
app.set("trust proxy", 1);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // The same generic wording the auth routes already use, so a throttled
  // attempt does not reveal anything a normal failure would not.
  message: { error: "Too many attempts. Try again in a few minutes." }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Slow down and try again shortly." }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: "Missing Authorization Bearer token"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
}

/* SASA_ADMIN_V24 — a valid signature is no longer enough.
 *
 * The JWT is stateless, so on its own it keeps working after an account is
 * suspended or its sessions are revoked. This re-reads the account on every
 * authenticated request and rejects the token when the account is suspended,
 * gone, or older than the account's tokens_valid_after watermark. It also
 * refreshes req.user.role from the database, so a role can never be taken from
 * the browser's copy of the token.
 */
async function loadAccount(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, email, role, status, tokens_valid_after FROM users WHERE id = $1 LIMIT 1`,
      [req.user.id]
    );

    const account = result.rows[0];

    if (!account) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (account.status === "suspended") {
      return res.status(403).json({ error: "This account is suspended." });
    }

    if (account.tokens_valid_after) {
      const issuedAt = req.user.iat ? new Date(req.user.iat * 1000) : null;

      if (!issuedAt || issuedAt <= new Date(account.tokens_valid_after)) {
        return res.status(401).json({ error: "Session ended. Sign in again." });
      }
    }

    req.account = account;
    req.user.role = account.role;
    next();
  } catch (error) {
    console.error("Account check error:", error);
    res.status(500).json({ error: "Unable to verify the session" });
  }
}

const requireSession = [requireAuth, loadAccount];

/** Administrator-only. Never satisfied by anything the browser sends. */
const requireAdmin = [
  requireAuth,
  loadAccount,
  (req, res, next) => {
    if (req.account?.role !== "admin") {
      // Same answer whether the caller is a guest, a child or a parent, so the
      // existence of admin endpoints is not confirmed to a non-admin.
      return res.status(403).json({ error: "Administrator access required" });
    }
    next();
  }
];

/** Append-only audit trail. Never called with a secret in `details`. */
async function recordAudit(req, action, targetType, targetId, details = {}) {
  try {
    await pool.query(
      `INSERT INTO admin_audit_log (actor_user_id, actor_email, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        req.account?.id ?? req.user?.id ?? null,
        req.account?.email ?? null,
        action,
        targetType,
        targetId ? String(targetId) : null,
        JSON.stringify(details || {})
      ]
    );
  } catch (error) {
    // Auditing must never take down the operation it is recording, but a
    // failure has to be visible in the logs.
    console.error("Audit log write failed:", action, error.message);
  }
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
}

async function askOllama(prompt) {
  const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false
    })
  });

  if (!ollamaResponse.ok) {
    const errorText = await ollamaResponse.text();
    throw new Error(`Ollama request failed: ${errorText}`);
  }

  const data = await ollamaResponse.json();
  return data.response;
}

app.use("/api", apiLimiter);

app.get("/api/health", async (req, res) => {
  try {
    const db = await testDbConnection();

    res.json({
      status: "ok",
      service: "saratube-backend-api",
      mode: "on-premise",
      database: {
        status: "ok",
        name: db.database,
        user: db.user
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "saratube-backend-api",
      mode: "on-premise",
      database: {
        status: "error",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});


app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const displayName = String(req.body?.displayName || "").trim();
    /* SASA_ADMIN_V24 — registration always creates a parent.
     *
     * This used to read the role straight from the request body and accept
     * "admin", so anyone who could reach the public registration endpoint
     * could make themselves an administrator by adding one field to the JSON.
     * The role is now fixed here and can only be changed server-side, which is
     * what the admin-authorization suite asserts. */
    const role = "parent";

    if (!email || !password || !displayName) {
      return res.status(400).json({
        error: "email, password, and displayName are required"
      });
    }

    if (role !== "parent") {
      return res.status(400).json({
        error: "Invalid role"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at`,
      [email, passwordHash, role]
    );

    const user = userResult.rows[0];

    await pool.query(
      `INSERT INTO profiles (user_id, display_name, is_parent)
       VALUES ($1, $2, $3)`,
      [user.id, displayName, role === "parent"]
    );

    const token = createToken(user);

    res.status(201).json({
      status: "ok",
      user,
      token
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    console.error("Register error:", error);
    res.status(500).json({
      error: "Register failed",
      details: error.message
    });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        error: "email and password are required"
      });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, role, status, created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    /* SASA_ADMIN_V24 — a suspended account cannot start a new session. The
     * password is verified first so this answer cannot be used to tell a
     * suspended account apart from a wrong password without knowing the
     * password in the first place. */
    if (user.status === "suspended") {
      return res.status(403).json({
        error: "This account is suspended. Contact an administrator."
      });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };

    const token = createToken(safeUser);

    res.json({
      status: "ok",
      user: safeUser,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details: error.message
    });
  }
});



app.get("/api/auth/me", ...requireSession, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json({
      status: "ok",
      user
    });
  } catch (error) {
    console.error("Auth me error:", error);
    res.status(500).json({
      error: "Failed to get current user",
      details: error.message
    });
  }
});



app.get("/api/parent/children", ...requireSession, async (req, res) => {
  try {
    if (req.user.role !== "parent" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Parent access required"
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         user_id,
         display_name,
         avatar_url,
         age,
         selected_theme,
         created_by_parent,
         child_login_id,
         /* SASA_CHILD_PIN_V20: an explicit boolean derived server-side from
            whether a usable bcrypt hash exists. The hash itself is never
            selected into the response — only this flag. The client used to
            guess from child_login_id, which every child has, so every child
            looked PIN-protected and a PIN-less child could never be opened. */
         (pin_hash IS NOT NULL AND length(trim(pin_hash)) > 0) AS has_pin,
         created_at
       FROM profiles
       WHERE created_by_parent = $1
         AND is_parent = false
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      status: "ok",
      children: result.rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        display_name: row.display_name,
        avatar_url: row.avatar_url,
        age: row.age,
        selected_theme: row.selected_theme,
        created_by_parent: row.created_by_parent,
        child_login_id: row.child_login_id,
        has_pin: row.has_pin === true,
        created_at: row.created_at
      }))
    });
  } catch (error) {
    console.error("Fetch children error:", error);
    res.status(500).json({
      error: "Failed to fetch children",
      details: error.message
    });
  }
});

app.post("/api/parent/children", ...requireSession, async (req, res) => {
  try {
    if (req.user.role !== "parent" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Parent access required"
      });
    }

    const displayName = String(req.body?.displayName || "").trim();
    const age = req.body?.age ? Number(req.body.age) : null;
    const selectedTheme = req.body?.selectedTheme || "rainbow";
    /* SASA_CHILD_CREATE_V22 — profiles.avatar_url already existed but nothing
     * could ever set it, so a parent had no way to choose how a child appears.
     * Accepted here and bounded: either an "emoji:<char>" preset or a relative
     * /uploads path. An absolute URL is refused so this cannot become a way to
     * point a profile picture at an arbitrary remote host. */
    const rawAvatar = req.body?.avatarUrl ? String(req.body.avatarUrl).trim() : "";
    const avatarUrl =
      rawAvatar && (/^emoji:.{1,8}$/u.test(rawAvatar) || /^\/uploads\/[\w.-]+$/.test(rawAvatar))
        ? rawAvatar
        : null;
    const childLoginId = req.body?.childLoginId
      ? String(req.body.childLoginId).trim().toLowerCase()
      : displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const pin = req.body?.pin ? String(req.body.pin) : null;

    if (pin && !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        error: "PIN must be 4 digits"
      });
    }

    const pinHash = pin
      ? await bcrypt.hash(pin, 12)
      : null;

    if (!displayName) {
      return res.status(400).json({
        error: "displayName is required"
      });
    }

    const childUserResult = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'child')
       RETURNING id, email, role, created_at`,
      [
        `${crypto.randomUUID()}@child.local`,
        pinHash || "child-login-disabled-for-now"
      ]
    );

    const childUser = childUserResult.rows[0];

    const profileResult = await pool.query(
      `INSERT INTO profiles
         (user_id, display_name, age, selected_theme, is_parent, created_by_parent, child_login_id, pin_hash, avatar_url)
       VALUES
         ($1, $2, $3, $4, false, $5, $6, $7, $8)
       RETURNING
         id,
         user_id,
         display_name,
         avatar_url,
         age,
         selected_theme,
         created_by_parent,
         child_login_id,
         created_at`,
      [
        childUser.id,
        displayName,
        age,
        selectedTheme,
        req.user.id,
        childLoginId,
        pinHash,
        avatarUrl
      ]
    );

    res.status(201).json({
      status: "ok",
      child: profileResult.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Child login ID already exists"
      });
    }

    console.error("Create child error:", error);
    res.status(500).json({
      error: "Failed to create child",
      details: error.message
    });
  }
});



/* SASA_CHILD_PIN_V20 — open a PIN-less child profile.
 *
 * A child with no PIN previously could not be opened at all: the only way in
 * was /api/child/login, which requires a PIN and returns a generic 401 when
 * pin_hash is null. This endpoint is the smallest secure alternative that
 * matches the existing model:
 *   - requireAuth, so it is never reachable by an unauthenticated caller
 *     holding only a public child login id;
 *   - the caller must be the parent (or admin) who created the profile, so
 *     one parent cannot open another family's child;
 *   - it refuses when the child DOES have a PIN, so setting a PIN cannot be
 *     side-stepped by a tampered client;
 *   - it returns exactly the same child payload as /api/child/login and
 *     grants no parent capability.
 */
app.post("/api/parent/children/:profileId/select", ...requireSession, async (req, res) => {
  try {
    if (req.user.role !== "parent" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Parent access required" });
    }

    const result = await pool.query(
      `SELECT
         p.id,
         p.user_id,
         p.display_name,
         p.avatar_url,
         p.age,
         p.selected_theme,
         p.child_login_id,
         p.created_by_parent,
         (p.pin_hash IS NOT NULL AND length(trim(p.pin_hash)) > 0) AS has_pin
       FROM profiles p
       WHERE p.id = $1
         AND p.is_parent = false
       LIMIT 1`,
      [req.params.profileId]
    );

    const child = result.rows[0];

    // Same generic answer whether the profile is missing or belongs to another
    // family, so this cannot be used to probe for profile ids.
    if (!child || child.created_by_parent !== req.user.id) {
      return res.status(404).json({ error: "Child profile not found" });
    }

    if (child.has_pin) {
      return res.status(409).json({
        error: "This profile is PIN protected. Enter the PIN to open it."
      });
    }

    const token = createToken({ id: child.user_id, email: null, role: "child" });

    res.json({
      status: "ok",
      token,
      child: {
        id: child.id,
        userId: child.user_id,
        name: child.display_name,
        avatarUrl: child.avatar_url,
        age: child.age,
        theme: child.selected_theme || "rainbow",
        childLoginId: child.child_login_id,
        parentId: child.created_by_parent
      }
    });
  } catch (error) {
    console.error("Child select error:", error);
    res.status(500).json({ error: "Unable to open child profile" });
  }
});

/* SASA_CHILD_PIN_V20 — set / change / reset a child PIN.
 *
 * The frontend has always called this path; it did not exist on this backend,
 * so PIN change and reset silently 404'd. Storage matches how POST
 * /api/parent/children already creates a PIN: bcrypt, cost 12. Sending an
 * empty pin clears it, which is the reset case.
 */
app.post("/api/auth/set-kid-pin", authLimiter, ...requireSession, async (req, res) => {
  try {
    if (req.user.role !== "parent" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Parent access required" });
    }

    const childId = String(req.body?.child_id || req.body?.childId || "").trim();
    const rawPin = req.body?.pin === null || req.body?.pin === undefined
      ? ""
      : String(req.body.pin).trim();

    if (!childId) {
      return res.status(400).json({ error: "child_id is required" });
    }

    if (rawPin && !/^\d{4}$/.test(rawPin)) {
      return res.status(400).json({ error: "PIN must be 4 digits" });
    }

    const owned = await pool.query(
      `SELECT id, created_by_parent
         FROM profiles
        WHERE id = $1 AND is_parent = false
        LIMIT 1`,
      [childId]
    );

    const child = owned.rows[0];

    if (!child || child.created_by_parent !== req.user.id) {
      return res.status(404).json({ error: "Child profile not found" });
    }

    const pinHash = rawPin ? await bcrypt.hash(rawPin, 12) : null;

    await pool.query(`UPDATE profiles SET pin_hash = $2 WHERE id = $1`, [childId, pinHash]);

    res.json({ status: "ok", has_pin: Boolean(pinHash) });
  } catch (error) {
    console.error("Set kid PIN error:", error);
    res.status(500).json({ error: "Unable to update the child PIN" });
  }
});

/* =====================================================================
   SASA_ADMIN_V24 — administrator API
   Every route below is behind requireAdmin, which re-reads the account from
   the database on each request. A role from the browser's token is never
   trusted, and a suspended or session-revoked admin is rejected like anyone
   else. Sensitive actions are rate limited and written to admin_audit_log.
   No password, PIN or hash is selected into any response.
   ===================================================================== */

const adminWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many administrative changes. Try again shortly." }
});

/** Refuses to leave the platform with no usable administrator. */
async function otherActiveAdminCount(excludeUserId) {
  const result = await pool.query(
    `SELECT count(*)::int AS n FROM users
      WHERE role = 'admin' AND status = 'active' AND id <> $1`,
    [excludeUserId]
  );
  return result.rows[0].n;
}

app.get("/api/admin/overview", ...requireAdmin, async (req, res) => {
  try {
    const [parents, children, media, uploads, actions] = await Promise.all([
      pool.query(`SELECT status, count(*)::int AS n FROM users WHERE role = 'parent' GROUP BY status`),
      pool.query(`SELECT count(*)::int AS n FROM profiles WHERE is_parent = false`),
      pool.query(
        `SELECT media_type, visibility, publication_status, count(*)::int AS n
           FROM media_files GROUP BY 1,2,3`
      ),
      pool.query(
        `SELECT id, title, media_type, visibility, publication_status, created_at
           FROM media_files ORDER BY created_at DESC LIMIT 5`
      ),
      pool.query(
        `SELECT id, actor_email, action, target_type, target_id, created_at
           FROM admin_audit_log ORDER BY created_at DESC LIMIT 5`
      )
    ]);

    const byStatus = Object.fromEntries(parents.rows.map((r) => [r.status, r.n]));
    const pick = (type, vis, pub) =>
      media.rows
        .filter((r) => (!type || r.media_type === type) && (!vis || r.visibility === vis) && (!pub || r.publication_status === pub))
        .reduce((sum, r) => sum + r.n, 0);

    res.json({
      status: "ok",
      stats: {
        parentsActive: byStatus.active || 0,
        parentsSuspended: byStatus.suspended || 0,
        children: children.rows[0].n,
        publicVideosPublished: pick("video", "public", "published"),
        publicPhotosPublished: pick("photo", "public", "published"),
        publicDrafts: pick(null, "public", "draft"),
        privateFamilyMedia: pick(null, "private", null)
      },
      recentUploads: uploads.rows,
      recentActions: actions.rows
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ error: "Unable to load the overview" });
  }
});

app.get("/api/admin/parents", ...requireAdmin, async (req, res) => {
  try {
    const search = String(req.query.search || "").trim().toLowerCase();
    const statusFilter = String(req.query.status || "").trim();
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const where = [`u.role = 'parent'`];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      where.push(`lower(u.email) LIKE $${params.length}`);
    }

    if (statusFilter === "active" || statusFilter === "suspended") {
      params.push(statusFilter);
      where.push(`u.status = $${params.length}`);
    }

    const totalResult = await pool.query(
      `SELECT count(*)::int AS n FROM users u WHERE ${where.join(" AND ")}`,
      params
    );

    params.push(limit, offset);

    const rows = await pool.query(
      `SELECT
         u.id, u.email, u.status, u.created_at, u.suspended_at,
         (SELECT count(*)::int FROM profiles p
           WHERE p.created_by_parent = u.id AND p.is_parent = false) AS child_count,
         (SELECT count(*)::int FROM media_files m WHERE m.owner_user_id = u.id) AS media_count
       FROM users u
      WHERE ${where.join(" AND ")}
      ORDER BY u.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ status: "ok", total: totalResult.rows[0].n, parents: rows.rows, limit, offset });
  } catch (error) {
    console.error("Admin parents error:", error);
    res.status(500).json({ error: "Unable to list parent accounts" });
  }
});

app.get("/api/admin/parents/:id", ...requireAdmin, async (req, res) => {
  try {
    const account = await pool.query(
      `SELECT id, email, role, status, created_at, suspended_at, tokens_valid_after
         FROM users WHERE id = $1 AND role = 'parent' LIMIT 1`,
      [req.params.id]
    );

    if (!account.rows[0]) return res.status(404).json({ error: "Parent account not found" });

    // has_pin only. The hash is never selected, so it cannot be returned.
    const children = await pool.query(
      `SELECT id, display_name, age, child_login_id, avatar_url, created_at,
              (pin_hash IS NOT NULL AND length(trim(pin_hash)) > 0) AS has_pin
         FROM profiles
        WHERE created_by_parent = $1 AND is_parent = false
        ORDER BY created_at DESC`,
      [req.params.id]
    );

    const media = await pool.query(
      `SELECT count(*)::int AS n, coalesce(sum(size_bytes), 0)::bigint AS bytes
         FROM media_files WHERE owner_user_id = $1`,
      [req.params.id]
    );

    const audit = await pool.query(
      `SELECT id, actor_email, action, created_at, details
         FROM admin_audit_log
        WHERE target_type = 'parent' AND target_id = $1
        ORDER BY created_at DESC LIMIT 20`,
      [req.params.id]
    );

    res.json({
      status: "ok",
      parent: account.rows[0],
      children: children.rows,
      media: { count: media.rows[0].n, bytes: Number(media.rows[0].bytes) },
      audit: audit.rows
    });
  } catch (error) {
    console.error("Admin parent detail error:", error);
    res.status(500).json({ error: "Unable to load the account" });
  }
});

app.post("/api/admin/parents/:id/status", adminWriteLimiter, ...requireAdmin, async (req, res) => {
  try {
    const next = String(req.body?.status || "").trim();

    if (next !== "active" && next !== "suspended") {
      return res.status(400).json({ error: "status must be 'active' or 'suspended'" });
    }

    const target = await pool.query(
      `SELECT id, email, role, status FROM users WHERE id = $1 LIMIT 1`,
      [req.params.id]
    );

    const account = target.rows[0];

    if (!account) return res.status(404).json({ error: "Account not found" });

    // Never leave the platform without a way back in.
    if (account.role === "admin" && next === "suspended") {
      if ((await otherActiveAdminCount(account.id)) === 0) {
        return res.status(409).json({ error: "This is the last active administrator." });
      }
    }

    if (next === "suspended") {
      /* Suspending also moves the token watermark forward, so sessions the
       * account already holds stop working immediately rather than lasting
       * until the JWT expires. A child of a suspended parent keeps their
       * current session but cannot start a new one, because child sign-in
       * runs through the parent's family. */
      await pool.query(
        `UPDATE users SET status = 'suspended', suspended_at = now(), suspended_by = $2,
                          tokens_valid_after = now()
          WHERE id = $1`,
        [account.id, req.account.id]
      );
    } else {
      await pool.query(
        `UPDATE users SET status = 'active', suspended_at = NULL, suspended_by = NULL WHERE id = $1`,
        [account.id]
      );
    }

    await recordAudit(req, next === "suspended" ? "parent.suspend" : "parent.restore", "parent", account.id, {
      email: account.email,
      from: account.status,
      to: next
    });

    res.json({ status: "ok", accountStatus: next });
  } catch (error) {
    console.error("Admin status error:", error);
    res.status(500).json({ error: "Unable to change the account status" });
  }
});

app.post("/api/admin/parents/:id/revoke-sessions", adminWriteLimiter, ...requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users SET tokens_valid_after = now() WHERE id = $1 RETURNING id, email`,
      [req.params.id]
    );

    if (!result.rows[0]) return res.status(404).json({ error: "Account not found" });

    await recordAudit(req, "parent.revoke_sessions", "parent", req.params.id, {
      email: result.rows[0].email
    });

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Admin revoke error:", error);
    res.status(500).json({ error: "Unable to revoke sessions" });
  }
});

app.get("/api/admin/audit", ...requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const total = await pool.query(`SELECT count(*)::int AS n FROM admin_audit_log`);
    const rows = await pool.query(
      `SELECT id, actor_email, action, target_type, target_id, details, created_at
         FROM admin_audit_log ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ status: "ok", total: total.rows[0].n, entries: rows.rows, limit, offset });
  } catch (error) {
    console.error("Admin audit error:", error);
    res.status(500).json({ error: "Unable to load the audit log" });
  }
});

/* =====================================================================
   SASA_ADMIN_V24 — public media library
   Separate from private family media by the `visibility` column. Nothing is
   visible to a guest until an administrator publishes it, and new uploads are
   always created as public/draft, never published implicitly.
   ===================================================================== */

/** Guest feed. No authentication, and deliberately narrow. */
app.get("/api/public/media", async (req, res) => {
  try {
    const type = String(req.query.type || "").trim();
    const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 30));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const params = [];
    let typeClause = "";

    if (type === "video" || type === "photo") {
      params.push(type);
      typeClause = ` AND media_type = $${params.length}`;
    }

    params.push(limit, offset);

    /* The visibility/publication pair is the whole access rule, and the two
     * columns are filtered here rather than anywhere in the client. Private
     * family media and drafts can never match. owner_user_id is deliberately
     * not selected: a guest has no business learning which administrator
     * uploaded an item. */
    const rows = await pool.query(
      `SELECT id, media_type, title, description, category, public_url, thumbnail_url,
              is_featured, published_at, created_at
         FROM media_files
        WHERE visibility = 'public' AND publication_status = 'published'${typeClause}
        ORDER BY is_featured DESC, sort_order ASC, published_at DESC NULLS LAST, created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ status: "ok", media: normaliseMediaRows(rows.rows) });
  } catch (error) {
    console.error("Public media error:", error);
    res.status(500).json({ error: "Unable to load public media" });
  }
});

/** Admin listing: every public item, including drafts. */
app.get("/api/admin/public-media", ...requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const total = await pool.query(
      `SELECT count(*)::int AS n FROM media_files WHERE visibility = 'public'`
    );

    const rows = await pool.query(
      `SELECT id, media_type, title, description, category, public_url, thumbnail_url,
              publication_status, is_featured, sort_order, size_bytes, mime_type,
              owner_user_id, published_at, created_at, updated_at,
              thumbnail_status, thumbnail_attempts, thumbnail_error
         FROM media_files
        WHERE visibility = 'public'
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      status: "ok",
      total: total.rows[0].n,
      media: normaliseMediaRows(rows.rows),
      limit,
      offset
    });
  } catch (error) {
    console.error("Admin public media error:", error);
    res.status(500).json({ error: "Unable to list public media" });
  }
});

app.post(
  "/api/admin/public-media",
  adminWriteLimiter,
  ...requireAdmin,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ status: "error", message: "No file uploaded" });

    const cleanup = async () => {
      try { await fs.promises.unlink(req.file.path); } catch { /* already gone */ }
    };

    try {
      const declaredType = String(req.file.mimetype || "");
      const isVideo = declaredType.startsWith("video/");

      /* Real file inspection, not the extension or the client's Content-Type.
       * For images the magic bytes decide; SVG and anything executable simply
       * has no matching signature and is rejected here. */
      if (!isVideo) {
        const realType = await detectImageType(req.file.path);

        if (!realType) {
          await cleanup();
          return res.status(400).json({
            status: "error",
            message: "That file is not a supported image (JPEG, PNG or WebP)."
          });
        }

        if (req.file.size > MAX_PUBLIC_IMAGE_BYTES) {
          await cleanup();
          return res.status(400).json({ status: "error", message: "That image is too large." });
        }
      }

      const title = String(req.body.title || req.file.originalname || "Untitled").slice(0, 200);
      const description = req.body.description ? String(req.body.description).slice(0, 2000) : null;
      const category = String(req.body.category || "general").slice(0, 80);

      let publicUrl = `/uploads/${req.file.filename}`;
      let thumbnailUrl = null;

      /* SASA_ASYNC_THUMBNAILS_V27 — a video's thumbnail is NOT generated here.
       * ffmpeg can take ~165s worst case (see thumbnails.js) and Cloudflare
       * cuts a proxied request at ~100s, so awaiting it answered the admin
       * HTTP 520 for exactly the large videos most worth uploading. The row is
       * committed as 'pending' and thumbnail-worker.js picks it up: the queue
       * is the table, so it survives a pod restart and two replicas cannot
       * claim the same row. A photo's display image is bounded and quick, so
       * it stays inline. */
      const thumbnailStatus = isVideo ? "pending" : "ready";

      if (!isVideo) {
        // Re-encoded, bounded and stripped of EXIF/GPS before it is ever served.
        const displayName = `${path.parse(req.file.filename).name}.display.webp`;
        const display = await makeDisplayImage({
          sourcePath: req.file.path,
          outputDir: UPLOAD_DIR,
          outputName: displayName
        });
        publicUrl = `/uploads/${path.basename(display.filePath)}`;
        thumbnailUrl = publicUrl;
      }

      const result = await pool.query(
        `INSERT INTO media_files
           (owner_user_id, media_type, title, description, category, file_path, public_url,
            thumbnail_url, original_filename, mime_type, size_bytes, visibility, publication_status,
            thumbnail_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'public','draft',$12)
         RETURNING *`,
        [
          req.account.id,
          isVideo ? "video" : "photo",
          title,
          description,
          category,
          req.file.path,
          publicUrl,
          thumbnailUrl,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          thumbnailStatus
        ]
      );

      await recordAudit(req, "public_media.upload", "media", result.rows[0].id, {
        title,
        media_type: isVideo ? "video" : "photo"
      });

      res.status(201).json({ status: "ok", media: normaliseMediaRow(result.rows[0]) });
    } catch (error) {
      console.error("Public media upload error:", error);
      await cleanup();
      res.status(500).json({ status: "error", message: "Upload failed" });
    }
  }
);

/* SASA_RESUMABLE_UPLOADS_V28 — chunked upload endpoints.
 *
 * Every one is behind requireAdmin (which re-reads role and status from the
 * database on each call, so a suspended or demoted admin loses access
 * mid-upload) and every one re-checks that the session belongs to the caller.
 * Ownership is not established once at session creation and then trusted. */

/** Raw-body parser for one chunk. Bounded so a lying Content-Length cannot
 *  make the pod allocate without limit. */
const chunkBody = express.raw({
  type: "application/octet-stream",
  limit: CHUNK_SIZE + 1024,
});

/** Loads the caller's own open session, or answers and returns null. */
async function loadOwnSession(req, res, { allowStatuses = ["open"] } = {}) {
  const id = String(req.params.id || "");

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    res.status(400).json({ status: "error", message: "Invalid session id" });
    return null;
  }

  const { rows } = await pool.query(`SELECT * FROM upload_sessions WHERE id = $1`, [id]);
  const session = rows[0];

  // Same answer for "not yours" and "does not exist", so one admin cannot
  // probe for another's session ids.
  if (!session || session.owner_user_id !== req.account.id) {
    res.status(404).json({ status: "error", message: "Upload session not found" });
    return null;
  }

  if (!allowStatuses.includes(session.status)) {
    res.status(409).json({ status: "error", message: `Session is ${session.status}` });
    return null;
  }

  return session;
}

/** Opens a session. The client declares size and type; both are enforced. */
app.post("/api/admin/uploads/session", adminWriteLimiter, ...requireAdmin, async (req, res) => {
  try {
    const totalBytes = Number(req.body?.totalBytes);
    const mimeType = String(req.body?.mimeType || "");
    const originalFilename = String(req.body?.filename || "video.mp4").slice(0, 255);

    if (!Number.isFinite(totalBytes) || totalBytes <= 0) {
      return res.status(400).json({ status: "error", message: "A positive totalBytes is required" });
    }

    if (totalBytes > MAX_UPLOAD_BYTES) {
      return res.status(413).json({
        status: "error",
        message: `That video is larger than the ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))}MB limit.`
      });
    }

    // Resumable upload exists for video. A photo is small enough for the
    // simple path and is validated by magic bytes there.
    if (!mimeType.startsWith("video/")) {
      return res.status(400).json({ status: "error", message: "Only videos use resumable upload" });
    }

    const totalChunks = chunkCountFor(totalBytes);
    const { rows } = await pool.query(
      `INSERT INTO upload_sessions
         (owner_user_id, original_filename, mime_type, total_bytes, chunk_size, total_chunks,
          title, category, temp_dir, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now() + ($10::bigint * interval '1 millisecond'))
       RETURNING id, chunk_size, total_chunks, total_bytes, expires_at`,
      [
        req.account.id,
        originalFilename,
        mimeType,
        totalBytes,
        CHUNK_SIZE,
        totalChunks,
        String(req.body?.title || "").slice(0, 200) || null,
        String(req.body?.category || "general").slice(0, 80),
        "", // filled below; the directory name derives from the generated id
        SESSION_TTL_MS
      ]
    );

    const session = rows[0];
    const dir = sessionDir(UPLOAD_DIR, session.id);
    await fs.promises.mkdir(dir, { recursive: true });
    await pool.query(`UPDATE upload_sessions SET temp_dir = $2 WHERE id = $1`, [session.id, dir]);

    await recordAudit(req, "upload_session.open", "upload_session", session.id, {
      filename: originalFilename,
      total_bytes: totalBytes
    });

    res.status(201).json({
      status: "ok",
      session: {
        id: session.id,
        chunkSize: toBoundedByteNumber(session.chunk_size, "session.chunk_size"),
        totalChunks: session.total_chunks,
        totalBytes: toBoundedByteNumber(session.total_bytes, "session.total_bytes"),
        uploadedBytes: 0,
        receivedChunks: [],
        expiresAt: session.expires_at
      }
    });
  } catch (error) {
    console.error("Upload session create error:", error);
    res.status(500).json({ status: "error", message: "Could not start the upload" });
  }
});

/** Which chunks the server already holds — the basis for resuming. */
app.get("/api/admin/uploads/session/:id", ...requireAdmin, async (req, res) => {
  try {
    const session = await loadOwnSession(req, res, {
      allowStatuses: ["open", "assembling", "completed"]
    });
    if (!session) return;

    const { rows } = await pool.query(
      `SELECT chunk_index, size_bytes FROM upload_session_chunks
        WHERE session_id = $1 ORDER BY chunk_index`,
      [session.id]
    );

    const { rows: totals } = await pool.query(
      `SELECT coalesce(sum(size_bytes), 0)::bigint AS uploaded
         FROM upload_session_chunks WHERE session_id = $1`,
      [session.id]
    );

    res.json({
      status: "ok",
      session: {
        id: session.id,
        status: session.status,
        chunkSize: toBoundedByteNumber(session.chunk_size, "session.chunk_size"),
        totalChunks: session.total_chunks,
        totalBytes: toBoundedByteNumber(session.total_bytes, "session.total_bytes"),
        uploadedBytes: toBoundedByteNumber(totals[0].uploaded, "session.uploaded_bytes"),
        receivedChunks: rows.map((r) => r.chunk_index),
        mediaId: session.media_id
      }
    });
  } catch (error) {
    console.error("Upload session read error:", error);
    res.status(500).json({ status: "error", message: "Could not read the upload" });
  }
});

/** Stores one chunk. Idempotent: re-sending an index overwrites it. */
app.put(
  "/api/admin/uploads/session/:id/chunk/:index",
  ...requireAdmin,
  chunkBody,
  async (req, res) => {
    try {
      const session = await loadOwnSession(req, res);
      if (!session) return;

      const index = Number(req.params.index);
      if (!Number.isInteger(index) || index < 0 || index >= session.total_chunks) {
        return res.status(400).json({ status: "error", message: "Chunk index out of range" });
      }

      const body = Buffer.isBuffer(req.body) ? req.body : null;
      if (!body || body.length === 0) {
        return res.status(400).json({ status: "error", message: "Empty chunk" });
      }

      // Every chunk but the last must be exactly chunk_size; the last is
      // whatever remains. Anything else means the client is not sending the
      // file it declared.
      const isLast = index === session.total_chunks - 1;
      const expected = isLast
        ? Number(session.total_bytes) - index * session.chunk_size
        : session.chunk_size;

      if (body.length !== expected) {
        return res.status(400).json({
          status: "error",
          message: `Chunk ${index} should be ${expected} bytes, received ${body.length}`
        });
      }

      // Path is built from the session UUID and the integer index only.
      const target = chunkPath(UPLOAD_DIR, session.id, index);
      await fs.promises.writeFile(target, body);

      await pool.query(
        `INSERT INTO upload_session_chunks (session_id, chunk_index, size_bytes)
         VALUES ($1,$2,$3)
         ON CONFLICT (session_id, chunk_index)
         DO UPDATE SET size_bytes = EXCLUDED.size_bytes, received_at = now()`,
        [session.id, index, body.length]
      );

      const { rows } = await pool.query(
        `UPDATE upload_sessions SET updated_at = now() WHERE id = $1
         RETURNING
           (SELECT count(*)::int FROM upload_session_chunks WHERE session_id = $1) AS received,
           (SELECT coalesce(sum(size_bytes), 0)::bigint FROM upload_session_chunks
             WHERE session_id = $1) AS uploaded`,
        [session.id]
      );

      res.json({
        status: "ok",
        chunkIndex: index,
        received: rows[0].received,
        totalChunks: session.total_chunks,
        uploadedBytes: toBoundedByteNumber(rows[0].uploaded, "session.uploaded_bytes"),
        totalBytes: toBoundedByteNumber(session.total_bytes, "session.total_bytes")
      });
    } catch (error) {
      console.error("Upload chunk error:", error);
      res.status(500).json({ status: "error", message: "Could not store the chunk" });
    }
  }
);

/** Assembles, validates and creates the draft media row. */
app.post(
  "/api/admin/uploads/session/:id/complete",
  adminWriteLimiter,
  ...requireAdmin,
  async (req, res) => {
    let session = await loadOwnSession(req, res);
    if (!session) return;

    // Claim the session so a duplicate complete cannot assemble twice.
    const claim = await pool.query(
      `UPDATE upload_sessions SET status = 'assembling', updated_at = now()
        WHERE id = $1 AND status = 'open' RETURNING id`,
      [session.id]
    );

    if (!claim.rows[0]) {
      return res.status(409).json({ status: "error", message: "Upload is already being finished" });
    }

    try {
      const assembled = await assembleSession(pool, UPLOAD_DIR, session);

      const title = String(req.body?.title || session.title || session.original_filename).slice(0, 200);
      const category = String(req.body?.category || session.category || "general").slice(0, 80);

      /* Draft and private-by-default like every other upload, and the
       * thumbnail is queued rather than extracted here. Nothing is published
       * by assembling a file. */
      const media = await pool.query(
        `INSERT INTO media_files
           (owner_user_id, media_type, title, description, category, file_path, public_url,
            thumbnail_url, original_filename, mime_type, size_bytes, visibility,
            publication_status, thumbnail_status)
         VALUES ($1,'video',$2,$3,$4,$5,$6,NULL,$7,$8,$9,'public','draft','pending')
         RETURNING *`,
        [
          req.account.id,
          title,
          String(req.body?.description || "").slice(0, 2000) || null,
          category,
          assembled.filePath,
          `/uploads/${assembled.storedName}`,
          session.original_filename,
          session.mime_type,
          assembled.sizeBytes
        ]
      );

      await pool.query(
        `UPDATE upload_sessions SET status = 'completed', media_id = $2, updated_at = now()
          WHERE id = $1`,
        [session.id, media.rows[0].id]
      );

      await recordAudit(req, "upload_session.complete", "media", media.rows[0].id, {
        title,
        size_bytes: assembled.sizeBytes,
        session_id: session.id
      });

      res.status(201).json({ status: "ok", media: normaliseMediaRow(media.rows[0]) });
    } catch (error) {
      // An incomplete or corrupt upload stays open so the admin can send the
      // missing chunks and finish, rather than losing what already arrived.
      await pool.query(
        `UPDATE upload_sessions SET status = 'open', error = $2, updated_at = now() WHERE id = $1`,
        [session.id, String(error.message).slice(0, 500)]
      );
      console.error("Upload assemble error:", error.message);
      res.status(400).json({ status: "error", message: error.message });
    }
  }
);

/** Abandons a session and removes its chunks immediately. */
app.delete("/api/admin/uploads/session/:id", adminWriteLimiter, ...requireAdmin, async (req, res) => {
  try {
    const session = await loadOwnSession(req, res, { allowStatuses: ["open", "assembling"] });
    if (!session) return;

    await pool.query(`UPDATE upload_sessions SET status = 'aborted', updated_at = now() WHERE id = $1`, [
      session.id
    ]);
    await discardSessionFiles(UPLOAD_DIR, session.id);
    await recordAudit(req, "upload_session.abort", "upload_session", session.id, {});

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Upload session abort error:", error);
    res.status(500).json({ status: "error", message: "Could not cancel the upload" });
  }
});

/* SASA_ASYNC_THUMBNAILS_V27 — retry a thumbnail an admin can see has failed.
 * Re-queues rather than generating inline, so the retry answers immediately
 * and goes through the same single-claim worker path as a fresh upload. */
app.post(
  "/api/admin/public-media/:id/thumbnail/retry",
  adminWriteLimiter,
  ...requireAdmin,
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        `UPDATE media_files
            SET thumbnail_status = 'pending',
                thumbnail_attempts = 0,
                thumbnail_error = NULL,
                thumbnail_locked_at = NULL,
                thumbnail_locked_by = NULL,
                thumbnail_next_attempt_at = NULL,
                updated_at = now()
          WHERE id = $1
            AND media_type = 'video'
      RETURNING id, title, thumbnail_status`,
        [req.params.id]
      );

      if (!rows[0]) {
        return res.status(404).json({ status: "error", message: "Video not found" });
      }

      await recordAudit(req, "public_media.thumbnail_retry", "media", rows[0].id, {
        title: rows[0].title
      });

      res.json({ status: "ok", media: rows[0] });
    } catch (error) {
      console.error("Thumbnail retry error:", error);
      res.status(500).json({ status: "error", message: "Unable to retry" });
    }
  }
);

app.patch("/api/admin/public-media/:id", adminWriteLimiter, ...requireAdmin, async (req, res) => {
  try {
    const fields = [];
    const params = [req.params.id];
    const audit = {};

    const push = (column, value) => {
      params.push(value);
      fields.push(`${column} = $${params.length}`);
    };

    if (typeof req.body.title === "string") { push("title", req.body.title.slice(0, 200)); audit.title = true; }
    if (typeof req.body.description === "string") { push("description", req.body.description.slice(0, 2000)); audit.description = true; }
    if (typeof req.body.category === "string") { push("category", req.body.category.slice(0, 80)); audit.category = true; }
    if (typeof req.body.is_featured === "boolean") { push("is_featured", req.body.is_featured); audit.is_featured = req.body.is_featured; }
    if (Number.isInteger(req.body.sort_order)) { push("sort_order", req.body.sort_order); }

    if (req.body.publication_status === "published" || req.body.publication_status === "draft") {
      push("publication_status", req.body.publication_status);
      push("published_at", req.body.publication_status === "published" ? new Date() : null);
      audit.publication_status = req.body.publication_status;
    }

    if (!fields.length) return res.status(400).json({ error: "Nothing to update" });

    // Scoped to visibility='public' so this can never be used to reach into
    // a family's private media.
    const result = await pool.query(
      `UPDATE media_files SET ${fields.join(", ")}, updated_at = now()
        WHERE id = $1 AND visibility = 'public'
        RETURNING *`,
      params
    );

    if (!result.rows[0]) return res.status(404).json({ error: "Public media not found" });

    await recordAudit(req, "public_media.update", "media", req.params.id, audit);

    res.json({ status: "ok", media: result.rows[0] });
  } catch (error) {
    console.error("Public media update error:", error);
    res.status(500).json({ error: "Unable to update the item" });
  }
});

app.delete("/api/admin/public-media/:id", adminWriteLimiter, ...requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM media_files WHERE id = $1 AND visibility = 'public'
       RETURNING title, thumbnail_url, public_url, file_path`,
      [req.params.id]
    );

    const row = result.rows[0];

    if (!row) return res.status(404).json({ error: "Public media not found" });

    await removeThumbnailFile(UPLOAD_DIR, row.thumbnail_url);

    for (const candidate of [row.public_url, row.file_path]) {
      if (!candidate) continue;
      try {
        await fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(String(candidate))));
      } catch { /* already gone */ }
    }

    await recordAudit(req, "public_media.delete", "media", req.params.id, { title: row.title });

    res.json({ status: "ok" });
  } catch (error) {
    console.error("Public media delete error:", error);
    res.status(500).json({ error: "Unable to delete the item" });
  }
});

/* =====================================================================
   SASA_ADMIN_V24 — child avatars
   A child may change only their own avatar, and an uploaded avatar is private
   family content: it is stored outside the public /uploads mount and served
   only through an authorised route. It can never become guest content, and
   this endpoint cannot be used as a general media upload - the output is a
   fixed 512x512 WebP with all metadata removed, and nothing is written to
   media_files.
   ===================================================================== */

const AVATAR_DIR = process.env.AVATAR_DIR || path.join(UPLOAD_DIR, "avatars");
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
    filename: (_req, _file, cb) => cb(null, `${crypto.randomUUID()}.upload`)
  }),
  limits: { fileSize: MAX_AVATAR_BYTES }
});

const avatarLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many avatar changes. Try again in a few minutes." }
});

/**
 * May `req` change this profile's avatar?
 * A parent may manage any child they created. A child may change only their
 * own profile. Nobody else, including another family's parent.
 */
/* SASA_CHILD_MEDIA_AUTH_V25 — one place that answers "may this session act on
 * this child profile?".
 *
 * A child may act only on their own profile, a parent only on children they
 * created, an administrator on any. Everyone else gets the same answer as a
 * profile that does not exist, so an unauthorised caller cannot tell a real
 * child id from a made-up one by probing.
 */
async function resolveChildAccess(req, profileId) {
  // A malformed id must not reach Postgres as a uuid cast error, which would
  // answer 500 and thereby distinguish "bad id" from "not yours".
  if (!/^[0-9a-fA-F-]{36}$/.test(String(profileId || ""))) {
    return { allowed: false };
  }

  const result = await pool.query(
    `SELECT id, user_id, created_by_parent, avatar_url, display_name
       FROM profiles WHERE id = $1 AND is_parent = false LIMIT 1`,
    [profileId]
  );

  const profile = result.rows[0];

  if (!profile) return { allowed: false };

  const role = req.account?.role;

  if (role === "admin") return { allowed: true, profile };
  if (role === "parent" && profile.created_by_parent === req.account.id) {
    return { allowed: true, profile };
  }
  if (role === "child" && profile.user_id === req.account.id) {
    return { allowed: true, profile };
  }

  return { allowed: false, profile };
}

async function canManageAvatar(req, profileId) {
  return resolveChildAccess(req, profileId);
}

app.post(
  "/api/profiles/:id/avatar",
  avatarLimiter,
  ...requireSession,
  avatarUpload.single("file"),
  async (req, res) => {
    const cleanup = async (target) => {
      if (!target) return;
      try { await fs.promises.unlink(target); } catch { /* already gone */ }
    };

    try {
      const check = await canManageAvatar(req, req.params.id);

      if (!check.allowed) {
        await cleanup(req.file?.path);
        // Same answer for "not yours" and "does not exist", so profile ids
        // cannot be probed.
        return res.status(404).json({ error: "Profile not found" });
      }

      // A preset needs no file at all.
      const preset = req.body?.avatarUrl ? String(req.body.avatarUrl).trim() : "";

      if (!req.file && /^emoji:.{1,8}$/u.test(preset)) {
        const previous = check.profile.avatar_url;

        await pool.query(
          `UPDATE profiles SET avatar_url = $2, avatar_updated_at = now() WHERE id = $1`,
          [req.params.id, preset]
        );

        if (previous && previous.startsWith("/avatars/")) {
          await cleanup(path.join(AVATAR_DIR, path.basename(previous)));
        }

        return res.json({ status: "ok", avatar_url: preset });
      }

      if (!req.file) return res.status(400).json({ error: "No image uploaded" });

      /* Real signature check. A .jpg holding SVG or a script has no matching
       * magic bytes and stops here, before ffmpeg is ever invoked. */
      const realType = await detectImageType(req.file.path);

      if (!realType) {
        await cleanup(req.file.path);
        return res.status(400).json({
          error: "That file is not a supported image. Use a JPEG, PNG or WebP photo."
        });
      }

      let crop = null;
      if (req.body?.crop) {
        try { crop = JSON.parse(req.body.crop); } catch { crop = null; }
      }

      const outputName = `${crypto.randomUUID()}.webp`;

      let processed;
      try {
        processed = await makeAvatar({
          sourcePath: req.file.path,
          outputDir: AVATAR_DIR,
          outputName,
          crop
        });
      } catch (processError) {
        console.error("Avatar processing failed:", processError.message);
        await cleanup(req.file.path);
        // The previous avatar is untouched, because nothing was written yet.
        return res.status(400).json({ error: "That photo could not be processed." });
      }

      const avatarUrl = `/avatars/${outputName}`;
      const previous = check.profile.avatar_url;

      try {
        await pool.query(
          `UPDATE profiles SET avatar_url = $2, avatar_updated_at = now() WHERE id = $1`,
          [req.params.id, avatarUrl]
        );
      } catch (dbError) {
        // Database write failed: discard the new file and keep the old avatar.
        console.error("Avatar db update failed:", dbError.message);
        await cleanup(processed.filePath);
        await cleanup(req.file.path);
        return res.status(500).json({ error: "Could not save the new avatar." });
      }

      await cleanup(req.file.path);

      // Only now that the replacement is committed is the old one removed.
      if (previous && previous.startsWith("/avatars/")) {
        await cleanup(path.join(AVATAR_DIR, path.basename(previous)));
      }

      res.json({ status: "ok", avatar_url: avatarUrl, bytes: processed.bytes, size: AVATAR_SIZE });
    } catch (error) {
      console.error("Avatar upload error:", error);
      await cleanup(req.file?.path);
      res.status(500).json({ error: "Unable to update the avatar" });
    }
  }
);

/**
 * Authorised avatar delivery. Avatars live outside the static /uploads mount,
 * so the only way to read one is through this route, which re-checks that the
 * caller belongs to the family. A guest gets 404 - not a redirect, and not the
 * file.
 */
app.get("/api/profiles/:id/avatar", ...requireSession, async (req, res) => {
  try {
    const check = await canManageAvatar(req, req.params.id);

    if (!check.allowed) return res.status(404).json({ error: "Profile not found" });

    const avatar = check.profile.avatar_url;

    if (!avatar || !avatar.startsWith("/avatars/")) {
      return res.status(404).json({ error: "No uploaded avatar" });
    }

    const name = path.basename(avatar);
    const filePath = path.join(AVATAR_DIR, name);

    if (path.dirname(path.resolve(filePath)) !== path.resolve(AVATAR_DIR)) {
      return res.status(400).json({ error: "Bad avatar reference" });
    }

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "No uploaded avatar" });

    res.type("image/webp");
    res.setHeader("Cache-Control", "private, max-age=60");
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("Avatar read error:", error);
    res.status(500).json({ error: "Unable to load the avatar" });
  }
});

app.post("/api/child/login", authLimiter, async (req, res) => {
  try {
    const childLoginId = String(req.body?.childLoginId || "").trim().toLowerCase();
    const pin = String(req.body?.pin || "");

    if (!childLoginId || !pin) {
      return res.status(400).json({
        error: "childLoginId and pin are required"
      });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        error: "PIN must be 4 digits"
      });
    }

    const result = await pool.query(
      `SELECT
         p.id,
         p.user_id,
         p.display_name,
         p.avatar_url,
         p.age,
         p.selected_theme,
         p.child_login_id,
         p.pin_hash,
         p.created_by_parent,
         u.role
       FROM profiles p
       JOIN users u ON u.id = p.user_id
       WHERE lower(p.child_login_id) = $1
         AND p.is_parent = false
         AND u.role = 'child'
       LIMIT 1`,
      [childLoginId]
    );

    const child = result.rows[0];

    if (!child || !child.pin_hash) {
      return res.status(401).json({
        error: "Invalid child login ID or PIN"
      });
    }

    const pinOk = await bcrypt.compare(pin, child.pin_hash);

    if (!pinOk) {
      return res.status(401).json({
        error: "Invalid child login ID or PIN"
      });
    }

    /* SASA_CHILD_MEDIA_AUTH_V25 — children had no session at all, so
     * "a child may read only their own media" could not be enforced or even
     * expressed. This issues a child-scoped token: role 'child', so every
     * parent and admin guard rejects it, and resolveChildAccess matches it
     * only against the child's own profile. */
    const token = createToken({ id: child.user_id, email: null, role: "child" });

    res.json({
      status: "ok",
      token,
      child: {
        id: child.id,
        userId: child.user_id,
        name: child.display_name,
        avatarUrl: child.avatar_url,
        age: child.age,
        theme: child.selected_theme || "rainbow",
        childLoginId: child.child_login_id,
        parentId: child.created_by_parent
      }
    });
  } catch (error) {
    console.error("Child login error:", error);
    res.status(500).json({
      error: "Child login failed",
      details: error.message
    });
  }
});


app.post("/api/ai/test", async (req, res) => {
  try {
    const prompt = req.body?.prompt || "Say hello from SaraTube local AI.";
    const response = await askOllama(prompt);

    res.json({
      status: "ok",
      model: OLLAMA_MODEL,
      response
    });
  } catch (error) {
    console.error("AI test error:", error);
    res.status(500).json({
      error: "AI test failed",
      details: error.message
    });
  }
});

app.post("/api/ai/parent-advisor", async (req, res) => {
  try {
    const messages = req.body?.messages || [];
    const childInfo = req.body?.childInfo || null;

    const latestUserMessage =
      messages.length > 0
        ? messages[messages.length - 1].content
        : "Give general safe screen-time advice for parents.";

    const childContext = childInfo
      ? `Child information: name=${childInfo.name || "unknown"}, age=${childInfo.age || "unknown"}`
      : "Child information: not provided";

    const prompt = `
You are SaraTube Parent Advisor.
You help parents choose safe, educational, age-appropriate video content for children.

Rules:
- Give practical advice.
- Keep the answer short and clear.
- Do not provide medical diagnosis.
- Do not encourage unsafe or inappropriate content.
- Prefer educational, calm, family-safe recommendations.

${childContext}

Parent question:
${latestUserMessage}
`;

    const response = await askOllama(prompt);

    res.json({
      status: "ok",
      model: OLLAMA_MODEL,
      response
    });
  } catch (error) {
    console.error("Parent advisor error:", error);
    res.status(500).json({
      error: "Parent advisor failed",
      details: error.message
    });
  }
});


app.post("/api/ai/quiz-advisor", async (req, res) => {
  try {
    const answers = req.body?.answers || [];

    const formattedAnswers = answers
      .map((item, index) => `${index + 1}. ${item.question}: ${item.answer}`)
      .join("\n");

    const prompt = `
You are SaraTube Content Advisor.
You help parents choose safe, educational, age-appropriate video content for children.

The parent completed a quiz about their child.

Rules:
- Give short and practical recommendations.
- Recommend safe categories, not external websites.
- Keep the tone friendly.
- Focus on educational and family-safe content.
- Do not provide medical diagnosis.
- Do not encourage unsafe or inappropriate content.

Quiz answers:
${formattedAnswers || "No quiz answers provided."}

Give:
1. Recommended content types
2. Best time/length suggestion
3. Simple parent tip
`;

    const response = await askOllama(prompt);

    res.json({
      status: "ok",
      model: OLLAMA_MODEL,
      response
    });
  } catch (error) {
    console.error("Quiz advisor error:", error);
    res.status(500).json({
      error: "Quiz advisor failed",
      details: error.message
    });
  }
});



app.post("/api/ai/kids-chat", async (req, res) => {
  try {
    const messages = req.body?.messages || [];

    const latestUserMessage =
      messages.length > 0
        ? messages[messages.length - 1].content
        : "Hello";

    const prompt = `
You are SaraTube Kids Helper.
You talk to children in a safe, kind, simple, and friendly way.

Very important safety rules:
- Keep answers very short.
- Use simple child-friendly words.
- Do not ask for personal information.
- Do not ask for name, address, school, phone, location, email, or passwords.
- Do not discuss adult topics.
- Do not suggest unsafe actions.
- Do not give medical, legal, or dangerous advice.
- If the child asks something unsafe or private, gently say to ask a parent.
- Prefer educational, creative, calm, and positive answers.

Child message:
${latestUserMessage}

Answer in 1 to 4 short sentences.
`;

    const response = await askOllama(prompt);

    res.json({
      status: "ok",
      model: OLLAMA_MODEL,
      response
    });
  } catch (error) {
    console.error("Kids chat error:", error);
    res.status(500).json({
      error: "Kids chat failed",
      details: error.message
    });
  }
});




app.delete("/api/parent/children/:profileId", ...requireSession, async (req, res) => {
  const client = await pool.connect();

  try {
    if (!["parent", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Only parents can delete child profiles",
      });
    }

    const { profileId } = req.params;

    await client.query("BEGIN");

    const childResult = await client.query(
      `SELECT p.id, p.user_id
       FROM profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1
         AND p.created_by_parent = $2
         AND p.is_parent = false
         AND u.role = 'child'`,
      [profileId, req.user.id]
    );

    if (childResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        status: "error",
        message: "Child not found or not owned by this parent",
      });
    }

    const childUserId = childResult.rows[0].user_id;

    await client.query("DELETE FROM users WHERE id = $1", [childUserId]);

    await client.query("COMMIT");

    res.json({
      status: "ok",
      message: "Child deleted",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete child error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete child",
    });
  } finally {
    client.release();
  }
});



app.patch("/api/child/:profileId/theme", async (req, res) => {
  try {
    const { profileId } = req.params;
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({
        status: "error",
        message: "Theme is required",
      });
    }

    const result = await pool.query(
      `UPDATE profiles
       SET selected_theme = $1,
           updated_at = now()
       WHERE id = $2
         AND is_parent = false
       RETURNING id, display_name, selected_theme`,
      [theme, profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Child profile not found",
      });
    }

    res.json({
      status: "ok",
      child: result.rows[0],
    });
  } catch (error) {
    console.error("Update child theme error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update child theme",
    });
  }
});

app.get("/api/child/:profileId/media", ...requireSession, async (req, res) => {
  try {
    const { profileId } = req.params;

    /* This used to take the profile id from the URL and return that child's
     * whole assigned library to anyone who asked - no session at all. Knowing
     * or guessing a uuid was enough to read another family's media. */
    const access = await resolveChildAccess(req, profileId);

    if (!access.allowed) {
      return res.status(404).json({ status: "error", message: "Profile not found" });
    }

    const result = await pool.query(
      `SELECT
         m.id,
         m.media_type,
         m.title,
         m.description,
         m.category,
         m.public_url,
         m.thumbnail_url,
         m.original_filename,
         m.mime_type,
         m.size_bytes,
         m.created_at,
         mca.no_limit,
         mca.daily_limit_minutes,
         mca.available_from,
         mca.available_until
       FROM media_files m
       JOIN media_child_access mca ON mca.media_id = m.id
       WHERE mca.child_profile_id = $1
         AND mca.is_allowed = true
         AND (mca.available_from IS NULL OR mca.available_from <= now())
         AND (mca.available_until IS NULL OR mca.available_until >= now())
       ORDER BY m.created_at DESC`,
      [profileId]
    );

    res.json({
      status: "ok",
      media: result.rows,
    });
  } catch (error) {
    console.error("Child media error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to load child media",
    });
  }
});

/* SASA_MEDIA_CONTAINMENT_V30 — optional session.
 *
 * Public published media is readable by a guest, so these routes cannot sit
 * behind requireSession. But when a token IS presented it must be validated
 * exactly as strictly as anywhere else — a suspended account or a revoked
 * session must not gain private access here. This runs the same loadAccount
 * checks and simply continues as an anonymous caller when no token is sent.
 */
async function optionalSession(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    req.account = null;
    return next();
  }

  return requireAuth(req, res, () => loadAccount(req, res, next));
}

/**
 * Whether this caller may see a specific media row.
 *
 * Published public media is open. Everything else is family content: only the
 * owning parent, a child the media was explicitly assigned to, or an
 * administrator may see it. Every other caller is told the same thing a
 * nonexistent id would produce.
 */
async function resolveMediaAccess(req, media) {
  if (media.visibility === "public" && media.publication_status === "published") {
    return { allowed: true, scope: "public" };
  }

  const account = req.account;
  if (!account) return { allowed: false };

  if (account.role === "admin") return { allowed: true, scope: "admin" };

  if (account.role === "parent" && media.owner_user_id === account.id) {
    return { allowed: true, scope: "owner" };
  }

  if (account.role === "child") {
    // Assignment is per child profile, and the profile must belong to this
    // child's own account — not merely exist.
    const { rows } = await pool.query(
      `SELECT 1
         FROM media_child_access mca
         JOIN profiles p ON p.id = mca.child_profile_id
        WHERE mca.media_id = $1 AND p.user_id = $2
        LIMIT 1`,
      [media.id, account.id]
    );

    if (rows[0]) return { allowed: true, scope: "assigned-child" };
  }

  return { allowed: false };
}

/**
 * The public shape of a media row.
 *
 * owner_user_id, file_path and the stored filename are deliberately absent:
 * they identify the uploading family and the physical location on the NAS, and
 * a caller needs neither to display an item.
 */
function publicMediaShape(media, { includeAssetUrls }) {
  return {
    id: media.id,
    media_type: media.media_type,
    title: media.title,
    description: media.description,
    category: media.category,
    size_bytes: toBoundedByteNumber(media.size_bytes, "media.size_bytes"),
    created_at: media.created_at,
    visibility: media.visibility,
    publication_status: media.publication_status,
    thumbnail_status: media.thumbnail_status,
    // Only published public media gets a directly fetchable URL. Private
    // media is served through an authorised route instead; handing out its
    // /uploads path here would defeat the point of protecting it.
    ...(includeAssetUrls
      ? { public_url: media.public_url, thumbnail_url: media.thumbnail_url }
      : {})
  };
}

/* SASA_MEDIA_CONTAINMENT_V30 — was an unauthenticated listing of every row.
 *
 * This returned all media, public and private, to anyone who asked, including
 * each item's /uploads path. Combined with the open static mount that was a
 * complete index of every family's photos and videos. Nothing in the
 * application calls it, so it is gone rather than repaired; a route that
 * exists only to leak has no safe version.
 */
app.get("/api/media/files", (_req, res) => {
  res.status(404).json({ status: "error", message: "Not found" });
});

app.post("/api/media/upload", ...requireSession, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    const title = req.body.title || req.file.originalname;
    const description = req.body.description || null;
    const category = req.body.category || "general";

    const mimeType = req.file.mimetype || "";
    const mediaType = mimeType.startsWith("video/") ? "video" : "photo";

    const publicUrl = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO media_files (
         owner_user_id,
         media_type,
         title,
         description,
         category,
         file_path,
         public_url,
         original_filename,
         mime_type,
         size_bytes
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        req.user.id,
        mediaType,
        title,
        description,
        category,
        req.file.path,
        publicUrl,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
      ]
    );

    let media = result.rows[0];

    /* SASA_ASYNC_THUMBNAILS_V27 — queued, not extracted inline.
     *
     * SASA_VIDEO_THUMBNAILS_V21 extracted the frame here, after the row
     * existed, so a thumbnail failure could not lose an already-stored video.
     * That property is kept, but the wait is not: ffmpeg can take ~165s worst
     * case and Cloudflare cuts a proxied request at ~100s, so a family
     * uploading a long video got HTTP 520 despite the file arriving intact.
     *
     * The row is marked 'pending' and thumbnail-worker.js does the work. The
     * queue is this table, so it survives a pod restart and two replicas
     * cannot claim the same row. */
    if (mediaType === "video") {
      const queued = await pool.query(
        `UPDATE media_files SET thumbnail_status = 'pending', updated_at = now()
          WHERE id = $1
      RETURNING *`,
        [media.id]
      );

      if (queued.rows[0]) media = queued.rows[0];
    }

    let childProfileIds = [];
    try {
      childProfileIds = req.body.childProfileIds
        ? JSON.parse(req.body.childProfileIds)
        : [];
    } catch {
      childProfileIds = [];
    }

    if (Array.isArray(childProfileIds) && childProfileIds.length > 0) {
      const accessRows = childProfileIds.map((childProfileId) => [
        media.id,
        childProfileId,
        req.user.id,
      ]);

      for (const row of accessRows) {
        await pool.query(
          `INSERT INTO media_child_access (media_id, child_profile_id, granted_by)
           VALUES ($1, $2, $3)
           ON CONFLICT (media_id, child_profile_id) DO NOTHING`,
          row
        );
      }
    }

    res.json({
      status: "ok",
      media,
      childProfileIds,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Upload failed",
    });
  }
});


app.post("/api/media/upload-v2", ...requireSession, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    const title = req.body.title || req.file.originalname;
    const description = req.body.description || null;
    const category = req.body.category || "general";

    const mimeType = req.file.mimetype || "";
    const mediaType = mimeType.startsWith("video/") ? "video" : "photo";

    const publicUrl = `/uploads/${req.file.filename}`;

    const mediaResult = await pool.query(
      `INSERT INTO media_files (
         owner_user_id,
         media_type,
         title,
         description,
         category,
         file_path,
         public_url,
         original_filename,
         mime_type,
         size_bytes
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        req.user.id,
        mediaType,
        title,
        description,
        category,
        req.file.path,
        publicUrl,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
      ]
    );

    const media = mediaResult.rows[0];

    let childProfileIds = [];
    try {
      childProfileIds = req.body.childProfileIds ? JSON.parse(req.body.childProfileIds) : [];
    } catch {
      childProfileIds = [];
    }

    const noLimit = req.body.noLimit === "true";
    const dailyLimitMinutes = req.body.dailyLimitMinutes ? Number(req.body.dailyLimitMinutes) : null;
    const availableFrom = req.body.availableFrom || null;
    const availableUntil = req.body.availableUntil || null;

    for (const childProfileId of childProfileIds) {
      await pool.query(
        `INSERT INTO media_child_access (
           media_id,
           child_profile_id,
           granted_by,
           is_allowed,
           no_limit,
           daily_limit_minutes,
           available_from,
           available_until,
           updated_at
         )
         VALUES ($1,$2,$3,true,$4,$5,$6,$7,now())
         ON CONFLICT (media_id, child_profile_id)
         DO UPDATE SET
           is_allowed = true,
           no_limit = EXCLUDED.no_limit,
           daily_limit_minutes = EXCLUDED.daily_limit_minutes,
           available_from = EXCLUDED.available_from,
           available_until = EXCLUDED.available_until,
           updated_at = now()`,
        [
          media.id,
          childProfileId,
          req.user.id,
          noLimit,
          dailyLimitMinutes,
          availableFrom,
          availableUntil,
        ]
      );
    }

    res.json({ status: "ok", media });
  } catch (error) {
    console.error("Upload v2 error:", error);
    res.status(500).json({ status: "error", message: "Upload failed" });
  }
});

app.get("/api/media/manage", ...requireSession, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         m.id,
         m.owner_user_id,
         m.media_type,
         m.title,
         m.description,
         m.category,
         m.public_url,
         m.thumbnail_url,
         m.original_filename,
         m.mime_type,
         m.size_bytes,
         m.created_at,
         COALESCE(
           json_agg(
             json_build_object(
               'child_profile_id', p.id,
               'display_name', p.display_name,
               'age', p.age,
               'child_login_id', p.child_login_id,
               'no_limit', mca.no_limit,
               'daily_limit_minutes', mca.daily_limit_minutes,
               'available_from', mca.available_from,
               'available_until', mca.available_until
             )
           ) FILTER (WHERE p.id IS NOT NULL),
           '[]'
         ) AS child_access
       FROM media_files m
       LEFT JOIN media_child_access mca ON mca.media_id = m.id
       LEFT JOIN profiles p ON p.id = mca.child_profile_id
       WHERE m.owner_user_id = $1 OR $2 = 'admin'
       GROUP BY m.id
       ORDER BY m.created_at DESC`,
      [req.user.id, req.user.role]
    );

    res.json({ status: "ok", media: result.rows });
  } catch (error) {
    console.error("Media manage error:", error);
    res.status(500).json({ status: "error", message: "Failed to load media" });
  }
});

app.post("/api/media/:mediaId/access", ...requireSession, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { childProfileId, noLimit, dailyLimitMinutes, availableFrom, availableUntil } = req.body;

    if (!childProfileId) {
      return res.status(400).json({ status: "error", message: "childProfileId is required" });
    }

    await pool.query(
      `INSERT INTO media_child_access (
         media_id,
         child_profile_id,
         granted_by,
         is_allowed,
         no_limit,
         daily_limit_minutes,
         available_from,
         available_until,
         updated_at
       )
       VALUES ($1,$2,$3,true,$4,$5,$6,$7,now())
       ON CONFLICT (media_id, child_profile_id)
       DO UPDATE SET
         is_allowed = true,
         no_limit = EXCLUDED.no_limit,
         daily_limit_minutes = EXCLUDED.daily_limit_minutes,
         available_from = EXCLUDED.available_from,
         available_until = EXCLUDED.available_until,
         updated_at = now()`,
      [
        mediaId,
        childProfileId,
        req.user.id,
        !!noLimit,
        dailyLimitMinutes || null,
        availableFrom || null,
        availableUntil || null,
      ]
    );

    res.json({ status: "ok", message: "Child linked" });
  } catch (error) {
    console.error("Link media error:", error);
    res.status(500).json({ status: "error", message: "Failed to link child" });
  }
});


app.patch("/api/media/:mediaId", ...requireSession, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { title, description, category } = req.body;

    const result = await pool.query(
      `UPDATE media_files
       SET
         title = COALESCE($1, title),
         description = $2,
         category = COALESCE($3, category),
         updated_at = now()
       WHERE id = $4
         AND (owner_user_id = $5 OR $6 = 'admin')
       RETURNING *`,
      [
        title || null,
        description || null,
        category || null,
        mediaId,
        req.user.id,
        req.user.role,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Media not found or not owned by you",
      });
    }

    res.json({
      status: "ok",
      media: result.rows[0],
    });
  } catch (error) {
    console.error("Edit media error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to edit media",
    });
  }
});

app.delete("/api/media/:mediaId/access/:childProfileId", ...requireSession, async (req, res) => {
  try {
    const { mediaId, childProfileId } = req.params;

    await pool.query(
      `DELETE FROM media_child_access
       WHERE media_id = $1 AND child_profile_id = $2`,
      [mediaId, childProfileId]
    );

    res.json({ status: "ok", message: "Child unlinked" });
  } catch (error) {
    console.error("Unlink media error:", error);
    res.status(500).json({ status: "error", message: "Failed to unlink child" });
  }
});

app.delete("/api/media/:mediaId", ...requireSession, async (req, res) => {
  try {
    const { mediaId } = req.params;

    /* SASA_VIDEO_THUMBNAILS_V21 — RETURNING lets us clean the files up after
     * the row goes. Ownership is still enforced by the WHERE clause, so a
     * caller who owns nothing deletes nothing and removes no files. Deleting
     * the row without its files is what left orphaned uploads on the volume
     * before. */
    const deleted = await pool.query(
      `DELETE FROM media_files
       WHERE id = $1 AND (owner_user_id = $2 OR $3 = 'admin')
       RETURNING thumbnail_url, file_path`,
      [mediaId, req.user.id, req.user.role]
    );

    const row = deleted.rows[0];

    if (row) {
      await removeThumbnailFile(UPLOAD_DIR, row.thumbnail_url);

      if (row.file_path) {
        try {
          const name = path.basename(String(row.file_path));
          await fs.promises.unlink(path.join(UPLOAD_DIR, name));
        } catch {
          // Already gone, or never written - nothing to report.
        }
      }
    }

    res.json({ status: "ok", message: "Media deleted" });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ status: "error", message: "Failed to delete media" });
  }
});


/* SASA_MEDIA_CONTAINMENT_V30 — was unauthenticated.
 *
 * This answered for ANY media id with no session at all, and the body carried
 * owner_user_id and the internal file_path (/app/uploads/...). A guest could
 * read every private family row and learn exactly where each file sat.
 *
 * It is now authorisation-aware: published public media stays open, and
 * anything else requires the owning parent, a child the item was assigned to,
 * or an administrator. Everyone else gets the same 404 a nonexistent id
 * produces, so the endpoint cannot be used to discover which ids exist. The
 * body is sanitised in every case.
 */
app.get("/api/media/:mediaId", optionalSession, async (req, res) => {
  try {
    const { mediaId } = req.params;

    // A malformed id must not reach Postgres as a failed uuid cast, which
    // would answer 500 and distinguish "bad id" from "not yours".
    if (!/^[0-9a-fA-F-]{36}$/.test(String(mediaId || ""))) {
      return res.status(404).json({ status: "error", message: "Media not found" });
    }

    const result = await pool.query(
      `SELECT id, owner_user_id, media_type, title, description, category,
              public_url, thumbnail_url, size_bytes, created_at,
              visibility, publication_status, thumbnail_status
         FROM media_files
        WHERE id = $1
        LIMIT 1`,
      [mediaId]
    );

    const media = result.rows[0];

    // Identical answer whether the row is missing or simply not this
    // caller's, so the response cannot confirm that an id exists.
    if (!media) {
      return res.status(404).json({ status: "error", message: "Media not found" });
    }

    const access = await resolveMediaAccess(req, media);

    if (!access.allowed) {
      return res.status(404).json({ status: "error", message: "Media not found" });
    }

    if (access.scope === "admin") {
      await recordAudit(req, "media.admin_read", "media", media.id, { title: media.title });
    }

    const isPublic = access.scope === "public";

    // Private bodies must not be stored by a shared cache; a published item
    // is world-readable anyway and may be cached normally.
    res.set("Cache-Control", isPublic ? "public, max-age=300" : "private, no-store");

    res.json({
      status: "ok",
      media: publicMediaShape(media, { includeAssetUrls: isPublic })
    });
  } catch (error) {
    console.error("Media read error:", error);
    res.status(500).json({ status: "error", message: "Unable to load media" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SaraTube backend API running on port ${PORT}`);
  console.log(`Using Ollama at ${OLLAMA_URL}`);
  console.log(`Using model ${OLLAMA_MODEL}`);

  /* SASA_ASYNC_THUMBNAILS_V27 — starts after the port is open so a slow first
   * claim cannot delay readiness. Recovery needs no special path: rows left
   * 'processing' by a pod that died are reclaimed by the same stale-claim
   * branch the worker always uses. */
  startThumbnailWorker(pool, UPLOAD_DIR);

  /* SASA_RESUMABLE_UPLOADS_V28 — an abandoned session holds NAS space until
   * something removes it: a 500MB video dropped at 90% costs 450MB. */
  startUploadSweeper(pool, UPLOAD_DIR);
});
