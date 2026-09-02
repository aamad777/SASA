import { Film, Heart, Image as ImageIcon, Play, Sparkles } from "lucide-react";
import type { MouseEvent } from "react";
import type { KidsVideoItem } from "../KidsVideoHome";
import { mediaThumbnailFallback } from "../KidsVideoHome";
import { getMediaByline, getMediaKindLabel, getMediaMetaLine, isClockDuration } from "./media-meta";

type Props = {
  item: KidsVideoItem;
  saved: boolean;
  onOpen: (item: KidsVideoItem) => void;
  onToggleSave: (id: number, event: MouseEvent) => void;
};

function SourceIcon({ item }: { item: KidsVideoItem }) {
  if (item.sourceType === "photo") return <ImageIcon size={16} />;
  if (item.sourceType === "upload" || item.sourceType === "youtube") return <Film size={16} />;

  return <Sparkles size={16} />;
}

/** One feed cell: 16:9 thumbnail, then title, byline and real metadata. */
export function MediaCard({ item, saved, onOpen, onToggleSave }: Props) {
  const isPhoto = item.sourceType === "photo";
  const badge = isClockDuration(item.duration) ? item.duration : getMediaKindLabel(item);

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
          <span className="sasa-card-play" aria-hidden="true">
            <Play size={30} fill="currentColor" />
          </span>
          {badge && <span className="sasa-card-badge">{badge}</span>}
        </span>
      </button>

      <div className="sasa-card-body">
        <span className="sasa-card-source" aria-hidden="true">
          <SourceIcon item={item} />
        </span>

        <div className="sasa-card-text">
          <h3 className="sasa-card-title">{item.title}</h3>
          <p className="sasa-card-channel">{getMediaByline(item)}</p>
          <p className="sasa-card-meta">{getMediaMetaLine(item)}</p>
        </div>

        <button
          type="button"
          className={saved ? "sasa-card-save is-saved" : "sasa-card-save"}
          onClick={(event) => onToggleSave(item.id, event)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${item.title} from library` : `Save ${item.title} to library`}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}

export default MediaCard;
