/* SASA_FRIENDS_V32 — the child's Friends page.
 *
 * Two deliberate absences: there is no browse or as-you-type search, because
 * the server only answers exact Friend IDs and a suggestive UI would imply a
 * capability that must not exist; and there is no message field anywhere,
 * because the feature carries media and approvals, never free text.
 */

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Loader2, UserPlus, Users, X } from "lucide-react";
import {
  cancelFriendRequest,
  getMyFriendId,
  listFriends,
  lookupFriendId,
  sendFriendRequest,
  type Friend,
  type SafeChild,
} from "@/lib/friends-api";

const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for grown-ups",
  active: "Friends",
  rejected: "Not approved",
  blocked: "Blocked",
  removed: "Removed",
};

function StatusChip({ status }: { status: string }) {
  return (
    <span className={`sasa-friend-chip is-${status}`} role="status">
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function Avatar({ child }: { child: SafeChild }) {
  const initial = (child.display_name || "?").charAt(0).toUpperCase();
  return (
    <span className="sasa-friend-avatar" aria-hidden="true">
      {child.avatar_url ? <img src={child.avatar_url} alt="" /> : initial}
    </span>
  );
}

export default function KidsFriends({ token }: { token: string }) {
  const [friendId, setFriendId] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<SafeChild | null>(null);
  const [searchNote, setSearchNote] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getMyFriendId(token), listFriends(token)])
      .then(([mine, list]) => {
        setFriendId(mine.friend_id);
        setFriends(list.friends);
        setError("");
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(load, [load]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(friendId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the ID is on screen to read out anyway.
      setCopied(false);
    }
  };

  const doSearch = async () => {
    const value = query.trim().toUpperCase();
    if (!value) return;

    setSearching(true);
    setFound(null);
    setSearchNote("");

    try {
      const result = await lookupFriendId(token, value);
      setFound(result.child);
      if (result.friendship) {
        setSearchNote(`Already ${(STATUS_LABEL[result.friendship.status] || "").toLowerCase()}.`);
      }
    } catch {
      /* The server gives the same answer for "no such ID", "that's you" and
       * "blocked", so this message must not guess between them. */
      setSearchNote("No friend found with that Friend ID. Check it and try again.");
    } finally {
      setSearching(false);
    }
  };

  const doRequest = async () => {
    if (!found) return;
    try {
      await sendFriendRequest(token, found.friend_id);
      setFound(null);
      setQuery("");
      setSearchNote("Sent! A grown-up on both sides needs to say yes.");
      load();
    } catch (e) {
      setSearchNote(e instanceof Error ? e.message : "Could not send the request.");
    }
  };

  const doCancel = async (id: string) => {
    try {
      await cancelFriendRequest(token, id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel.");
    }
  };

  const active = friends.filter((f) => f.status === "active");
  const pending = friends.filter((f) => f.status === "pending");
  const other = friends.filter((f) => !["active", "pending"].includes(f.status));

  return (
    <div className="sasa-friends">
      <section className="sasa-friends-card">
        <h2>My Friend ID</h2>
        <p className="sasa-friends-hint">
          Share this with a friend so they can add you. Only someone who has your exact ID can find
          you.
        </p>
        <div className="sasa-friendid-row">
          <code className="sasa-friendid">{loading ? "…" : friendId}</code>
          <button type="button" className="sasa-btn" onClick={copyId} disabled={!friendId}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </section>

      <section className="sasa-friends-card">
        <h2>Add a friend</h2>
        <div className="sasa-friends-search">
          <label className="sasa-sr-only" htmlFor="friend-id-input">
            Enter your friend&apos;s exact Friend ID
          </label>
          <input
            id="friend-id-input"
            className="sasa-friends-input"
            placeholder="SASA-XXXXXX"
            value={query}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") doSearch();
            }}
          />
          <button
            type="button"
            className="sasa-btn is-primary"
            onClick={doSearch}
            disabled={searching}
          >
            {searching ? <Loader2 size={16} /> : <UserPlus size={16} />}
            Find
          </button>
        </div>

        {found && (
          <div className="sasa-friend-row">
            <Avatar child={found} />
            <div className="sasa-friend-name">
              <strong>{found.display_name}</strong>
              <span>{found.friend_id}</span>
            </div>
            <button type="button" className="sasa-btn is-primary" onClick={doRequest}>
              Ask to be friends
            </button>
          </div>
        )}

        {searchNote && (
          <p className="sasa-friends-note" role="status">
            {searchNote}
          </p>
        )}
      </section>

      {error && (
        <p className="sasa-friends-note is-error" role="alert">
          {error}
        </p>
      )}

      {pending.length > 0 && (
        <section className="sasa-friends-card">
          <h2>Waiting for grown-ups</h2>
          <ul className="sasa-friend-list">
            {pending.map((f) => (
              <li key={f.id} className="sasa-friend-row">
                <Avatar child={f.child} />
                <div className="sasa-friend-name">
                  <strong>{f.child.display_name}</strong>
                  <StatusChip status={f.status} />
                </div>
                {f.direction === "outgoing" && (
                  <button type="button" className="sasa-btn" onClick={() => doCancel(f.id)}>
                    <X size={16} /> Cancel
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="sasa-friends-card">
        <h2>
          <Users size={18} /> My friends
        </h2>
        {loading ? (
          <p className="sasa-friends-note">Loading…</p>
        ) : active.length === 0 ? (
          <p className="sasa-friends-note">
            No friends yet. Share your Friend ID with someone you know.
          </p>
        ) : (
          <ul className="sasa-friend-list">
            {active.map((f) => (
              <li key={f.id} className="sasa-friend-row">
                <Avatar child={f.child} />
                <div className="sasa-friend-name">
                  <strong>{f.child.display_name}</strong>
                  <span>{f.child.friend_id}</span>
                </div>
                <StatusChip status={f.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {other.length > 0 && (
        <section className="sasa-friends-card">
          <h2>Not active</h2>
          <ul className="sasa-friend-list">
            {other.map((f) => (
              <li key={f.id} className="sasa-friend-row">
                <Avatar child={f.child} />
                <div className="sasa-friend-name">
                  <strong>{f.child.display_name}</strong>
                </div>
                <StatusChip status={f.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
