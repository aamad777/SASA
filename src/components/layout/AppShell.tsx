import { ArrowLeft, Menu, Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "./BrandMark";
import { MobileTabBar } from "./MobileTabBar";
import { SideRail } from "./SideRail";
import { RAIL_GROUPS, type KidsSectionId } from "./nav-sections";

type Props = {
  /** "dark" is used by the watch screen so the black player sits in context. */
  tone?: "light" | "dark";
  /** Watch-screen theme id; retints the shell surfaces only (never media). */
  watchTheme?: string;
  /** Which kid section is showing — drives the rail and bottom bar state. */
  activeSection?: KidsSectionId;
  onNavigate: (section: KidsSectionId) => void;
  onOpenParentControls?: () => void;

  /** Search is wired to the real section search; omit to hide the field. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  searchPlaceholder?: string;

  /** Extra header controls (sound, theme, watch party…). */
  headerActions?: ReactNode;
  /** Account control, rendered last in the header. */
  accountSlot?: ReactNode;
  /** Back control rendered before the brand (watch screen). */
  onBack?: () => void;
  backLabel?: string;

  /** The watch screen hides the inline rail and uses the drawer instead. */
  railMode?: "inline" | "drawer";

  profileLabel: string;
  /** The signed-in child's name. Replaces "SARA" in the wordmark so the app
   *  carries the name of whoever is watching. Falls back to "SARA". */
  brandName?: string;
  profileEmoji?: string;
  profileImage?: string;

  /** True only when a parent account is signed in — gates the create action. */
  parentSignedIn?: boolean;

  /**
   * SASA_ADMIN_UI_V25 — shows the Admin link. Presentation only: /admin is
   * reachable by typing it, and every admin API call it makes is refused
   * server-side for a non-admin, so this is tidiness rather than a control.
   */
  isAdmin?: boolean;

  /** Set false to let a page manage its own horizontal padding. */
  contained?: boolean;
  children: ReactNode;
};

export function AppShell({
  tone = "light",
  watchTheme,
  activeSection,
  onNavigate,
  onOpenParentControls,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = "Search videos and photos",
  headerActions,
  accountSlot,
  onBack,
  backLabel = "Back",
  railMode = "inline",
  profileLabel,
  brandName,
  profileEmoji,
  profileImage,
  parentSignedIn = false,
  isAdmin = false,
  contained = true,
  children,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [railMini, setRailMini] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const searchEnabled = typeof onSearchChange === "function";

  // A drawer that outlives its own screen would trap the page, so close it
  // whenever the section changes underneath it.
  useEffect(() => {
    setDrawerOpen(false);
  }, [activeSection]);

  const submitSearch = () => {
    onSearchSubmit?.(searchValue ?? "");
    setMobileSearchOpen(false);
  };

  const searchField = (
    <div className="sasa-search">
      <Search size={18} className="sasa-search-icon" aria-hidden="true" />
      <input
        type="search"
        value={searchValue ?? ""}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        onChange={(event) => onSearchChange?.(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submitSearch();
          }
        }}
      />
      {searchValue ? (
        <button
          type="button"
          className="sasa-search-clear"
          aria-label="Clear search"
          onClick={() => onSearchChange?.("")}
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );

  return (
    <div
      className={tone === "dark" ? "sasa-shell is-dark" : "sasa-shell"}
      data-watch-theme={watchTheme}
    >
      <header
        className={mobileSearchOpen ? "sasa-topbar is-searching" : "sasa-topbar"}
        data-tone={tone}
      >
        <div className="sasa-topbar-start">
          {onBack && (
            <button type="button" className="sasa-iconbtn" aria-label={backLabel} onClick={onBack}>
              <ArrowLeft size={22} />
            </button>
          )}

          <button
            type="button"
            className="sasa-iconbtn sasa-menu-trigger"
            aria-label={
              railMode === "drawer" || drawerOpen ? "Open navigation" : "Collapse navigation"
            }
            aria-expanded={railMode === "drawer" ? drawerOpen : !railMini}
            onClick={() => {
              if (railMode === "drawer") {
                setDrawerOpen((value) => !value);
              } else {
                setRailMini((value) => !value);
              }
            }}
          >
            <Menu size={22} />
          </button>

          <button
            type="button"
            className="sasa-brand"
            onClick={() => onNavigate("home")}
            aria-label={`${brandName || "SARA"} home`}
          >
            <BrandMark />
            <span className="sasa-brand-word">
              {brandName || "SARA"}
              <sup>kids</sup>
            </span>
          </button>
        </div>

        <div className="sasa-topbar-mid">
          {searchEnabled &&
            (mobileSearchOpen ? (
              <div className="sasa-topbar-searchrow">
                <button
                  type="button"
                  className="sasa-iconbtn"
                  aria-label="Close search"
                  onClick={() => setMobileSearchOpen(false)}
                >
                  <ArrowLeft size={20} />
                </button>
                {searchField}
              </div>
            ) : (
              <div
                className="sasa-desktop-search"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {searchField}
              </div>
            ))}
        </div>

        <div className="sasa-topbar-end">
          {searchEnabled && (
            <button
              type="button"
              className="sasa-iconbtn sasa-search-trigger"
              aria-label="Search"
              onClick={() => setMobileSearchOpen(true)}
            >
              <Search size={22} />
            </button>
          )}

          {isAdmin && (
            <a
              className="sasa-iconbtn sasa-admin-link"
              href="/admin"
              aria-label="Open the admin portal"
              title="Admin portal"
            >
              <ShieldCheck size={20} />
            </a>
          )}

          {headerActions}
          {accountSlot}
        </div>
      </header>

      <div className="sasa-shell-body">
        {railMode === "inline" && (
          <SideRail
            variant="inline"
            mini={railMini}
            groups={RAIL_GROUPS}
            activeId={activeSection}
            onNavigate={(id) => onNavigate(id as KidsSectionId)}
            onOpenParentControls={onOpenParentControls}
          />
        )}

        {drawerOpen && (
          <SideRail
            variant="overlay"
            groups={RAIL_GROUPS}
            activeId={activeSection}
            onNavigate={(id) => onNavigate(id as KidsSectionId)}
            onOpenParentControls={onOpenParentControls}
            onClose={() => setDrawerOpen(false)}
          />
        )}

        <main className="sasa-main">
          {contained ? <div className="sasa-container">{children}</div> : children}
        </main>
      </div>

      <MobileTabBar
        activeId={activeSection}
        onNavigate={onNavigate}
        profileLabel={profileLabel}
        profileEmoji={profileEmoji}
        profileImage={profileImage}
        parentSignedIn={parentSignedIn}
        onOpenParentControls={onOpenParentControls}
      />
    </div>
  );
}

export default AppShell;
