import YouTubeStyleMediaPlayer from "./YouTubeStyleMediaPlayer";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clapperboard,
  BookOpen,
  Home,
  Palette,
  Pause,
  Play,
  Search,
  Sparkles,
  UserCircle,
  Users,
  Radio,
  X,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import { playHeartSound, playPopSound } from "../lib/sound";
import { recordActivity } from "../lib/activity";
import type { KidsVideoItem } from "./KidsVideoHome";
import { kidsVideos, mediaThumbnailFallback } from "./KidsVideoHome";
import WatchPartyModal, { type WatchPartyBuddy } from "./WatchPartyModal";
import NumbersLearningVideo from "./NumbersLearningVideo";

import puppyImg from "../assets/images/puppy_avatar_1784920038818.jpg";
import penguinImg from "../assets/images/penguin_avatar_1784920051288.jpg";
import kittyImg from "../assets/images/kitty_avatar_1784920065128.jpg";
import monkeyImg from "../assets/images/monkey_avatar_1784920076703.jpg";
import koalaImg from "../assets/images/koala_avatar_1784920089417.jpg";

// SARA_CARTOON_THEMES_V7 — original, local SVG illustrations (no internet
// images, no copyrighted characters). Lightweight: pure vector shapes +
// gradients, animated only via CSS transform/opacity inside each SVG's own
// <style> block (which already respects prefers-reduced-motion internally).
import spaceThemeArt from "../assets/themes/space/background.svg";
import oceanThemeArt from "../assets/themes/ocean/background.svg";
import jungleThemeArt from "../assets/themes/jungle/background.svg";
import rainbowThemeArt from "../assets/themes/rainbow/background.svg";
import nightThemeArt from "../assets/themes/night/background.svg";
import brightThemeArt from "../assets/themes/bright/background.svg";

type CustomProfileProp = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  age?: number;
  avatarUrl?: string;
  image?: string;
};

type KidsVideoPlayerProps = {
  video: KidsVideoItem;
  profileId?: number | string;
  profileName?: string;
  profileEmoji?: string;
  customProfiles?: CustomProfileProp[];
  playlist?: KidsVideoItem[];
  onBack: () => void;
  onOpenVideo: (video: KidsVideoItem) => void;
  onOpenHomeTab: (tab: "home" | "search" | "library") => void;
  onChangeProfile: () => void;
};

const defaultBuddies: WatchPartyBuddy[] = [
  {
    id: 101,
    name: "Leo",
    emoji: "🦁",
    color: "#ffa62b",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA",
  },
  {
    id: 102,
    name: "Poppy",
    emoji: "🐼",
    color: "#95d5b2",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ",
  },
  {
    id: 103,
    name: "Ruby",
    emoji: "🐰",
    color: "#ff8fa3",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0",
  },
  {
    id: 104,
    name: "Percy Puppy",
    emoji: "🐶",
    color: "#fdb813",
    image: puppyImg,
  },
  {
    id: 105,
    name: "Pippin Penguin",
    emoji: "🐧",
    color: "#38bdf8",
    image: penguinImg,
  },
  {
    id: 106,
    name: "Cleo Kitty",
    emoji: "🐱",
    color: "#f472b6",
    image: kittyImg,
  },
  {
    id: 107,
    name: "Milo Monkey",
    emoji: "🐵",
    color: "#fb923c",
    image: monkeyImg,
  },
  {
    id: 108,
    name: "Kiki Koala",
    emoji: "🐨",
    color: "#a7f3d0",
    image: koalaImg,
  },
];

const reactions = [
  {
    id: "love",
    label: "Love it",
    emoji: "💖",
    className: "love",
  },
  {
    id: "amazing",
    label: "Amazing",
    emoji: "🤩",
    className: "amazing",
  },
  {
    id: "funny",
    label: "Funny",
    emoji: "😂",
    className: "funny",
  },
  {
    id: "favorite",
    label: "Favorite",
    emoji: "🌟",
    className: "favorite",
  },
];

// Small icon + label pair describing what kind of media is playing, used by
// both the compact metadata bar and the Up Next queue cards.
function getMediaTypeMeta(item: KidsVideoItem) {
  if (item.sourceType === "photo") {
    return { icon: "📷", label: "Photo" };
  }

  return { icon: "▶", label: "Video" };
}

