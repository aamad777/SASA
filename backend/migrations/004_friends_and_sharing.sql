-- SASA_FRIENDS_V32 — parent-controlled friendships and media sharing.
--
-- Two rules shape every table here:
--
--   1. A child is never addressable by anything personal. Discovery happens
--      through a Friend ID that encodes nothing about the child, their family
--      or their location, and there is no listing or partial search anywhere,
--      so an ID can only be used by someone the child gave it to.
--
--   2. Nothing connects or moves without BOTH families agreeing. A friendship
--      needs an approval from each side's parent, and so does every single
--      share. That is why approvals are two nullable timestamps rather than
--      one status flag: "who has agreed so far" has to be representable.
--
-- Repeatable and safe: only ADDs, every statement IF NOT EXISTS or guarded.
-- No existing table is altered in a way that changes a row's meaning, and no
-- existing media visibility is touched — sharing never makes anything public.

BEGIN;

-- ── Friend ID ───────────────────────────────────────────────────────────
-- Non-personal by construction: a fixed prefix plus random characters from a
-- Crockford-style alphabet with I, L, O, U, 0 and 1 removed, so a child can
-- read one aloud without ambiguity.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS friend_id text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_friend_id_key') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_friend_id_key UNIQUE (friend_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION sasa_generate_friend_id() RETURNS text AS $$
DECLARE
  alphabet text := '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  candidate text;
  i int;
BEGIN
  LOOP
    candidate := 'SASA-';
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE friend_id = candidate);
  END LOOP;
  RETURN candidate;
END;
$$ LANGUAGE plpgsql;

-- Backfill every existing child. Parent profiles get none: only children have
-- friends, and giving a parent an ID would create a way to address an adult.
UPDATE profiles SET friend_id = sasa_generate_friend_id()
 WHERE friend_id IS NULL AND is_parent = false;

-- ── Friendships ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- 'pending'  one or both parents have not answered
  -- 'active'   both approved; only now may anything be shared
  -- 'rejected' a parent declined this request
  -- 'blocked'  a parent blocked the pair; no new request may be made
  -- 'removed'  previously active, ended by a parent
  status text NOT NULL DEFAULT 'pending',

  -- Two separate approvals, because "both families agreed" cannot be
  -- represented by a single flag.
  requester_parent_approved_at timestamptz,
  addressee_parent_approved_at timestamptz,

  decided_by uuid REFERENCES users(id) ON DELETE SET NULL,
  rejected_at  timestamptz,
  blocked_at   timestamptz,
  removed_at   timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- A child cannot befriend themselves.
  CONSTRAINT friendships_not_self CHECK (requester_profile_id <> addressee_profile_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'friendships_status_check') THEN
    ALTER TABLE friendships ADD CONSTRAINT friendships_status_check
      CHECK (status = ANY (ARRAY['pending','active','rejected','blocked','removed']));
  END IF;
END $$;

-- One row per ordered pair, so a duplicate request updates rather than stacks.
CREATE UNIQUE INDEX IF NOT EXISTS idx_friendships_pair
  ON friendships (requester_profile_id, addressee_profile_id);

-- Answering "who are my friends" reads both columns.
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships (requester_profile_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships (addressee_profile_id, status);

-- ── Media shares ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id uuid NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  friendship_id uuid NOT NULL REFERENCES friendships(id) ON DELETE CASCADE,
  sender_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- 'pending' | 'active' | 'rejected' | 'revoked'
  status text NOT NULL DEFAULT 'pending',

  -- Again two approvals: the owning family must agree to it leaving, and the
  -- receiving family must agree to it arriving.
  sender_parent_approved_at    timestamptz,
  recipient_parent_approved_at timestamptz,

  decided_by uuid REFERENCES users(id) ON DELETE SET NULL,
  rejected_at timestamptz,
  revoked_at  timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT media_shares_not_self CHECK (sender_profile_id <> recipient_profile_id)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'media_shares_status_check') THEN
    ALTER TABLE media_shares ADD CONSTRAINT media_shares_status_check
      CHECK (status = ANY (ARRAY['pending','active','rejected','revoked']));
  END IF;
END $$;

-- The same item cannot be shared twice to the same child.
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_shares_unique
  ON media_shares (media_id, recipient_profile_id);

-- The authorisation check on every private media read filters on exactly this.
CREATE INDEX IF NOT EXISTS idx_media_shares_recipient
  ON media_shares (recipient_profile_id, status);
CREATE INDEX IF NOT EXISTS idx_media_shares_media ON media_shares (media_id, status);

COMMIT;
