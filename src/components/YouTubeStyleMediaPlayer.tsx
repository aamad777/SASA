import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Repeat,
  Unlock,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type MediaItem = {
  id: string | number;
  title: string;
  category?: string;
  image?: string;
  sourceType?: string;
  sourceUrl?: string;
};

type Props = {
  media: MediaItem;
  hasAdjacentMedia: boolean;
  autoPlay?: boolean;
  autoplayEnabled: boolean;
  onToggleAutoplay: () => void;
  onAutoPlayConsumed: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onPlayingChange?: (playing: boolean) => void;
  onToast?: (message: string) => void;
  /** "3 / 12" style position label rendered next to the time readout. */
  positionLabel?: string;
  /** Mirrors the in-player lock state up to the parent — see SARA_LOCKED_AUTOPLAY_V9. */
  onLockedChange?: (locked: boolean) => void;
};

const PHOTO_SECONDS = 8;
const SWIPE_DISTANCE_THRESHOLD = 56;
const SWIPE_MAX_DURATION = 700;

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
  autoplayEnabled,
  onToggleAutoplay,
  onAutoPlayConsumed,
  onPrevious,
  onNext,
  onPlayingChange,
  onToast,
  positionLabel,
  onLockedChange,
}: Props) {
  const isPhoto = media.sourceType === "photo";
  const reduceMotion = useReducedMotion();

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
  const volumeRef = useRef(1);
  const swipeStartRef = useRef<{ x: number; y: number; time: number; fromDock: boolean } | null>(
    null,
  );

  const nextRef = useRef(onNext);
  const previousRef = useRef(onPrevious);

  const [playing, setPlaying] = useState(isPhoto);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [photoProgress, setPhotoProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);

  useEffect(() => {
    nextRef.current = onNext;
    previousRef.current = onPrevious;
  }, [onNext, onPrevious]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const clearHideTimer = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const revealControls = () => {
    if (locked) return;

    setControlsVisible(true);
    clearHideTimer();

    if (playing) {
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
    // SARA_ANDROID_AUTH_RECOVERY_V10 — this used to force setLocked(false)
    // on every media change, which meant a parent's kiosk lock silently
    // turned itself off after the very next autoplay-advanced photo/video.
    // Lock now persists across media changes (see also the KidsVideoPlayer
    // stage key fix, which stops this component from remounting on every
    // playlist advance so fullscreen survives too); it's still cleared by
    // handleFullscreenChange above when fullscreen is actually exited.
    setCurrentTime(0);
    setDuration(0);
    setPhotoProgress(0);
    setControlsVisible(true);
    setMediaError(false);
    setRetryToken(0);
    setBufferedPercent(0);
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
    element.volume = volumeRef.current;

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

  // SARA_LOCKED_AUTOPLAY_V9 — lock only blocks manual UI/keyboard/swipe entry
  // points (togglePlay, handleKeyboard, handleTouchEnd below) — it never gates
  // the photo slideshow timer or the video "ended" autoplay-advance, so both
  // keep running while locked. Lifting the flag up lets KidsVideoPlayer's
  // app-level Next/Previous/Theater shortcuts respect the lock too, since
  // those live outside this component and weren't reachable from here before.
  useEffect(() => {
    onLockedChange?.(locked);
  }, [locked, onLockedChange]);

  useEffect(() => {
    if (!isPhoto || !playing) return;

    const interval = window.setInterval(() => {
      setPhotoProgress((current) => {
        if (current >= 100) return current;

        const next = Math.min(100, current + 100 / (PHOTO_SECONDS * 10));

        if (next >= 100 && !photoFinishedRef.current) {
          photoFinishedRef.current = true;

          if (autoplayEnabled) {
            window.setTimeout(() => {
              nextRef.current();
            }, 0);
          }
        }

        return next;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [isPhoto, mediaIdentity, playing, autoplayEnabled]);

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

  const handleVolumeChange = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));

    setVolume(clamped);

    const element = videoRef.current;

    if (element) {
      element.volume = clamped;

      if (clamped > 0 && element.muted) {
        element.muted = false;
        setMuted(false);
      } else if (clamped === 0 && !element.muted) {
        element.muted = true;
        setMuted(true);
      }
    }

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

  // Retry after a failed load: bump retryToken (cache-busts the photo <img>
  // src so the browser actually re-requests it instead of reusing the
  // already-failed response) and, for video, explicitly re-trigger load().
  const retryMedia = () => {
    setMediaError(false);
    setRetryToken((value) => value + 1);

    const element = videoRef.current;

    if (!isPhoto && element) {
      element.load();
    }
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

      // Locked = no accidental play/seek/mute/skip, from touch or keyboard alike.
      if (locked) return;

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

  // Swipe-left/right navigation for photos + uploaded videos. Any touch that
  // starts inside the control dock (seek bar, volume, buttons) is ignored so a
  // scrub gesture can never be misread as a page-turn.
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    revealControls();

    const target = event.target as HTMLElement | null;
    const fromDock = Boolean(target?.closest(".sasa-cinema-controlbar"));
    const touch = event.touches[0];

    if (!touch) return;

    swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now(), fromDock };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;

    swipeStartRef.current = null;

    if (!start || start.fromDock || locked) return;

    const touch = event.changedTouches[0];

    if (!touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const elapsed = Date.now() - start.time;

    if (
      elapsed <= SWIPE_MAX_DURATION &&
      Math.abs(deltaX) >= SWIPE_DISTANCE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.4
    ) {
      if (deltaX < 0) {
        nextRef.current();
      } else {
        previousRef.current();
      }
    }
  };

  const progressMaximum = isPhoto ? 100 : Math.max(duration, 1);

  const progressValue = isPhoto ? photoProgress : Math.min(currentTime, progressMaximum);

  const progressPercent = Math.min(100, Math.max(0, (progressValue / progressMaximum) * 100));

  const remainingPhotoSeconds = Math.max(0, Math.ceil(PHOTO_SECONDS * (1 - photoProgress / 100)));

  const elapsedPhotoSeconds = Math.min(PHOTO_SECONDS, (photoProgress / 100) * PHOTO_SECONDS);

  const volumeIcon =
    muted || volume === 0 ? (
      <VolumeX size={19} />
    ) : volume < 0.5 ? (
      <Volume1 size={19} />
    ) : (
      <Volume2 size={19} />
    );

  const mediaTypeLabel = isPhoto ? "Photo" : "Video";

  // While locked, every control except the Unlock pill stays hidden so a
  // stray tap can't seek, skip, or mute — that's the whole point of the lock.
  const showControls = !locked && (controlsVisible || !playing);

  // V7 player polish — entrance kept short (~300ms) per spec: a smooth
  // fade with a very small scale-in, never an aggressive pop.
  const entranceTransition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div
      ref={shellRef}
      className="sasa-cinema-player"
      onMouseMove={revealControls}
      onMouseLeave={() => {
        if (playing && !locked) {
          setControlsVisible(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      /* With native controls the browser owns taps on the video surface;
         intercepting them here would double-toggle playback. */
      onClick={isPhoto ? togglePlay : undefined}
    >
      {isPhoto ? (
        <motion.img
          key={mediaIdentity}
          className="sasa-cinema-media"
          src={
            retryToken > 0 && media.sourceUrl
              ? `${media.sourceUrl}${media.sourceUrl.includes("?") ? "&" : "?"}_retry=${retryToken}`
              : media.sourceUrl
          }
          alt={media.title}
          draggable={false}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
          // Quick fade+scale-in (~300ms), then — while motion is allowed — a
          // slow continuous Ken Burns drift for the rest of the slideshow.
          // object-fit: contain (see .sasa-cinema-media) keeps the photo
          // uncropped throughout.
          animate={{
            opacity: 1,
            scale: reduceMotion ? 1 : [1.04, 1, 1.07],
          }}
          transition={
            reduceMotion
              ? { duration: 0.01 }
              : {
                  opacity: { duration: 0.3, ease: "easeOut" },
                  scale: {
                    duration: PHOTO_SECONDS,
                    times: [0, 0.05, 1],
                    ease: "easeOut",
                  },
                }
          }
          onError={() => setMediaError(true)}
        />
      ) : (
        <motion.video
          key={mediaIdentity}
          ref={videoRef}
          className="sasa-cinema-media"
          src={media.sourceUrl}
          poster={media.image}
          /* SASA_WATCH_COMPACT_V23 — the browser's own controls for video.
           * The custom bar below rendered whenever the player was paused, which
           * is the state the page opens in, so a full-width black panel with a
           * seek bar and ten buttons sat permanently over the poster and hid
           * the thumbnail the video had just been given. Native controls are
           * compact, auto-hide on their own, and bring play/pause, seek,
           * volume and fullscreen with them. The custom bar is kept only for
           * photos, which have no native controls and do need a slideshow
           * timer — so the two are never shown at the same time. */
          controls
          controlsList="nodownload"
          playsInline
          preload="metadata"
          muted={muted}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={entranceTransition}
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
          onProgress={(event) => {
            const element = event.currentTarget;
            const total = element.duration;

            if (!Number.isFinite(total) || total <= 0 || element.buffered.length === 0) return;

            const bufferedEnd = element.buffered.end(element.buffered.length - 1);

            setBufferedPercent(Math.min(100, Math.max(0, (bufferedEnd / total) * 100)));
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

            if (autoplayEnabled) {
              nextRef.current();
            } else {
              setControlsVisible(true);
            }
          }}
          onError={() => setMediaError(true)}
        >
          Your browser does not support video playback.
        </motion.video>
      )}

      {/* Friendly fallback when a photo/video fails to load — never leaves a
          broken image icon or a frozen player with no way forward. */}
      {mediaError && (
        <div className="sasa-cinema-media-error" onClick={(event) => event.stopPropagation()}>
          <span className="sasa-cinema-media-error-icon" aria-hidden="true">
            😕
          </span>
          <strong>This {mediaTypeLabel.toLowerCase()} couldn&apos;t be loaded.</strong>
          <div className="sasa-cinema-media-error-actions">
            <button type="button" onClick={retryMedia}>
              Try Again
            </button>

            {hasAdjacentMedia && (
              <button type="button" onClick={() => nextRef.current()}>
                Skip to Next
              </button>
            )}
          </div>
        </div>
      )}

      {/* Title / category / type overlay — fades in and out together with the bottom controls */}
      <div
        className={["sasa-cinema-top-overlay", showControls && isPhoto ? "visible" : ""]
          .filter(Boolean)
          .join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="sasa-cinema-now-playing">
          <span className="sasa-cinema-now-playing-dot" aria-hidden="true" />
          Now Playing
        </span>

        <strong className="sasa-cinema-overlay-title">{media.title}</strong>

        <span className="sasa-cinema-overlay-chips">
          {media.category && <span className="sasa-cinema-overlay-chip">{media.category}</span>}
          <span className="sasa-cinema-overlay-chip is-type">{mediaTypeLabel}</span>
          <span className="sasa-cinema-overlay-chip is-approved">🛡 Parent Approved</span>
        </span>
      </div>

      <motion.button
        type="button"
        className={["sasa-cinema-center-play", showControls && isPhoto ? "visible" : ""]
          .filter(Boolean)
          .join(" ")}
        whileHover={reduceMotion ? undefined : { scale: 1.08 }}
        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
        onClick={(event) => {
          event.stopPropagation();
          togglePlay();
        }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause size={38} fill="currentColor" /> : <Play size={38} fill="currentColor" />}
      </motion.button>

      {fullscreen && (
        <button
          type="button"
          className="sasa-cinema-lock-pill"
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

      {/* The screen lock is a fullscreen-only control and has its own pill
          above (`sasa-cinema-lock-pill`), so it survives the custom bar being
          limited to photos — nothing is lost by that change. */}
      {isPhoto && (
        <div
          className={["sasa-cinema-controlbar", showControls ? "visible" : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={(event) => event.stopPropagation()}
        >
          <input
            className="sasa-cinema-seek"
            style={
              {
                "--fill": `${progressPercent}%`,
                "--buffered": `${isPhoto ? 0 : bufferedPercent}%`,
              } as React.CSSProperties
            }
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

          <div className="sasa-cinema-control-row">
            <div className="sasa-cinema-control-group">
              <motion.button
                type="button"
                className="sasa-cinema-btn"
                whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                onClick={() => previousRef.current()}
                disabled={!hasAdjacentMedia}
                aria-label="Previous media"
              >
                <ChevronLeft size={22} />
              </motion.button>

              <motion.button
                type="button"
                className="sasa-cinema-btn"
                whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <Pause size={22} fill="currentColor" />
                ) : (
                  <Play size={22} fill="currentColor" />
                )}
              </motion.button>

              <motion.button
                type="button"
                className="sasa-cinema-btn"
                whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                onClick={() => nextRef.current()}
                disabled={!hasAdjacentMedia}
                aria-label="Next media"
              >
                <ChevronRight size={22} />
              </motion.button>

              {!isPhoto && (
                <>
                  <motion.button
                    type="button"
                    className="sasa-cinema-btn"
                    whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                    onClick={toggleMute}
                    aria-label={muted ? "Unmute" : "Mute"}
                  >
                    {volumeIcon}
                  </motion.button>

                  <input
                    className="sasa-cinema-volume-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={muted ? 0 : volume}
                    onChange={(event) => handleVolumeChange(Number(event.currentTarget.value))}
                    aria-label="Volume"
                  />
                </>
              )}

              <span className="sasa-cinema-time">
                {isPhoto
                  ? `${formatTime(elapsedPhotoSeconds)} / ${formatTime(PHOTO_SECONDS)}`
                  : `${formatTime(currentTime)} / ${formatTime(duration)}`}
              </span>

              {positionLabel && <span className="sasa-cinema-position">{positionLabel}</span>}

              {isPhoto && (
                <span className="sasa-cinema-photo-caption">
                  {autoplayEnabled ? `Next in ${remainingPhotoSeconds}s` : "Autoplay off"}
                </span>
              )}
            </div>

            <div className="sasa-cinema-control-group">
              <motion.button
                type="button"
                className={["sasa-cinema-btn", autoplayEnabled ? "is-active" : ""]
                  .filter(Boolean)
                  .join(" ")}
                whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                onClick={() => {
                  onToggleAutoplay();
                  revealControls();
                }}
                aria-pressed={autoplayEnabled}
                aria-label={autoplayEnabled ? "Turn autoplay off" : "Turn autoplay on"}
                title={autoplayEnabled ? "Autoplay on" : "Autoplay off"}
              >
                <Repeat size={19} />
              </motion.button>

              {fullscreen && (
                <motion.button
                  type="button"
                  className="sasa-cinema-btn"
                  whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                  onClick={() => {
                    setLocked((current) => !current);
                    setControlsVisible(true);
                  }}
                  aria-label={locked ? "Unlock player" : "Lock player"}
                >
                  {locked ? <Unlock size={19} /> : <Lock size={19} />}
                </motion.button>
              )}

              <motion.button
                type="button"
                className="sasa-cinema-btn"
                whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                onClick={() => void toggleFullscreen()}
                aria-label={fullscreen ? "Exit full screen" : "Full screen"}
              >
                {fullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
