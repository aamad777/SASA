/* SASA_KID_SHARE_V34 — the child's share sheet.
 *
 * Rewritten because the old one was a list of rows with a Share button each:
 * one friend per tap, no sense of what had already been sent, and silence
 * when nothing could be shared. A child needs large targets, the ability to
 * pick several friends at once, and — most importantly — to be told WHY when
 * sharing is not possible rather than facing a button that does nothing.
 *
 * Nothing here decides permission. The server re-checks the friendship, the
 * assignment and both parents' approval; this only shapes the request and
 * reports honestly what came back.
 */

import { useEffect, useState } from "react";
import { Check, Clock, Loader2, Send, X } from "lucide-react";
import { listFriends, shareMedia, type Friend } from "@/lib/friends-api";
import FriendAvatar from "./FriendAvatar";

type Outcome = { friend: string; ok: boolean; note: string };

export default function ShareToFriend({
  token,
  mediaId,
  mediaTitle,
  onClose,
}: {
  token: string;
  /* SASA_KID_SHARE_V35 — null for an item the server would refuse (anything
   * not assigned to this child). The sheet still opens and says so; a control
   * that silently does nothing is the thing being fixed. */
  mediaId: string | null;
  mediaTitle: string;
  onClose: () => void;
}) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingWith, setPendingWith] = useState<Set<string>>(new Set());
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  useEffect(() => {
    let cancelled = false;

    /* "Already shared" has to come from somewhere the child can see before
     * they tap, otherwise the only feedback is a duplicate error afterwards.
     * The received list is the recipient's view, so it cannot tell us what we
     * sent; the duplicate check on the server remains the real guard and its
     * message is surfaced verbatim below. */
    listFriends(token)
      .then((d) => {
        if (!cancelled) setFriends(d.friends.filter((f) => f.status === "active"));
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  /* Escape closes the sheet, and Android's Back button reaches the WebView as
   * the same key. Without this the only way out on a phone was the small X. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id: string) => {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const send = async () => {
    if (chosen.size === 0 || !mediaId) return;
    setSending(true);
    const results: Outcome[] = [];

    for (const friendshipId of chosen) {
      const friend = friends.find((f) => f.id === friendshipId);
      const name = friend?.child.display_name || "your friend";
      try {
        await shareMedia(token, mediaId, friendshipId);
        results.push({ friend: name, ok: true, note: "Sent to your parents for approval." });
        setPendingWith((p) => new Set(p).add(friendshipId));
      } catch (e) {
        // The server's own words — "already shared", "not an approved friend"
        // — are more accurate than anything guessed here.
        results.push({
          friend: name,
          ok: false,
          note: e instanceof Error ? e.message : "That did not go through.",
        });
      }
    }

    setChosen(new Set());
    setOutcomes(results);
    setSending(false);
  };

  const pickable = friends.filter((f) => !pendingWith.has(f.id));
  const alreadySent = friends.filter((f) => pendingWith.has(f.id));

  return (
    <div
      className="sasa-share-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Share ${mediaTitle} with a friend`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sasa-sharesheet">
        <div className="sasa-share-head">
          <h2>Send to a friend</h2>
          <button type="button" className="sasa-iconbtn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <p className="sasa-sharesheet-item">{mediaTitle}</p>

        {loading && mediaId && <p className="sasa-friends-note">Loading your friends…</p>}

        {/* Each of these is a real explanation, never a dead button. */}
        {!mediaId && (
          <p className="sasa-friends-note">
            This one can&apos;t be sent to a friend. You can send the photos and videos a grown-up
            put in your own library.
          </p>
        )}

        {mediaId && !loading && loadError && (
          <p className="sasa-friends-note is-error" role="alert">
            {loadError}
          </p>
        )}

        {mediaId && !loading && !loadError && friends.length === 0 && (
          <p className="sasa-friends-note">
            You don&apos;t have any approved friends yet. Add a friend on the Friends page — a
            grown-up on both sides says yes first.
          </p>
        )}

        {mediaId && !loading && !loadError && friends.length > 0 && pickable.length === 0 && (
          <p className="sasa-friends-note">
            You&apos;ve already sent this to all of your friends. A grown-up is checking it.
          </p>
        )}

        {mediaId && pickable.length > 0 && (
          <>
            <ul className="sasa-friendpick">
              {pickable.map((f) => {
                const picked = chosen.has(f.id);
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      className={picked ? "sasa-friendpick-btn is-picked" : "sasa-friendpick-btn"}
                      aria-pressed={picked}
                      onClick={() => toggle(f.id)}
                    >
                      <span className="sasa-friendpick-avatarwrap">
                        <FriendAvatar child={f.child} variant="pick" />
                        {picked && (
                          <span className="sasa-friendpick-tick" aria-hidden="true">
                            <Check size={14} />
                          </span>
                        )}
                      </span>
                      <span className="sasa-friendpick-name">
                        {f.child.display_name.split(" ")[0]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              className="sasa-btn is-primary sasa-sharesheet-send"
              disabled={chosen.size === 0 || sending}
              onClick={send}
            >
              {sending ? <Loader2 size={18} /> : <Send size={18} />}
              {chosen.size > 1 ? `Send to ${chosen.size} friends` : "Send"}
            </button>
          </>
        )}

        {/* What this child has already asked for, so a second tap is never
            needed to find out. Only this session's sends are known: the API
            has no "shares I sent" listing, so nothing is claimed about
            earlier ones — the server's duplicate check answers those. */}
        {alreadySent.length > 0 && (
          <p className="sasa-friends-note">
            <Clock size={14} aria-hidden="true" /> Waiting for a grown-up:{" "}
            {alreadySent.map((f) => f.child.display_name.split(" ")[0]).join(", ")}
          </p>
        )}

        {outcomes.length > 0 && (
          <ul className="sasa-share-outcomes" role="status">
            {outcomes.map((o) => (
              <li key={o.friend} className={o.ok ? "is-ok" : "is-bad"}>
                <strong>{o.friend}</strong> — {o.note}
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="sasa-btn sasa-sharesheet-close" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
