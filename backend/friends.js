/* SASA_DIRECT_SHARING_V36 — parent-approved friendships, then direct sharing.
 *
 * Everything here exists to keep two promises:
 *
 *   - a child is only ever addressable by a Friend ID they chose to give out.
 *     There is no listing, no partial match and no name search, so an ID
 *     cannot be discovered, only received.
 *   - nothing connects without BOTH families agreeing. A friendship needs one
 *     approval per side, and the parents are told in the approval itself that
 *     it lets these children share photos and videos directly.
 *
 * Sharing after that is immediate, and stays under parental control through
 * reversibility rather than a queue: a parent can see every shared item,
 * revoke one, switch sharing off for a friend or for their child, and remove
 * or block the friendship. Each takes effect on the next request.
 *
 * The functions that answer "may this child see this?" are used by the media
 * delivery path as well as the listings, so a share cannot be enjoyed through
 * one route while being denied by another.
 */

/** Everything a child may learn about another child. Nothing else. */
export function safeChildShape(profile) {
  if (!profile) return null;
  return {
    friend_id: profile.friend_id,
    display_name: profile.display_name,
    // A URL the caller can render; never a storage path.
    avatar_url: profile.avatar_url ? `/api/profiles/${profile.id}/avatar` : null,
  };
}

/** Friend IDs are SASA- plus six unambiguous characters. */
export const FRIEND_ID_PATTERN = /^SASA-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$/;

export function normaliseFriendId(value) {
  return String(value || "").trim().toUpperCase();
}

/**
 * The child profile behind a session, or null.
 *
 * A child account owns exactly one profile. Taking it from the session rather
 * than from the request is what stops a child acting as another child by
 * changing an id in the URL.
 */
export async function childProfileForAccount(pool, account) {
  if (!account || account.role !== "child") return null;
  const { rows } = await pool.query(
    `SELECT id, display_name, avatar_url, friend_id, created_by_parent, user_id
       FROM profiles WHERE user_id = $1 AND is_parent = false LIMIT 1`,
    [account.id],
  );
  return rows[0] || null;
}

/** True when this parent account owns that child profile. */
export async function parentOwnsProfile(pool, account, profileId) {
  if (!account || (account.role !== "parent" && account.role !== "admin")) return false;
  if (account.role === "admin") return true;
  const { rows } = await pool.query(
    `SELECT 1 FROM profiles WHERE id = $1 AND created_by_parent = $2 AND is_parent = false LIMIT 1`,
    [profileId, account.id],
  );
  return Boolean(rows[0]);
}

/**
 * The friendship between two children, in either direction.
 *
 * Direction matters for who requested, but not for whether they are friends,
 * so lookups have to consider both orderings.
 */
export async function findFriendship(pool, aProfileId, bProfileId) {
  const { rows } = await pool.query(
    `SELECT * FROM friendships
      WHERE (requester_profile_id = $1 AND addressee_profile_id = $2)
         OR (requester_profile_id = $2 AND addressee_profile_id = $1)
      LIMIT 1`,
    [aProfileId, bProfileId],
  );
  return rows[0] || null;
}

/**
 * Recomputes a friendship's status from its two approvals.
 *
 * Kept in one place so "active" can only ever mean both parents approved —
 * there is no code path that can set it from a single approval.
 */
/**
 * Whether two approvals are satisfied, allowing for an administrator override.
 *
 * SASA_ADMIN_OVERRIDE_V33 — an override stands in for exactly ONE missing
 * side. Requiring a real parent approval alongside it means an administrator
 * acting alone can never connect two children or move a photo between
 * families; the most they can do is unblock a family that is already willing.
 */
function bothSidesSatisfied(a, b, overrideAt) {
  if (a && b) return true;
  if (!overrideAt) return false;
  // Exactly one genuine parent approval, plus the override for the other side.
  return Boolean(a) !== Boolean(b);
}

export function friendshipStatusFrom(row) {
  if (row.status === "blocked" || row.status === "rejected" || row.status === "removed") {
    return row.status;
  }
  return bothSidesSatisfied(
    row.requester_parent_approved_at,
    row.addressee_parent_approved_at,
    row.admin_override_at,
  )
    ? "active"
    : "pending";
}

/**
 * SASA_DIRECT_SHARING_V36 — a share's status.
 *
 * A 'direct' share carried its consent from the friendship, so it is active
 * from the moment it is created. Only the older 'per_share' rows are still
 * judged by the two-approval rule, which is why the mode is stored rather than
 * inferred: rows written under the old rules keep being read under them, and
 * nothing that was waiting for a parent becomes visible by deploying this.
 */
export function shareStatusFrom(row) {
  if (row.status === "rejected" || row.status === "revoked") return row.status;

  if (row.approval_mode === "direct") return "active";

  return bothSidesSatisfied(
    row.sender_parent_approved_at,
    row.recipient_parent_approved_at,
    row.admin_override_at,
  )
    ? "active"
    : "pending";
}

/**
 * SQL fragment: the share itself is authorised.
 *
 * Written once and used by every path that answers "may this child see this?"
 * — the listings and the media delivery route both. When these drift, an item
 * lists but refuses to play, or worse, plays while listed as revoked.
 */
