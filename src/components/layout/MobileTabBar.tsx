import { Plus, Sparkles, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useDismiss } from "@/hooks/use-dismiss";
import ProfileAvatar from "./ProfileAvatar";
import { SHEET_SECTIONS, TABBAR_SECTIONS, type KidsSectionId } from "./nav-sections";

type Props = {
  activeId?: string;
  onNavigate: (id: KidsSectionId) => void;
  profileLabel: string;
  profileEmoji?: string;
  profileImage?: string;
  /**
   * SASA_NAV_PARENT_ACTION_V19 — true only when a parent account is actually
   * signed in on this device. It gates the central create action, which is
   * the entry point to uploading media. A child profile never renders it, and
   * even when it is shown the destination is still behind the parental gate,
   * so this is a visibility rule layered on top of the existing check rather
   * than a replacement for it.
   */
  parentSignedIn?: boolean;
  onOpenParentControls?: () => void;
};

/**
 * Fixed bottom navigation for phones and small tablets. Four fixed
 * destinations plus a "Play" sheet holding Songs / Games / Studio, so every
 * existing kid section stays reachable without a nine-item bar.
 */
export function MobileTabBar({
  activeId,
  onNavigate,
  profileLabel,
  profileEmoji,
  profileImage,
  parentSignedIn = false,
  onOpenParentControls,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useDismiss(sheetOpen, sheetRef, closeSheet);

  const playActive = SHEET_SECTIONS.some((section) => section.id === activeId);

  return (
    <>
      <nav className="sasa-tabbar" aria-label="Main sections">
        {TABBAR_SECTIONS.map((section) => {
          const Icon = section.icon;
          const current = activeId === section.id;

          return (
            <button
              key={section.id}
              type="button"
              className={current ? "is-current" : undefined}
              aria-current={current ? "page" : undefined}
              onClick={() => onNavigate(section.id)}
            >
              <Icon size={22} />
              <span>{section.label}</span>
            </button>
          );
        })}

        {parentSignedIn && onOpenParentControls && (
          <button
            type="button"
            className="sasa-tabbar-create"
            onClick={onOpenParentControls}
            aria-label="Parent controls — add or manage media"
          >
            <span className="sasa-tabbar-create-icon" aria-hidden="true">
              <Plus size={22} />
            </span>
            <span>Add</span>
          </button>
        )}

        <button
          type="button"
          className={playActive ? "is-current" : undefined}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen((value) => !value)}
        >
          <Sparkles size={22} />
          <span>Play</span>
        </button>

        <button
          type="button"
          className={activeId === "profile" ? "is-current" : undefined}
          aria-current={activeId === "profile" ? "page" : undefined}
          onClick={() => onNavigate("profile")}
        >
          <ProfileAvatar
            className="sasa-tabbar-avatar"
            image={profileImage}
            fallback={profileEmoji || "🙂"}
          />
          <span>{profileLabel}</span>
        </button>
      </nav>

      {sheetOpen && (
        <>
          <button
            type="button"
            className="sasa-sheet-scrim"
            aria-label="Close"
            onClick={closeSheet}
          />
          <div className="sasa-sheet" role="dialog" aria-label="Play and create" ref={sheetRef}>
            <div className="sasa-sheet-head">
              <h2>Play &amp; create</h2>
              <button
                type="button"
                className="sasa-iconbtn"
                aria-label="Close"
                onClick={closeSheet}
              >
                <X size={20} />
              </button>
            </div>

            <div className="sasa-sheet-list">
              {SHEET_SECTIONS.map((section) => {
                const Icon = section.icon;
                const current = activeId === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    className={current ? "sasa-menu-item is-current" : "sasa-menu-item"}
                    onClick={() => {
                      closeSheet();
                      onNavigate(section.id);
                    }}
                  >
                    <Icon size={20} />
                    <span>
                      {section.label}
                      <span
                        style={{
                          display: "block",
                          color: "var(--sasa-ink-3)",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {section.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default MobileTabBar;
