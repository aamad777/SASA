import { useEffect } from "react";

/**
 * SASA_PIN_KEYBOARD_V23 — freezes the page behind a PIN screen or a form
 * sheet.
 *
 * The dialog itself already sizes to the visible viewport, so its own controls
 * stay reachable when the on-screen keyboard opens. What remained was the page
 * *underneath*: on a keyboard-shrunk viewport the profile list behind the PIN
 * dialog still had ~150px of scrollable height, so the whole screen could be
 * dragged around while entering a PIN. Locking the document while the overlay
 * is mounted removes that, and restores whatever overflow the page had before
 * (rather than assuming "visible") so nothing else is disturbed.
 */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    const { body, documentElement: root } = document;

    // Both elements: which one actually scrolls depends on the page. On the
    // profile screen it is documentElement, so locking only body left the page
    // behind the PIN dialog dragging by ~180px on a keyboard-shrunk viewport.
    const previous = {
      bodyOverflow: body.style.overflow,
      bodyTouch: body.style.touchAction,
      rootOverflow: root.style.overflow,
    };

    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    root.style.overflow = "hidden";

    return () => {
      body.style.overflow = previous.bodyOverflow;
      body.style.touchAction = previous.bodyTouch;
      root.style.overflow = previous.rootOverflow;
    };
  }, [active]);
}

export default useScrollLock;
