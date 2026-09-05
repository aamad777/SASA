/* SASA_ASYNC_THUMBNAILS_V27 — durable thumbnail worker.
 *
 * The upload handler used to await ffmpeg before replying. Worst case that is
 * ~165s (see thumbnails.js) and Cloudflare cuts a proxied request at ~100s, so
 * a large or dark-opening video answered the admin HTTP 520 even though the
 * file had landed on the NAS intact.
 *
 * Generation therefore happens here instead, after the row is committed. Three
 * properties matter and none of them are available from a fire-and-forget
 * promise, which is why the queue is the media_files table itself:
 *
 *   - it survives a pod restart. A claim is a row update, so a worker that
 *     dies mid-job leaves a 'processing' row with an old thumbnail_locked_at,
 *     and the next worker reclaims it once that claim goes stale.
 *   - two replicas cannot take the same row. The claim uses
 *     FOR UPDATE SKIP LOCKED, so a second worker skips a row another is
 *     already claiming rather than blocking on or duplicating it.
 *   - failures retry with backoff and eventually park as 'failed', which an
 *     admin can retry explicitly. They never silently become the generic icon.
 *
 * backfill-thumbnails.js stays as the out-of-band repair tool; this worker is
 * the normal path.
 */

import os from "node:os";
import { generateVideoThumbnail } from "./thumbnails.js";

/** How long a claim may be held before another worker may take the row. */
const STALE_CLAIM_MS = 10 * 60 * 1000;
/** Idle poll interval. Short enough that a new upload is picked up promptly. */
const POLL_INTERVAL_MS = 5_000;
/** Attempts before a row parks as 'failed' and waits for an explicit retry. */
const MAX_ATTEMPTS = 3;
/** Backoff between automatic attempts. */
const BACKOFF_MS = [30_000, 2 * 60_000];

/** Identifies this pod in thumbnail_locked_by, for debugging a stuck row. */
const WORKER_ID = `${os.hostname()}:${process.pid}`;

/**
 * Claims one row and marks it 'processing', atomically.
 *
 * The inner SELECT picks either a due 'pending' row or a 'processing' row
 * whose claim has gone stale (the pod that held it died). SKIP LOCKED is what
 * makes this safe with more than one replica: a row another transaction is
 * already claiming is skipped, never waited on, so two workers cannot run
 * ffmpeg over the same file.
 */
async function claimNextJob(pool) {
  const { rows } = await pool.query(
    `UPDATE media_files
        SET thumbnail_status = 'processing',
            thumbnail_locked_at = now(),
            thumbnail_locked_by = $1
      WHERE id = (
        SELECT id
          FROM media_files
         WHERE media_type = 'video'
           AND (
                 (thumbnail_status = 'pending'
                  AND (thumbnail_next_attempt_at IS NULL OR thumbnail_next_attempt_at <= now()))
              OR (thumbnail_status = 'processing'
                  AND thumbnail_locked_at < now() - ($2::bigint * interval '1 millisecond'))
               )
         ORDER BY created_at
         LIMIT 1
         FOR UPDATE SKIP LOCKED
      )
      RETURNING id, file_path, thumbnail_attempts`,
    [WORKER_ID, STALE_CLAIM_MS],
  );

  return rows[0] || null;
}

async function markReady(pool, id, thumbnailUrl) {
  await pool.query(
    `UPDATE media_files
        SET thumbnail_url = $2,
            thumbnail_status = 'ready',
            thumbnail_error = NULL,
            thumbnail_locked_at = NULL,
            thumbnail_locked_by = NULL,
            thumbnail_next_attempt_at = NULL,
            updated_at = now()
      WHERE id = $1`,
    [id, thumbnailUrl],
  );
}

async function markAttemptFailed(pool, id, attempts, message) {
  const next = attempts + 1;
  const giveUp = next >= MAX_ATTEMPTS;
  // Only the message, never a stack: this string is shown to an admin.
  const reason = String(message || "unknown error").slice(0, 500);

  await pool.query(
    `UPDATE media_files
        SET thumbnail_status = $2,
            thumbnail_attempts = $3,
            thumbnail_error = $4,
            thumbnail_locked_at = NULL,
            thumbnail_locked_by = NULL,
            thumbnail_next_attempt_at = CASE WHEN $2 = 'pending'
              THEN now() + ($5::bigint * interval '1 millisecond') ELSE NULL END
      WHERE id = $1`,
    [
      id,
      giveUp ? "failed" : "pending",
      next,
      reason,
      BACKOFF_MS[Math.min(next - 1, BACKOFF_MS.length - 1)],
    ],
  );
}

/** Runs one claimed job. Returns true when a job was processed. */
async function runOnce(pool, uploadDir) {
  const job = await claimNextJob(pool);
  if (!job) return false;

  try {
    const filename = job.file_path.split("/").pop();
    const thumb = await generateVideoThumbnail({
      videoPath: job.file_path,
      videoFilename: filename,
      uploadDir,
    });
    await markReady(pool, job.id, thumb.publicUrl);
    console.log(`[thumbnails] ready ${job.id} -> ${thumb.publicUrl}`);
  } catch (error) {
    await markAttemptFailed(pool, job.id, job.thumbnail_attempts, error.message);
    console.error(`[thumbnails] attempt failed ${job.id}: ${error.message}`);
  }

  return true;
}

/**
 * Starts the polling loop. One job at a time: ffmpeg is CPU-bound and the pod
 * has a 500m CPU limit, so processing two at once would make both slower
 * without finishing any sooner.
 */
export function startThumbnailWorker(pool, uploadDir) {
  let stopped = false;

  const tick = async () => {
    if (stopped) return;

    try {
      // Drain the queue before sleeping, so a burst of uploads is not paced
      // at one per poll interval.
      while (!stopped && (await runOnce(pool, uploadDir))) {
        /* keep going */
      }
    } catch (error) {
      // A database blip must not kill the loop.
      console.error("[thumbnails] worker tick failed:", error.message);
    }

    if (!stopped) setTimeout(tick, POLL_INTERVAL_MS).unref?.();
  };

  // A restart re-claims stale 'processing' rows through the same path, so
  // there is nothing special to do for recovery beyond starting.
  console.log(`[thumbnails] worker ${WORKER_ID} started`);
  setTimeout(tick, 1_000).unref?.();

  return () => {
    stopped = true;
  };
}

export const __test__ = { WORKER_ID, MAX_ATTEMPTS, STALE_CLAIM_MS };
