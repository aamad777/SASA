import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDismiss } from "@/hooks/use-dismiss";
import { PARENT_CONTROLS_ICON, type SectionDef } from "./nav-sections";

type Props = {
  groups: Array<{ title?: string; items: SectionDef[] }>;
  activeId?: string;
  onNavigate: (id: string) => void;
  onOpenParentControls?: () => void;
  /** "inline" sits beside the content on wide screens; "overlay" is a drawer. */
  variant: "inline" | "overlay";
  /** Icon-only inline rail. */
  mini?: boolean;
  onClose?: () => void;
};

export function SideRail({
  groups,
  activeId,
  onNavigate,
  onOpenParentControls,
  variant,
  mini = false,
  onClose,
}: Props) {
  const railRef = useRef<HTMLElement | null>(null);
  const isOverlay = variant === "overlay";

  useDismiss(isOverlay, railRef, () => onClose?.());

  // Move focus into the drawer so keyboard users are not left behind on the
  // trigger, and restore the page's scroll lock on close.
  useEffect(() => {
    if (!isOverlay) return;

    const node = railRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    node?.querySelector<HTMLElement>("button, a")?.focus();

    return () => previouslyFocused?.focus?.();
  }, [isOverlay]);

  return (
    <>
      {isOverlay && (
        <button
          type="button"
          className="sasa-rail-scrim"
          aria-label="Close navigation"
          onClick={() => onClose?.()}
        />
      )}

      <nav
        ref={railRef}
        className={[
          "sasa-rail",
          isOverlay ? "is-overlay" : "is-inline",
          !isOverlay && mini ? "is-mini" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Sections"
      >
        {isOverlay && (
          <div className="sasa-rail-overlay-head">
            <button
              type="button"
              className="sasa-iconbtn"
              aria-label="Close navigation"
              onClick={() => onClose?.()}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {groups.map((group, groupIndex) => (
          <div key={group.title ?? `group-${groupIndex}`}>
            {group.title && !mini && <p className="sasa-rail-group-title">{group.title}</p>}
            {group.title && mini && <div className="sasa-rail-sep" />}

            {group.items.map((item) => {
              const Icon = item.icon;
              const current = activeId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={current ? "sasa-rail-link is-current" : "sasa-rail-link"}
                  aria-current={current ? "page" : undefined}
                  onClick={() => {
                    onNavigate(item.id);
                    if (isOverlay) onClose?.();
                  }}
                >
                  <Icon size={20} />
                  <span className="sasa-rail-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}

        {onOpenParentControls && (
          <>
            <div className="sasa-rail-sep" />
            <button
              type="button"
              className="sasa-rail-link"
              onClick={() => {
                onOpenParentControls();
                if (isOverlay) onClose?.();
              }}
            >
              <PARENT_CONTROLS_ICON size={20} />
              <span className="sasa-rail-label">Parent controls</span>
            </button>
            {!mini && (
              <p className="sasa-rail-note">
                Parent controls ask for the grown-up gate before they open.
              </p>
            )}
          </>
        )}
      </nav>
    </>
  );
}

export default SideRail;
