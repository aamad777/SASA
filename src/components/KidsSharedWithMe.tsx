/* SASA_FRIENDS_V32 — "Shared with me" for the child's Videos and Photos.
 *
 * Only fully approved shares reach this list: the server filters on both
 * parents having approved, the friendship still being active, and the sender
 * still holding the item. Nothing pending, rejected or revoked is returned, so
 * there is no client-side filtering to get wrong.
 *
 * Every URL here is a short-lived signed one minted for this child and
 * re-authorised on each request, so playback stops the moment a parent
 * revokes the share or ends the friendship.
 */

import { useEffect, useState } from "react";
import { Image as ImageIcon, Play } from "lucide-react";
import { listSharedWithMe, type SharedMediaItem } from "@/lib/friends-api";
import { getApiAssetUrl } from "@/lib/api";

export default function KidsSharedWithMe({
  token,
  kind,
  onOpen,
}: {
  token: string;
  kind: "video" | "photo";
  onOpen?: (item: SharedMediaItem) => void;
}) {
  const [items, setItems] = useState<SharedMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    listSharedWithMe(token)
      .then((d) => {
        if (!cancelled) setItems(d.media.filter((m) => m.media_type === kind));
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
  }, [token, kind]);

  if (loading) return <p className="sasa-friends-note">Loading…</p>;
  if (error) return <p className="sasa-friends-note is-error">{error}</p>;

  if (items.length === 0) {
    return (
      <p className="sasa-friends-note">
        Nothing shared with you yet. When a friend shares a {kind}, it appears here after both
        grown-ups say yes.
      </p>
    );
  }

  return (
    <div className="sasa-shared-grid">
      {items.map((item) => (
        <article className="sasa-shared-card" key={item.share_id}>
          <button
            type="button"
            className="sasa-shared-thumb"
            onClick={() => onOpen?.(item)}
            aria-label={`Open ${item.title}`}
          >
            {item.thumbnail_url ? (
              <img src={getApiAssetUrl(item.thumbnail_url)} alt="" loading="lazy" />
            ) : (
              <span className="sasa-shared-placeholder" aria-hidden="true">
                {kind === "video" ? <Play size={26} /> : <ImageIcon size={26} />}
              </span>
            )}
          </button>
          <div className="sasa-shared-body">
            <strong>{item.title}</strong>
            {/* Child-safe attribution: a display name, never an account. */}
            <span>Shared by {item.shared_by.display_name}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
