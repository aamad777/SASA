import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, Camera, Home, Video } from "lucide-react";

const navItems = [
  { to: "/", label: "App", icon: Home },
  { to: "/videos", label: "Videos", icon: Video },
  { to: "/photos", label: "Photos", icon: Camera },
  { to: "/learn", label: "Learn", icon: BookOpen },
];

/**
 * Navigation for the standalone /videos, /photos and /learn pages. Every
 * entry points at a real route; "App" returns to the main SARA experience.
 */
export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="sasa-tabbar is-standalone" aria-label="Pages">
      {navItems.map((item) => {
        const isActive = pathname === item.to;
        const Icon = item.icon;

        return (
          <Link
            key={item.to}
            to={item.to}
            className={isActive ? "is-current" : undefined}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={22} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
