import { useEffect, type RefObject } from "react";

/**
 * Closes a popover/menu/drawer on outside pointer-down or Escape.
 * Keyboard users get the same exit as pointer users, which is why Escape is
 * handled here rather than per-component.
 */
export function useDismiss(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  onDismiss: () => void,
) {
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
