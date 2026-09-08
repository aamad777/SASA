/* SASA_ANDROID_BACK_V40 — one Back handler, three tiers, in order:
 *
 *   1. close the topmost open sheet or dialog;
 *   2. otherwise leave full screen (which also clears the screen lock);
 *   3. otherwise go back in history, and exit only at the app's root.
 *
 * Why it is built this way
 * ------------------------
 * Escape covered every sheet in a desktop browser. Inside the Capacitor
 * WebView there is no Escape key: Android delivers Back as a `backButton`
 * event on the App plugin. With nothing listening, a child with the share
 * sheet open pressed Back and left SASA.
 *
 * V39 registered a listener only while a sheet was open and removed it once
 * the last one closed, assuming Capacitor's own default would then take over.
 * AppPlugin.java shows that is not what happens:
 *
 *     if (!hasListeners(EVENT_BACK_BUTTON)) {
 *         if (bridge.getWebView().canGoBack()) {
 *             bridge.getWebView().goBack();
 *         }
 *     }
 *
 * The callback is registered with the OnBackPressedDispatcher, so it consumes
 * the press either way — and when the WebView cannot go back it does nothing
 * at all. Removing the listener therefore buys a dead Back button at the root,
 * not "exit the app". Tier 3 only exists if we keep one listener and answer
 * every case ourselves.
 *
 * So the listener is installed once, for the life of the app, and the chain
 * below decides. Everything that wants a turn registers on a shared stack
 * rather than adding its own listener, because sheets nest — the theme menu
 * over the watch screen, the share sheet over a feed — and separate listeners
 * would each receive the same press and close all of them at once.
 *
 * `priority` is what keeps tier 1 ahead of tier 2 regardless of mount order:
 * full screen registers when playback goes full screen, usually BEFORE a sheet
 * is opened over it, so "most recent wins" alone would let Back leave full
 * screen while a sheet was still up.
 */

import { useEffect } from "react";

/** Higher wins. Sheets sit above full screen. */
const PRIORITY_DISMISSIBLE = 10;
const PRIORITY_FULLSCREEN = 5;

type Entry = { run: () => void; priority: number };

/** Most recently registered last; ties broken by registration order. */
const stack: Entry[] = [];

let installed = false;
let installing = false;

/** The highest-priority entry, and among equals the most recent. */
function topEntry(): Entry | undefined {
  let best: Entry | undefined;
  for (const entry of stack) {
    if (!best || entry.priority >= best.priority) best = entry;
  }
  return best;
}

async function handleBack(canGoBack: boolean) {
  // Tiers 1 and 2: whatever is registered and outranks the rest.
  const top = topEntry();
  if (top) {
    top.run();
    return;
  }

  // Tier 3: ordinary navigation, then exit at the root. Both are done here
  // rather than left to the plugin, because the plugin's no-listener path
  // never exits — see the comment at the top of this file.
  if (canGoBack && typeof window !== "undefined" && window.history.length > 1) {
    window.history.back();
    return;
  }

  try {
    const { App } = await import("@capacitor/app");
    await App.exitApp();
  } catch {
    /* Not under Capacitor: a browser tab is not ours to close. */
  }
}

/**
 * Installs the single `backButton` listener. Safe to call repeatedly; only the
 * first call registers. Never removed — the chain above must answer Back for
 * the whole life of the app, including at the root.
 */
export function installAndroidBackHandler(): void {
  if (installed || installing) return;
  installing = true;

  void (async () => {
    try {
      const { App } = await import("@capacitor/app");
      await App.addListener("backButton", (event) => {
        void handleBack(Boolean(event?.canGoBack));
      });
      installed = true;
    } catch {
      /* Not running under Capacitor — the web keeps exiting on Escape. */
    } finally {
      installing = false;
    }
  })();
}

/** Mount once at the app root. */
export function useAndroidBackRoot(): void {
  useEffect(() => {
    installAndroidBackHandler();
  }, []);
}

function useBackEntry(active: boolean, run: () => void, priority: number): void {
  useEffect(() => {
    if (!active) return;

    installAndroidBackHandler();

    const entry: Entry = { run, priority };
    stack.push(entry);

    return () => {
      const index = stack.lastIndexOf(entry);
      if (index >= 0) stack.splice(index, 1);
    };
  }, [active, run, priority]);
}

/**
 * Tier 1 — closes this sheet or dialog on Back while `active`.
 *
 * Pass a stable callback (useCallback); an identity that changes every render
 * re-registers the entry and would reorder the stack underneath it.
 */
export function useAndroidBack(active: boolean, onDismiss: () => void): void {
  useBackEntry(active, onDismiss, PRIORITY_DISMISSIBLE);
}

/**
 * Tier 2 — leaves full screen on Back while `active`, unless a sheet is open
 * over it. Clearing the screen lock is left to the player's own
 * `fullscreenchange` handler, so there is one path out of a locked screen.
 */
export function useAndroidBackFullscreen(active: boolean, onExit: () => void): void {
  useBackEntry(active, onExit, PRIORITY_FULLSCREEN);
}

/** Test seam: what the chain would do right now, without firing anything. */
export function inspectAndroidBackStack(): { depth: number; topPriority: number | null } {
  const top = topEntry();
  return { depth: stack.length, topPriority: top ? top.priority : null };
}
