import { useEffect } from "react";

// SARA_ANDROID_KEYBOARD_DIALOG_V15 — real-device testing (APK on a physical
// Android phone) showed the on-screen keyboard still covering the lower
// controls of the Add Kid Profile / PIN dialogs even though the dialogs
// already use `max-height: calc(100dvh - ...)` and the manifest already
// sets `windowSoftInputMode="adjustResize"` (SARA_ANDROID_AUTH_RECOVERY_V10).
// `100dvh` is *supposed* to track the keyboard-shrunk viewport, but the
// Capacitor Android WebView build in use does not reliably resize the CSS
// dynamic viewport when the keyboard opens — `window.visualViewport` does,
// so this hook mirrors its height onto a CSS custom property dialogs can
// fall back to. It is a no-op (property stays unset, `var(..., 100dvh)`
// fallback applies) on desktop browsers and any WebView where dvh already
// behaves — this only ever tightens the constraint, never loosens it.
//
// Mount this ONCE near the app root (see src/routes/__root.tsx) — it sets a
// single global CSS variable, so every keyboard-aware dialog in the app can
// reuse it via `max-height: calc(var(--app-visible-height, 100dvh) - Npx)`
// without each dialog re-registering its own listener.
export function useVisibleViewportHeight() {
  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) {
      return;
    }

    const updateHeight = () => {
      document.documentElement.style.setProperty("--app-visible-height", `${viewport.height}px`);
    };

    updateHeight();

    viewport.addEventListener("resize", updateHeight);
    viewport.addEventListener("scroll", updateHeight);

    return () => {
      viewport.removeEventListener("resize", updateHeight);
      viewport.removeEventListener("scroll", updateHeight);
    };
  }, []);
}
