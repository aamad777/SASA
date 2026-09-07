/* SASA_DIRECT_SHARING_V36 — client for friendships and media sharing.
 *
 * Every rule these calls appear to enforce is really enforced by the server;
 * this module only shapes requests and surfaces the answers. In particular a
 * lookup is exact-match on the server, so there is deliberately no
 * as-you-type search here — that would imply a capability the API does not
 * offer and must not offer.
 *
 * Sharing is direct: both parents approve the friendship once, and after that
 * a child's Send lands with their friend immediately. `can_share` and
 * `share_blocked_reason` come from the server per friend, so the interface can
 * avoid offering a Send that would be refused.
 */

import { API_BASE_URL } from "@/lib/api";

/** Everything a child may learn about another child. */
export type SafeChild = {
  friend_id: string;
  display_name: string;
  avatar_url: string | null;
};

export type FriendshipStatus = "pending" | "active" | "rejected" | "blocked" | "removed";

/** Why the server would refuse a send along this friendship. */
export type ShareBlockedReason =
  | "friendship_not_active"
  | "sharing_off_for_friend"
  | "sharing_off_for_me"
  | "sharing_off_for_them"
  | null;

export type Friend = {
  id: string;
  status: FriendshipStatus;
  direction: "incoming" | "outgoing";
  /** The server's own answer, so no Send button is offered that would fail. */
  can_share: boolean;
  share_blocked_reason: ShareBlockedReason;
  child: SafeChild;
};

export type SharedMediaItem = {
  id: string;
  media_type: "video" | "photo";
  title: string;
  description: string | null;
  category: string | null;
  content_url: string;
  thumbnail_url: string | null;
  share_id: string;
  /** A pointer at something public, rather than an item handed over. */
  is_recommendation: boolean;
  shared_by: SafeChild;
};

/** Recorded when an administrator unblocked an approval instead of a parent. */
export type AdminOverride = {
  at: string;
  reason: string | null;
  /** True when THIS parent did approve their own side; the override covered
   *  the other family. False means the override covered this parent's side. */
  approved_by_me: boolean;
};

export type ParentFriendship = {
  id: string;
  status: FriendshipStatus;
  my_child: string;
  my_child_profile_id: string;
  other_child: string;
  other_friend_id: string;
  direction: "incoming" | "outgoing";
  awaiting_me: boolean;
  awaiting_other: boolean;
  /** Whether anything can actually move along this friendship right now. */
  sharing_active: boolean;
  my_child_sharing_enabled: boolean;
  sharing_off_by_me: boolean;
  /** Reported so a parent knows it is not their own switch in the way. */
  sharing_off_by_other_family: boolean;
  admin_override: AdminOverride | null;
};

export type ParentShare = {
  id: string;
  status: "pending" | "active" | "rejected" | "revoked";
  title: string;
  media_type: "video" | "photo";
  from_child: string;
  to_child: string;
  direction: "incoming" | "outgoing";
  /** True for everything shared under the current rules. */
  direct: boolean;
  /** Only ever true for rows left over from the old per-share approval. */
  awaiting_me: boolean;
  can_revoke: boolean;
  is_recommendation: boolean;
  shared_at: string;
  admin_override: AdminOverride | null;
};

async function call<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    // The server answers 404 identically for "missing" and "not yours", so the
    // message shown must not speculate about which it was.
    throw new Error(body?.message || body?.error || `Request failed (${response.status}).`);
  }

  return body as T;
}

export function getMyFriendId(token: string) {
  return call<{ friend_id: string; display_name: string }>(token, "/friends/me");
}

export function listFriends(token: string) {
  return call<{ friends: Friend[] }>(token, "/friends");
}

/** Exact match only — the server rejects anything that is not a full ID. */
export function lookupFriendId(token: string, friendId: string) {
  return call<{ child: SafeChild; friendship: { id: string; status: FriendshipStatus } | null }>(
    token,
    "/friends/lookup",
    { method: "POST", body: JSON.stringify({ friendId }) },
  );
}

export function sendFriendRequest(token: string, friendId: string) {
  return call<{ friendship: { id: string; status: FriendshipStatus } }>(token, "/friends/request", {
    method: "POST",
    body: JSON.stringify({ friendId }),
  });
}

/** A child may only withdraw a request that no parent has approved yet. */
export function cancelFriendRequest(token: string, id: string) {
  return call<{ status: string }>(token, `/friends/${id}`, { method: "DELETE" });
}

/**
 * Sends an item to one friend, immediately.
 *
 * `sent_to` comes back so the child can be told "Sent to Hatem" — naming the
 * friend is the only confirmation that it went where they meant.
 */
export function shareMedia(token: string, mediaId: string, friendshipId: string) {
  return call<{
    share: { id: string; status: string; is_recommendation: boolean; sent_to: string };
  }>(token, "/shares", {
    method: "POST",
    body: JSON.stringify({ mediaId, friendshipId }),
  });
}

/** "Allow direct sharing with approved friends", for one child. */
export function setChildDirectSharing(token: string, profileId: string, enabled: boolean) {
  return call<{ child: { id: string; display_name: string; direct_sharing_enabled: boolean } }>(
    token,
    `/parent/children/${profileId}/direct-sharing`,
    { method: "PATCH", body: JSON.stringify({ enabled }) },
  );
}

/** Sharing on or off for one friendship, from this family's side. */
export function setFriendshipSharing(token: string, friendshipId: string, enabled: boolean) {
  return call<{
    friendship: { id: string; sharing_off_by_me: boolean; sharing_off_by_other_family: boolean };
  }>(token, `/parent/friendships/${friendshipId}/sharing`, {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
}

export function listSharedWithMe(token: string) {
  return call<{ media: SharedMediaItem[] }>(token, "/shares/received");
}

/* SASA_DIRECT_SHARING_V36 — what this child has sent, and what became of it.
 *
 * Carries no content URL by design: it answers "does my friend already have
 * this, and did a grown-up take it back?", which is all the share sheet needs.
 * Reading it from the server rather than from session state is what makes the
 * sheet still correct after a refresh. */
export type SentShare = {
  share_id: string;
  media_id: string;
  media_type: "video" | "photo";
  title: string;
  friendship_id: string;
  status: "pending" | "active" | "rejected" | "revoked";
  is_recommendation: boolean;
  created_at: string;
  updated_at: string;
  shared_with: SafeChild;
};

export function listSentShares(token: string) {
  return call<{ shares: SentShare[] }>(token, "/shares/sent");
}

export function getParentFriendsOverview(token: string) {
  return call<{ friendships: ParentFriendship[]; shares: ParentShare[]; pending_count: number }>(
    token,
    "/parent/friends-overview",
  );
}

export function decideFriendship(
  token: string,
  id: string,
  action: "approve" | "reject" | "block" | "remove",
  /** Required only for an administrator override; a parent never sends one. */
  reason?: string,
) {
  return call<{ friendship: { id: string; status: FriendshipStatus } }>(
    token,
    `/parent/friendships/${id}/${action}`,
    { method: "POST", body: reason ? JSON.stringify({ reason }) : undefined },
  );
}

export function decideShare(
  token: string,
  id: string,
  action: "approve" | "reject" | "revoke",
  reason?: string,
) {
  return call<{ share: { id: string; status: string } }>(token, `/parent/shares/${id}/${action}`, {
    method: "POST",
    body: reason ? JSON.stringify({ reason }) : undefined,
  });
}
