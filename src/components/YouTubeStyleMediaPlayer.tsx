import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Unlock,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MediaItem = {
  id: string | number;
  title: string;
  image?: string;
  sourceType?: string;
  sourceUrl?: string;
};

type Props = {
  media: MediaItem;
  hasAdjacentMedia: boolean;
  autoPlay?: boolean;
  onAutoPlayConsumed: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onPlayingChange?: (playing: boolean) => void;
  onToast?: (message: string) => void;
};

const PHOTO_SECONDS = 8;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export default function YouTubeStyleMediaPlayer({
  media,
  hasAdjacentMedia,
  autoPlay = false,
  onAutoPlayConsumed,
  onPrevious,
  onNext,
  onPlayingChange,
  onToast,
}: Props) {
  const isPhoto = media.sourceType === "photo";

  const mediaIdentity = [
    media.sourceType || "media",
    media.id,
    media.sourceUrl || "",
    media.title,
  ].join("::");

  const shellRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const photoFinishedRef = useRef(false);

  const nextRef = useRef(onNext);
  const previousRef = useRef(onPrevious);

  const [playing, setPlaying] = useState(isPhoto);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    nextRef.current = onNext;
    previousRef.current = onPrevious;
  }, [onNext, onPrevious]);

  const clearHideTimer = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const revealControls = () => {
    setControlsVisible(true);
    clearHideTimer();

    if (playing && !locked) {
      hideTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 2800);
    }
  };

  useEffect(() => {
    return () => clearHideTimer();
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === shellRef.current;

      setFullscreen(active);

      if (!active) {
        setLocked(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setPhotoProgress(0);
    setControlsVisible(true);
    setLocked(false);
    photoFinishedRef.current = false;

    if (isPhoto) {
      setPlaying(true);
      onPlayingChange?.(true);
      return;
    }

    setPlaying(false);
    onPlayingChange?.(false);

    const element = videoRef.current;

    if (!element) return;

    element.load();

    if (!autoPlay) return;

    onAutoPlayConsumed();

    element.muted = true;
    setMuted(true);

    const start = () => {
      void element.play().catch(() => {
        setControlsVisible(true);
        onToast?.("Tap play to continue.");
      });
    };

    if (element.readyState >= 2) {
      start();
      return;
    }

    element.addEventListener("canplay", start, {
      once: true,
    });

    return () => {
      element.removeEventListener("canplay", start);
    };
  }, [mediaIdentity]);

  useEffect(() => {
    revealControls();
  }, [playing, locked]);

  useEffect(() => {
    if (!isPhoto || !playing) return;

    const interval = window.setInterval(() => {
      setPhotoProgress((current) => {
        const next = Math.min(100, current + 100 / (PHOTO_SECONDS * 10));

        if (next >= 100 && !photoFinishedRef.current) {
          photoFinishedRef.current = true;

          window.setTimeout(() => {
            nextRef.current();
          }, 0);
        }

        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [isPhoto, mediaIdentity, playing]);

  const togglePlay = () => {
    if (locked) return;

    if (isPhoto) {
      setPlaying((current) => {
        const next = !current;
        onPlayingChange?.(next);
        return next;
      });

      revealControls();
      return;
    }

    const element = videoRef.current;

    if (!element) return;

    if (element.paused) {
      void element.play();
    } else {
      element.pause();
    }

    revealControls();
  };

  const toggleMute = () => {
    const element = videoRef.current;

    if (!element || isPhoto) return;

    element.muted = !element.muted;
    setMuted(element.muted);
    revealControls();
  };

  const toggleFullscreen = async () => {
    const shell = shellRef.current;

    if (!shell) return;

    try {
      if (document.fullscreenElement === shell) {
        await document.exitFullscreen();
      } else {
        await shell.requestFullscreen();
      }
    } catch {
      onToast?.("Full screen is not available in this browser.");
    }

    revealControls();
  };

  const seek = (value: number) => {
    if (isPhoto) {
      setPhotoProgress(Math.max(0, Math.min(100, value)));

      photoFinishedRef.current = false;
      revealControls();
      return;
    }

    const element = videoRef.current;

    if (!element) return;

    element.currentTime = value;
    setCurrentTime(value);
    revealControls();
  };

  const seekVideoBy = (seconds: number) => {
    const element = videoRef.current;

    if (!element || isPhoto) return;

    const maximum = Number.isFinite(element.duration) ? element.duration : 0;

    element.currentTime = Math.max(0, Math.min(maximum, element.currentTime + seconds));

    revealControls();
  };

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
        return;
      }

      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        toggleMute();
        return;
      }

      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        void toggleFullscreen();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();

        if (isPhoto) {
          nextRef.current();
        } else {
          seekVideoBy(5);
        }

        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();

        if (isPhoto) {
          previousRef.current();
        } else {
          seekVideoBy(-5);
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [isPhoto, playing, muted, locked]);

  const progressMaximum = isPhoto ? 100 : Math.max(duration, 1);

  const progressValue = isPhoto ? photoProgress : Math.min(currentTime, progressMaximum);

  const remainingPhotoSeconds = Math.max(0, Math.ceil(PHOTO_SECONDS * (1 - photoProgress / 100)));

  const showControls = controlsVisible || !playing || locked;

  return (
    <div
      ref={shellRef}
      className={[
        "sasa-youtube-player",
        fullscreen ? "is-fullscreen" : "",
        locked ? "is-locked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseMove={revealControls}
      onMouseLeave={() => {
        if (playing && !locked) {
          setControlsVisible(false);
        }
      }}
      onTouchStart={revealControls}
      onClick={togglePlay}
    >
      {isPhoto ? (
        <img
          className="sasa-youtube-media"
          src={media.sourceUrl}
          alt={media.title}
          draggable={false}
        />
      ) : (
        <video
          ref={videoRef}
          className="sasa-youtube-media"
          src={media.sourceUrl}
          poster={media.image}
          controls={false}
          playsInline
          preload="metadata"
          muted={muted}
          onLoadedMetadata={(event) => {
            const element = event.currentTarget;

            setDuration(element.duration || 0);
            setCurrentTime(element.currentTime || 0);
            setMuted(element.muted);
          }}
          onTimeUpdate={(event) => {
            setCurrentTime(event.currentTarget.currentTime);
          }}
          onDurationChange={(event) => {
            setDuration(event.currentTarget.duration || 0);
          }}
          onVolumeChange={(event) => {
            setMuted(event.currentTarget.muted);
          }}
          onPlay={() => {
            setPlaying(true);
            onPlayingChange?.(true);
            revealControls();
          }}
          onPause={() => {
            setPlaying(false);
            onPlayingChange?.(false);
            setControlsVisible(true);
          }}
          onEnded={() => {
            setPlaying(false);
            onPlayingChange?.(false);
            nextRef.current();
          }}
        >
          Your browser does not support video playback.
        </video>
      )}

      <button
        type="button"
        className={["sasa-youtube-center-button", showControls ? "visible" : ""]
          .filter(Boolean)
          .join(" ")}
        onClick={(event) => {
          event.stopPropagation();
          togglePlay();
        }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
      </button>

      {fullscreen && (
        <button
          type="button"
          className="sasa-youtube-lock-button"
          onClick={(event) => {
            event.stopPropagation();
            setLocked((current) => !current);
            setControlsVisible(true);
          }}
          aria-label={locked ? "Unlock player" : "Lock player"}
        >
          {locked ? <Unlock size={21} /> : <Lock size={21} />}

          <span>{locked ? "Unlock" : "Lock"}</span>
        </button>
      )}

      <div
        className={["sasa-youtube-controls", showControls ? "visible" : ""]
          .filter(Boolean)
          .join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        <input
          className="sasa-youtube-progress"
          type="range"
          min="0"
          max={progressMaximum}
          step={isPhoto ? 0.1 : 0.25}
          value={progressValue}
          onChange={(event) => {
            seek(Number(event.currentTarget.value));
          }}
          aria-label={isPhoto ? "Photo slideshow progress" : "Video progress"}
        />

        <div className="sasa-youtube-control-row">
          <button
            type="button"
            onClick={() => previousRef.current()}
            disabled={!hasAdjacentMedia}
            aria-label="Previous media"
          >
            <ChevronLeft size={25} />
          </button>

          <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
            {playing ? (
              <Pause size={25} fill="currentColor" />
            ) : (
              <Play size={25} fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            onClick={() => nextRef.current()}
            disabled={!hasAdjacentMedia}
            aria-label="Next media"
          >
            <ChevronRight size={25} />
          </button>

          {!isPhoto && (
            <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
              {muted ? <VolumeX size={23} /> : <Volume2 size={23} />}
            </button>
          )}

          <span className="sasa-youtube-time">
            {isPhoto
              ? `${remainingPhotoSeconds}s`
              : `${formatTime(currentTime)} / ${formatTime(duration)}`}
          </span>

          <strong className="sasa-youtube-title">{media.title}</strong>

          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label={fullscreen ? "Exit full screen" : "Full screen"}
          >
            {fullscreen ? <Minimize2 size={23} /> : <Maximize2 size={23} />}
          </button>
        </div>
      </div>
    </div>
  );
}
