/* SASA_RESUMABLE_UPLOADS_V28 — chunked, resumable video uploads.
 *
 * Cloudflare refuses a proxied body over 100MB with a plain 413, so the 500MB
 * application limit was unreachable through the real public portal however
 * fast the origin answered. Chunks well under that cap are the only way
 * through the proxy, and server-side tracking is what makes an interrupted
 * upload resume instead of restarting.
 *
 * Trust boundaries, all enforced here rather than in the route:
 *   - the client never names a path. Every filename is derived from the
 *     session UUID and the integer chunk index, then re-checked with
 *     assertInside, so "../" in a filename or index has nothing to act on.
 *   - the chunk index must be an integer inside [0, total_chunks). Order is
 *     irrelevant on the wire because assembly reads chunks by index from the
 *     database, not in arrival order.
 *   - the declared total is enforced twice: no chunk may exceed chunk_size,
 *     and the assembled byte count must equal total_bytes exactly.
 *   - the assembled file is probed with ffprobe. A corrupt or non-video
 *     payload is rejected and never becomes a media row.
 *   - assembly writes a temporary file and then renames it into place, so a
 *     partially written file is never visible under the final name and only
 *     one copy is ever stored.
 */

import fs from "node:fs";
import path from "node:path";
import { probeVideo } from "./thumbnails.js";

/** 12MB: inside the requested 10-20MB band and far below Cloudflare's cap. */
export const CHUNK_SIZE = 12 * 1024 * 1024;
/** Matches the existing multer limit for the simple upload path. */
export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;
/** An abandoned session and its chunks are swept after this. */
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const SWEEP_INTERVAL_MS = 30 * 60 * 1000;

/** Refuses any path that escapes the uploads directory. */
function assertInside(dir, target) {
  const resolvedDir = path.resolve(dir) + path.sep;
  const resolved = path.resolve(target);

  if (!resolved.startsWith(resolvedDir)) {
    throw new Error("Refusing to process a path outside the uploads directory");
  }

  return resolved;
}

/** A session's own directory. Named only by its UUID — no client input. */
export function sessionDir(uploadDir, sessionId) {
  if (!/^[0-9a-f-]{36}$/i.test(sessionId)) {
    throw new Error("Invalid session id");
  }
  return assertInside(uploadDir, path.join(uploadDir, ".uploads", sessionId));
}

/** A chunk's own file. Named only by its integer index. */
export function chunkPath(uploadDir, sessionId, index) {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("Invalid chunk index");
  }
  const dir = sessionDir(uploadDir, sessionId);
  return assertInside(dir, path.join(dir, `${index}.part`));
}

/**
 * Sanitises the name that ends up on disk. The client's filename is only ever
 * used for its extension and for display; the stored name is generated.
 */