export const SHARE_AUTHORISED_SQL = `(
     s.approval_mode = 'direct'
  OR (s.sender_parent_approved_at IS NOT NULL AND s.recipient_parent_approved_at IS NOT NULL)
  OR (s.admin_override_at IS NOT NULL
      AND (s.sender_parent_approved_at IS NOT NULL) <> (s.recipient_parent_approved_at IS NOT NULL))
)`;

/** SQL fragment: the friendship behind a share is still active. */
export const FRIENDSHIP_ACTIVE_SQL = `(
  f.status = 'active'
  AND (
        (f.requester_parent_approved_at IS NOT NULL AND f.addressee_parent_approved_at IS NOT NULL)
     OR (f.admin_override_at IS NOT NULL
         AND (f.requester_parent_approved_at IS NOT NULL) <> (f.addressee_parent_approved_at IS NOT NULL))
      )
)`;

/**
 * SQL fragment: the sender still legitimately holds the item.
 *
 * A recommendation of public media is exempt: nobody needs to hold a published
 * item to point at it, and requiring an assignment would make a recommendation
 * vanish for reasons the children could not understand.
 */
export const SENDER_STILL_HOLDS_SQL = `(
  s.is_recommendation
  OR EXISTS (
    SELECT 1 FROM media_child_access mca
     WHERE mca.media_id = s.media_id
       AND mca.child_profile_id = s.sender_profile_id
  )
)`;

/**
 * Whether new shares may flow along a friendship right now.
 *
 * Checked when a child presses Send, and deliberately NOT when the recipient
 * reads: turning sharing off stops new items arriving, it does not reach back
 * and delete what a child was already given. Removing the item is a separate,
 * explicit act — revoking the share.
 */
export function directSharingAllowed(friendship, senderProfile, recipientProfile) {
  if (friendshipStatusFrom(friendship) !== "active") {
    return { allowed: false, reason: "friendship_not_active" };
  }

  if (friendship.requester_sharing_disabled_at || friendship.addressee_sharing_disabled_at) {
    return { allowed: false, reason: "sharing_off_for_friend" };
  }

  if (!senderProfile?.direct_sharing_enabled) {
    return { allowed: false, reason: "sharing_off_for_me" };
  }

  if (!recipientProfile?.direct_sharing_enabled) {
    return { allowed: false, reason: "sharing_off_for_them" };
  }

  return { allowed: true, reason: null };
}

/**
 * Whether a child may see a media item because it was shared with them.
 *
 * Deliberately strict, and re-evaluated on every media read rather than
 * cached: the share must be active, the friendship behind it must still be
 * active, and the sender must still legitimately have the item. Revoking any
 * one of those cuts access off at the next request.
 */
export async function activeShareForChild(pool, mediaId, childProfileId) {
  const { rows } = await pool.query(
    `SELECT s.id
       FROM media_shares s
       JOIN friendships f ON f.id = s.friendship_id
      WHERE s.media_id = $1
        AND s.recipient_profile_id = $2
        AND s.status = 'active'
        AND ${SHARE_AUTHORISED_SQL}
        AND ${FRIENDSHIP_ACTIVE_SQL}
        AND ${SENDER_STILL_HOLDS_SQL}
      LIMIT 1`,
    [mediaId, childProfileId],
  );
  return rows[0] || null;
}

/** Both parent user ids for a friendship, for approval routing. */
export async function friendshipParents(pool, friendship) {
  const { rows } = await pool.query(
    `SELECT id, created_by_parent FROM profiles WHERE id = ANY($1::uuid[])`,
    [[friendship.requester_profile_id, friendship.addressee_profile_id]],
  );
  const map = Object.fromEntries(rows.map((r) => [r.id, r.created_by_parent]));
  return {
    requesterParent: map[friendship.requester_profile_id] || null,
    addresseeParent: map[friendship.addressee_profile_id] || null,
  };
}

/**
 * Which side of a friendship this parent is on, or null when neither.
 *
 * Returning the side rather than a boolean is what lets an approval write to
 * the correct column: a parent may only approve for their own child.
 */
export async function parentSideOfFriendship(pool, account, friendship) {
  if (!account) return null;

  const { requesterParent, addresseeParent } = await friendshipParents(pool, friendship);

  /* Parenthood is tested BEFORE the role. An administrator who is also the
   * parent of one of these children is acting as that parent, not as an
   * administrator — checking the role first made every approval by such an
   * account look like an override, which is not what it is. */
  const ownsRequester = account.id === requesterParent;
  const ownsAddressee = account.id === addresseeParent;

  /* One parent owning both children is one family on both sides, so a single
   * approval genuinely is both families agreeing. Requiring two clicks would
   * be theatre, and leaving it unrepresentable meant such a friendship could
   * never become active at all. */
  if (ownsRequester && ownsAddressee) return "both";
  if (ownsRequester) return "requester";
  if (ownsAddressee) return "addressee";

  // Only now, with no parental relationship at all, is this an override.
  if (account.role === "admin") return "admin";

  return null;
}
