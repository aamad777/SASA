/* SASA_PRIVATE_MEDIA_V31 — authorised delivery of private media.
 *
 * express.static served every file under /uploads with no authorisation, so
 * anyone who knew or learned a filename could download another family's
 * photos and videos. Containment closed the routes that handed those filenames
 * out; this closes the files themselves.
 *
 * The hard constraint is that a native <img> or <video> cannot attach an
 * Authorization header, and putting the login JWT in a URL would leak a
 * full-privilege credential into history, referrers and logs. So private media
 * is addressed by a short-lived token that:
 *
 *   - is signed with a key DERIVED from JWT_SECRET under a distinct label, so
 *     it is not the login token and cannot be replayed as one;
 *   - names one media item, one account and one variant, so it grants nothing
 *     else;
 *   - expires in minutes;
 *   - and — the part that actually matters — is re-authorised on every single
 *     request. The token only says who is asking. Whether they may still have
 *     the file is decided from the database at read time, so a revoked
 *     session, a suspended account, a withdrawn assignment or a deleted row
 *     stops the URL working immediately rather than when the token expires.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/** Minutes, not hours: a leaked URL should die quickly on its own too. */
export const MEDIA_TOKEN_TTL_SECONDS = 5 * 60;

/** Distinct label so a media token can never be confused with a login JWT. */
function mediaKey(jwtSecret) {
  return crypto.createHash("sha256").update(`${jwtSecret}:sasa-media-url-v1`).digest();
}

function b64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

/**
 * Signs a capability naming exactly one media item, one account and one
 * variant. Carries no privileges of its own — see the re-authorisation note
 * above.
 */
export function signMediaToken(jwtSecret, { mediaId, accountId, variant }) {
  const payload = {
    m: mediaId,
    a: accountId || null,
    v: variant,
    e: Math.floor(Date.now() / 1000) + MEDIA_TOKEN_TTL_SECONDS,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(crypto.createHmac("sha256", mediaKey(jwtSecret)).update(body).digest());
  return `${body}.${sig}`;
}

/** Returns the payload, or null for anything tampered with or expired. */
export function verifyMediaToken(jwtSecret, token) {
  if (typeof token !== "string" || !token.includes(".")) return null;

  const [body, sig] = token.split(".", 2);
  if (!body || !sig) return null;

  const expected = b64url(crypto.createHmac("sha256", mediaKey(jwtSecret)).update(body).digest());

  // Constant-time: a length mismatch is compared as a failure rather than
  // throwing, so timing does not distinguish "wrong length" from "wrong bytes".
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (!payload?.m || !payload?.v) return null;
  if (typeof payload.e !== "number" || payload.e < Math.floor(Date.now() / 1000)) return null;

  return { mediaId: payload.m, accountId: payload.a, variant: payload.v, exp: payload.e };
}

/** Refuses any path that escapes the uploads directory. */
function assertInside(dir, target) {
  const resolvedDir = path.resolve(dir) + path.sep;
  const resolved = path.resolve(target);
  if (!resolved.startsWith(resolvedDir)) {
    throw new Error("Refusing to serve a path outside the uploads directory");
  }
  return resolved;
}

/**
 * Resolves the absolute file for a media row and variant.
 *
 * Built from the stored path only — never from anything in the request — and
 * re-checked with assertInside, so a crafted id or variant has no path to act
 * on.
 */
export function resolveMediaFile(uploadDir, media, variant) {
  const rel =
    variant === "thumb"
      ? media.thumbnail_url
      : media.public_url || (media.file_path ? `/uploads/${path.basename(media.file_path)}` : null);

  if (!rel) return null;

  const name = String(rel).replace(/^\/uploads\//, "");
  if (!name || name.includes("..") || name.includes("/")) {
    // Media filenames are flat inside the uploads directory. A separator here
    // means the stored value is not what this function is meant to serve.
    if (!name.startsWith("avatars/")) return null;
  }

  try {
    return assertInside(uploadDir, path.join(uploadDir, name));
  } catch {
    return null;
  }
}

const MIME_BY_EXT = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export function mimeForFile(filePath, fallback = "application/octet-stream") {
  return MIME_BY_EXT[path.extname(filePath).toLowerCase()] || fallback;
}

/**
 * Streams a file, honouring HTTP Range so a child can seek inside a video and
 * so fullscreen playback works. HEAD returns the same headers with no body.
 *
 * Private responses are no-store: a shared cache holding a private video would
 * reintroduce exactly the exposure this module exists to remove.
 */
export async function streamFile(req, res, filePath, { isPrivate, mimeType }) {
  let stat;
  try {
    stat = await fs.promises.stat(filePath);
  } catch {
    return res.status(404).json({ status: "error", message: "Not found" });
  }

  if (!stat.isFile()) {
    return res.status(404).json({ status: "error", message: "Not found" });
  }

  const type = mimeType || mimeForFile(filePath);

  res.set("Content-Type", type);
  res.set("Accept-Ranges", "bytes");
  res.set("X-Content-Type-Options", "nosniff");
  res.set(
    "Cache-Control",
    isPrivate ? "private, no-store, max-age=0" : "public, max-age=3600",
  );

  const range = req.headers.range;

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(String(range).trim());

    if (!match) {
      res.set("Content-Range", `bytes */${stat.size}`);
      return res.status(416).end();
    }

    let start = match[1] === "" ? null : Number(match[1]);
    let end = match[2] === "" ? null : Number(match[2]);

    if (start === null && end === null) {
      res.set("Content-Range", `bytes */${stat.size}`);
      return res.status(416).end();
    }

    // "bytes=-N" means the last N bytes.
    if (start === null) {
      start = Math.max(0, stat.size - end);
      end = stat.size - 1;
    } else if (end === null || end >= stat.size) {
      end = stat.size - 1;
    }

    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= stat.size) {
      res.set("Content-Range", `bytes */${stat.size}`);
      return res.status(416).end();
    }

    res.status(206);
    res.set("Content-Range", `bytes ${start}-${end}/${stat.size}`);
    res.set("Content-Length", String(end - start + 1));

    if (req.method === "HEAD") return res.end();

    return fs.createReadStream(filePath, { start, end }).pipe(res);
  }

  res.set("Content-Length", String(stat.size));
  if (req.method === "HEAD") return res.end();
  return fs.createReadStream(filePath).pipe(res);
}
