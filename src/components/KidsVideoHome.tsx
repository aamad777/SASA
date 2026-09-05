import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import {
  Check,
  Crown,
  Edit3,
  Heart,
  Image as ImageIcon,
  Info,
  LogIn,
  LogOut,
  Palette,
  Paintbrush,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  playHeartSound,
  playPopSound,
  playSuccessSound,
  isSoundEnabled,
  setSoundEnabled,
} from "../lib/sound";
import {
  appThemes,
  applyThemeAttribute,
  getStoredTheme,
  isNightTheme,
  setStoredTheme,
  type AppThemeId,
} from "../lib/theme";
import { useDismiss } from "../hooks/use-dismiss";
import AppShell from "./layout/AppShell";
import KidsFriends from "./KidsFriends";
import KidsSharedWithMe from "./KidsSharedWithMe";
import ShareToFriend from "./ShareToFriend";
import AccountMenu, { type AccountMenuItem } from "./layout/AccountMenu";
import { KIDS_SECTIONS, type KidsSectionId } from "./layout/nav-sections";
import MediaCard from "./media/MediaCard";
import MediaCardSkeleton from "./media/MediaCardSkeleton";
import AvatarChooser from "./AvatarChooser";
import EmptyState from "./media/EmptyState";
import KidsDrawingStudio from "./KidsDrawingStudio";
import KidsGamesStudio from "./KidsGamesStudio";
import KidsSongsStudio from "./KidsSongsStudio";

import numbersVideoImg from "../assets/images/numbers_kids_video_1784920463079.jpg";

export type KidsVideoItem = {
  id: number;
  title: string;
  duration: string;
  image: string;
  category: string;
  sourceType?: "built-in" | "upload" | "youtube" | "photo";
  sourceUrl?: string;
  youtubeVideoId?: string;
  /** ISO timestamp straight from the backend media record, when it sends one. */
  createdAt?: string;
  /** Byline shown under a card title. Never invented — see media-meta.ts. */
  sourceLabel?: string;
  /** Parent-written description straight from the backend, when there is one. */
  description?: string;
  /** The backend's own media key (a uuid for assigned media). See SASA_FEED_ID_V19. */
  mediaId?: string;
};

export type KidsHomeTab = KidsSectionId;

// Shared fallback thumbnail for any assigned-media image that fails to load
// (broken URL, deleted file, network hiccup) — used here and in the player
// so a bad thumbnail never shows a broken-image icon or blank card.
export const mediaThumbnailFallback = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
    <rect width="640" height="360" fill="#e6e8ec"/>
    <text x="320" y="190" text-anchor="middle" font-family="Manrope, Arial" font-size="24" font-weight="700" fill="#79808a">Media unavailable</text>
  </svg>`,
)}`;

type KidsVideoHomeProps = {
  key?: string | number;
  profileName: string;
  profileEmoji: string;
  profileId?: number | string;
  /* SASA_AVATAR_UI_V25 — a session and the backend profile uuid, present only
     for a database child. Without both, the avatar picker stays the local
     emoji list it has always been. */
  avatarToken?: string | null;
  databaseProfileId?: string | null;
  onAvatarSaved?: (avatarUrl: string) => void;
  profileImage?: string;
  assignedVideos?: KidsVideoItem[];
  assignedVideosLoading?: boolean;
  assignedMediaError?: string;
  onRetryAssignedMedia?: () => void;
  initialTab?: KidsHomeTab;
  activeTab?: KidsHomeTab;
  onTabChange?: (tab: KidsHomeTab) => void;
  onOpenVideo: (video: KidsVideoItem) => void;
  onOpenParentalControls: () => void;
  onChangeProfile: () => void;
  onOpenFreeAccount?: () => void;
  accountActionLabel: "Login" | "Sign Out";
  /** Passed through to AppShell to show the admin entry. */
  isAdmin?: boolean;
  onAccountAction: () => void;
};

