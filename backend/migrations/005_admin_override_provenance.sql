-- SASA_ADMIN_OVERRIDE_V33 — an administrator may unblock a stuck approval,
-- but never by impersonating a parent.
--
-- Approvals previously required both parents, with no override at all. That
-- is safe but has no answer for a parent who has lost access, leaving a
-- request pending forever.
--
-- The override is therefore recorded in its OWN columns. The parent columns
-- keep meaning exactly one thing — "this family agreed, at this time" — so a
-- row never stores a consent that did not happen, and both parents can be
-- shown honestly that an administrator, not they, unblocked it.
--
-- One real parent approval is still required: the override substitutes for a
-- single missing side, never for both. An administrator acting alone cannot
-- connect two children or move a photo between families.
--
-- Repeatable and safe: only ADDs nullable columns; no existing row changes
-- meaning and no existing approval is affected.

BEGIN;

ALTER TABLE friendships  ADD COLUMN IF NOT EXISTS admin_override_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE friendships  ADD COLUMN IF NOT EXISTS admin_override_at timestamptz;
ALTER TABLE friendships  ADD COLUMN IF NOT EXISTS admin_override_reason text;

ALTER TABLE media_shares ADD COLUMN IF NOT EXISTS admin_override_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE media_shares ADD COLUMN IF NOT EXISTS admin_override_at timestamptz;
ALTER TABLE media_shares ADD COLUMN IF NOT EXISTS admin_override_reason text;

COMMIT;
