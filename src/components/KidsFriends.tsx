/* SASA_KID_FRIENDS_V35 — the child's Friends page.
 *
 * Ordered the way a child looks for things: the faces they already know come
 * first, one obvious "Add friend" button opens everything else, and the
 * machinery — Friend ID, exact-ID lookup — lives inside that sheet rather
 * than being the first thing on the page. The previous order put the child's
 * own ID and a text field above their friends, so "see my friends" meant
 * scrolling past two forms.
 *
 * Two deliberate absences: there is no browse or as-you-type search, because
 * the server only answers exact Friend IDs and a suggestive UI would imply a
 * capability that must not exist; and there is no message field anywhere,
 * because the feature carries media and approvals, never free text.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, Copy, Loader2, Search, UserPlus, Users, X } from "lucide-react";
import {
  cancelFriendRequest,
  getMyFriendId,
  listFriends,
  lookupFriendId,
  sendFriendRequest,
  type Friend,
  type SafeChild,
  type SharedMediaItem,
} from "@/lib/friends-api";
import FriendAvatar from "./FriendAvatar";
import KidsSharedWithMe from "./KidsSharedWithMe";

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

/** First name only — a child recognises "Ben", not "Ben Whitfield". */
function firstName(displayName: string): string {
  return displayName.split(" ")[0];
}

