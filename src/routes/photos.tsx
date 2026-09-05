import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { usePublicLibrary } from "@/lib/use-public-library";
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

/** The picture set bundled with the app (src/assets/photo-*.jpg). */
const photos = [
  { id: 1, label: "Puppy", image: puppyImg },
  { id: 2, label: "Flower", image: flowerImg },
  { id: 3, label: "Car", image: carImg },
  { id: 4, label: "Star", image: starImg },
  { id: 5, label: "Apple", image: appleImg },
  { id: 6, label: "Fish", image: fishImg },
  { id: 7, label: "Ball", image: ballImg },
  { id: 8, label: "Moon", image: moonImg },
];

/**
 * Standalone picture book. Tapping a picture opens it full size in a viewer
 * with previous/next — the cards used to be inert buttons that did nothing.
 */
function PhotosPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* SASA_PUBLIC_LIBRARY_V26 — published library photos, from the public
   * endpoint, which needs no session and can only return published public
   * rows. They join the bundled set so the viewer, the arrow keys and
   * previous/next all cover them too. */
  const library = usePublicLibrary("photo");

  const allPhotos = useMemo(
    () => [
      ...library.items.map((item) => ({
        id: item.id,
        label: item.title,
        image: item.image,
      })),
      ...photos,
    ],
    [library.items],
  );

  useEffect(() => {
    if (openIndex === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenIndex(null);
      if (event.key === "ArrowRight")
        setOpenIndex((index) => ((index ?? 0) + 1) % allPhotos.length);
      if (event.key === "ArrowLeft")
        setOpenIndex((index) => ((index ?? 0) - 1 + allPhotos.length) % allPhotos.length);
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [openIndex, allPhotos.length]);

  const active = openIndex === null ? null : allPhotos[openIndex];

  return (
    <div className="sasa-standalone">
      <header className="sasa-auth-topbar">
        <Link to="/" className="sasa-iconbtn" aria-label="Back to SARA">
          <ArrowLeft size={22} />
        </Link>
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <h1 className="sasa-standalone-title">Photos</h1>
          <p className="sasa-standalone-sub">Tap a picture to see it big</p>
        </div>
      </header>

      <main className="sasa-container">
        {library.error && (
          <p className="sasa-standalone-note" role="status">
            The SASA library could not be loaded. {library.error}
          </p>
        )}

        <div className="sasa-tilegrid">
          {allPhotos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className="sasa-tile"
              onClick={() => setOpenIndex(index)}
              aria-label={`Open ${photo.label}`}
            >
              <span className="sasa-tile-media is-square">
                <img src={photo.image} alt="" loading="lazy" />
              </span>
              <span className="sasa-tile-body">
                <strong>{photo.label}</strong>
              </span>
            </button>
          ))}
        </div>
      </main>

      {active && (
        <div className="sasa-lightbox" role="dialog" aria-label={active.label}>
          <div className="sasa-lightbox-bar">
            <strong>{active.label}</strong>
            <button
              type="button"
              className="sasa-iconbtn"
              onClick={() => setOpenIndex(null)}
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          <img className="sasa-lightbox-img" src={active.image} alt={active.label} />

          <div className="sasa-lightbox-nav">
            <button
              type="button"
              className="sasa-btn"
              onClick={() =>
                setOpenIndex((index) => ((index ?? 0) - 1 + allPhotos.length) % allPhotos.length)
              }
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <button
              type="button"
              className="sasa-btn"
              onClick={() => setOpenIndex((index) => ((index ?? 0) + 1) % allPhotos.length)}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
