/* SASA_DIRECT_SHARING_V36 — "Shared with me" for the child's Videos and Photos.
 *
 * A friend's send arrives here immediately, because both parents agreed to
 * that when they approved the friendship. The server still filters the list on
 * the friendship being active and — for an item the friend actually holds —
 * their assignment still existing, so nothing revoked, removed or blocked is
 * ever returned and there is no client-side filtering to get wrong.
 *
 * Every URL here is a short-lived signed one minted for this child and
 * re-authorised on each request, so playback stops the moment a parent revokes
 * the share or ends the friendship.
 */

import { useEffect, useState } from "react";
import { Image as ImageIcon, Play } from "lucide-react";
import { listSharedWithMe, type SharedMediaItem } from "@/lib/friends-api";
import { getApiAssetUrl } from "@/lib/api";
import FriendAvatar from "./FriendAvatar";

export default function KidsSharedWithMe({
  token,
  kind,
  from,
  onOpen,
  silentWhenEmpty = false,
}: {
  token: string;
  kind: "video" | "photo";
  /** Friend ID, to show only what this one friend shared. */
  from?: string;
  onOpen?: (item: SharedMediaItem) => void;
  /** Renders nothing at all when there is nothing to show. Set on all but one
   *  instance where videos and photos are listed side by side, so a child is
   *  not told twice that nothing has arrived. */
  silentWhenEmpty?: boolean;
}) {
  const [items, setItems] = useState<SharedMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    listSharedWithMe(token)
      .then((d) => {
        if (cancelled) return;
        setItems(
          d.media.filter((m) => m.media_type === kind && (!from || m.shared_by.friend_id === from)),
        );
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, kind, from]);

  if (loading) return silentWhenEmpty ? null : <p className="sasa-friends-note">Loading…</p>;
  if (error) return <p className="sasa-friends-note is-error">{error}</p>;

  if (items.length === 0) {
    if (silentWhenEmpty) return null;
    return (
      <p className="sasa-friends-note">
        Nothing shared with you yet. When a friend sends you a {kind}, it turns up here straight
        away.
      </p>
    );
  }

  return (
    <div className="sasa-shared-grid">
      {items.map((item) => {
        const thumb = item.thumbnail_url ? (
          <img src={getApiAssetUrl(item.thumbnail_url)} alt="" loading="lazy" />
        ) : (
          <span className="sasa-shared-placeholder" aria-hidden="true">
            {kind === "video" ? <Play size={26} /> : <ImageIcon size={26} />}
          </span>
        );

        return (
          <article className="sasa-shared-card" key={item.share_id}>
            {/* A button only where there is somewhere to go. Rendering one
                regardless is what made these cards look tappable and do
                nothing when no handler was passed. */}
            {onOpen ? (
              <button
                type="button"
                className="sasa-shared-thumb"
                onClick={() => onOpen(item)}
                aria-label={`Open ${item.title}`}
              >
                {thumb}
              </button>
            ) : (
              <div className="sasa-shared-thumb">{thumb}</div>
            )}
            <div className="sasa-shared-body">
              <strong>{item.title}</strong>
              {/* Child-safe attribution: a face and a display name, never an
                  account, an email or an id. */}
              <span className="sasa-shared-by">
                <FriendAvatar child={item.shared_by} variant="row" />
                {item.is_recommendation
                  ? `${item.shared_by.display_name} thinks you'll like this`
                  : `Shared by ${item.shared_by.display_name}`}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