export default function KidsFriends({
  token,
  onOpenShared,
}: {
  token: string;
  /** Opens a shared item in the player; without it the cards are inert. */
  onOpenShared?: (item: SharedMediaItem) => void;
}) {
  const [friendId, setFriendId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [openFriend, setOpenFriend] = useState<Friend | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<SafeChild | null>(null);
  const [searchNote, setSearchNote] = useState("");
  const [sent, setSent] = useState(false);

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
    if (!friendId) return;
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
    setSent(false);

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
      setSent(true);
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

  const closeAdd = useCallback(() => {
    setAddOpen(false);
    setFound(null);
    setSearchNote("");
    setQuery("");
    setSent(false);
  }, []);

  const active = friends.filter((f) => f.status === "active");
  const pending = friends.filter((f) => f.status === "pending");
  const rejected = friends.filter((f) => ["rejected", "blocked"].includes(f.status));

  /* A child-safe friend page: face, first name, and what they have shared.
   * Deliberately nothing else — no Friend ID of theirs to pass around, no
   * parent, no contact details, and no way to type at each other. */
  if (openFriend) {
    return (
      <div className="sasa-friends">
        <button type="button" className="sasa-btn" onClick={() => setOpenFriend(null)}>
          <ChevronLeft size={18} /> Back to friends
        </button>

        <section className="sasa-friends-card sasa-friendpage-head">
          <FriendAvatar child={openFriend.child} className="is-lg" />
          <h2>{firstName(openFriend.child.display_name)}</h2>
          <StatusChip status={openFriend.status} />
        </section>

        <section className="sasa-friends-card">
          <h2>Shared with you</h2>
          <KidsSharedWithMe
            token={token}
            kind="video"
            from={openFriend.child.friend_id}
            onOpen={onOpenShared}
          />
          <KidsSharedWithMe
            token={token}
            kind="photo"
            from={openFriend.child.friend_id}
            onOpen={onOpenShared}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="sasa-friends">
      {/* Faces first. Everything a child comes to this page for is above the
          fold at 360px; the machinery is one button away. */}
      <section className="sasa-friends-card">
        <div className="sasa-friends-cardhead">
          <h2>
            <Users size={18} /> My friends
          </h2>
          <button
            type="button"
            className="sasa-btn is-primary"
            onClick={() => setAddOpen(true)}
            aria-haspopup="dialog"
          >
            <UserPlus size={18} /> Add friend
          </button>
        </div>

        {loading ? (
          <p className="sasa-friends-note">Loading…</p>
        ) : active.length === 0 ? (
          <p className="sasa-friends-note">
            No friends yet. Tap <strong>Add friend</strong> and type your friend&apos;s Friend ID —
            then a grown-up on both sides says yes.
          </p>
        ) : (
          /* Big circles and first names: a child recognises a face far faster
             than a row of text. Tapping one opens their page. */
          <ul className="sasa-friendgrid">
            {active.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="sasa-friendgrid-btn"
                  onClick={() => setOpenFriend(f)}
                >
                  <FriendAvatar child={f.child} />
                  <span className="sasa-friendgrid-name">{firstName(f.child.display_name)}</span>
                </button>
              </li>
            ))}
          </ul>
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
          <p className="sasa-friends-hint">
            A grown-up in both families says yes before you become friends.
          </p>
          <ul className="sasa-friend-list">
            {pending.map((f) => (
              <li key={f.id} className="sasa-friend-row">
                <FriendAvatar child={f.child} variant="row" />
                <div className="sasa-friend-name">
                  <strong>{firstName(f.child.display_name)}</strong>
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

      {rejected.length > 0 && (
        <section className="sasa-friends-card">
          <h2>Not approved</h2>
          <p className="sasa-friends-hint">A grown-up said no to these. You can ask them why.</p>
          <ul className="sasa-friend-list">
            {rejected.map((f) => (
              <li key={f.id} className="sasa-friend-row">
                <FriendAvatar child={f.child} variant="row" />
                <div className="sasa-friend-name">
                  <strong>{firstName(f.child.display_name)}</strong>
                </div>
                <StatusChip status={f.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {addOpen && (
        <AddFriendSheet
          onClose={closeAdd}
          friendId={friendId}
          loadingId={loading}
          copied={copied}
          onCopy={copyId}
          query={query}
          onQueryChange={setQuery}
          onSearch={doSearch}
          searching={searching}
          found={found}
          note={searchNote}
          sent={sent}
          onRequest={doRequest}
        />
      )}
    </div>
  );
}

/**
 * The one sheet a child needs to gain a friend: the ID to hand out, and the
 * box to type one into. Kept as a bottom sheet so it sits under the thumb on
 * a phone, and shares the share-sheet's chrome rather than inventing more.
 */
function AddFriendSheet({
  onClose,
  friendId,
  loadingId,
  copied,
  onCopy,
  query,
  onQueryChange,
  onSearch,
  searching,
  found,
  note,
  sent,
  onRequest,
}: {
  onClose: () => void;
  friendId: string | null;
  loadingId: boolean;
  copied: boolean;
  onCopy: () => void;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  searching: boolean;
  found: SafeChild | null;
  note: string;
  sent: boolean;
  onRequest: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Escape, and Android's Back button, reach the WebView as the same key.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="sasa-share-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Add a friend"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sasa-sharesheet">
        <div className="sasa-share-head">
          <h2>Add a friend</h2>
          <button type="button" className="sasa-iconbtn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div>
          <h3 className="sasa-friends-subhead">Your Friend ID</h3>
          <p className="sasa-friends-hint">
            Give this to a friend so they can add you. Only someone who has your exact ID can find
            you.
          </p>
          <div className="sasa-friendid-row">
            <code className="sasa-friendid">{loadingId ? "…" : friendId || "Not ready yet"}</code>
            <button type="button" className="sasa-btn" onClick={onCopy} disabled={!friendId}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          {/* A missing ID is a real condition, not a blank box: say so rather
              than showing an empty field the child cannot act on. */}
          {!loadingId && !friendId && (
            <p className="sasa-friends-note is-error" role="alert">
              Your Friend ID isn&apos;t ready yet. Ask a grown-up to check your profile.
            </p>
          )}
        </div>

        <div>
          <h3 className="sasa-friends-subhead">Find your friend</h3>
          <div className="sasa-friends-search">
            <label className="sasa-sr-only" htmlFor="friend-id-input">
              Enter your friend&apos;s exact Friend ID
            </label>
            <input
              id="friend-id-input"
              ref={inputRef}
              className="sasa-friends-input"
              placeholder="SASA-XXXXXX"
              value={query}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => onQueryChange(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
            />
            <button
              type="button"
              className="sasa-btn is-primary"
              onClick={onSearch}
              disabled={searching || !query.trim()}
            >
              {searching ? <Loader2 size={16} /> : <Search size={16} />}
              Find
            </button>
          </div>
        </div>

        {found && (
          <div className="sasa-friend-row">
            <FriendAvatar child={found} />
            {/* Name only. The ID they typed is already on screen, and nothing
                else about another child is safe to show here. */}
            <div className="sasa-friend-name">
              <strong>{firstName(found.display_name)}</strong>
            </div>
            <button type="button" className="sasa-btn is-primary" onClick={onRequest}>
              <UserPlus size={16} /> Add friend
            </button>
          </div>
        )}

        {note && (
          <p className={sent ? "sasa-friends-note is-ok" : "sasa-friends-note"} role="status">
            {note}
          </p>
        )}

        <button type="button" className="sasa-btn sasa-sharesheet-close" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
