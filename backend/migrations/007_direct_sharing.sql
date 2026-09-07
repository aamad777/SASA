-- SASA_DIRECT_SHARING_V36 — approval moves to the friendship; sharing becomes
-- immediate.
--
-- 004 required a parent approval from EACH family for every single share. That
-- is safe and unusable: a child taps Share, nothing appears for their friend,
-- and two adults have to be found before a photo moves. Children stopped
-- using it, which is worse for safety than a permission they understand,
-- because the feature they do use is the one you can supervise.
--
-- The consent is not removed, it is moved to where it is meaningful. Both
-- parents still approve, once, when the friendship is created, and they are
-- told plainly what they are agreeing to: that these two children may then
-- share photos and videos with each other directly. After that a share is
-- immediate.
--
-- What replaces per-share approval is per-share VISIBILITY and reversibility:
-- a parent sees every shared item, can revoke one, can switch sharing off for
-- a single friend, can switch it off for their child entirely, and can remove
-- or block the friendship. All of those take effect on the next request.
--
-- Repeatable and additive: only ADD COLUMN IF NOT EXISTS and guarded
-- constraints. No existing row changes meaning, and no media visibility is
-- touched — sharing still never makes anything public.

BEGIN;

-- ── Per-child switch ────────────────────────────────────────────────────
-- "Allow direct sharing with approved friends", one per child, held by the
-- parent.
--
-- Defaults to false, and is turned on when a parent approves a friendship
-- under the new wording. `decided_at` records that a parent chose explicitly,
-- so a later friendship approval cannot quietly re-enable something a parent
-- deliberately turned off.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS direct_sharing_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS direct_sharing_decided_at timestamptz;

-- Friendships that already existed are deliberately NOT opted in. Their
-- parents approved under the old rules, which said nothing about direct
-- sharing; enabling it here would hand out a capability nobody was asked
-- about. Those parents are shown the new explanation and choose.

-- ── Per-friendship switch ───────────────────────────────────────────────
-- One column per side, so "sharing with this friend is off" is attributable to
-- the family that decided it and can only be undone by them. Either side being
-- set blocks new shares in both directions: a channel one family has closed is
-- closed.
ALTER TABLE friendships
  ADD COLUMN IF NOT EXISTS requester_sharing_disabled_at timestamptz;

ALTER TABLE friendships
  ADD COLUMN IF NOT EXISTS addressee_sharing_disabled_at timestamptz;

-- ── How a share was authorised ──────────────────────────────────────────
-- 'direct'     the friendship carried the consent; visible to the recipient
--              immediately. Every new share.
-- 'per_share'  the old two-approval rule. Existing rows keep it, and keep
--              being judged by it, so nothing that was waiting for a parent
--              silently becomes visible when this migration runs.
ALTER TABLE media_shares
  ADD COLUMN IF NOT EXISTS approval_mode text NOT NULL DEFAULT 'per_share';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_shares_approval_mode_check') THEN
    ALTER TABLE media_shares ADD CONSTRAINT media_shares_approval_mode_check
      CHECK (approval_mode = ANY (ARRAY['direct','per_share']));
  END IF;
END $$;

-- ── Recommendations of public media ─────────────────────────────────────
-- Public published media needs no permission to watch, so recommending it must
-- not mint a private grant. The row exists so the recipient gets a "Sara sent
-- you this" entry and a parent can see and revoke it; access itself continues
-- to come from the item being public.
ALTER TABLE media_shares
  ADD COLUMN IF NOT EXISTS is_recommendation boolean NOT NULL DEFAULT false;

-- The recipient's list is read by (recipient, status) already; recommendations
-- are read the same way, so no new index is needed. This one serves the
-- parent's "what has my child sent" view, which orders by time.
CREATE INDEX IF NOT EXISTS idx_media_shares_sender_created
  ON media_shares (sender_profile_id, created_at DESC);

COMMIT;