// Shared title/category/type/parent-approved overlay for the stage branches
// that don't manage their own fading controls (YouTube embed, built-in demo
// image, Numbers Learning). Always visible — there's no controlbar to fade
// with — mirroring the fading overlay YouTubeStyleMediaPlayer renders itself
// for photos/uploaded videos.
function CinemaTopOverlay({
  title,
  category,
  typeLabel,
}: {
  title: string;
  category?: string;
  typeLabel: string;
}) {
  return (
    <div className="sasa-cinema-top-overlay is-static visible">
      <span className="sasa-cinema-now-playing">
        <span className="sasa-cinema-now-playing-dot" aria-hidden="true" />
        Now Playing
      </span>

      <strong className="sasa-cinema-overlay-title">{title}</strong>

      <span className="sasa-cinema-overlay-chips">
        {category && <span className="sasa-cinema-overlay-chip">{category}</span>}
        <span className="sasa-cinema-overlay-chip is-type">{typeLabel}</span>
        <span className="sasa-cinema-overlay-chip is-approved">🛡 Parent Approved</span>
      </span>
    </div>
  );
}

// Built-in watching-page themes. Each swaps a small set of CSS custom
// properties (background gradient stops + accent color) applied via
// `data-theme` on the player root — see the "SARA PROFESSIONAL PLAYER V4"
// theme block in styles.css. Purely cosmetic: never touches media, API
// calls, or layout behavior.
const PLAYER_THEMES = [
  {
    id: "space",
    label: "Space",
    emoji: "🌌",
    gradient: "linear-gradient(135deg, #0b0f2b 0%, #1e1b4b 55%, #05050c 100%)",
    art: spaceThemeArt,
  },
  {
    id: "ocean",
    label: "Ocean",
    emoji: "🌊",
    gradient: "linear-gradient(135deg, #032235 0%, #0b4a63 55%, #030c14 100%)",
    art: oceanThemeArt,
  },
  {
    id: "jungle",
    label: "Jungle",
    emoji: "🌿",
    gradient: "linear-gradient(135deg, #07200f 0%, #14532d 55%, #04120a 100%)",
    art: jungleThemeArt,
  },
  {
    id: "rainbow",
    label: "Rainbow",
    emoji: "🌈",
    gradient: "linear-gradient(135deg, #240b32 0%, #6d28d9 40%, #0369a1 75%, #050510 100%)",
    art: rainbowThemeArt,
  },
  {
    id: "night",
    label: "Night",
    emoji: "🌙",
    gradient: "linear-gradient(135deg, #0a0c14 0%, #14171f 55%, #05060a 100%)",
    art: nightThemeArt,
  },
  {
    id: "bright",
    label: "Bright",
    emoji: "☀️",
    gradient: "linear-gradient(135deg, #241a06 0%, #7c4a03 55%, #0c0904 100%)",
    art: brightThemeArt,
  },
] as const;

type PlayerThemeId = (typeof PLAYER_THEMES)[number]["id"];

const DEFAULT_PLAYER_THEME: PlayerThemeId = "night";

function readStoredTheme(): PlayerThemeId {
  const stored = localStorage.getItem("sasa-player-theme");

  return (
    (PLAYER_THEMES.find((item) => item.id === stored)?.id as PlayerThemeId) ?? DEFAULT_PLAYER_THEME
  );
}

type FloatingEmoji = {
  id: number;
  emoji: string;
  left: number;
  sender: string;
};

