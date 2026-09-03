import YouTubeStyleMediaPlayer from "./YouTubeStyleMediaPlayer";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clapperboard,
  Heart,
  Image as ImageIcon,
  ListVideo,
  Palette,
  Pause,
  Play,
  Radio,
  Repeat,
  Share2,
  ShieldCheck,
  SkipBack,
  SkipForward,
  User,
  Users,
  Video,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import { playHeartSound, playPopSound } from "../lib/sound";
import { recordActivity } from "../lib/activity";
import { shareMedia } from "../lib/share";
import { useDismiss } from "../hooks/use-dismiss";
import type { KidsVideoItem, KidsHomeTab } from "./KidsVideoHome";
import { kidsVideos, mediaThumbnailFallback } from "./KidsVideoHome";
import AppShell from "./layout/AppShell";
import AccountMenu, { type AccountMenuItem } from "./layout/AccountMenu";
import {
  getMediaByline,
  getMediaDate,
  getMediaKindLabel,
  getMediaMetaLine,
} from "./media/media-meta";
import WatchPartyModal, { type WatchPartyBuddy } from "./WatchPartyModal";
import NumbersLearningVideo from "./NumbersLearningVideo";

import puppyImg from "../assets/images/puppy_avatar_1784920038818.jpg";
import penguinImg from "../assets/images/penguin_avatar_1784920051288.jpg";
import kittyImg from "../assets/images/kitty_avatar_1784920065128.jpg";
import monkeyImg from "../assets/images/monkey_avatar_1784920076703.jpg";
import koalaImg from "../assets/images/koala_avatar_1784920089417.jpg";

// SARA_CARTOON_THEMES_V7 — original, local SVG illustrations (no internet
// images, no copyrighted characters). Used as the theme swatches in the
// picker below; lightweight pure-vector art.
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
  onOpenHomeTab: (tab: KidsHomeTab) => void;
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
  { id: "love", label: "Love it", emoji: "💖" },
  { id: "amazing", label: "Amazing", emoji: "🤩" },
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "favorite", label: "Favorite", emoji: "🌟" },
];

// Built-in watching-page themes. Each swaps a small set of CSS custom
// properties (surface tint + accent color) applied via `data-theme` on the
// watch root — see the theme block in styles.css. Purely cosmetic: never
// touches media, API calls, or layout behavior.
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

