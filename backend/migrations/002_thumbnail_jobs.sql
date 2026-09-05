-- SASA_ASYNC_THUMBNAILS_V27 — durable, restart-safe thumbnail processing.
--
-- Why: the upload handler awaited ffmpeg before answering. Worst case that is
-- ~165s of probing and frame extraction (see thumbnails.js), and Cloudflare
-- cuts a proxied request off at ~100s, so a large or dark-opening video
-- answered the admin with HTTP 520 even though the file had uploaded fine.
--
-- The fix moves generation off the request. That only works if the queue
-- survives a pod restart and two replicas cannot claim the same row, so the
-- queue lives in this table rather than in memory.
--
-- Repeatable and safe: every statement is IF NOT EXISTS / idempotent, only
-- ADDs columns, and alters no existing column. Most importantly the new
-- status column defaults to 'ready', and the backfill writes exactly that to
-- existing rows, so nothing already uploaded is re-processed and no existing
-- thumbnail is disturbed.

BEGIN;

-- ── Thumbnail job state ─────────────────────────────────────────────────
-- 'pending'    queued, nothing has claimed it
-- 'processing' claimed by a worker (thumbnail_locked_by/at say which, when)
-- 'ready'      thumbnail_url is usable
-- 'failed'     gave up after thumbnail_attempts tries; retryable by an admin
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS thumbnail_status text NOT NULL DEFAULT 'ready';
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS thumbnail_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS thumbnail_error text;

-- Claim bookkeeping. A worker stamps both; a crashed worker leaves them set,
-- which is exactly how a stale claim is detected and reclaimed.
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS thumbnail_locked_at timestamptz;
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS thumbnail_locked_by text;

-- Next attempt time, so a retry backs off instead of spinning.
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS thumbnail_next_attempt_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_files_thumbstatus_check') THEN
    ALTER TABLE media_files ADD CONSTRAINT media_files_thumbstatus_check
      CHECK (thumbnail_status = ANY (ARRAY['pending'::text, 'processing'::text, 'ready'::text, 'failed'::text]));
  END IF;
END $$;

-- Existing rows are finished work: they either have a thumbnail or are photos.
-- Written explicitly rather than relying on the column default so the intent
-- survives a re-run against a database where the column already existed.
UPDATE media_files SET thumbnail_status = 'ready' WHERE thumbnail_status IS NULL;

-- The worker's claim query orders by this and filters on status. Partial, so
-- it stays small: finished rows are the overwhelming majority and are excluded.
CREATE INDEX IF NOT EXISTS idx_media_files_thumbnail_queue
  ON media_files (thumbnail_status, thumbnail_next_attempt_at, created_at)
  WHERE thumbnail_status IN ('pending', 'processing');

COMMIT;
