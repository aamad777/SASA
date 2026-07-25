import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ArrowLeft, CheckCircle2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
});

const activities = [
  { id: 1, title: "ABC Match", subtitle: "Find the letters", color: "bg-sky-soft" },
  { id: 2, title: "Counting Bears", subtitle: "1, 2, 3", color: "bg-peach-soft" },
  { id: 3, title: "Shape Sorting", subtitle: "Circles & squares", color: "bg-mint" },
  { id: 4, title: "Color Mixing", subtitle: "What color is this?", color: "bg-sun" },
  { id: 5, title: "Animal Sounds", subtitle: "Moo, woof, meow", color: "bg-sky-soft" },
  { id: 6, title: "Story Time", subtitle: "Read together", color: "bg-peach-soft" },
];

function LearnPage() {
  return (
    <div className="min-h-screen bg-background pb-28">
      <main className="mx-auto max-w-3xl px-4 pt-6 sm:pt-10">
        <header className="mb-6 flex items-center gap-4">
          <Link
            to="/"
            className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-foreground transition-colors hover:bg-muted/80"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-foreground">Play & Learn</h1>
            <p className="text-sm font-medium text-muted-foreground">Tiny games and lessons</p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {activities.map((activity) => (
            <button
              key={activity.id}
              className={`kid-card toddler-shadow flex items-center gap-5 text-left ${activity.color}`}
            >
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/60">
                <BookOpen className="h-8 w-8 text-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-xl font-bold text-foreground">{activity.title}</h3>
                <p className="text-sm font-medium text-muted-foreground">{activity.subtitle}</p>
              </div>
              <CheckCircle2 className="ml-auto h-7 w-7 shrink-0 text-mint" />
            </button>
          ))}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