function loadLibraryIds(): number[] {
  try {
    const value = localStorage.getItem("sasa-video-library");
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

type FloatingEmoji = {
  id: number;
  emoji: string;
  left: number;
  sender: string;
};

/** Static title overlay for the stage branches without fading controls. */
function StageOverlay({
  title,
  category,
  typeLabel,
}: {
  title: string;
  category?: string;
  typeLabel: string;
}) {
  return (
    <div className="sasa-stage-overlay">
      <strong>{title}</strong>
      <span className="sasa-stage-overlay-chips">
        {category && <span>{category}</span>}
        <span>{typeLabel}</span>
        <span>Parent approved</span>
      </span>
    </div>
  );
}

/** Watch-screen theme picker. */
function ThemeButton({
  theme,
  onSelect,
}: {
  theme: PlayerThemeId;
  onSelect: (id: PlayerThemeId) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const close = useCallback(() => setOpen(false), []);

  useDismiss(open, wrapRef, close);

  return (
    <div className="sasa-menu-wrap" ref={wrapRef} style={{ flex: "0 0 auto" }}>
      <button
        type="button"
        className="sasa-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          playPopSound();
          setOpen((value) => !value);
        }}
      >
        <Palette size={18} />
        <span className="sasa-watch-actionlabel">Theme</span>
      </button>

      {open && (
        <div className="sasa-themepop" role="dialog" aria-label="Choose a watch theme">
          <div className="sasa-themepop-grid">
            {PLAYER_THEMES.map((item) => {
              const selected = theme === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={selected ? "sasa-themecard is-selected" : "sasa-themecard"}
                  aria-pressed={selected}
                  onClick={() => {
                    playPopSound();
                    onSelect(item.id);
                    close();
                  }}
                >
                  <span
                    className="sasa-themecard-swatch"
                    style={{ backgroundImage: `${item.gradient}, url(${item.art})` }}
                    aria-hidden="true"
                  >
                    {selected && <Check size={14} />}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

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
  // SASA_WATCH_INFO_V19 — the description/metadata panel under the title is
  // collapsed by default and expands on tap, the way a phone watch page works.
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const [relatedHidden, setRelatedHidden] = useState(false);
  // SARA_LOCKED_AUTOPLAY_V9 — mirrors YouTubeStyleMediaPlayer's in-player
  // lock state so the app-level Theater/Next/Previous keyboard shortcuts
  // below can respect it too (autoplay/timer logic lives entirely inside
  // that component and was never gated by lock in the first place).
  const [playerLocked, setPlayerLocked] = useState(false);
  const [theme, setTheme] = useState<PlayerThemeId>(readStoredTheme);
  const [showWatchPartyModal, setShowWatchPartyModal] = useState(false);
  const [activeWatchPartyBuddy, setActiveWatchPartyBuddy] = useState<WatchPartyBuddy | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [libraryIds, setLibraryIds] = useState<number[]>(loadLibraryIds);
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
  // up twice in the related list and never produces duplicate React keys.
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

  const upNext = mediaPlaylist.filter((item) => getMediaIdentity(item) !== currentMediaIdentity);

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
  // happens via Previous/Next, autoplay-advance, or a related pick — so a
  // stale reaction never leaks from the previous item.
  useEffect(() => {
    setReaction(localStorage.getItem(`sasa-video-reaction-${video.id}`) ?? "");
    setInfoExpanded(false);
    setShareNote("");

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
  // playlist/video state.
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
  }, [playerLocked]);

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

  const handleShare = async () => {
    playPopSound();

    const outcome = await shareMedia({
      title: video.title,
      text: getMediaByline(video),
    });

    if (outcome === "shared" || outcome === "cancelled") return;

    setShareNote(outcome === "copied" ? "Link copied" : "Sharing isn’t available here");
    window.setTimeout(() => setShareNote(""), 2600);
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

  const saved = libraryIds.includes(video.id);

  const toggleSaved = (event: MouseEvent) => {
    const updated = saved ? libraryIds.filter((id) => id !== video.id) : [...libraryIds, video.id];

    setLibraryIds(updated);
    localStorage.setItem("sasa-video-library", JSON.stringify(updated));

    if (saved) {
      playPopSound();
      return;
    }

    playHeartSound();

    const rect = event.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 22,
      spread: 60,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ["#ff72aa", "#8b7cff", "#ffc107", "#2563eb"],
    });
  };

  // Same branch conditions used below to pick the stage renderer — hoisted so
  // the stage shell can decide whether to hold a strict 16:9 crop (photos,
  // uploads, YouTube) or fall back to a fluid height (the Numbers Learning
  // activity, which has its own non-video layout and must never be cropped).
  const isYouTubeMedia = video.sourceType === "youtube" && Boolean(video.youtubeVideoId);
  const isPlayableMedia =
    (video.sourceType === "photo" || video.sourceType === "upload") && Boolean(video.sourceUrl);
  const isNumbersActivity =
    !isYouTubeMedia && !isPlayableMedia && (video.id === 7 || video.category === "Numbers");

  // SARA_ANDROID_AUTH_RECOVERY_V10 — the stage below used to key the
  // YouTubeStyleMediaPlayer mount by currentMediaIdentity (one key per
  // photo/video), so every autoplay-advanced or Next/Previous transition
  // fully unmounted and remounted it. That destroyed its fullscreen DOM
  // node (the browser auto-exits fullscreen when the element is removed)
  // and reset its in-player lock, so a parent's kiosk lock silently turned
  // itself off after the very next item. Photos/uploads all render through
  // the same YouTubeStyleMediaPlayer instance, so they share one stable
  // stage key ("playable") and let its own mediaIdentity-keyed effects
  // handle the per-item reset instead of a remount — fullscreen and lock
  // now survive playlist navigation.
  const stageKey = isPlayableMedia ? "playable" : currentMediaIdentity;

  const showAside = !theaterMode && !relatedHidden && upNext.length > 0;

  const accountItems: AccountMenuItem[] = [
    {
      id: "profile",
      label: "Kid profile",
      icon: User,
      onSelect: () => onOpenHomeTab("profile"),
    },
    {
      id: "switch",
      label: "Switch profile",
      icon: Users,
      onSelect: () => {
        playPopSound();
        onChangeProfile();
      },
    },
  ];

  return (
    <AppShell
      tone="dark"
      watchTheme={theme}
      railMode="drawer"
      onBack={() => {
        playPopSound();
        onBack();
      }}
      backLabel="Back to home"
      onNavigate={(section) => onOpenHomeTab(section)}
      profileLabel="You"
      profileEmoji={profileEmoji}
      headerActions={
        <button
          type="button"
          className={activeWatchPartyBuddy ? "sasa-iconbtn is-active" : "sasa-iconbtn"}
          onClick={() => {
            playPopSound();
            setShowWatchPartyModal(true);
          }}
          aria-label={activeWatchPartyBuddy ? "Watch party is active" : "Invite someone to watch"}
          title="Watch party"
        >
          <Users size={22} />
        </button>
      }
      accountSlot={
        <AccountMenu
          name={profileName}
          subtitle="Kid profile"
          avatarEmoji={profileEmoji}
          items={accountItems}
        />
      }
    >
      <div className={theaterMode ? "sasa-watch is-theater" : "sasa-watch"}>
        {activeWatchPartyBuddy && (
          <section className="sasa-party">
            <span className="sasa-party-stack">
              <span className="sasa-avatar">{profileEmoji}</span>
              <span
                className="sasa-avatar"
                style={{ backgroundColor: activeWatchPartyBuddy.color || undefined }}
              >
                {activeWatchPartyBuddy.avatarUrl || activeWatchPartyBuddy.image ? (
                  <img
                    src={activeWatchPartyBuddy.avatarUrl || activeWatchPartyBuddy.image}
                    alt=""
                  />
                ) : (
                  activeWatchPartyBuddy.emoji
                )}
              </span>
            </span>

            <span className="sasa-party-text">
              <strong>
                {profileName} &amp; {activeWatchPartyBuddy.name}
              </strong>
              <span>Synced playback</span>
            </span>

            <span className="sasa-party-actions">
              {["🍿", "🎉", "💖", "👏"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="sasa-party-emoji"
                  onClick={() => handleSendEmojiReaction(emoji)}
                  aria-label={`Send ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                className="sasa-btn is-quiet"
                onClick={() => {
                  playPopSound();
                  setShowWatchPartyModal(true);
                }}
              >
                Manage
              </button>
            </span>
          </section>
        )}

        <div className={showAside ? "sasa-watch-grid has-aside" : "sasa-watch-grid"}>
          <div className="sasa-watch-primary">
            <div className="sasa-watch-stagewrap">
              <div className={isNumbersActivity ? "sasa-watch-stage is-fluid" : "sasa-watch-stage"}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stageKey}
                    className="sasa-watch-stage-media"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0.01 : 0.25, ease: "easeOut" }}
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

                        {hasAdjacentMedia && (
                          <div className="sasa-stage-nav">
                            <button
                              type="button"
                              onClick={() => openMedia(getPreviousPlayableMedia())}
                              aria-label="Previous item"
                            >
                              <ChevronLeft size={24} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openMedia(getNextPlayableMedia())}
                              aria-label="Next item"
                            >
                              <ChevronRight size={24} />
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
                      // The activity draws its own heading, so no stage
                      // overlay here — two stacked titles collided.
                      <div className="sasa-watch-activity">
                        <NumbersLearningVideo isPlaying={playing} onTogglePlay={handleTogglePlay} />
                      </div>
                    ) : (
                      <section className="sasa-cinema-frame">
                        <img
                          src={video.image}
                          alt={video.title}
                          className="sasa-cinema-frame-img"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = mediaThumbnailFallback;
                          }}
                        />

                        <StageOverlay
                          title={video.title}
                          category={video.category}
                          typeLabel="Video"
                        />

                        <button
                          type="button"
                          className="sasa-stage-play"
                          onClick={handleTogglePlay}
                          aria-label={playing ? "Pause" : "Play"}
                        >
                          {playing ? (
                            <Pause size={30} fill="currentColor" />
                          ) : (
                            <Play size={30} fill="currentColor" />
                          )}
                        </button>
                      </section>
                    )}

                    {/* Watch-party floating reactions, kept over the stage. */}
                    <div className="sasa-floatlayer">
                      <AnimatePresence>
                        {floatingEmojis.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 1, y: 120, scale: 0.6 }}
                            animate={{ opacity: 0, y: -80, scale: 1.6 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.8, ease: "easeOut" }}
                            style={{ left: `${item.left}%` }}
                          >
                            <span>{item.emoji}</span>
                            <span>{item.sender}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <h1 className="sasa-watch-title">{video.title}</h1>

            <p className="sasa-watch-meta">
              {getMediaMetaLine(video)}
              {currentNavigableIndex >= 0 && navigableMedia.length > 1 && (
                <>
                  <span className="sasa-watch-meta-dot">·</span>
                  {currentNavigableIndex + 1} of {navigableMedia.length} in this playlist
                </>
              )}
            </p>

            <button
              type="button"
              className="sasa-watch-info-toggle"
              aria-expanded={infoExpanded}
              onClick={() => {
                playPopSound();
                setInfoExpanded((value) => !value);
              }}
            >
              <span>{infoExpanded ? "Hide details" : "More details"}</span>
              {infoExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {infoExpanded && (
              <div className="sasa-watch-info">
                {/* Only fields the backend actually sent are rendered — there is
                    no view counter on these endpoints, so none is shown. */}
                {video.description && <p className="sasa-watch-info-desc">{video.description}</p>}

                <dl className="sasa-watch-info-list">
                  <div>
                    <dt>Type</dt>
                    <dd>{getMediaKindLabel(video)}</dd>
                  </div>

                  {video.category?.trim() && (
                    <div>
                      <dt>Category</dt>
                      <dd>{video.category}</dd>
                    </div>
                  )}

                  {getMediaDate(video) && (
                    <div>
                      <dt>Added</dt>
                      <dd>{getMediaDate(video)}</dd>
                    </div>
                  )}

                  <div>
                    <dt>Shared by</dt>
                    <dd>{getMediaByline(video)}</dd>
                  </div>
                </dl>

                {!video.description && (
                  <p className="sasa-watch-info-empty">
                    No description was added for this {getMediaKindLabel(video).toLowerCase()}.
                  </p>
                )}
              </div>
            )}

            {shareNote && (
              <p className="sasa-watch-sharenote" role="status">
                <Check size={14} /> {shareNote}
              </p>
            )}

            <div className="sasa-watch-actions sasa-hscroll">
              <button
                type="button"
                className="sasa-btn"
                onClick={toggleSaved}
                aria-pressed={saved}
                aria-label={saved ? "Remove from library" : "Save to library"}
              >
                <Heart
                  size={18}
                  fill={saved ? "currentColor" : "none"}
                  style={saved ? { color: "var(--sasa-pink)" } : undefined}
                />
                <span className="sasa-watch-actionlabel">{saved ? "Saved" : "Save"}</span>
              </button>

              <button
                type="button"
                className="sasa-btn"
                onClick={handleShare}
                aria-label={`Share ${video.title}`}
              >
                <Share2 size={18} />
                <span className="sasa-watch-actionlabel">Share</span>
              </button>

              <button
                type="button"
                className="sasa-btn"
                onClick={() => openMedia(getPreviousPlayableMedia())}
                disabled={!hasAdjacentMedia}
                aria-label="Previous item (P)"
              >
                <SkipBack size={18} />
                <span className="sasa-watch-actionlabel">Prev</span>
              </button>

              <button
                type="button"
                className="sasa-btn"
                onClick={() => openMedia(getNextPlayableMedia())}
                disabled={!hasAdjacentMedia}
                aria-label="Next item (N)"
              >
                <SkipForward size={18} />
                <span className="sasa-watch-actionlabel">Next</span>
              </button>

              <button
                type="button"
                className="sasa-btn"
                onClick={() => {
                  playPopSound();
                  setAutoplayEnabled((value) => !value);
                }}
                aria-pressed={autoplayEnabled}
              >
                <Repeat size={18} />
                <span className="sasa-watch-actionlabel">
                  Auto {autoplayEnabled ? "on" : "off"}
                </span>
              </button>

              <button
                type="button"
                className="sasa-btn"
                onClick={() => {
                  playPopSound();
                  setTheaterMode((value) => !value);
                }}
                aria-pressed={theaterMode}
                title="Theater mode (T)"
              >
                <Clapperboard size={18} />
                <span className="sasa-watch-actionlabel">Theater</span>
              </button>

              {upNext.length > 0 && (
                <button
                  type="button"
                  className="sasa-btn"
                  onClick={() => {
                    playPopSound();
                    setRelatedHidden((value) => !value);
                  }}
                  aria-pressed={relatedHidden}
                >
                  <ListVideo size={18} />
                  <span className="sasa-watch-actionlabel">
                    {relatedHidden ? "Related" : "Related"}
                  </span>
                </button>
              )}

              <button
                type="button"
                className={activeWatchPartyBuddy ? "sasa-btn is-primary" : "sasa-btn"}
                onClick={() => {
                  playPopSound();
                  setShowWatchPartyModal(true);
                }}
              >
                <Users size={18} />
                <span className="sasa-watch-actionlabel">
                  {activeWatchPartyBuddy ? "Party on" : "Party"}
                </span>
              </button>

              <ThemeButton theme={theme} onSelect={setTheme} />
            </div>

            <section className="sasa-watch-channel">
              <span className="sasa-avatar is-lg" aria-hidden="true">
                {video.sourceType === "photo" ? <ImageIcon size={20} /> : <Video size={20} />}
              </span>
              <span className="sasa-watch-channel-text">
                <strong>{getMediaByline(video)}</strong>
                <span>
                  {getMediaKindLabel(video)} for {profileName}
                </span>
              </span>
              <span
                className="sasa-chip"
                style={{ pointerEvents: "none", gap: 6 }}
                aria-label="This item was approved by a parent"
              >
                <ShieldCheck size={16} style={{ color: "var(--sasa-ok)" }} />
                Parent approved
              </span>
            </section>

            <section className="sasa-watch-block" aria-label="React to this item">
              <h2 className="sasa-watch-block-title">How was it?</h2>
              {/* SASA_WATCH_COMPACT_V23 — a grid, not a sideways scroller.
                  Four labelled pills never fit a phone width, so the last one
                  was always sliced down the middle and looked broken. Two rows
                  of two fit every size in the test matrix whole. */}
              <div className="sasa-reaction-grid">
                {reactions.map((item) => {
                  const selected = reaction === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={selected ? "sasa-reaction is-selected" : "sasa-reaction"}
                      onClick={(event) => handleReactionClick(item.id, event)}
                      aria-pressed={selected}
                    >
                      <span className="sasa-reaction-emoji" aria-hidden="true">
                        {item.emoji}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* On narrow screens the related list follows the primary column;
                from 1280px up it moves into the aside instead. */}
            {!showAside && !relatedHidden && !theaterMode && upNext.length > 0 && (
              <RelatedList items={upNext} current={video} onOpen={openMedia} inline />
            )}
          </div>

          {showAside && (
            <aside className="sasa-watch-aside">
              <RelatedList items={upNext} current={video} onOpen={openMedia} />
            </aside>
          )}
        </div>
      </div>

      {syncToast && (
        <div className="sasa-toast" role="status">
          <div>
            <Radio size={14} aria-hidden="true" />
            {syncToast}
          </div>
        </div>
      )}

      <WatchPartyModal
        isOpen={showWatchPartyModal}
        onClose={() => setShowWatchPartyModal(false)}
        currentProfileName={profileName}
        currentProfileEmoji={profileEmoji}
        availableBuddies={availableBuddies}
        activeBuddy={activeWatchPartyBuddy}
        onStartWatchParty={(buddy) => {
          setActiveWatchPartyBuddy(buddy);
          showToast(`Watch Party started with ${buddy.name}!`);
        }}
        onEndWatchParty={() => {
          setActiveWatchPartyBuddy(null);
          showToast(`Watch Party ended.`);
        }}
        isPlaying={playing}
        onTogglePlay={handleTogglePlay}
        videoTitle={video.title}
      />
    </AppShell>
  );
}

/** Related / up-next list. Rows keep the 16:9 ratio and never crop titles. */
function RelatedList({
  items,
  current,
  onOpen,
  inline = false,
}: {
  items: KidsVideoItem[];
  current: KidsVideoItem;
  onOpen: (item: KidsVideoItem) => void;
  inline?: boolean;
}) {
  return (
    <section
      className="sasa-watch-block"
      style={inline ? undefined : { marginBlockStart: 0 }}
      aria-label="Up next"
    >
      <h2 className="sasa-watch-block-title">Up next</h2>

      <div className="sasa-related">
        <div className="sasa-related-item is-current" aria-current="true">
          <span className="sasa-related-thumb">
            <img
              src={current.image}
              alt=""
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = mediaThumbnailFallback;
              }}
            />
          </span>
          <span className="sasa-related-text">
            <span className="sasa-nowplaying">
              <span className="sasa-nowplaying-dot" aria-hidden="true" />
              Now playing
            </span>
            <span className="sasa-related-title">{current.title}</span>
            <span className="sasa-related-meta">{getMediaMetaLine(current)}</span>
          </span>
        </div>

        {items.map((item) => (
          <button
            key={`${item.sourceType || "built-in"}-${item.id}`}
            type="button"
            className="sasa-related-item"
            onClick={() => onOpen(item)}
          >
            <span className="sasa-related-thumb">
              <img
                src={item.image}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = mediaThumbnailFallback;
                }}
              />
            </span>
            <span className="sasa-related-text">
              <span className="sasa-related-title">{item.title}</span>
              <span className="sasa-related-meta">{getMediaMetaLine(item)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
