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

/* SASA_ADMIN_OVERRIDE_V33 — shown to both parents. The wording distinguishes
 * "an administrator covered the OTHER family" from "an administrator approved
 * on YOUR behalf", because only the second is something this parent did not
 * personally agree to. */
function OverrideNote({ override }: { override: NonNullable<ParentFriendship["admin_override"]> }) {
  return (
    <span className="sasa-override-note" role="note">
      {override.approved_by_me
        ? "Approved by an administrator for the other family"
        : "Approved by an administrator, not by you"}
      {override.reason ? ` — ${override.reason}` : ""}
    </span>
  );
}

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
  /* SASA_ADMIN_OVERRIDE_V33 — an administrator approving something neither of
   * their own children is in must give a reason. Only the server knows that,
   * so rather than guessing the viewer's role we let it say so and then ask.
   * A parent approving their own side never sees this. */
  const [reasonFor, setReasonFor] = useState<{ kind: "friendship" | "share"; id: string } | null>(
    null,
  );
  const [reason, setReason] = useState("");

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

  const act = async (
    fn: () => Promise<unknown>,
    key: string,
    prompt?: { kind: "friendship" | "share"; id: string },
  ) => {
    setBusy(key);
    setError("");
    try {
      await fn();
      setReasonFor(null);
      setReason("");
      load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "That action did not go through.";

      // Turn the server's "needs a reason" into an actual way to give one,
      // instead of a dead end the parent cannot get past.
      if (prompt && /needs a short reason/i.test(message)) {
        setReasonFor(prompt);
        setError("");
      } else {
        setError(message);
      }
    } finally {
      setBusy(null);
    }
  };

  const submitReason = () => {
    if (!reasonFor) return;
    const text = reason.trim();
    if (text.length < 3) return;

    if (reasonFor.kind === "friendship") {
      act(() => decideFriendship(token, reasonFor.id, "approve", text), reasonFor.id);
    } else {
      act(() => decideShare(token, reasonFor.id, "approve", text), reasonFor.id);
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

      {reasonFor && (
        <section className="sasa-pfriends-card sasa-override-prompt">
          <h3>Why are you overriding this?</h3>
          <p className="sasa-friends-note">
            Neither of your own children is in this one, so approving it is an administrator
            override. Both families will see this reason.
          </p>
          <div className="sasa-friends-search">
            <label className="sasa-sr-only" htmlFor="override-reason">
              Reason for the override
            </label>
            <input
              id="override-reason"
              className="sasa-friends-input"
              style={{ textTransform: "none" }}
              placeholder="e.g. the other parent has lost account access"
              value={reason}
              autoFocus
              onChange={(e) => setReason(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitReason();
              }}
            />
            <button
              type="button"
              className="sasa-btn is-primary"
              disabled={reason.trim().length < 3 || busy !== null}
              onClick={submitReason}
            >
              Override
            </button>
            <button
              type="button"
              className="sasa-btn"
              onClick={() => {
                setReasonFor(null);
                setReason("");
              }}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

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
                    onClick={() =>
                      act(() => decideFriendship(token, f.id, "approve"), f.id, {
                        kind: "friendship",
                        id: f.id,
                      })
                    }
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
                    onClick={() =>
                      act(() => decideShare(token, s.id, "approve"), s.id, {
                        kind: "share",
                        id: s.id,
                      })
                    }
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
                  {f.admin_override && <OverrideNote override={f.admin_override} />}
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
                  {s.admin_override && <OverrideNote override={s.admin_override} />}
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
