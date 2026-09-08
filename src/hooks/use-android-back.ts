/* SASA_ANDROID_BACK_V39 — Android's hardware Back closes the open sheet.
 *
 * Escape already closed every sheet, and on a desktop browser that is enough.
 * Inside the Capacitor WebView there is no Escape key: Android delivers Back
 * as a `backButton` event on the App plugin, and with nothing listening
 * Capacitor's default took over — navigating the WebView back, or exiting the
 * app outright. A child with the share sheet open pressed Back and left SASA.
 *
 * Two things make this more than a single listener:
 *
 *   - Sheets nest. The theme menu can be open over the watch screen, the share
 *     sheet over a feed. Every mounted listener receives the event, so without
 *     coordination one Back press would close all of them at once. A
 *     module-level stack fixes the order: the most recently opened dismissible
 *     is the only one that closes, which is what Back means.
 *
 *   - Nothing must break on the web. `@capacitor/app` resolves in a browser
 *     but never fires `backButton`, so the import is dynamic and its failure
 *     is silent — the web build keeps working exactly as it did, on Escape.
 *
 * When the stack is empty the listener is removed entirely, so Capacitor's own
 * behaviour (go back, or exit at the root) is restored rather than suppressed.
 */

import { useEffect } from "react";

/** Most recently opened last; only the last entry handles a Back press. */
const stack: Array<() => void> = [];

let detach: (() => void) | null = null;
let attaching = false;

function handleBack() {
  const top = stack[stack.length - 1];
  if (top) top();
}

async function ensureListener() {
  if (detach || attaching) return;
  attaching = true;

  try {
    const { App } = await import("@capacitor/app");
    const handle = await App.addListener("backButton", handleBack);

    // The stack can empty while the import is in flight; do not leave a
    // listener behind that would swallow Back at the root of the app.
    if (stack.length === 0) {
      await handle.remove();
      return;
    }

    detach = () => {
      void handle.remove();
    };
  } catch {
    /* Not running under Capacitor — Escape is the only exit, as before. */
  } finally {
    attaching = false;
  }
}

function releaseListener() {
  if (stack.length > 0 || !detach) return;
  detach();
  detach = null;
}

/**
 * Closes this dismissible on Android Back while `active`.
 *
 * `onDismiss` is read through a ref-like closure captured at registration, so
 * pass a stable callback (useCallback) where the identity would otherwise
 * change every render.
 */
export function useAndroidBack(active: boolean, onDismiss: () => void): void {
  useEffect(() => {
    if (!active) return;

    const entry = () => onDismiss();
    stack.push(entry);
    void ensureListener();

    return () => {
      const index = stack.lastIndexOf(entry);
      if (index >= 0) stack.splice(index, 1);
      releaseListener();
    };
  }, [active, onDismiss]);
}