export default function KidsVideoPlayer({
  video,
  profileId,
  profileName = "Leo",
  profileEmoji = "🦁",
  customProfiles = [],
  playlist = [],
  onBack,
  onOpenVideo,
  onOpenHomeTab,
  onChangeProfile,
}: KidsVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const reduceMotion = useReducedMotion();
  const shouldAutoPlayNextRef = useRef(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    const stored = localStorage.getItem("sasa-player-autoplay");

    return stored === null ? true : stored === "true";
  });
  const [theaterMode, setTheaterMode] = useState(false);
  const [queueCollapsed, setQueueCollapsed] = useState(false);
  // SARA_LOCKED_AUTOPLAY_V9 — mirrors YouTubeStyleMediaPlayer's in-player
  // lock state so the app-level Theater/Next/Previous keyboard shortcuts
  // below can respect it too (autoplay/timer logic lives entirely inside
  // that component and was never gated by lock in the first place).
  const [playerLocked, setPlayerLocked] = useState(false);
  const [theme, setTheme] = useState<PlayerThemeId>(readStoredTheme);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showWatchPartyModal, setShowWatchPartyModal] = useState(false);
  const [activeWatchPartyBuddy, setActiveWatchPartyBuddy] = useState<WatchPartyBuddy | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [reaction, setReaction] = useState(() => {
    return localStorage.getItem(`sasa-video-reaction-${video.id}`) ?? "";
  });

  useEffect(() => {
    localStorage.setItem("sasa-player-autoplay", String(autoplayEnabled));
  }, [autoplayEnabled]);

  useEffect(() => {
    localStorage.setItem("sasa-player-theme", theme);
  }, [theme]);

  const getMediaIdentity = (item: KidsVideoItem) =>
    [
      item.sourceType || "built-in",
      item.id,
      item.sourceUrl || "",
      item.youtubeVideoId || "",
      item.title,
    ].join("::");

  const rawMediaPlaylist = playlist.length > 0 ? playlist : kidsVideos;

  // De-duplicate by identity so a media item assigned more than once never shows
  // up twice in "More to Watch"/"Playing Next" and never produces duplicate React keys.
  const mediaPlaylist = rawMediaPlaylist.filter((item, index, items) => {
    const identity = getMediaIdentity(item);

    return items.findIndex((candidate) => getMediaIdentity(candidate) === identity) === index;
  });

  const navigableMedia = mediaPlaylist.filter(
    (item) =>
      ((item.sourceType === "upload" || item.sourceType === "photo") && Boolean(item.sourceUrl)) ||
      (item.sourceType === "youtube" && Boolean(item.youtubeVideoId)),
  );

  const currentMediaIdentity = getMediaIdentity(video);

  const currentNavigableIndex = navigableMedia.findIndex(
    (item) => getMediaIdentity(item) === currentMediaIdentity,
  );

  const otherQueueItems = mediaPlaylist.filter(
    (item) => getMediaIdentity(item) !== currentMediaIdentity,
  );

  // Horizontal "Up Next" row scrolls, so every remaining item is rendered —
  // no separate "See All" pagination needed like the old vertical list had.
  const upNext = otherQueueItems;

  const hasAdjacentMedia = navigableMedia.length > 1;

  // Combine default buddies and custom profiles, excluding the currently logged-in kid
  const availableBuddies: WatchPartyBuddy[] = [
    ...defaultBuddies,
    ...customProfiles.map((cp) => ({
      id: cp.id,
      name: cp.name,
      emoji: cp.emoji,
      color: cp.color,
      avatarUrl: cp.avatarUrl || cp.image,
    })),
  ].filter((b) => b.name.toLowerCase() !== profileName.toLowerCase());

  const showToast = (message: string) => {
    setSyncToast(message);
    setTimeout(() => setSyncToast(null), 2500);
  };

  // Reset per-video UI state whenever the active media changes — whether that
  // happens via Previous/Next, autoplay-advance, or a "More to Watch" pick —
  // so a stale reaction never leaks from the previous item.
  useEffect(() => {
    setReaction(localStorage.getItem(`sasa-video-reaction-${video.id}`) ?? "");

    // Photos/uploads report their own play state via onPlayingChange once the
    // YouTubeStyleMediaPlayer mounts for the new item — resetting it here too
    // would race that callback. Only the YouTube/built-in branches, which the
    // parent controls directly, need an explicit reset on media change.
    if (video.sourceType !== "photo" && video.sourceType !== "upload") {
      setPlaying(false);
    }
  }, [video.id, video.sourceType]);

  const getNextPlayableMedia = () => {
    if (navigableMedia.length < 2) return null;

    if (currentNavigableIndex < 0) {
      return navigableMedia[0];
    }

    return navigableMedia[(currentNavigableIndex + 1) % navigableMedia.length];
  };

  const getPreviousPlayableMedia = () => {
    if (navigableMedia.length < 2) return null;

    if (currentNavigableIndex < 0) {
      return navigableMedia[navigableMedia.length - 1];
    }

    return navigableMedia[
      (currentNavigableIndex - 1 + navigableMedia.length) % navigableMedia.length
    ];
  };

  const openMedia = (item: KidsVideoItem | null) => {
    if (!item) return;

    shouldAutoPlayNextRef.current = item.sourceType === "upload";

    playPopSound();
    onOpenVideo(item);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Playlist-level keyboard shortcuts (Theater/Next/Previous) that must work
  // no matter which stage branch is mounted — YouTubeStyleMediaPlayer owns
  // Space/Arrow/M/F itself for photos + uploads. Kept in a ref, refreshed
  // every render, so the single window listener never closes over stale
  // playlist/video state (mirrors the nextRef/previousRef pattern below it).
  const globalShortcutsRef = useRef({
    toggleTheater: () => {},
    next: () => {},
    previous: () => {},
  });

  useEffect(() => {
    globalShortcutsRef.current = {
      toggleTheater: () => setTheaterMode((value) => !value),
      next: () => openMedia(getNextPlayableMedia()),
      previous: () => openMedia(getPreviousPlayableMedia()),
    };
  });

  useEffect(() => {
    const handleGlobalKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      ) {
        return;
      }

      if (event.key === "Escape" && showThemePicker) {
        setShowThemePicker(false);
        return;
      }

      // SARA_LOCKED_AUTOPLAY_V9 — block the app-level shortcuts while the
      // player is locked, matching the Space/Arrow/M/F guards already
      // enforced inside YouTubeStyleMediaPlayer. This only blocks manual
      // keyboard interaction; autoplay-driven navigation never goes through
      // this handler, so it's unaffected.
      if (playerLocked) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "t") {
        event.preventDefault();
        globalShortcutsRef.current.toggleTheater();
      } else if (key === "n") {
        event.preventDefault();
        globalShortcutsRef.current.next();
      } else if (key === "p") {
        event.preventDefault();
        globalShortcutsRef.current.previous();
      }
    };

    window.addEventListener("keydown", handleGlobalKeydown);

    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, [showThemePicker, playerLocked]);

  const handleTogglePlay = () => {
    playPopSound();
    const nextState = !playing;
    setPlaying(nextState);

    if (activeWatchPartyBuddy) {
      showToast(
        nextState
          ? `Synced! Playing for ${profileName} & ${activeWatchPartyBuddy.name}`
          : `Synced! Paused for both profiles`,
      );
    }
  };

  const handleSendEmojiReaction = (emoji: string) => {
    playHeartSound();
    const newId = Date.now() + Math.random();
    const leftPos = Math.floor(Math.random() * 70) + 15; // 15% to 85% width

    setFloatingEmojis((prev) => [
      ...prev,
      { id: newId, emoji, left: leftPos, sender: activeWatchPartyBuddy?.name || profileName },
    ]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newId));
    }, 2000);

    if (activeWatchPartyBuddy) {
      showToast(`${activeWatchPartyBuddy.name} sent ${emoji}`);
    }
  };

  const handleReactionClick = (id: string, e: MouseEvent) => {
    const updated = reaction === id ? "" : id;
    setReaction(updated);

    if (updated) {
      localStorage.setItem(`sasa-video-reaction-${video.id}`, updated);
      playHeartSound();

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 30,
        spread: 70,
        origin: { x, y },
        colors: ["#ff72aa", "#ffd166", "#06d6a0", "#118ab2", "#8338ec"],
      });

      // SARA_KIDS_ACTIVITY_V7 — a reaction is a genuine, real user action
      // worth showing in the parent's Activity feed; only logged when a
      // profile id is known (never for the "Leo" placeholder default).
      if (profileId !== undefined && profileId !== null) {
        const reactionMeta = reactions.find((r) => r.id === id);

        recordActivity({
          profileId: String(profileId),
          profileName,
          videoId: video.id,
          title: video.title,
          image: video.image,
          category: video.category,
          duration: video.duration,
          mediaType: video.sourceType || "built-in",
          kind: "reaction",
          reactionEmoji: reactionMeta?.emoji,
          reactionLabel: reactionMeta?.label,
        });
      }

      if (activeWatchPartyBuddy) {
        handleSendEmojiReaction(reactions.find((r) => r.id === id)?.emoji || "❤️");
      }
    } else {
      localStorage.removeItem(`sasa-video-reaction-${video.id}`);
      playPopSound();
    }
  };

  const cinemaBackdrop = video.image || video.sourceUrl;

  // Same branch conditions used below to pick the stage renderer — hoisted so
  // the stage shell can decide whether to hold a strict 16:9 crop (photos,
  // uploads, YouTube) or fall back to a fluid height (the Numbers Learning
  // activity, which has its own non-video layout and must never be cropped).
  const isYouTubeMedia = video.sourceType === "youtube" && Boolean(video.youtubeVideoId);
  const isPlayableMedia =
    (video.sourceType === "photo" || video.sourceType === "upload") && Boolean(video.sourceUrl);
  const isNumbersActivity =
    !isYouTubeMedia && !isPlayableMedia && (video.id === 7 || video.category === "Numbers");

  const activeThemeArt = PLAYER_THEMES.find((item) => item.id === theme)?.art;

  return (
    <motion.div
      className={[
        "kids-player-page sasa-professional-player-v4 relative overflow-hidden",
        theaterMode ? "is-theater-mode" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-theme={theme}
      style={
        activeThemeArt
          ? ({ "--player-art": `url(${activeThemeArt})` } as React.CSSProperties)
          : undefined
      }
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Theater backdrop: a softly blurred still from the active media behind
          a readability scrim, plus a single low-opacity ambient glow tinted by
          the selected theme. Crossfades whenever the selected media changes. */}
      <div className="sasa-cinema-bg" aria-hidden="true">
        {/* SARA_CARTOON_THEMES_V7 — cute original per-theme illustration,
            confined to the edges by design (each SVG keeps its center calm)
            and faded further toward the middle by the mask below so it never
            competes with the media/controls for attention. Remounted (via
            `key`) on theme change for a subtle fade rather than an instant
            swap. */}
        <motion.div
          key={theme}
          className="sasa-cinema-theme-art"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.6, ease: "easeOut" }}
        />
        <AnimatePresence>
          <motion.div
            key={currentMediaIdentity}
            className="sasa-cinema-bg-image"
            style={cinemaBackdrop ? { backgroundImage: `url(${cinemaBackdrop})` } : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 1.1, ease: "easeOut" }}
          />
        </AnimatePresence>
        <div className="sasa-cinema-bg-overlay" />
        <div className="sasa-cinema-ambient-glow" />
      </div>

      <header className="kids-player-header flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => {
            playPopSound();
            onBack();
          }}
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </motion.button>

        <h1 className="sasa-player-brand">
          WonderWatch <Sparkles size={15} aria-hidden="true" />
        </h1>

        <div className="sasa-player-header-actions">
          <div className="sasa-theme-picker-wrap">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              className="sasa-player-header-btn"
              onClick={() => {
                playPopSound();
                setShowThemePicker((value) => !value);
              }}
              aria-haspopup="dialog"
              aria-expanded={showThemePicker}
              aria-label="Choose a theme"
            >
              <Palette size={15} />
              <span>Theme</span>
            </motion.button>

            <AnimatePresence>
              {showThemePicker && (
                <>
                  <button
                    type="button"
                    className="sasa-theme-picker-backdrop"
                    aria-label="Close theme picker"
                    onClick={() => setShowThemePicker(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="sasa-theme-picker"
                    role="dialog"
                    aria-label="Choose a player theme"
                  >
                    <div className="sasa-theme-picker-header">
                      <h4>Player Theme</h4>
                      <button
                        type="button"
                        onClick={() => setShowThemePicker(false)}
                        aria-label="Close theme picker"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="sasa-theme-picker-grid">
                      {PLAYER_THEMES.map((item) => {
                        const selected = theme === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={["sasa-theme-card", selected ? "selected" : ""]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={() => {
                              playPopSound();
                              setTheme(item.id);
                              setShowThemePicker(false);
                            }}
                            aria-pressed={selected}
                          >
                            <span
                              className="sasa-theme-card-swatch"
                              style={{
                                background: item.gradient,
                                backgroundImage: `${item.gradient}, url(${item.art})`,
                              }}
                              aria-hidden="true"
                            >
                              {selected && <Check size={13} />}
                            </span>
                            <span className="sasa-theme-card-label">
                              {item.emoji} {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Watch Party Quick Trigger Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => {
              playPopSound();
              setShowWatchPartyModal(true);
            }}
            className={["sasa-player-header-btn", activeWatchPartyBuddy ? "is-active" : ""]
              .filter(Boolean)
              .join(" ")}
          >
            <Users size={15} />
            <span>{activeWatchPartyBuddy ? "Watch Party Active" : "Invite to Watch"}</span>
            {activeWatchPartyBuddy && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            )}
          </motion.button>
        </div>
      </header>

      {/* Sync Status Toast Banner */}
      <AnimatePresence>
        {syncToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-black flex items-center gap-2 border border-sky-400/40 backdrop-blur-md"
          >
            <Radio size={14} className="text-emerald-400 animate-pulse" />
            <span>{syncToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="kids-player-content">
        {/* Watch Party Active Top Bar */}
        {activeWatchPartyBuddy && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-3 text-white flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-400 flex items-center justify-center text-sm shadow">
                  {profileEmoji}
                </div>
                <div
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm shadow overflow-hidden"
                  style={{ backgroundColor: activeWatchPartyBuddy.color || "#bae6fd" }}
                >
                  {activeWatchPartyBuddy.avatarUrl || activeWatchPartyBuddy.image ? (
                    <img
                      src={activeWatchPartyBuddy.avatarUrl || activeWatchPartyBuddy.image}
                      alt={activeWatchPartyBuddy.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    activeWatchPartyBuddy.emoji
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-black tracking-tight block">
                  {profileName} & {activeWatchPartyBuddy.name}'s Party
                </span>
                <span className="text-[10px] text-purple-200 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  Synced Playback Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Quick Party Reactions */}
              {["🍿", "🎉", "💖", "👏"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendEmojiReaction(emoji)}
                  className="p-1.5 hover:bg-white/20 rounded-xl text-sm transition active:scale-90"
                  title={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setShowWatchPartyModal(true);
                }}
                className="ml-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-[11px] font-bold text-white transition"
              >
                Manage
              </button>
            </div>
          </motion.div>
        )}

        {/* Full-width stage, stacked top-to-bottom: player → media info →
            reactions → Up Next row. Up Next is a horizontally scrolling
            recommendation row on every breakpoint, not a side column. */}
        <div className="sasa-cinema-layout">
          <div className="sasa-cinema-stage-col">
            <div className="sasa-player-toolbar">
              <div className="sasa-player-toolbar-left">
                {currentNavigableIndex >= 0 && navigableMedia.length > 0 && (
                  <span className="sasa-player-position-pill">
                    {currentNavigableIndex + 1} / {navigableMedia.length}
                  </span>
                )}
              </div>

              <div className="sasa-player-toolbar-right">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  className={["sasa-player-toolbar-btn", theaterMode ? "is-active" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    playPopSound();
                    setTheaterMode((value) => !value);
                  }}
                  aria-pressed={theaterMode}
                  aria-label={theaterMode ? "Exit theater mode" : "Theater mode"}
                  title="Theater mode (T)"
                >
                  <Clapperboard size={15} />
                  <span>Theater</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  className="sasa-player-toolbar-btn sasa-desktop-only"
                  onClick={() => {
                    playPopSound();
                    setQueueCollapsed((value) => !value);
                  }}
                  aria-pressed={queueCollapsed}
                  aria-label={queueCollapsed ? "Show up next queue" : "Hide up next queue"}
                >
                  {queueCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                  <span>{queueCollapsed ? "Show queue" : "Hide queue"}</span>
                </motion.button>
              </div>
            </div>

            <div className="sasa-cinema-stage-shell">
              <div className="sasa-cinema-stage-glow" aria-hidden="true" />

              <div
                className={["sasa-cinema-stage", isNumbersActivity ? "is-fluid" : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMediaIdentity}
                    className="sasa-cinema-stage-media"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.01 }}
                    transition={{ duration: reduceMotion ? 0.01 : 0.3, ease: "easeOut" }}
                  >
                    {isYouTubeMedia ? (
                      <section className="sasa-cinema-frame">
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?rel=0&modestbranding=1`}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />

                        <CinemaTopOverlay
                          title={video.title}
                          category={video.category}
                          typeLabel="Video"
                        />

                        {hasAdjacentMedia && (
                          <div className="sasa-cinema-frame-nav">
                            <button
                              type="button"
                              onClick={() => openMedia(getPreviousPlayableMedia())}
                              aria-label="Previous assigned media"
                            >
                              <ChevronLeft size={28} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openMedia(getNextPlayableMedia())}
                              aria-label="Next assigned media"
                            >
                              <ChevronRight size={28} />
                            </button>
                          </div>
                        )}
                      </section>
                    ) : isPlayableMedia ? (
                      <YouTubeStyleMediaPlayer
                        media={video}
                        hasAdjacentMedia={hasAdjacentMedia}
                        autoPlay={shouldAutoPlayNextRef.current}
                        autoplayEnabled={autoplayEnabled}
                        onToggleAutoplay={() => setAutoplayEnabled((value) => !value)}
                        onAutoPlayConsumed={() => {
                          shouldAutoPlayNextRef.current = false;
                        }}
                        onPrevious={() => openMedia(getPreviousPlayableMedia())}
                        onNext={() => openMedia(getNextPlayableMedia())}
                        onPlayingChange={setPlaying}
                        onToast={showToast}
                        onLockedChange={setPlayerLocked}
                        positionLabel={
                          currentNavigableIndex >= 0 && navigableMedia.length > 0
                            ? `${currentNavigableIndex + 1} / ${navigableMedia.length}`
                            : undefined
                        }
                      />
                    ) : isNumbersActivity ? (
                      <div className="sasa-cinema-frame is-fluid">
                        <CinemaTopOverlay
                          title={video.title}
                          category={video.category}
                          typeLabel="Activity"
                        />

                        <NumbersLearningVideo isPlaying={playing} onTogglePlay={handleTogglePlay} />
                      </div>
                    ) : (
                      <section className="sasa-cinema-frame group">
                        <img
                          src={video.image}
                          alt={video.title}
                          className="sasa-cinema-frame-img"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = mediaThumbnailFallback;
                          }}
                        />

                        <CinemaTopOverlay
                          title={video.title}
                          category={video.category}
                          typeLabel="Video"
                        />

                        {/* Floating Emoji Reactions Overlay (watch-party — untouched) */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                          <AnimatePresence>
                            {floatingEmojis.map((item) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 1, y: 160, scale: 0.5 }}
                                animate={{ opacity: 0, y: -100, scale: 1.8 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.8, ease: "easeOut" }}
                                style={{ left: `${item.left}%` }}
                                className="absolute bottom-10 text-4xl filter drop-shadow-lg flex flex-col items-center"
                              >
                                <span>{item.emoji}</span>
                                <span className="text-[10px] font-black bg-slate-900/80 text-white px-1.5 py-0.5 rounded-md mt-0.5">
                                  {item.sender}
                                </span>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.88 }}
                          type="button"
                          className="kids-player-play-button shadow-2xl z-30"
                          onClick={handleTogglePlay}
                          aria-label={playing ? "Pause video" : "Play video"}
                        >
                          {playing ? (
                            <Pause size={42} fill="currentColor" />
                          ) : (
                            <Play size={42} fill="currentColor" />
                          )}
                        </motion.button>
                      </section>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <section className="sasa-cinema-meta-strip" aria-label="Media details">
              <span className="sasa-cinema-meta-chip is-type">
                {getMediaTypeMeta(video).icon} {getMediaTypeMeta(video).label}
              </span>
              <span className="sasa-cinema-meta-chip">🗂 {video.category || "Kids Media"}</span>
              <span className="sasa-cinema-meta-chip is-safe">🧸 Safe for Kids</span>
              <span className="sasa-cinema-meta-chip is-approved">🛡 Parent Approved</span>
              <span className="sasa-cinema-meta-chip is-autoplay">
                🔁 Autoplay {autoplayEnabled ? "On" : "Off"}
              </span>
            </section>

            <section className="sasa-cinema-reaction-dock" aria-label="React to this media">
              <h3 className="sasa-cinema-reaction-label">How was it?</h3>

              <div className="sasa-cinema-reaction-row">
                {reactions.map((item) => {
                  const selected = reaction === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.06, y: -3 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className={[
                        "sasa-cinema-reaction-pill",
                        item.className,
                        selected ? "selected" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={(e) => handleReactionClick(item.id, e)}
                      aria-pressed={selected}
                      aria-label={item.label}
                    >
                      <motion.span
                        aria-hidden="true"
                        className="sasa-cinema-reaction-emoji"
                        animate={selected && !reduceMotion ? { scale: [1, 1.5, 1] } : undefined}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                      >
                        {item.emoji}
                      </motion.span>
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Up Next / More to Watch — a YouTube-style horizontal recommendation
              row below the player, media info, and reactions. Same click-to-open
              behavior as the old sidebar queue, just laid out as scrolling cards. */}
          {!(queueCollapsed || theaterMode) && (
            <section className="sasa-cinema-upnext" aria-label="Up next queue">
              <div className="sasa-cinema-upnext-header">
                <h3>Up Next</h3>
              </div>

              <div className="sasa-cinema-upnext-row">
                <div className="sasa-cinema-upnext-card is-current" aria-current="true">
                  <span className="sasa-cinema-upnext-thumb">
                    <img
                      src={video.image}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = mediaThumbnailFallback;
                      }}
                    />
                    {video.duration && (
                      <span className="sasa-cinema-upnext-duration">{video.duration}</span>
                    )}
                  </span>
                  <span className="sasa-cinema-upnext-info">
                    <span className="sasa-cinema-upnext-badge is-now-playing">
                      <span className="sasa-cinema-upnext-now-dot" aria-hidden="true" />
                      Now Playing
                    </span>
                    <strong className="sasa-cinema-upnext-title">{video.title}</strong>
                    {video.category && (
                      <span className="sasa-cinema-upnext-category">{video.category}</span>
                    )}
                  </span>
                </div>

                <AnimatePresence>
                  {upNext.map((item, idx) => {
                    const meta = getMediaTypeMeta(item);

                    return (
                      <motion.button
                        key={getMediaIdentity(item)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        className="sasa-cinema-upnext-card"
                        onClick={() => openMedia(item)}
                      >
                        <span className="sasa-cinema-upnext-thumb">
                          <img
                            src={item.image}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = mediaThumbnailFallback;
                            }}
                          />
                          {item.duration && (
                            <span className="sasa-cinema-upnext-duration">{item.duration}</span>
                          )}
                        </span>
                        <span className="sasa-cinema-upnext-info">
                          <span className="sasa-cinema-upnext-badge">
                            {meta.icon} {meta.label}
                          </span>
                          <strong className="sasa-cinema-upnext-title">{item.title}</strong>
                          {item.category && (
                            <span className="sasa-cinema-upnext-category">{item.category}</span>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Watch Party Modal */}
      <WatchPartyModal
        isOpen={showWatchPartyModal}
        onClose={() => setShowWatchPartyModal(false)}
        currentProfileName={profileName}
        currentProfileEmoji={profileEmoji}
        availableBuddies={availableBuddies}
        activeBuddy={activeWatchPartyBuddy}
        onStartWatchParty={(buddy) => {
          setActiveWatchPartyBuddy(buddy);
          showToast(`Watch Party started with ${buddy.name}! 🍿`);
        }}
        onEndWatchParty={() => {
          setActiveWatchPartyBuddy(null);
          showToast(`Watch Party ended.`);
        }}
        isPlaying={playing}
        onTogglePlay={handleTogglePlay}
        videoTitle={video.title}
      />

      <nav className="kids-player-bottom-nav">
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          className="active"
          onClick={() => {
            playPopSound();
            onOpenHomeTab("home");
          }}
        >
          <Home size={24} />
          <span>Home</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => {
            playPopSound();
            onOpenHomeTab("search");
          }}
        >
          <Search size={24} />
          <span>Search</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => {
            playPopSound();
            onOpenHomeTab("library");
          }}
        >
          <BookOpen size={24} />
          <span>Library</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => {
            playPopSound();
            onChangeProfile();
          }}
        >
          <UserCircle size={24} />
          <span>Profile</span>
        </motion.button>
      </nav>
    </motion.div>
  );
}
