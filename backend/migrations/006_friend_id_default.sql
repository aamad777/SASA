-- SASA_KID_FRIENDS_V35 — every child must have a Friend ID, not just the ones
-- that existed when 004 ran.
--
-- 004 added profiles.friend_id and backfilled the children that existed at
-- that moment, but left the column with no default, and POST /api/parent/children
-- has never listed friend_id in its INSERT. Every child created since then was
-- therefore written with friend_id = NULL, which makes the whole Friends
-- feature unusable for them:
--
--   * GET /api/friends/me answers friend_id: null, so the child has nothing to
--     give out and the Friend ID card is blank;
--   * POST /api/friends/lookup matches on an exact friend_id, so nobody can
--     find them — and because a lookup miss is answered identically to "does
--     not exist", it reads to a child as "my friend typed it wrong";
--   * with no friendship there is nothing for POST /api/shares to hang a share
--     on, so "Share with a friend" cannot succeed either.
--
-- Fixed at the column rather than in server.js on purpose: the default applies
-- to the INSERT that is already deployed, so new children are correct without
-- a backend image rebuild, and it keeps holding for any future insert path
-- that forgets the column.
--
-- sasa_generate_friend_id() is defined in 004 and re-loops on collision; the
-- unique constraint added there remains the real guarantee.

ALTER TABLE profiles
  ALTER COLUMN friend_id SET DEFAULT sasa_generate_friend_id();

-- The children 004 could not know about. Parent profiles are deliberately
-- skipped: only children have friends, and giving a parent an ID would create
-- a way to address an adult.
UPDATE profiles
   SET friend_id = sasa_generate_friend_id()
 WHERE friend_id IS NULL
   AND is_parent = false;
