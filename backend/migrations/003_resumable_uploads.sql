-- SASA_RESUMABLE_UPLOADS_V28 — chunked, resumable video upload sessions.
--
-- Why: Cloudflare refuses a proxied request body over 100MB with a plain 413,
-- so the 500MB application limit was unreachable through the real public
-- portal no matter how fast the origin answered. Splitting the file into
-- chunks that are each far below that cap is the only way to move a large
-- video through the proxy, and tracking the chunks server-side is what makes
-- an interrupted upload resumable instead of restarting from zero.
--
-- The session rows are the authority on what has arrived. The client is never
-- trusted for it: a resume asks the server which chunks it already holds.
--
-- Repeatable and safe: only CREATE ... IF NOT EXISTS. No existing table is
-- altered and no existing row's meaning changes.

BEGIN;

-- One in-progress upload. Deleted once assembled, or swept after expires_at.
CREATE TABLE IF NOT EXISTS upload_sessions (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Ownership is checked on every single chunk, not just at creation.
  owner_user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename text NOT NULL,
  mime_type         text NOT NULL,
  -- Declared up front and enforced at assembly: the bytes that actually
  -- arrived must equal this exactly, or the upload is rejected.
  total_bytes       bigint NOT NULL,
  chunk_size        integer NOT NULL,
  total_chunks      integer NOT NULL,
  title             text,
  category          text,
  -- 'open' accepting chunks | 'assembling' | 'completed' | 'aborted'
  status            text NOT NULL DEFAULT 'open',
  -- Server-generated, never built from client input. See resumable-uploads.js.
  temp_dir          text NOT NULL,
  media_id          uuid REFERENCES media_files(id) ON DELETE SET NULL,
  error             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  expires_at        timestamptz NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'upload_sessions_status_check') THEN
    ALTER TABLE upload_sessions ADD CONSTRAINT upload_sessions_status_check
      CHECK (status = ANY (ARRAY['open'::text, 'assembling'::text, 'completed'::text, 'aborted'::text]));
  END IF;
END $$;

-- Which chunks have landed. The primary key is what makes a re-sent chunk
-- idempotent rather than a duplicate, and what a resume reads back.
CREATE TABLE IF NOT EXISTS upload_session_chunks (
  session_id  uuid    NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  size_bytes  integer NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, chunk_index)
);

-- The sweeper scans by expiry; an admin's resume list scans by owner.
CREATE INDEX IF NOT EXISTS idx_upload_sessions_expiry ON upload_sessions (expires_at)
  WHERE status IN ('open', 'assembling');
CREATE INDEX IF NOT EXISTS idx_upload_sessions_owner ON upload_sessions (owner_user_id, created_at DESC);

COMMIT;
