import { useCallback, useEffect, useRef, useState } from "react";

import penguin from "@/assets/intro/penguin.png";
import tileBear from "@/assets/intro/tile-bear.jpg";
import tileFruit from "@/assets/intro/tile-fruit.jpg";
import tileSpace from "@/assets/intro/tile-space.jpg";
import tileTrain from "@/assets/intro/tile-train.jpg";

import "@/styles/intro-splash.css";

type IntroSplashProps = {
  onComplete: () => void;
};

const TILES = [
  {
    src: tileBear,
    label: "Bear's Big Adventure",
    position: "left-[8%] top-[16%] -rotate-6",
    delay: 900,
  },
  {
    src: tileSpace,
    label: "Robot's Space Trip",
    position: "right-[8%] top-[16%] rotate-6",
    delay: 1050,
  },
  {
    src: tileFruit,
    label: "Fruit Song Party",
    position: "left-[8%] bottom-[12%] rotate-3",
    delay: 1200,
  },
  {
    src: tileTrain,
    label: "Animal Train Ride",
    position: "right-[8%] bottom-[12%] -rotate-3",
    delay: 1350,
  },
];

const BUBBLES = [
  { left: "8%", size: 46, delay: 0, duration: 11, dx: "30px" },
  { left: "18%", size: 22, delay: 2.5, duration: 9, dx: "-20px" },
  { left: "31%", size: 64, delay: 1.2, duration: 14, dx: "40px" },
  { left: "44%", size: 30, delay: 4, duration: 10, dx: "-35px" },
  { left: "57%", size: 52, delay: 0.6, duration: 13, dx: "25px" },
  { left: "68%", size: 26, delay: 3.2, duration: 9.5, dx: "-15px" },
  { left: "79%", size: 58, delay: 1.8, duration: 12.5, dx: "35px" },
  { left: "91%", size: 34, delay: 5, duration: 10.5, dx: "-28px" },
];

export default function IntroSplash({ onComplete }: IntroSplashProps) {
  const [leaving, setLeaving] = useState(false);
  const finishing = useRef(false);

  const finishIntro = useCallback(() => {
    if (finishing.current) return;

    finishing.current = true;
    setLeaving(true);
    window.setTimeout(onComplete, 700);
  }, [onComplete]);

  useEffect(() => {
    const timer = window.setTimeout(finishIntro, 4200);
    return () => window.clearTimeout(timer);
  }, [finishIntro]);

  return (
    <main
      className={`sara-intro-theme fixed inset-0 z-[9999] flex min-h-dvh cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden bg-sky-scene px-4 py-8 ${
        leaving ? "animate-exit-scene" : ""
      }`}
      onClick={finishIntro}
      aria-label="SARA introduction"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {BUBBLES.map((bubble, index) => (
          <span
            key={index}
            className="animate-drift absolute bottom-[-10vh] rounded-full bg-bubble-orb opacity-60"
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
              ["--dx" as string]: bubble.dx,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        className="absolute right-5 top-5 z-20 rounded-full bg-white/80 px-5 py-2 font-display font-bold text-slate-600 shadow-soft backdrop-blur"
        onClick={(event) => {
          event.stopPropagation();
          finishIntro();
        }}
      >
        Skip
      </button>

      <div className="relative flex w-full max-w-2xl flex-col items-center gap-4">
        <div className="relative flex w-full items-center justify-center">
          {TILES.map((tile) => (
            <figure
              key={tile.label}
              className={`animate-pop absolute hidden w-24 overflow-hidden rounded-[1.75rem] shadow-float sm:block lg:w-32 ${tile.position}`}
              style={{ animationDelay: `${tile.delay}ms` }}
            >
              <div className="animate-bob" style={{ animationDelay: `${tile.delay}ms` }}>
                <img src={tile.src} alt={tile.label} className="h-24 w-full object-cover lg:h-32" />

                <figcaption className="absolute inset-x-0 bottom-0 bg-slate-900/45 px-2 py-1 text-center font-display text-[0.65rem] font-bold leading-tight text-white">
                  {tile.label}
                </figcaption>
              </div>
            </figure>
          ))}

          <div className="relative flex h-[min(58vw,17rem)] w-[min(58vw,17rem)] items-center justify-center">
            <div className="animate-orb absolute inset-0 rounded-full bg-bubble-orb shadow-float">
              <span className="animate-shimmer absolute left-[18%] top-[14%] h-12 w-20 rounded-full bg-white/50 blur-md" />
            </div>

            <img
              src={penguin}
              alt="SARA penguin mascot"
              className="animate-pop absolute -top-12 right-0 w-28 drop-shadow-xl sm:w-36"
              style={{ animationDelay: "700ms" }}
            />

            <h1
              className="animate-fade-up relative z-10 text-center font-display text-4xl font-extrabold text-puffy sm:text-5xl"
              style={{ animationDelay: "1200ms" }}
            >
              Safe Video Fun!
            </h1>
          </div>
        </div>

        <p
          className="animate-fade-up font-display text-3xl font-extrabold tracking-wider text-sky-600 sm:text-4xl"
          style={{ animationDelay: "300ms" }}
        >
          SARA
        </p>

        <p
          className="animate-fade-up font-display text-base font-bold text-slate-600"
          style={{ animationDelay: "1600ms" }}
        >
          Starting your safe adventure…
        </p>
      </div>
    </main>
  );
}
