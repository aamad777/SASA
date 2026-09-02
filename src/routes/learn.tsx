import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, Gamepad2, Music, Paintbrush } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
});

/**
 * Directory of the app's real play-and-learn sections. Each entry deep-links
 * into that section of the app (see the `section` search param handling in
 * src/routes/index.tsx) instead of duplicating the activity here.
 */
const sections = [
  {
    id: "songs",
    title: "Songs",
    description: "Sing-along songs with words on screen",
    icon: Music,
  },
  {
    id: "games",
    title: "Games",
    description: "Small games that practise counting and matching",
    icon: Gamepad2,
  },
  {
    id: "studio",
    title: "Drawing studio",
    description: "Draw, colour and save your own artwork",
    icon: Paintbrush,
  },
] as const;

function LearnPage() {
  return (
    <div className="sasa-standalone">
      <header className="sasa-auth-topbar">
        <Link to="/" className="sasa-iconbtn" aria-label="Back to SARA">
          <ArrowLeft size={22} />
        </Link>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <h1 className="sasa-standalone-title">Play &amp; learn</h1>
          <p className="sasa-standalone-sub">Open a section in the app</p>
        </div>
      </header>

      <main className="sasa-container">
        <div className="sasa-linklist">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.id}
                to="/"
                search={{ section: section.id }}
                className="sasa-panel sasa-linkrow"
              >
                <span className="sasa-avatar is-lg" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span className="sasa-panel-text">
                  <strong>{section.title}</strong>
                  <span>{section.description}</span>
                </span>
                <ChevronRight size={20} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
