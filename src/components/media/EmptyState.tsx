import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "default" | "error";
  action?: ReactNode;
};

/** Shared empty / error panel so every section reads the same way. */
export function EmptyState({ icon: Icon, title, description, tone = "default", action }: Props) {
  return (
    <section className={tone === "error" ? "sasa-state is-error" : "sasa-state"}>
      <span className="sasa-state-icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}

export default EmptyState;
