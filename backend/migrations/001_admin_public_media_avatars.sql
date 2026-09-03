-- SASA_ADMIN_V24 — roles, account status, audit log, public media, avatars.
--
-- Repeatable and safe: every statement is IF NOT EXISTS / idempotent, so
-- re-running it changes nothing. It only ADDS columns and tables; no existing
-- column is altered or dropped and no row's meaning changes.
--
-- The single most important property: existing media must not become public.
-- Both new visibility columns default to the private/draft value, and the
-- backfill below writes exactly those defaults to existing rows, so every
-- family upload that exists today stays private family content.

BEGIN;

-- ── Account status ──────────────────────────────────────────────────────
-- 'active' | 'suspended'. Suspension blocks new sessions; see the login
-- handler. Existing accounts are explicitly backfilled to 'active'.
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_by uuid REFERENCES users(id) ON DELETE SET NULL;

-- Session revocation without a session table: any token issued at or before
-- this instant is rejected. Cheap, and it works with the existing stateless JWT.
ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens_valid_after timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_status_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_status_check
      CHECK (status = ANY (ARRAY['active'::text, 'suspended'::text]));
  END IF;
END $$;

-- ── Public media library ────────────────────────────────────────────────
-- 'private' = family media assigned to children (everything that exists today).
-- 'public'  = admin-curated library media, visible to guests once published.
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private';
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS publication_status text NOT NULL DEFAULT 'draft';
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE media_files ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_files_visibility_check') THEN
    ALTER TABLE media_files ADD CONSTRAINT media_files_visibility_check
      CHECK (visibility = ANY (ARRAY['private'::text, 'public'::text]));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_files_pubstatus_check') THEN
    ALTER TABLE media_files ADD CONSTRAINT media_files_pubstatus_check
      CHECK (publication_status = ANY (ARRAY['draft'::text, 'published'::text]));
  END IF;
END $$;

-- Explicit backfill. The defaults already cover new rows; this states the
-- intent for rows that existed before the columns did, so nothing depends on
-- reading the default from the catalogue.
UPDATE media_files SET visibility = 'private' WHERE visibility IS NULL;
UPDATE media_files SET publication_status = 'draft' WHERE publication_status IS NULL;

-- The guest feed reads exactly this pair, so it gets its own index.
CREATE INDEX IF NOT EXISTS idx_media_files_public_published
  ON media_files (visibility, publication_status, created_at DESC);

-- ── Admin audit log ─────────────────────────────────────────────────────
-- Append-only record of sensitive administrative actions. actor_user_id is
-- ON DELETE SET NULL so removing an admin never erases the history of what
-- they did. `details` holds non-sensitive context only; the application never
-- writes a password, PIN or hash into it.
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log (target_type, target_id);

-- ── Child avatars ───────────────────────────────────────────────────────
-- profiles.avatar_url already exists and already carries "emoji:<char>"
-- presets. Uploaded avatars are stored as a relative /avatars/<uuid>.webp
-- path served through the authenticated route, never as a filesystem path.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_updated_at timestamptz;

COMMIT;