const builtInCategories = [
  {
    name: "Numbers",
    image: numbersVideoImg,
  },
  {
    name: "Animals",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDjAp5NZ48TuzQUwagJX3BEsOoRnHOfOQFRiaHzC_6VTHBusH5vdnyE-dw2wknaAdkSD_sTsjy4_S035njloXzb9SfVsBpcozUKLuAk_Ru8t6VD9syxltNOKUoSvF3oUXsLo8akWhFvxPSm2k8HawcXFK9cvfvBSAUSSj-l_0flPJq2RHEuQ0kZCj_WR_krtqKF_ZdJ7EFdeLJYMLZRPv_YRK6UERduzBqHzOsLRKnUVUsh20dZNsLaXSmOmukV0-omLmxDf1yuxsA",
  },
  {
    name: "Science",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHx_6VcyyyAkMrQ7Y-w-OURZAkou1lzLfFPib9MJvZ8Q474OGB979tU1_jyn_95spx9jIpSNEy85GZQopqNO0YfQ9pUBwLBuUHqOTLbPJ5of_LNsURwBaiZi3QIy5je5_p64nOmb_s4c_6o5NBFDnM00Ova9JScEElI9-jWPKobWVu9oXtbNfP3_831wYXyLFyVhtH9oYsNKShDEFyZj5ao_bC8_QH_i0D4NSHwZDg0iZDGPhm6ZUApCXn67AXGvsf6S8g6rW_uOo",
  },
  {
    name: "Music",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1Xbm9EFIAa_mvtnoDyzgtc-A7uv8qtl0H_QNFVxh_WPQMF9XSYZ5oSoHBEMAtRXUi88dYmVPx_NAoLEZmVVTT4zjVdlMLl3fAT5IXLbgAsx8fnF440SBIgWZPAkymQlht1Z6NlIVJhHiLDMxYkRbdG27zpypLTYY8hQEFwTUNt_KY_u58FDDX9sPm4sNKmSfNds47k4N0SBuwe3uu1k5WmnsHMxhxacfccE_jj5avy0fi0PQr-5I7cyEhMK702e3wlHKCooQGqXE",
  },
  {
    name: "Space",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBV2uFqV3SsOxGG5OZoIPxSK9n-z2uooMZoXphzsg7XNM_7SOnRPS-T5nk0rwvrJjl8gUyds1SkY_Jpk2XkRWF-cQLWjcXXwtG8fD5gaYqbhKO8ZedsubYFwOwwEHx7TKGdAqG-GrMzOyKejZlU9mAfQ3f-lCVUM1HSnlw4vK9VBxcc_DLbVchaJ2XXzovD_bHU6AWHEdIOU5hgJyd1aOgZU2Yph7EIVdcucHErhwbhR_9agLdyYpNOLUXwgLiaj9qd6f_Wbyxjd8I",
  },
];

export const kidsVideos: KidsVideoItem[] = [
  {
    id: 7,
    title: "Learn Numbers 1 to 10 with Pippin!",
    duration: "04:30",
    category: "Numbers",
    image: numbersVideoImg,
  },
  {
    id: 1,
    title: "Learn to Count with Dinosaurs!",
    duration: "10:15",
    category: "Numbers",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDjwcBvDtG1fe9LxHnoNeNrMGk4fTivdubiwP3TV_DPY0hq0PJKfoljdtzGCLvfWssM7kOIgxD91CkIQjV5T4wDSnMhK8XBfG8BW0ML4IYpsgiKhz8Anpj6pMGuINoL8YZOGFOedj-GecrNAlbW6xYDigch_X_Poia5K8nEDaa-WRCCeNtM4KsoU_LRARwtMPxvsh-5KfqA1iLf5Mgs1uQxd8GjNjHCvVNalC6ezmoLMkoLE6znAFA1tB7fDx5zhsVYhr49qiEXBpc",
  },
  {
    id: 2,
    title: "The Amazing Solar System",
    duration: "15:30",
    category: "Space",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAYCIE5ObL0I7VLAVlu9S4guu3tZis6FpFWIbfo3lt8h7YwHELMjkXWpUm22oWdAvXGzdDqARBkSTL-G5nSSoHo0pby2o8GRQjz0iOlERwoh7WQoQieYKB7ey9KRjIunSXvRvXqfz95W-oOhohOmbwvGo7_9ha9VsYEH2DUbRvqXHWcYV5ZiTBQ0onEHIbr1qx7IHfklS01xpqKgxnOHpEY3zF0dgZZ7ncmW4uRlf1yLPkdr-oaAuDESMde65XhKhFE5lOOx9MnGS8",
  },
  {
    id: 3,
    title: "Sing-Along Nursery Rhymes",
    duration: "5:00",
    category: "Music",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBngTUq4TMGud68bpX563YhKS8fpUybHgPm2FagY7uqjDSjn5YnxN8QITXS3cqI1VSAKAySB6-GzuEXMNY38P1zE1hvCSwk9C0WUZwvOG1mwB40_k4Jl5rexXug-ap7N0H9j2JlCEHM-y7B7m14hTzTRm5PZcXs3ipLcNfFe_Jh7nTWeIOxB3luWZzuCZ2cr6_DOgUJS4T96D-WL0W1xUpoPWamZrCEa26f78ucd3uhaEVdHDv4f-paFw3t-nMDJcqNSYRdb1wQ7sQ",
  },
  {
    id: 4,
    title: "DIY Volcano Experiment",
    duration: "12:45",
    category: "Science",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAR6gvme4x0nZTflLk5canbiFllbfBKw-83LwR_D4Ea7GYRY8gTDi06DKL-1Vfmy-tPUivApwcH0LQf5jU1wOTdJQkGniE2iutdRwlnFibzzqKFCATB8OQwwndmGOHesq5NmBWUes66WDey5HENcFjeFZq3FCDmiz-3HIASq1Gqpo10NZOUYtk5XMr7sW8nkthJOAiWVFagHSq8rbaeyK418dVshiELkpoXUJEEbS4cNnDwLvAxeQx439IU6YDzVqYgVQQ8jINlF_c",
  },
  {
    id: 5,
    title: "Plant and Grow Together",
    duration: "10:10",
    category: "Science",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCGoW-xoowXiPjR8TL8V7ULpkCvanUpu4zojqDQZ4HYJjoRiJma4RaYu_h-1UaDzr1B9OU95WqQkZvqNRwBajNMo7uRIvVsTfP6YnNanz_oVLCzFT7wufVJ8Gxa5Ko6JP0hxyP0NMEmmujaZFJh8dLXSWcdDD7bZCWSmpufjS8JAM_e4l3Z5iu2-OV-g2Ir-YYXnNiSJTi6t4-zes9z3INlewm5J7yjp2owcaoZmRUMR5SsE-cIvOfSFCj56zAL7mER7JXOl4WyGwY",
  },
  {
    id: 6,
    title: "Friendly Animal Adventure",
    duration: "8:20",
    category: "Animals",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOqr2ccQdse7AfIKOtjwamQ3RJS_kac37xmabWYdAvdrYc0wDWpKIIXEQOUxuyp8YcDZiy-KXKFXylUdmQEXwwJZZZQT8OER_GGE4MKTDQm7tpZZ9mOUfSnBpT3945Pb4IfPhiFyLTOf1nZwGCVupEyJgr9Eh77u28xt4yU1sI2RCxGqX5fKH2955kRFincic4iL0YZHgSudq2f7uRlbQo8kY2ze-hrRIUvu6MIcKCyFVtXa1752c9e7ZdJ_UheNXB4G1FHxKLZ_0",
  },
];

