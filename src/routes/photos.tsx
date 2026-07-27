import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ArrowLeft, Heart } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import puppyImg from "@/assets/photo-puppy.jpg";
import flowerImg from "@/assets/photo-flower.jpg";
import carImg from "@/assets/photo-car.jpg";
import starImg from "@/assets/photo-star.jpg";
import appleImg from "@/assets/photo-apple.jpg";
import fishImg from "@/assets/photo-fish.jpg";
import ballImg from "@/assets/photo-ball.jpg";
import moonImg from "@/assets/photo-moon.jpg";

export const Route = createFileRoute("/photos")({
  component: PhotosPage,
});

const photos = [
  { id: 1, label: "Puppy", image: puppyImg, color: "bg-peach-soft" },
  { id: 2, label: "Flower", image: flowerImg, color: "bg-sky-soft" },
  { id: 3, label: "Car", image: carImg, color: "bg-mint" },
  { id: 4, label: "Star", image: starImg, color: "bg-sun" },
  { id: 5, label: "Apple", image: appleImg, color: "bg-peach-soft" },
  { id: 6, label: "Fish", image: fishImg, color: "bg-sky-soft" },
  { id: 7, label: "Ball", image: ballImg, color: "bg-mint" },
  { id: 8, label: "Moon", image: moonImg, color: "bg-sun" },
];

function PhotosPage() {
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
            <h1 className="font-heading text-3xl font-extrabold text-foreground">See Photos</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Tap a picture to say its name
            </p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {photos.map((photo) => (
            <button
              key={photo.id}
              className={`kid-card toddler-shadow flex flex-col items-center gap-3 p-4 ${photo.color}`}
            >
              <div className="aspect-square w-full overflow-hidden rounded-2xl bg-white/60">
                <img
                  src={photo.image}
                  alt={photo.label}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-heading text-lg font-bold text-foreground">{photo.label}</span>
              <Heart className="h-5 w-5 text-peach" />
            </button>
          ))}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
