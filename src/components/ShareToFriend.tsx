/* SASA_FRIENDS_V32 — share one of the child's own items with one friend.
 *
 * Only approved friends are offered, and only media already assigned to this
 * child can be chosen — both are re-checked server-side, so this list is a
 * convenience, not the control. Submitting creates a PENDING share: nothing
 * reaches the friend until both grown-ups approve, and the dialog says so
 * rather than implying the item has been sent.
 */

import { useEffect, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { listFriends, shareMedia, type Friend } from "@/lib/friends-api";

export default function ShareToFriend({
  token,
  mediaId,
  mediaTitle,
  onClose,
}: {
  token: string;
  mediaId: string;
  mediaTitle: string;
  onClose: () => void;
}) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    listFriends(token)
      .then((d) => setFriends(d.friends.filter((f) => f.status === "active")))
      .catch((e: Error) => setNote(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const send = async (friendshipId: string) => {
    setBusyId(friendshipId);
    setNote("");
    try {
      await shareMedia(token, mediaId, friendshipId);
      setDone(true);
      setNote("Sent for approval. Both grown-ups need to say yes before your friend sees it.");
    } catch (e) {
      // Covers the duplicate case too, which the server answers with 409.
      setNote(e instanceof Error ? e.message : "Could not share.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      className="sasa-share-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Share with a friend"
    >
      <div className="sasa-share-sheet">
        <div className="sasa-share-head">
          <h2>Share “{mediaTitle}”</h2>
          <button type="button" className="sasa-iconbtn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <p className="sasa-friends-note">Loading your friends…</p>
        ) : friends.length === 0 ? (
          <p className="sasa-friends-note">
            You have no approved friends yet. Add one on the Friends page first.
          </p>
        ) : (
          <ul className="sasa-friend-list">
            {friends.map((f) => (
              <li key={f.id} className="sasa-friend-row">
                <span className="sasa-friend-avatar" aria-hidden="true">
                  {f.child.display_name.charAt(0).toUpperCase()}
                </span>
                <div className="sasa-friend-name">
                  <strong>{f.child.display_name}</strong>
                </div>
                <button
                  type="button"
                  className="sasa-btn is-primary"
                  disabled={busyId === f.id || done}
                  onClick={() => send(f.id)}
                >
                  {busyId === f.id ? <Loader2 size={16} /> : <Send size={16} />}
                  Share
                </button>
              </li>
            ))}
          </ul>
        )}

        {note && (
          <p className="sasa-friends-note" role="status">
            {note}
          </p>
        )}

        <button type="button" className="sasa-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