const GRID_SECTIONS: KidsSectionId[] = ["home", "search", "library"];

const QUICK_TOPICS = [
  "Numbers",
  "Dinosaurs",
  "Solar System",
  "Sing-Along",
  "Experiment",
  "Animals",
];

const KID_AVATARS = [
  "🦁",
  "🐼",
  "🐰",
  "🐶",
  "🐧",
  "🐱",
  "🐒",
  "🐨",
  "🦄",
  "🐥",
  "🚀",
  "🌟",
  "👑",
  "🎨",
];

const CHARACTER_AVATARS = [
  {
    name: "Leo",
    emoji: "🦁",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA",
  },
  {
    name: "Poppy",
    emoji: "🐼",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ",
  },
  {
    name: "Ruby",
    emoji: "🐰",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0",
  },
];

const KID_BADGES = [
  { title: "Star Watcher", icon: "⭐" },
  { title: "Junior Artist", icon: "🎨" },
  { title: "Super Kid", icon: "🚀" },
];

function loadLibrary(): number[] {
  try {
    const value = localStorage.getItem("sasa-video-library");
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function loadBlockedVideoIds(): number[] {
  try {
    const saved = localStorage.getItem("sasa-parent-controls");
    if (!saved) return [];
    const settings = JSON.parse(saved);
    return Array.isArray(settings.blockedVideoIds) ? settings.blockedVideoIds : [];
  } catch {
    return [];
  }
}

/** Header popover for the kid theme picker. */
function ThemeMenu({
  currentTheme,
  onSelect,
}: {
  currentTheme: AppThemeId;
  onSelect: (themeId: AppThemeId) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const close = useCallback(() => setOpen(false), []);

  useDismiss(open, wrapRef, close);

  return (
    <div className="sasa-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="sasa-iconbtn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Choose a theme"
        title="Theme"
        onClick={() => setOpen((value) => !value)}
      >
        <Palette size={22} />
      </button>

      {open && (
        <div className="sasa-menu" role="menu">
          <div className="sasa-menu-head">
            <span className="sasa-avatar">
              <Palette size={18} />
            </span>
            <span style={{ minWidth: 0 }}>
              <strong>Theme</strong>
              <span>Changes the app colours only</span>
            </span>
          </div>

          {appThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              role="menuitemradio"
              aria-checked={currentTheme === theme.id}
              className={currentTheme === theme.id ? "sasa-menu-item is-current" : "sasa-menu-item"}
              onClick={() => {
                onSelect(theme.id);
                close();
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 16, width: 18 }}>
                {theme.emoji}
              </span>
              <span>{theme.name}</span>
              {currentTheme === theme.id && (
                <Check size={16} style={{ marginInlineStart: "auto" }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KidsVideoHome({
  profileName,
  profileEmoji,
  profileId,
  avatarToken,
  databaseProfileId,
  onAvatarSaved,
  profileImage,
  assignedVideos = [],
  assignedVideosLoading = false,
  assignedMediaError = "",
  onRetryAssignedMedia,
  initialTab = "home",
  activeTab: activeTabProp,
  onTabChange,
  onOpenVideo,
  onOpenParentalControls,
  onChangeProfile,
  onOpenFreeAccount,
  accountActionLabel,
  isAdmin = false,
  onAccountAction,
}: KidsVideoHomeProps) {
  const isGuestAccount = typeof onOpenFreeAccount === "function";

  /* SASA_FRIENDS_V32 — friends and sharing act AS the child, so they run on
   * the child-scoped token the server issued at PIN/profile-select, never on
   * the parent's. A guest has no session at all and simply gets no Friends. */
  const childToken =
    typeof window !== "undefined" ? localStorage.getItem("sasa-child-token") : null;

  /* The item a child chose to share, held while the sheet is open. */
  const [sharing, setSharing] = useState<{ id: string; title: string } | null>(null);

  const [currentTab, setCurrentTab] = useState<KidsHomeTab>(activeTabProp || initialTab);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [libraryIds, setLibraryIds] = useState<number[]>(loadLibrary);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppThemeId>(getStoredTheme);

  // Sync prop changes
  useEffect(() => {
    if (activeTabProp && activeTabProp !== currentTab) {
      setCurrentTab(activeTabProp);
    }
  }, [activeTabProp]);

  // The picker persisted a theme id that nothing ever applied on load, so a
  // chosen theme was forgotten on every visit. Re-apply it on mount.
  useEffect(() => {
    applyThemeAttribute(currentTheme);
  }, [currentTheme]);

  // Kid Profile Customization State
  const [activeEmoji, setActiveEmoji] = useState<string>(() => {
    return localStorage.getItem("sasa-active-kid-emoji") || profileEmoji;
  });
  const [activeName, setActiveName] = useState<string>(() => {
    return localStorage.getItem("sasa-active-kid-name") || profileName;
  });
  const profileImageStorageKey =
    profileId !== undefined && profileId !== null
      ? `sasa-child-image-${profileId}`
      : "sasa-active-kid-image";

  const [activeImage, setActiveImage] = useState<string | undefined>(() => {
    return profileImage || localStorage.getItem(profileImageStorageKey) || undefined;
  });

  useEffect(() => {
    const savedImage = profileImage || localStorage.getItem(profileImageStorageKey) || undefined;

    setActiveImage(savedImage);

    if (profileImage) {
      localStorage.setItem(profileImageStorageKey, profileImage);
    }
  }, [profileId, profileImage, profileImageStorageKey]);

  /* The browser tab carries the same name as the wordmark, so a parent with
   * several tabs open can tell whose session is whose. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = activeName ? `${activeName}kids` : "SARAkids";
  }, [activeName]);

  useEffect(() => {
    if (profileName) {
      setActiveName(profileName);
      setTempName(profileName);
    }
    if (profileEmoji) {
      setActiveEmoji(profileEmoji);
    }
  }, [profileName, profileEmoji]);

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(activeName);
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);

  /* SASA_AVATAR_UI_V25 — activeEmoji is seeded once from the prop, so a saved
     avatar did not show until a reload. Follow the prop when the owner
     changes it. */
  useEffect(() => {
    setActiveEmoji(profileEmoji);
  }, [profileEmoji]);

  useEffect(() => {
    setActiveImage(profileImage);
  }, [profileImage]);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  const savedArtworksCount = useMemo(() => {
    try {
      const saved = localStorage.getItem("sasa-kids-artworks");
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  }, [currentTab]);

  const handleSelectAvatar = (emoji: string, imageUrl?: string) => {
    playSuccessSound();
    setActiveEmoji(emoji);
    localStorage.setItem("sasa-active-kid-emoji", emoji);
    if (imageUrl) {
      setActiveImage(imageUrl);
      localStorage.setItem(profileImageStorageKey, imageUrl);
    } else {
      setActiveImage(undefined);
      localStorage.removeItem(profileImageStorageKey);
    }
    setShowAvatarPicker(false);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      playSuccessSound();
      setActiveName(tempName.trim());
      localStorage.setItem("sasa-active-kid-name", tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleTapBadge = (title: string, msg: string, event: MouseEvent) => {
    playSuccessSound();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    confetti({
      particleCount: 28,
      spread: 70,
      origin: { x, y },
      colors: ["#ff8fa3", "#ffa62b", "#ffde59", "#95d5b2", "#8ecae6"],
    });

    setBadgeToast(`Unlocked: ${title}! ${msg}`);
    setTimeout(() => setBadgeToast(null), 3500);
  };

  // SARA_ASSIGNED_MEDIA_MAPPING_V5 — "Photos" is a synthetic bucket keyed off
  // sourceType, not a real category string, so matching it against
  // video.category (as the filter below used to) always came back empty even
  // when photos existed. Category matching is also case-insensitive here so
  // e.g. "animals" and "Animals" from different assigned items land in the
  // same bucket and both show up when either casing is selected.
  const isPhotoBucketSelected = (category: string) => category.trim().toLowerCase() === "photos";

  const displayedVideos = useMemo(() => {
    const blockedVideoIds = loadBlockedVideoIds();

    let list = [...assignedVideos, ...kidsVideos].filter(
      (video) => !blockedVideoIds.includes(video.id),
    );

    if (currentTab === "library") {
      list = list.filter((video) => libraryIds.includes(video.id));
    }

    if (selectedCategory !== "All") {
      if (isPhotoBucketSelected(selectedCategory)) {
        list = list.filter((video) => video.sourceType === "photo");
      } else {
        const normalizedCategory = selectedCategory.trim().toLowerCase();
        list = list.filter(
          (video) => (video.category || "").trim().toLowerCase() === normalizedCategory,
        );
      }
    }

    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      list = list.filter(
        (video) =>
          video.title.toLowerCase().includes(query) || video.category.toLowerCase().includes(query),
      );
    }

    return list;
  }, [assignedVideos, currentTab, libraryIds, searchText, selectedCategory]);

  // Same source list + same rules as displayedVideos (minus the tab/search
  // narrowing) so the counts shown next to each category chip always match
  // what selecting that category will actually reveal.
  const categoryCounts = useMemo(() => {
    const blockedVideoIds = loadBlockedVideoIds();
    const countable = [...assignedVideos, ...kidsVideos].filter(
      (video) => !blockedVideoIds.includes(video.id),
    );

    const counts = new Map<string, number>();

    countable.forEach((video) => {
      if (video.sourceType === "photo") {
        counts.set("photos", (counts.get("photos") || 0) + 1);
      }

      const categoryName = video.category?.trim();

      if (!categoryName) return;

      const key = categoryName.toLowerCase();

      if (key === "photos") return;

      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return counts;
  }, [assignedVideos]);

  const visibleCategories = useMemo(() => {
    const categoryMap = new Map(
      builtInCategories.map((category) => [category.name.toLowerCase(), category]),
    );

    const firstPhoto = assignedVideos.find((video) => video.sourceType === "photo");

    if (firstPhoto) {
      categoryMap.set("photos", {
        name: "Photos",
        image: firstPhoto.image,
      });
    }

    assignedVideos.forEach((video) => {
      const categoryName = video.category?.trim();

      if (!categoryName) return;

      const key = categoryName.toLowerCase();

      // "Photos" is reserved for the sourceType-based bucket above — an
      // assigned item whose own category text happens to be "Photos" should
      // not create a second, redundant entry.
      if (key === "photos") return;

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          name: categoryName,
          image: video.image,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [assignedVideos]);

  const toggleLibrary = (videoId: number, event: MouseEvent) => {
    event.stopPropagation();
    const isAdding = !libraryIds.includes(videoId);
    const updated = isAdding ? [...libraryIds, videoId] : libraryIds.filter((id) => id !== videoId);

    setLibraryIds(updated);
    localStorage.setItem("sasa-video-library", JSON.stringify(updated));

    if (isAdding) {
      playHeartSound();
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 22,
        spread: 60,
        origin: { x, y },
        colors: ["#ff72aa", "#8b7cff", "#ffc107", "#2563eb"],
      });
    } else {
      playPopSound();
    }
  };

  /**
   * Section navigation. The search text is dropped on a deliberate section
   * change so a filter can never stay applied invisibly behind the collapsed
   * mobile search field — `keepSearch` is set only when the navigation was
   * itself triggered by submitting a search.
   */
  const goToSection = (tab: KidsHomeTab, options?: { keepSearch?: boolean }) => {
    playPopSound();
    setCurrentTab(tab);
    onTabChange?.(tab);
    setSelectedCategory("All");

    if (!options?.keepSearch) {
      setSearchText("");
    }
  };

  const handleToggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
    if (nextState) {
      playPopSound();
    }
  };

  const handleSelectTheme = (themeId: AppThemeId) => {
    playPopSound();
    setCurrentTheme(themeId);
    setStoredTheme(themeId);
  };

  const openVideo = (video: KidsVideoItem) => {
    playPopSound();
    onOpenVideo(video);
  };

  const section = KIDS_SECTIONS[currentTab];
  const showsGrid = GRID_SECTIONS.includes(currentTab);

  const accountItems: AccountMenuItem[] = [
    {
      id: "switch",
      label: "Switch profile",
      icon: User,
      onSelect: () => {
        playPopSound();
        onChangeProfile();
      },
    },
    // Parent controls belong to a signed-in parent. A guest has no account to
    // hold them, so offering the entry would lead to a gate they cannot pass.
    ...(isGuestAccount
      ? []
      : [
          {
            id: "parent",
            label: "Parent controls",
            icon: ShieldCheck,
            onSelect: () => {
              playPopSound();
              onOpenParentalControls();
            },
          },
        ]),
  ];

  if (isGuestAccount) {
    accountItems.push(
      {
        id: "free-info",
        label: "About the free account",
        icon: Info,
        onSelect: () => setShowFreeModal(true),
      },
      {
        id: "create-account",
        label: "Create a parent account",
        icon: Sparkles,
        onSelect: () => {
          playSuccessSound();
          onOpenFreeAccount();
        },
      },
    );
  }

  accountItems.push({
    id: "account-action",
    label: accountActionLabel === "Login" ? "Log in" : "Sign out",
    icon: accountActionLabel === "Login" ? LogIn : LogOut,
    tone: accountActionLabel === "Login" ? "default" : "danger",
    onSelect: () => {
      playPopSound();
      onAccountAction();
    },
  });

  const renderGrid = () => {
    if (currentTab === "home" && assignedVideosLoading && assignedVideos.length === 0) {
      return (
        <div className="sasa-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <MediaCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (displayedVideos.length === 0) {
      if (currentTab === "library") {
        return (
          <EmptyState
            icon={Heart}
            title="Nothing saved yet"
            description="Tap the heart on any video or photo and it will wait for you here."
            action={
              <button
                type="button"
                className="sasa-btn is-primary"
                onClick={() => goToSection("home")}
              >
                Browse home
              </button>
            }
          />
        );
      }

      if (searchText.trim()) {
        return (
          <EmptyState
            icon={Search}
            title={`No results for “${searchText.trim()}”`}
            description="Try a shorter word, or pick one of the quick topics above."
            action={
              <button type="button" className="sasa-btn" onClick={() => setSearchText("")}>
                Clear search
              </button>
            }
          />
        );
      }

      if (selectedCategory !== "All") {
        return (
          <EmptyState
            icon={ImageIcon}
            title={`Nothing in ${selectedCategory} yet`}
            description="Choose another category, or ask a grown-up to share something new."
            action={
              <button type="button" className="sasa-btn" onClick={() => setSelectedCategory("All")}>
                Show everything
              </button>
            }
          />
        );
      }

      return (
        <EmptyState
          icon={ImageIcon}
          title="Nothing to watch yet"
          description="When a grown-up shares videos or photos with this profile, they show up right here."
        />
      );
    }

    return (
      <div className="sasa-grid">
        {displayedVideos.map((video) => (
          <MediaCard
            key={video.id}
            item={video}
            saved={libraryIds.includes(video.id)}
            onOpen={openVideo}
            onToggleSave={toggleLibrary}
            onShareToFriend={childToken ? (id, title) => setSharing({ id, title }) : undefined}
          />
        ))}
      </div>
    );
  };

  const renderProfile = () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 720, paddingBlock: 8 }}>
      <section className="sasa-panel" style={{ gap: 14 }}>
        <button
          type="button"
          className="sasa-avatar is-lg"
          style={{ width: 64, height: 64, fontSize: 30 }}
          onClick={() => {
            playPopSound();
            setShowAvatarPicker((value) => !value);
          }}
          aria-expanded={showAvatarPicker}
          aria-label="Change avatar"
        >
          {activeImage ? <img src={activeImage} alt="" /> : activeEmoji}
        </button>

        <div className="sasa-panel-text">
          {isEditingName ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                value={tempName}
                onChange={(event) => setTempName(event.target.value)}
                className="sasa-input"
                autoFocus
                maxLength={16}
                aria-label="Profile name"
              />
              <button
                type="button"
                className="sasa-btn is-primary"
                onClick={handleSaveName}
                aria-label="Save name"
              >
                <Check size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 0 }}>
              <strong style={{ fontSize: 18 }}>{activeName}</strong>
              <button
                type="button"
                className="sasa-iconbtn"
                onClick={() => {
                  playPopSound();
                  setTempName(activeName);
                  setIsEditingName(true);
                }}
                aria-label="Edit profile name"
              >
                <Edit3 size={16} />
              </button>
            </div>
          )}
          <span>Kid profile · parent-approved content only</span>
        </div>
      </section>

      {/* SASA_AVATAR_UI_V25 — a database child gets the real chooser, which
          persists through the backend and can upload a cropped photo. A local
          profile has no server-side profile to save to, so it keeps the
          emoji list below. */}
      {/* SASA_FRIENDS_V32 — the share sheet. Submitting creates a PENDING
          share; nothing reaches the friend until both grown-ups approve. */}
      {sharing && childToken && (
        <ShareToFriend
          token={childToken}
          mediaId={sharing.id}
          mediaTitle={sharing.title}
          onClose={() => setSharing(null)}
        />
      )}

      {showAvatarPicker && avatarToken && databaseProfileId && (
        <AvatarChooser
          token={avatarToken}
          profileId={databaseProfileId}
          profileName={profileName}
          presets={KID_AVATARS}
          currentEmoji={activeEmoji}
          onClose={() => setShowAvatarPicker(false)}
          onSaved={(avatarUrl) => {
            onAvatarSaved?.(avatarUrl);
            setShowAvatarPicker(false);
          }}
        />
      )}

      {showAvatarPicker && !(avatarToken && databaseProfileId) && (
        <section
          style={{
            display: "grid",
            gap: 12,
            padding: 14,
            border: "1px solid var(--sasa-line)",
            borderRadius: "var(--sasa-radius)",
            background: "var(--sasa-surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--sasa-ink-2)",
              }}
            >
              <Crown size={14} /> Choose your avatar
            </span>
            <button
              type="button"
              className="sasa-iconbtn"
              onClick={() => setShowAvatarPicker(false)}
              aria-label="Close avatar picker"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {CHARACTER_AVATARS.map((item) => (
              <button
                key={item.name}
                type="button"
                className={activeImage === item.image ? "sasa-chip is-selected" : "sasa-chip"}
                onClick={() => handleSelectAvatar(item.emoji, item.image)}
                aria-pressed={activeImage === item.image}
              >
                <img className="sasa-chip-thumb" src={item.image} alt="" />
                {item.name}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
              gap: 6,
            }}
          >
            {KID_AVATARS.map((emoji) => {
              const selected = activeEmoji === emoji && !activeImage;

              return (
                <button
                  key={emoji}
                  type="button"
                  className={selected ? "sasa-chip is-selected" : "sasa-chip"}
                  style={{ justifyContent: "center", padding: 6, fontSize: 20 }}
                  onClick={() => handleSelectAvatar(emoji, undefined)}
                  aria-pressed={selected}
                  aria-label={`Use ${emoji} as avatar`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <button type="button" className="sasa-panel is-stat" onClick={() => goToSection("library")}>
          <Heart size={18} style={{ color: "var(--sasa-pink)" }} />
          <strong style={{ fontSize: 22 }}>{libraryIds.length}</strong>
          <span style={{ color: "var(--sasa-ink-2)", fontSize: 12.5 }}>Saved items</span>
        </button>

        <button type="button" className="sasa-panel is-stat" onClick={() => goToSection("studio")}>
          <Paintbrush size={18} style={{ color: "var(--sasa-brand)" }} />
          <strong style={{ fontSize: 22 }}>{savedArtworksCount}</strong>
          <span style={{ color: "var(--sasa-ink-2)", fontSize: 12.5 }}>Artworks drawn</span>
        </button>
      </div>

      <section>
        <h2 className="sasa-watch-block-title">
          <Trophy size={13} style={{ verticalAlign: "-2px", marginInlineEnd: 4 }} />
          Badges
        </h2>
        <div className="sasa-hscroll">
          {KID_BADGES.map((badge) => (
            <button
              key={badge.title}
              type="button"
              className="sasa-chip"
              onClick={(event) => handleTapBadge(badge.title, "Great job!", event)}
            >
              <span aria-hidden="true" style={{ fontSize: 16 }}>
                {badge.icon}
              </span>
              {badge.title}
            </button>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button
          type="button"
          className="sasa-btn is-primary"
          onClick={() => {
            playPopSound();
            onChangeProfile();
          }}
        >
          <User size={18} />
          Switch profile
        </button>

        {!isGuestAccount && (
          <button
            type="button"
            className="sasa-btn"
            onClick={() => {
              playPopSound();
              onOpenParentalControls();
            }}
          >
            <ShieldCheck size={18} />
            Parent controls
          </button>
        )}
      </div>
    </div>
  );

  const renderSection = () => {
    if (currentTab === "games") return <KidsGamesStudio />;
    if (currentTab === "studio") return <KidsDrawingStudio />;
    if (currentTab === "songs") return <KidsSongsStudio />;
    if (currentTab === "library" && childToken) {
      return (
        <>
          <h3 className="sasa-section-heading">Shared with me</h3>
          <KidsSharedWithMe token={childToken} kind="video" />
          <KidsSharedWithMe token={childToken} kind="photo" />
          <h3 className="sasa-section-heading">Saved by me</h3>
          {renderGrid()}
        </>
      );
    }
    if (currentTab === "profile") return renderProfile();
    if (currentTab === "friends") {
      return childToken ? (
        <KidsFriends token={childToken} />
      ) : (
        <p className="sasa-friends-note">
          Ask a grown-up to open your profile so you can use Friends.
        </p>
      );
    }

    return (
      <>
        {currentTab === "search" && (
          <div className="sasa-hscroll" style={{ paddingBlockEnd: 4 }}>
            {QUICK_TOPICS.map((topic) => {
              const selected = searchText.trim().toLowerCase() === topic.toLowerCase();

              return (
                <button
                  key={topic}
                  type="button"
                  className={selected ? "sasa-chip is-selected" : "sasa-chip"}
                  aria-pressed={selected}
                  onClick={() => {
                    playPopSound();
                    setSearchText(topic);
                  }}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        )}

        <div className="sasa-chiprow">
          <div className="sasa-hscroll">
            <button
              type="button"
              className={selectedCategory === "All" ? "sasa-chip is-selected" : "sasa-chip"}
              aria-pressed={selectedCategory === "All"}
              onClick={() => {
                playPopSound();
                setSelectedCategory("All");
              }}
            >
              All
            </button>

            {visibleCategories.map((category) => {
              const count = categoryCounts.get(category.name.toLowerCase());
              const selected = selectedCategory === category.name;

              return (
                <button
                  key={category.name}
                  type="button"
                  className={selected ? "sasa-chip is-selected" : "sasa-chip"}
                  aria-pressed={selected}
                  onClick={() => {
                    playPopSound();
                    setSelectedCategory(category.name);
                  }}
                >
                  {category.image && (
                    <img className="sasa-chip-thumb" src={category.image} alt="" loading="lazy" />
                  )}
                  {category.name}
                  {typeof count === "number" && count > 0 && (
                    <span className="sasa-chip-count">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {currentTab === "home" && assignedVideosLoading && assignedVideos.length > 0 && (
          <div className="sasa-notice" role="status">
            <span className="sasa-spinner" aria-hidden="true" />
            Refreshing your videos…
          </div>
        )}

        {currentTab === "home" && !assignedVideosLoading && assignedMediaError && (
          <div className="sasa-notice is-error" role="alert">
            <WifiOff size={16} aria-hidden="true" />
            <span>Couldn&apos;t load the videos shared with you.</span>
            {onRetryAssignedMedia && (
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  onRetryAssignedMedia();
                }}
              >
                Retry
              </button>
            )}
          </div>
        )}

        {renderGrid()}
      </>
    );
  };

  return (
    <AppShell
      tone={isNightTheme(currentTheme) ? "dark" : "light"}
      brandName={activeName}
      activeSection={currentTab}
      onNavigate={(next) => goToSection(next)}
      onOpenParentControls={
        isGuestAccount
          ? undefined
          : () => {
              playPopSound();
              onOpenParentalControls();
            }
      }
      searchValue={searchText}
      onSearchChange={setSearchText}
      onSearchSubmit={() => {
        if (currentTab !== "search") {
          goToSection("search", { keepSearch: true });
        }
      }}
      searchPlaceholder="Search videos and photos"
      parentSignedIn={accountActionLabel === "Sign Out"}
      isAdmin={isAdmin}
      profileLabel="You"
      profileEmoji={activeEmoji}
      profileImage={activeImage}
      headerActions={
        <>
          <button
            type="button"
            className="sasa-iconbtn"
            onClick={handleToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Turn sound effects off" : "Turn sound effects on"}
            title={soundOn ? "Sound effects on" : "Sound effects off"}
          >
            {soundOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>

          <ThemeMenu currentTheme={currentTheme} onSelect={handleSelectTheme} />
        </>
      }
      accountSlot={
        <AccountMenu
          name={activeName}
          subtitle={isGuestAccount ? "Guest profile" : "Kid profile"}
          avatarEmoji={activeEmoji}
          avatarImage={activeImage}
          items={accountItems}
        />
      }
    >
      <div className="sasa-page-head">
        <div style={{ minWidth: 0 }}>
          <h1>{section.title}</h1>
          <p>
            {currentTab === "home" ? `Hello ${activeName} — ${section.subtitle}` : section.subtitle}
          </p>
        </div>

        {showsGrid && displayedVideos.length > 0 && (
          <p style={{ flex: "0 0 auto", color: "var(--sasa-ink-3)", fontSize: 12.5 }}>
            {displayedVideos.length} {displayedVideos.length === 1 ? "item" : "items"}
          </p>
        )}
      </div>

      {isGuestAccount && currentTab === "home" && (
        <div className="sasa-notice">
          <Sparkles size={16} aria-hidden="true" />
          <span>You&apos;re browsing as a guest. A parent account keeps saved items in sync.</span>
          <button type="button" onClick={() => onOpenFreeAccount()}>
            Create account
          </button>
        </div>
      )}

      {renderSection()}

      {badgeToast && (
        <div className="sasa-toast" role="status">
          <div>
            <Trophy size={14} aria-hidden="true" />
            {badgeToast}
          </div>
        </div>
      )}

      {isGuestAccount && showFreeModal && (
        <FreeAccountDialog onClose={() => setShowFreeModal(false)} />
      )}
    </AppShell>
  );
}

/** Explains what the free guest experience includes. */
function FreeAccountDialog({ onClose }: { onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useDismiss(true, cardRef, onClose);

  return (
    <>
      <button type="button" className="sasa-sheet-scrim" aria-label="Close" onClick={onClose} />
      <div
        ref={cardRef}
        role="dialog"
        aria-label="About the free account"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 92,
          display: "grid",
          placeItems: "center",
          padding: 16,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "min(420px, 100%)",
            maxHeight: "calc(var(--app-visible-height, 100dvh) - 32px)",
            overflowY: "auto",
            padding: 20,
            border: "1px solid var(--sasa-line)",
            borderRadius: 16,
            background: "var(--sasa-surface)",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span className="sasa-avatar is-lg">
              <Sparkles size={20} />
            </span>
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: "block", fontSize: 16 }}>Free kid experience</strong>
              <span style={{ color: "var(--sasa-ink-2)", fontSize: 12.5 }}>
                No subscription needed
              </span>
            </div>
            <button
              type="button"
              className="sasa-iconbtn"
              style={{ marginInlineStart: "auto" }}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <ul
            style={{
              display: "grid",
              gap: 8,
              margin: "0 0 16px",
              padding: 0,
              listStyle: "none",
              color: "var(--sasa-ink-2)",
              fontSize: 13.5,
            }}
          >
            {[
              "Built-in videos, songs and games",
              "Drawing studio with saved artwork",
              "Sign in to add parent controls, bedtime and screen limits",
            ].map((line) => (
              <li key={line} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Check
                  size={16}
                  style={{ color: "var(--sasa-ok)", flex: "0 0 auto", marginTop: 2 }}
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="sasa-btn is-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
