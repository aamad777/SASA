import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

type KidCardProps = {
  to: string;
  icon: LucideIcon;
  title: string;
  color: "sky" | "peach" | "mint" | "sun" | "cream";
  className?: string;
};

const colorStyles = {
  sky: "bg-sky-soft text-foreground hover:bg-sky hover:text-primary-foreground",
  peach: "bg-peach-soft text-foreground hover:bg-peach hover:text-primary-foreground",
  mint: "bg-mint text-foreground hover:bg-mint/80",
  sun: "bg-sun text-foreground hover:bg-sun/80",
  cream: "bg-card text-foreground hover:bg-cream",
};

export function KidCard({ to, icon: Icon, title, color, className = "" }: KidCardProps) {
  return (
    <Link
      to={to}
      className={`kid-card toddler-shadow flex flex-col items-center justify-center gap-4 text-center ${colorStyles[color]} ${className}`}
    >
      <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/60 backdrop-blur-sm">
        <Icon className="h-10 w-10 text-foreground" strokeWidth={2} />
      </div>
      <span className="font-heading text-2xl font-bold tracking-tight">{title}</span>
    </Link>
  );
}
