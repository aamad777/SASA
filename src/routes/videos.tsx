import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, ArrowLeft, Star } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/videos")({
  component: VideosPage,
});

const videos = [
  { id: 1, title: "Sunny Morning Song", duration: "2:30", color: "bg-sky-soft" },
  { id: 2, title: "Animal Friends", duration: "3:15", color: "bg-peach-soft" },
  { id: 3, title: "Counting Clouds", duration: "2:45", color: "bg-mint" },
  { id: 4, title: "Color Parade", duration: "4:00", color: "bg-sun" },
  { id: 5, title: "Bedtime Lullaby", duration: "3:30", color: "bg-sky-soft" },
  { id: 6, title: "Shapes Everywhere", duration: "2:10", color: "bg-peach-soft" },
];

function VideosPage() {
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
            <h1 className="font-heading text-3xl font-extrabold text-foreground">Watch Videos</h1>
            <p className="text-sm font-medium text-muted-foreground">Fun, safe videos for little ones</p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {videos.map((video) => (
            <button
              key={video.id}
              className={`kid-card toddler-shadow flex items-center gap-5 text-left ${video.color}`}
            >
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/60">
                <Play className="h-8 w-8 fill-current text-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-lg font-bold text-foreground">{video.title}</h3>
                <p className="text-sm font-medium text-muted-foreground">{video.duration}</p>
              </div>
              <Star className="ml-auto h-6 w-6 shrink-0 text-sun" />
            </button>
          ))}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
