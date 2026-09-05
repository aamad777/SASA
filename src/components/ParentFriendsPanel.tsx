/* SASA_FRIENDS_V32 — the parent's Friends & Sharing panel.
 *
 * Every control here performs a real decision; nothing is decorative. The
 * pending count comes from the server's own `awaiting_me` flag rather than
 * being recomputed in the client, so the badge cannot disagree with what the
 * approve endpoints will actually accept.
 */

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Ban, Trash2, X } from "lucide-react";
import {
  decideFriendship,
  decideShare,
  getParentFriendsOverview,
  type ParentFriendship,
  type ParentShare,
} from "@/lib/friends-api";

export function useParentFriendsPending(token: string | null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const load = () =>
      getParentFriendsOverview(token)
        .then((d) => {
          if (!cancelled) setCount(d.pending_count);
        })
        .catch(() => {
          /* A blip must not clear a badge the parent is acting on. */
        });
    load();
    const id = window.setInterval(load, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [token]);

  return count;
}

export default function ParentFriendsPanel({ token }: { token: string }) {
  const [friendships, setFriendships] = useState<ParentFriendship[]>([]);
  const [shares, setShares] = useState<ParentShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getParentFriendsOverview(token)
      .then((d) => {
        setFriendships(d.friendships);
        setShares(d.shares);
        setError("");
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(load, [load]);

  const act = async (fn: () => Promise<unknown>, key: string) => {
    setBusy(key);
    setError("");
    try {
      await fn();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That action did not go through.");
    } finally {
      setBusy(null);
    }
  };

  const pendingFriendships = friendships.filter((f) => f.awaiting_me);
  const pendingShares = shares.filter((s) => s.awaiting_me);

  return (
    <div className="sasa-pfriends">
      {error && (
        <p className="sasa-friends-note is-error" role="alert">
          {error}
        </p>
      )}

      {loading && <p className="sasa-friends-note">Loading…</p>}

      <section className="sasa-pfriends-card">
        <h3>Needs your approval ({pendingFriendships.length + pendingShares.length})</h3>

        {pendingFriendships.length === 0 && pendingShares.length === 0 ? (
          <p className="sasa-friends-note">Nothing waiting for you.</p>
        ) : (
          <ul className="sasa-pfriends-list">
            {pendingFriendships.map((f) => (
              <li key={f.id}>
                <div className="sasa-pfriends-text">
                  <strong>
                    {f.my_child} &amp; {f.other_child}
                  </strong>
                  <span>
                    Friend request ({f.direction}) · {f.other_friend_id}
                  </span>
                </div>
                <div className="sasa-pfriends-actions">
                  <button
                    type="button"
                    className="sasa-btn is-primary"
                    disabled={busy === f.id}
                    onClick={() => act(() => decideFriendship(token, f.id, "approve"), f.id)}
                  >
                    {busy === f.id ? <Loader2 size={15} /> : <Check size={15} />} Approve
                  </button>
                  <button
                    type="button"
                    className="sasa-btn"
                    disabled={busy === f.id}
                    onClick={() => act(() => decideFriendship(token, f.id, "reject"), f.id)}
                  >
                    <X size={15} /> Reject
                  </button>
                  <button
                    type="button"
                    className="sasa-btn"
                    disabled={busy === f.id}
                    onClick={() => act(() => decideFriendship(token, f.id, "block"), f.id)}
                  >
                    <Ban size={15} /> Block
                  </button>
                </div>
              </li>
            ))}

            {pendingShares.map((s) => (
              <li key={s.id}>
                <div className="sasa-pfriends-text">
                  <strong>{s.title}</strong>
                  <span>
                    {s.media_type} · {s.from_child} → {s.to_child}
                  </span>
                </div>
                <div className="sasa-pfriends-actions">
                  <button
                    type="button"
                    className="sasa-btn is-primary"
                    disabled={busy === s.id}
                    onClick={() => act(() => decideShare(token, s.id, "approve"), s.id)}
                  >
                    {busy === s.id ? <Loader2 size={15} /> : <Check size={15} />} Approve
                  </button>
                  <button
                    type="button"
                    className="sasa-btn"
                    disabled={busy === s.id}
                    onClick={() => act(() => decideShare(token, s.id, "reject"), s.id)}
                  >
                    <X size={15} /> Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sasa-pfriends-card">
        <h3>Friendships</h3>
        {friendships.length === 0 ? (
          <p className="sasa-friends-note">No friendships yet.</p>
        ) : (
          <ul className="sasa-pfriends-list">
            {friendships.map((f) => (
              <li key={f.id}>
                <div className="sasa-pfriends-text">
                  <strong>
                    {f.my_child} &amp; {f.other_child}
                  </strong>
                  <span>
                    {f.status}
                    {f.awaiting_other ? " · waiting for the other family" : ""}
                  </span>
                </div>
                <div className="sasa-pfriends-actions">
                  {f.status === "active" && (
                    <button
                      type="button"
                      className="sasa-btn"
                      disabled={busy === f.id}
                      onClick={() => act(() => decideFriendship(token, f.id, "remove"), f.id)}
                    >
                      <Trash2 size={15} /> Remove
                    </button>
                  )}
                  {f.status !== "blocked" && (
                    <button
                      type="button"
                      className="sasa-btn"
                      disabled={busy === f.id}
                      onClick={() => act(() => decideFriendship(token, f.id, "block"), f.id)}
                    >
                      <Ban size={15} /> Block
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sasa-pfriends-card">
        <h3>Shared media</h3>
        {shares.length === 0 ? (
          <p className="sasa-friends-note">Nothing shared yet.</p>
        ) : (
          <ul className="sasa-pfriends-list">
            {shares.map((s) => (
              <li key={s.id}>
                <div className="sasa-pfriends-text">
                  <strong>{s.title}</strong>
                  <span>
                    {s.status} · {s.from_child} → {s.to_child}
                  </span>
                </div>
                <div className="sasa-pfriends-actions">
                  {s.status === "active" && (
                    <button
                      type="button"
                      className="sasa-btn"
                      disabled={busy === s.id}
                      onClick={() => act(() => decideShare(token, s.id, "revoke"), s.id)}
                    >
                      <Trash2 size={15} /> Revoke
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
