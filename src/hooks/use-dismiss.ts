import { useEffect, type RefObject } from "react";
import { useAndroidBack } from "./use-android-back";

/**
 * Closes a popover/menu/drawer on outside pointer-down, Escape, or Android's
 * hardware Back.
 *
 * Keyboard users get the same exit as pointer users, which is why Escape is
 * handled here rather than per-component. SASA_ANDROID_BACK_V39 adds Back for
 * the same reason: inside the Capacitor WebView there is no Escape key, so
 * every one of these surfaces used to trap a child until they found the small
 * close control — or Back exited the app from under them.
 */
export function useDismiss(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
) {
  useAndroidBack(active, onDismiss);

  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;
      const target = event.target as Node | null;

      if (!node || !target || node.contains(target)) return;

      onDismiss();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onDismiss();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, ref, onDismiss]);
}
