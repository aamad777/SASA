/* SASA_WATCH_SHARE_V19
 *
 * One share helper for the feed's card menu and the watch screen's action row.
 * It only ever offers what the browser genuinely supports:
 *   - `navigator.share` when the platform provides it (Android WebView and
 *     iOS Safari both do), which opens the real system share sheet;
 *   - otherwise `navigator.clipboard.writeText`, so the button still does
 *     something real rather than sitting there inert.
 * If neither exists the caller is told, so it can report that instead of
 * pretending the share happened.
 */

export type ShareOutcome = "shared" | "copied" | "cancelled" | "unsupported";

export type ShareInput = {
  title: string;
  /** Absolute URL to the item. Falls back to the current page. */
  url?: string;
  text?: string;
};

export function canShare(): boolean {
  if (typeof navigator === "undefined") return false;

  return typeof navigator.share === "function" || Boolean(navigator.clipboard?.writeText);
}

export async function shareMedia({ title, url, text }: ShareInput): Promise<ShareOutcome> {
  if (typeof window === "undefined") return "unsupported";

  const target = url || window.location.href;

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url: target });
      return "shared";
    } catch (error) {
      // The user dismissing the sheet throws AbortError — not a failure, and
      // it must not fall through to silently copying instead.
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(target);
      return "copied";
    } catch {
      return "unsupported";
    }
  }

  return "unsupported";
}
