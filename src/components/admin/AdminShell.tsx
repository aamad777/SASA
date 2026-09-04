import { LayoutDashboard, LogOut, ScrollText, ShieldCheck, Users, Video } from "lucide-react";
import type { ReactNode } from "react";

export type AdminTab = "overview" | "parents" | "media" | "audit";

export const ADMIN_TABS: Array<{ id: AdminTab; label: string; icon: typeof Users }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "parents", label: "Parents", icon: Users },
  { id: "media", label: "Public media", icon: Video },
  { id: "audit", label: "Audit", icon: ScrollText },
];

type Props = {
  active: AdminTab;
  onSelect: (tab: AdminTab) => void;
  adminEmail?: string | null;
  onSignOut: () => void;
  children: ReactNode;
};

/**
 * SASA_ADMIN_UI_V25 — the portal chrome.
 *
 * Same shape as the parent dashboard so the two feel like one product: the
 * outer page is fixed to the visible viewport and only the content area
 * scrolls, so the header and the tab bar can never be pushed off screen. Four
 * tabs fit a 360px row without clipping, so there is no hidden-overflow row
 * and nothing to swipe for.
 */
export function AdminShell({ active, onSelect, adminEmail, onSignOut, children }: Props) {
  return (
    <div className="sasa-admin">
      <header className="sasa-admin-head">
        <span className="sasa-admin-brand">
          <ShieldCheck size={18} />
          <strong>SASA Admin</strong>
        </span>

        <span className="sasa-admin-who">
          {adminEmail ? <span title={adminEmail}>{adminEmail}</span> : null}
          <button type="button" onClick={onSignOut} aria-label="Sign out of the admin portal">
            <LogOut size={17} />
          </button>
        </span>
      </header>

      <main className="sasa-admin-body">{children}</main>

      <nav className="sasa-admin-tabs" aria-label="Admin sections">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const current = tab.id === active;

          return (
            <button
              key={tab.id}
              type="button"
              className={current ? "is-current" : undefined}
              aria-current={current ? "page" : undefined}
              onClick={() => onSelect(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default AdminShell;
