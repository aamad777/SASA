import {
  Users,
  Check,
  Heart,
  Image as ImageIcon,
  Link2,
  MoreVertical,
  Share2,
  Video,
} from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import { useDismiss } from "@/hooks/use-dismiss";
import { shareMedia } from "@/lib/share";
import type { KidsVideoItem } from "../KidsVideoHome";
import { mediaThumbnailFallback } from "../KidsVideoHome";
import { getMediaByline, getMediaMetaLine, isClockDuration } from "./media-meta";

type Props = {
  /* SASA_FRIENDS_V32 — offered only when a child session exists and the item
   * has a backend id, so the entry never appears where sharing cannot work. */
  onShareToFriend?: (mediaId: string, title: string) => void;
  item: KidsVideoItem;
  saved: boolean;
  onOpen: (item: KidsVideoItem) => void;
  onToggleSave: (id: number, event: MouseEvent) => void;
};

function SourceIcon({ item }: { item: KidsVideoItem }) {
  return item.sourceType === "photo" ? <ImageIcon size={16} /> : <Video size={16} />;
}

/**
 * SASA_FEED_MOBILE_V19 — one feed cell in the proportions a phone video feed
 * uses: a full-bleed 16:9 thumbnail, then a compact row of avatar / two-line
 * title / byline / metadata with an overflow menu on the end.
 *
 * The duration badge appears only when the item genuinely has a clock
 * duration — assigned media carries a media-type word ("Video", "Photo")
 * in that field, and printing that in the corner would read as a fake
 * runtime. Nothing here invents a view count, a date or a channel name;
 * every line comes from media-meta.ts, which omits whatever the backend
 * did not send.
 */
export function MediaCard({ item, saved, onOpen, onToggleSave, onShareToFriend }: Props) {
  const isPhoto = item.sourceType === "photo";
  const duration = isClockDuration(item.duration) ? item.duration : null;
  const meta = getMediaMetaLine(item);

  const [menuOpen, setMenuOpen] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useDismiss(menuOpen, menuRef, () => setMenuOpen(false));

  const handleShare = async () => {
    const outcome = await shareMedia({ title: item.title, text: getMediaByline(item) });

    setMenuOpen(false);

    if (outcome === "shared" || outcome === "cancelled") return;

    setShareNote(outcome === "copied" ? "Link copied" : "Sharing isn’t available here");
    window.setTimeout(() => setShareNote(""), 2400);
  };

  return (
    <article className="sasa-card">
      <button
        type="button"
        className="sasa-card-link"
        onClick={() => onOpen(item)}
        aria-label={`Open ${item.title}`}
      >
        <span className={isPhoto ? "sasa-card-thumb is-photo" : "sasa-card-thumb"}>
          <img
            src={item.image}
            alt=""
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = mediaThumbnailFallback;
            }}
          />
          {duration && <span className="sasa-card-badge">{duration}</span>}
        </span>
      </button>

      <div className="sasa-card-body">
        <span className="sasa-card-source" aria-hidden="true">
          <SourceIcon item={item} />
        </span>

        <button type="button" className="sasa-card-text" onClick={() => onOpen(item)}>
          <h3 className="sasa-card-title">{item.title}</h3>
          <p className="sasa-card-channel">{getMediaByline(item)}</p>
          {meta && <p className="sasa-card-meta">{meta}</p>}
        </button>

        <div className="sasa-card-menuwrap" ref={menuRef}>
          <button
            type="button"
            className="sasa-card-more"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`More options for ${item.title}`}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((value) => !value);
            }}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="sasa-card-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={(event) => {
                  onToggleSave(item.id, event);
                  setMenuOpen(false);
                }}
              >
                <Heart size={17} fill={saved ? "currentColor" : "none"} />
                {saved ? "Remove from library" : "Save to library"}
              </button>

              {onShareToFriend && item.mediaId && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onShareToFriend(item.mediaId as string, item.title);
                    setMenuOpen(false);
                  }}
                >
                  <Users size={17} />
                  Share with a friend
                </button>
              )}

              <button type="button" role="menuitem" onClick={handleShare}>
                <Share2 size={17} />
                Share
              </button>
            </div>
          )}
        </div>
      </div>

      {shareNote && (
        <p className="sasa-card-note" role="status">
          {shareNote === "Link copied" ? <Check size={14} /> : <Link2 size={14} />}
          {shareNote}
        </p>
      )}
    </article>
  );
}

export default MediaCard;
