import { formatDistanceToNow } from "date-fns";
import type { KidsVideoItem } from "../KidsVideoHome";

/** True when `duration` holds a real clock value rather than a type word. */
export function isClockDuration(value: string | undefined): boolean {
  return Boolean(value && /^\d{1,3}:\d{2}$/.test(value.trim()));
}

export function getMediaKindLabel(item: KidsVideoItem): string {
  if (item.sourceType === "photo") return "Photo";
  if (item.sourceType === "youtube") return "Video link";
  // Built-in library items have no sourceType; they are still videos.
  return "Video";
}

/**
 * The byline under a card title. Assigned items really do come from the
 * grown-up's own library; built-in items ship with the app. Nothing here is
 * invented — there is no uploader field on the media endpoints.
 */
export function getMediaByline(item: KidsVideoItem): string {
  if (item.sourceLabel) return item.sourceLabel;

  return item.sourceType && item.sourceType !== "built-in" ? "Family library" : "SARA Kids";
}

/** Relative date, only when the backend actually gave us one. */
export function getMediaDate(item: KidsVideoItem): string | null {
  if (!item.createdAt) return null;

  const parsed = new Date(item.createdAt);

  if (Number.isNaN(parsed.getTime())) return null;

  try {
    return `${formatDistanceToNow(parsed)} ago`;
  } catch {
    return null;
  }
}

/** "Photo · Animals · 3 days ago" — every part omitted when unknown. */
export function getMediaMetaLine(item: KidsVideoItem): string {
  return [getMediaKindLabel(item), item.category?.trim() || null, getMediaDate(item)]
    .filter(Boolean)
    .join(" · ");
}
