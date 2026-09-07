/* SASA_DIRECT_SHARING_V36 — the child's share sheet.
 *
 * Two actions, and then it has happened: tap a friend, press Send. The item is
 * with them straight away, because both parents agreed to that when they
 * approved the friendship.
 *
 * What this replaces asked a child to pick friends, press Send, and then wait
 * for two adults — so nothing visibly happened, and children stopped using it.
 * A feature they avoid is worse for their safety than one you can supervise,
 * which is what the parent controls behind this now provide: every shared item
 * is visible to both parents, and any of it can be taken back.
 *
 * Nothing here decides permission. The server re-checks the friendship, the
 * assignment and both switches; `can_share` only stops this sheet from
 * offering a Send that would be refused.
 */

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Send, UserPlus, X } from "lucide-react";
import { listFriends, listSentShares, shareMedia, type Friend } from "@/lib/friends-api";
import FriendAvatar from "./FriendAvatar";

/** What the recipient's own list will call it, so the wording matches. */
type Sent = { name: string; recommendation: boolean };

export default function ShareToFriend({
  token,
  mediaId,
  mediaTitle,
  onClose,
}: {
  token: string;
  /** null for an item the server would refuse; the sheet says so rather than
   *  offering a control that cannot work. */
  mediaId: string | null;
  mediaTitle: string;
  onClose: () => void;
}) {
  const [friends, setFriends] = useState<Friend[]>([]);
  /** friendshipId -> status of THIS item, from the server, so it survives a
   *  refresh rather than lasting only as long as the sheet is open. */
  const [alreadySent, setAlreadySent] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    let cancelled = false;

    /* Both lists together: who can be sent to, and who already has it. The
     * second is a display aid — the server's duplicate check remains the real
     * guard — so failing to load it must not block sharing. */
    Promise.all([listFriends(token), listSentShares(token).catch(() => ({ shares: [] }))])
      .then(([friendList, sentList]) => {
        if (cancelled) return;
        setFriends(friendList.friends.filter((f) => f.status === "active"));
        setAlreadySent(
          Object.fromEntries(
            sentList.shares
              .filter((share) => share.media_id === mediaId)
              .map((share) => [share.friendship_id, share.status]),
          ),
        );
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
  }, [token, mediaId]);

  /* Escape closes the sheet, and Android's Back reaches the WebView as the
   * same key. Without it the only way out on a phone is the small X. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const groups = useMemo(() => {
    const has = (id: string) => alreadySent[id] === "active" || alreadySent[id] === "pending";
    return {
      // Can be sent to right now.
      pickable: friends.filter((f) => f.can_share && !has(f.id)),
      // Already has this one.
      holding: friends.filter((f) => has(f.id)),
      // A grown-up took this exact item back; it cannot be sent again.
      revoked: friends.filter((f) => alreadySent[f.id] === "revoked"),
      // Sharing is switched off somewhere along the line.
      blocked: friends.filter((f) => !f.can_share && !has(f.id)),
    };
  }, [friends, alreadySent]);

  const send = async () => {
    if (!picked || !mediaId || sending) return;

    const friend = friends.find((f) => f.id === picked);
    const name = friend?.child.display_name.split(" ")[0] || "your friend";

    setSending(true);
    setSendError("");

    try {
      const result = await shareMedia(token, mediaId, picked);
      setSent({
        name: result.share.sent_to?.split(" ")[0] || name,
        recommendation: result.share.is_recommendation,
      });
      setAlreadySent((current) => ({ ...current, [picked]: "active" }));
      setPicked(null);
    } catch (e) {
      // The server's own words: "Hatem already has this one", "a grown-up took
      // this back". They are more accurate than anything guessed here, and are
      // already written for a child to read.
      setSendError(e instanceof Error ? e.message : "That didn't go through. Try again.");
    } finally {
      setSending(false);
    }
  };

  const firstNames = (list: Friend[]) =>
    list.map((f) => f.child.display_name.split(" ")[0]).join(", ");

  return (
    <div
      className="sasa-share-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Send ${mediaTitle} to a friend`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sasa-sharesheet">
        <div className="sasa-share-head">
          <h2>{sent ? "Sent!" : "Send to a friend"}</h2>
          <button type="button" className="sasa-iconbtn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* The confirmation replaces the picker: the child has done the thing,
            and naming the friend is what tells them it went to the right one. */}
        {sent ? (
          <>
            <p className="sasa-share-sent" role="status">
              <span className="sasa-share-sent-tick" aria-hidden="true">
                <Check size={22} />
              </span>
              Sent to {sent.name}
            </p>
            <p className="sasa-friends-note">
              {sent.recommendation
                ? `${sent.name} can watch it now — it's in Shared with me.`
                : `It's in ${sent.name}'s Shared with me right now.`}
            </p>

            {groups.pickable.length > 0 && (
              <button
                type="button"
                className="sasa-btn"
                onClick={() => {
                  setSent(null);
                  setSendError("");
                }}
              >
                Send to someone else
              </button>
            )}

            <button
              type="button"
              className="sasa-btn is-primary sasa-sharesheet-close"
              onClick={onClose}
            >
              Done
            </button>
          </>
        ) : (
          <>
            <p className="sasa-sharesheet-item">{mediaTitle}</p>

            {loading && mediaId && <p className="sasa-friends-note">Loading your friends…</p>}

            {/* Every branch below is a real explanation, never a dead button. */}
            {!mediaId && (
              <p className="sasa-friends-note">
                This one can&apos;t be sent. You can send the photos and videos in your own library,
                and anything from Explore.
              </p>
            )}

            {mediaId && !loading && loadError && (
              <p className="sasa-friends-note is-error" role="alert">
                {loadError}
              </p>
            )}

            {mediaId && !loading && !loadError && friends.length === 0 && (
              <div className="sasa-share-empty">
                <UserPlus size={28} aria-hidden="true" />
                <p>
                  <strong>Add a friend first.</strong> Go to Friends and swap Friend IDs. A grown-up
                  on each side says yes once, and then you can send things straight away.
                </p>
              </div>
            )}

            {mediaId &&
              !loading &&
              !loadError &&
              friends.length > 0 &&
              groups.pickable.length === 0 && (
                <p className="sasa-friends-note">
                  {groups.holding.length > 0
                    ? "All of your friends already have this one."
                    : "You can't send things right now. A grown-up can turn sharing back on."}
                </p>
              )}

            {mediaId && groups.pickable.length > 0 && (
              <>
                <ul className="sasa-friendpick">
                  {groups.pickable.map((f) => {
                    const isPicked = picked === f.id;
                    return (
                      <li key={f.id}>
                        <button
                          type="button"
                          className={
                            isPicked ? "sasa-friendpick-btn is-picked" : "sasa-friendpick-btn"
                          }
                          /* One friend at a time: pick, then Send, and it is
                             done. Radio semantics because tapping a second
                             friend replaces the first rather than adding. */
                          role="radio"
                          aria-checked={isPicked}
                          onClick={() => setPicked(f.id)}
                        >
                          <span className="sasa-friendpick-avatarwrap">
                            <FriendAvatar child={f.child} variant="pick" token={token} />
                            {isPicked && (
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

                {sendError && (
                  <p className="sasa-friends-note is-error" role="alert">
                    {sendError}
                  </p>
                )}

                <button
                  type="button"
                  className="sasa-btn is-primary sasa-sharesheet-send"
                  disabled={!picked || sending}
                  onClick={send}
                >
                  {sending ? <Loader2 size={18} className="sasa-spin" /> : <Send size={18} />}
                  {picked
                    ? `Send to ${friends.find((f) => f.id === picked)?.child.display_name.split(" ")[0]}`
                    : "Pick a friend"}
                </button>
              </>
            )}

            {groups.holding.length > 0 && (
              <p className="sasa-friends-note is-ok">
                <Check size={14} aria-hidden="true" /> {firstNames(groups.holding)} already
                {groups.holding.length > 1 ? " have" : " has"} this one
              </p>
            )}

            {groups.revoked.length > 0 && (
              <p className="sasa-friends-note">
                A grown-up took this back from {firstNames(groups.revoked)}, so it can&apos;t be
                sent again.
              </p>
            )}

            {groups.blocked.length > 0 && (
              <p className="sasa-friends-note">
                Sharing is off for {firstNames(groups.blocked)} at the moment. A grown-up can turn
                it back on.
              </p>
            )}

            <button type="button" className="sasa-btn sasa-sharesheet-close" onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