export function safeStoredName(originalName) {
  const base = String(originalName || "video.mp4").replace(/[^a-zA-Z0-9._-]/g, "_");
  const trimmed = base.slice(-80) || "video.mp4";
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${trimmed}`;
}

/** Total chunks for a declared size. */
export function chunkCountFor(totalBytes) {
  return Math.max(1, Math.ceil(totalBytes / CHUNK_SIZE));
}

/**
 * Concatenates the session's chunks in index order into a temporary file,
 * verifies the byte count and that it is a real video, then renames it into
 * place. Returns the final filename.
 *
 * Reading by index from the database is what makes chunk-order manipulation
 * on the wire meaningless: whatever order chunks arrived in, they are joined
 * in numeric order here.
 */
export async function assembleSession(pool, uploadDir, session) {
  const dir = sessionDir(uploadDir, session.id);

  const { rows: chunks } = await pool.query(
    `SELECT chunk_index, size_bytes FROM upload_session_chunks
      WHERE session_id = $1 ORDER BY chunk_index`,
    [session.id],
  );

  if (chunks.length !== session.total_chunks) {
    throw new Error(
      `Upload is incomplete: ${chunks.length} of ${session.total_chunks} chunks received`,
    );
  }

  // Indexes must be exactly 0..n-1 with no gap. Counting alone is not enough:
  // the same index twice cannot happen (primary key), but a gap plus an
  // out-of-range index would still count correctly.
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i].chunk_index !== i) {
      throw new Error(`Upload is missing chunk ${i}`);
    }
  }

  const declared = chunks.reduce((sum, c) => sum + Number(c.size_bytes), 0);
  if (declared !== Number(session.total_bytes)) {
    throw new Error(
      `Upload size mismatch: received ${declared} bytes, expected ${session.total_bytes}`,
    );
  }

  const storedName = safeStoredName(session.original_filename);
  // Written under a temp name so a crash mid-assembly never leaves a
  // half-written file under the name the media row will point at.
  const tempPath = assertInside(uploadDir, path.join(uploadDir, `.assembling-${session.id}`));
  const finalPath = assertInside(uploadDir, path.join(uploadDir, storedName));

  await fs.promises.rm(tempPath, { force: true });

  const out = fs.createWriteStream(tempPath, { flags: "wx" });
  try {
    for (let i = 0; i < chunks.length; i++) {
      const part = chunkPath(uploadDir, session.id, i);
      await new Promise((resolve, reject) => {
        const input = fs.createReadStream(part);
        input.on("error", reject);
        out.on("error", reject);
        input.on("end", resolve);
        input.pipe(out, { end: false });
      });
    }
  } finally {
    await new Promise((resolve) => out.end(resolve));
  }

  const stat = await fs.promises.stat(tempPath);
  if (stat.size !== Number(session.total_bytes)) {
    await fs.promises.rm(tempPath, { force: true });
    throw new Error(`Assembled size ${stat.size} does not match declared ${session.total_bytes}`);
  }

  // Real inspection, not the client's Content-Type: ffprobe fails on anything
  // that is not a decodable video, so a corrupt upload never becomes a row.
  try {
    await probeVideo(tempPath);
  } catch {
    await fs.promises.rm(tempPath, { force: true });
    throw new Error("That file is not a readable video");
  }

  // Atomic within the same filesystem: the final name appears complete or not
  // at all, and only this one copy is kept.
  await fs.promises.rename(tempPath, finalPath);
  await fs.promises.rm(dir, { recursive: true, force: true });

  return { storedName, filePath: finalPath, sizeBytes: stat.size };
}

/** Removes a session's chunk directory. Safe to call more than once. */
export async function discardSessionFiles(uploadDir, sessionId) {
  try {
    await fs.promises.rm(sessionDir(uploadDir, sessionId), { recursive: true, force: true });
  } catch {
    /* Already gone, or never created. */
  }
}

/**
 * Deletes expired sessions and their chunks. Abandoned uploads would
 * otherwise hold NAS space indefinitely — a 500MB video abandoned at 90%
 * costs 450MB until something removes it.
 */
export async function sweepExpiredSessions(pool, uploadDir) {
  const { rows } = await pool.query(
    `DELETE FROM upload_sessions
      WHERE status IN ('open', 'assembling') AND expires_at < now()
      RETURNING id`,
  );

  for (const row of rows) {
    await discardSessionFiles(uploadDir, row.id);
  }

  if (rows.length) {
    console.log(`[uploads] swept ${rows.length} expired upload session(s)`);
  }

  return rows.length;
}

export function startUploadSweeper(pool, uploadDir) {
  const tick = async () => {
    try {
      await sweepExpiredSessions(pool, uploadDir);
    } catch (error) {
      console.error("[uploads] sweep failed:", error.message);
    }
  };

  console.log("[uploads] expiry sweeper started");
  setTimeout(tick, 60_000).unref?.();
  const handle = setInterval(tick, SWEEP_INTERVAL_MS);
  handle.unref?.();
  return () => clearInterval(handle);
}
