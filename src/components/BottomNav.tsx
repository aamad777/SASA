import { Link, useLocation } from "@tanstack/react-router";
import { Home, Play, Camera, BookOpen } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/videos", label: "Videos", icon: Play },
  { to: "/photos", label: "Photos", icon: Camera },
  { to: "/learn", label: "Learn", icon: BookOpen },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-pb">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-7 w-7" strokeWidth={2.5} />
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
