import type { LucideIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useDismiss } from "@/hooks/use-dismiss";
import ProfileAvatar from "./ProfileAvatar";

export type AccountMenuItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  tone?: "default" | "danger";
};

type Props = {
  name: string;
  subtitle: string;
  avatarEmoji?: string;
  avatarImage?: string;
  items: AccountMenuItem[];
};

/**
 * Header account control. Hand-rolled rather than pulled from a portal
 * library so it renders identically during SSR and stays inside the header's
 * stacking context.
 */
export function AccountMenu({ name, subtitle, avatarEmoji, avatarImage, items }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useDismiss(open, wrapRef, close);

  return (
    <div className="sasa-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="sasa-iconbtn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <ProfileAvatar
          className="sasa-avatar"
          image={avatarImage}
          fallback={avatarEmoji || name.charAt(0) || "?"}
        />
      </button>

      {open && (
        <div className="sasa-menu" role="menu">
          <div className="sasa-menu-head">
            <ProfileAvatar
              className="sasa-avatar is-lg"
              image={avatarImage}
              fallback={avatarEmoji || name.charAt(0) || "?"}
            />
            <span style={{ minWidth: 0 }}>
              <strong>{name}</strong>
              <span>{subtitle}</span>
            </span>
          </div>

          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className={item.tone === "danger" ? "sasa-menu-item is-danger" : "sasa-menu-item"}
                onClick={() => {
                  close();
                  item.onSelect();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AccountMenu;
