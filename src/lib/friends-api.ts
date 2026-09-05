/* SASA_FRIENDS_V32 — client for friendships and media sharing.
 *
 * Every rule these calls appear to enforce is really enforced by the server;
 * this module only shapes requests and surfaces the answers. In particular a
 * lookup is exact-match on the server, so there is deliberately no
 * as-you-type search here — that would imply a capability the API does not
 * offer and must not offer.
 */

import { API_BASE_URL } from "@/lib/api";

/** Everything a child may learn about another child. */
export type SafeChild = {
  friend_id: string;
  display_name: string;
  avatar_url: string | null;
};

export type FriendshipStatus = "pending" | "active" | "rejected" | "blocked" | "removed";

export type Friend = {
  id: string;
  status: FriendshipStatus;
  direction: "incoming" | "outgoing";
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
  shared_by: SafeChild;
};

export type ParentFriendship = {
  id: string;
  status: FriendshipStatus;
  my_child: string;
  other_child: string;
  other_friend_id: string;
  direction: "incoming" | "outgoing";
  awaiting_me: boolean;
  awaiting_other: boolean;
};

export type ParentShare = {
  id: string;
  status: "pending" | "active" | "rejected" | "revoked";
  title: string;
  media_type: "video" | "photo";
  from_child: string;
  to_child: string;
  direction: "incoming" | "outgoing";
  awaiting_me: boolean;
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

export function shareMedia(token: string, mediaId: string, friendshipId: string) {
  return call<{ share: { id: string; status: string } }>(token, "/shares", {
    method: "POST",
    body: JSON.stringify({ mediaId, friendshipId }),
  });
}

export function listSharedWithMe(token: string) {
  return call<{ media: SharedMediaItem[] }>(token, "/shares/received");
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
) {
  return call<{ friendship: { id: string; status: FriendshipStatus } }>(
    token,
    `/parent/friendships/${id}/${action}`,
    { method: "POST" },
  );
}

export function decideShare(token: string, id: string, action: "approve" | "reject" | "revoke") {
  return call<{ share: { id: string; status: string } }>(token, `/parent/shares/${id}/${action}`, {
    method: "POST",
  });
}
