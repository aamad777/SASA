import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playPopSound, playSuccessSound } from "../lib/sound";
import { kidsVideos } from "./KidsVideoHome";
import {
  addParentYoutubeVideo,
  deleteChild,
  deleteParentMedia,
  getApiAssetUrl,
  getParentMedia,
  updateParentMedia,
  updateParentMediaAccess,
  uploadParentVideo,
  type DatabaseChild,
  type ParentMediaItem,
} from "../lib/api";
import {
  BarChart3,
  Bed,
  Bell,
  BookOpen,
  Clock3,
  Check,
  Film,
  Home,
  Info,
  Key,
  Library,
  Lock,
  Menu,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Timer,
  Trash2,
  Unlock,
  UserCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";

export type BlockedChannel = {
  id: number;
  name: string;
  image: string;
};

export type ParentControlSettings = {
  screenLimitEnabled: boolean;
  screenMinutes: number;
  bedtimeEnabled: boolean;
  bedtimeStart: string;
  bedtimeEnd: string;
  deviceLocked: boolean;
  blockedChannels: BlockedChannel[];
  blockedVideoIds: number[];
  parentPin: string;
  requireParentPin: boolean;
};

type WatchHistoryItem = {
  historyId: string;
  profileId: number;
  profileName: string;
  videoId: number;
  title: string;
  image: string;
  category: string;
  duration: string;
  watchedAt: string;
};

type ManagedCustomProfile = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  age?: number;
  avatarUrl?: string;
  image?: string;
  isProtected?: boolean;
};

type ParentSection =
  | "screen-time"
  | "content-filters"
  | "kids-media"
  | "activity-history"
  | "profiles"
  | "settings";

type ParentDashboardProps = {
  parentToken: string;
  databaseChildren: DatabaseChild[];
  onDatabaseChildDeleted: (childId: number) => void;
  customProfiles: ManagedCustomProfile[];
  onDeleteCustomProfile: (profileId: number) => void;
  onUpdateCustomProfile: (profile: ManagedCustomProfile) => void;
  onToggleProfileProtection: (profileId: number) => void;
  onClose: () => void;
  settings: ParentControlSettings;
  profileId: number | null;
  profileName: string;
  onSettingsChange: (settings: ParentControlSettings) => void;
};

const historyItems = [
  {
    id: 1,
    title: "Peppa Pig: Muddy Puddles",
    watched: "10m ago",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_XNMAxsUTBKZmh1ejMzKmmL6hQC4jFZvo7bTnfsSFPA1yOt7GLpxsTbjU_SkjawV0GVfdd79-an-CEi5yzse3mVw_P8M4_XITJiGupnCSkqt4vTPs1gIz-HZ7wyLgHEm6W1KJG-20vFJ7oj9hwuyRqG-bjqgOFUEI7XJTUwfoY_XSc_9zOqtrWyANG9mymfvev6_34tfeT1MzYDwgDAzDN4CWqjld4CwpT5rO2MSfQ97aaB63TC1XVVKxN2rxilt6u67kXSJVtR8",
  },
  {
    id: 2,
    title: "Cocomelon: Bath Song",
    watched: "25m ago",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-wiB4yWnYIg2a7UXCzWONngOSx0l07EKXMERr7wyfA_kqrh4ih2vP24rYFAevIKp6MoMJSfzLS9fXg_jCGPwvjOJTUJZkUBulJ2I4fVuuDsyIgvGBv8N9TTnTw1yUUmsEL56hGWdi9gV4iPMbcfEiDe8xGxEeWAgfgTJFUhc4lFqXXGOSx_3_j_A7g6Hjil2Mz2azQJYapIIfsmQalLyDwYaukUE5ZdbvPfIDFNBkxsD6ZXBuv4nlnxZCijrqUNKsVc18I3Iq7DU",
  },
  {
    id: 3,
    title: "Bluey: The Pooch",
    watched: "1h ago",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqHn6Ilvqma_Z7cukIpg63qFn-VYpUefNCOE1ti4X4jZ_oNszZQ6mfHbuIzTRxGsS-ylmNqjnBZNANPt_hHJ3Z3CDRpz66DRzfAB0Iq_XA_pK3WORC-42sFaW8K_vxftFft19mzEUv5xyWkblVhpU1Zqi_fpPKsRqrzcmK65z5mZYKn9mPi5llp3L6FIsr-Sdl8t7G9g84oTJf4jpCWy63IAcU4t7MpWiSbyQHoFKdhXfOrluR53c7MZ4oVyUoFVibFTiCtfBO0-o",
  },
];

export const initialBlockedChannels: BlockedChannel[] = [
  {
    id: 1,
    name: "Ryan's World",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8h0FQFA_8laRvvyvA_y-9UW7CQCVYZOXp05jh6hY9RzIIKuCFjHFgJF2sH0mJJu-6QAScLVnpDSc5Qqt45FLvRuiEXkfhW1f0PUdmLaaNfdUg_ETpRcasrArWIqd6UAJaTlS23T7Xv6FHJl52qK_Ne18bS5vRBf-KECJGXoDXJ4m-V9mntUPZNU3IP0JMQaKBcpNgGfMPal72INZ-nZsV3kxwWmQR7qQ7YATvoFfENLw6vuo4rNCjM36opXdBDeGzbxH-q86bZpA",
  },
  {
    id: 2,
    name: "Blippi",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAkKQ_iYk7Pblor4K10ZrejHUaTmoJnbg6Pa_8p0N8Kh1_HY5N6jEQylBbiKVesLm5D9ZqpWOk1TGxkHOv4jf8BhTWyzLUhPiiPMJshxPRcje4ql5BAcBA_6aLmBjZY2Ttrt8ALso9NkjDxG4qOQXNLviIcsop8vKUfhsgDxXnnQcl2i9s8bkPYe2ViG02TUee_njZ2YpkOchFJOzTBZAba1wAOAg0_G-8Brw1oDxW6s3jqU-4LRZOS-SCOX14oRefpl7S09zyQvAc",
  },
];

export const defaultParentControlSettings: ParentControlSettings = {
  screenLimitEnabled: true,
  screenMinutes: 90,
  bedtimeEnabled: true,
  bedtimeStart: "20:00",
  bedtimeEnd: "07:00",
  deviceLocked: false,
  blockedChannels: initialBlockedChannels,
  blockedVideoIds: [],
  parentPin: "1234",
  requireParentPin: true,
};

const chartData = [
  { day: "Mon", videos: 10, games: 40, reading: 30 },
  { day: "Tue", videos: 20, games: 50, reading: 20 },
  { day: "Wed", videos: 15, games: 30, reading: 40 },
  { day: "Thu", videos: 10, games: 60, reading: 10 },
  { day: "Fri", videos: 25, games: 40, reading: 30 },
  { day: "Sat", videos: 5, games: 20, reading: 50 },
  { day: "Sun", videos: 15, games: 35, reading: 25 },
];

export default function ParentDashboard({
  parentToken,
  databaseChildren,
  onDatabaseChildDeleted,
  onClose,
  settings,
  profileId,
  profileName,
  customProfiles,
  onDeleteCustomProfile,
  onUpdateCustomProfile,
  onToggleProfileProtection,
  onSettingsChange,
}: ParentDashboardProps) {
  const [activeSection, setActiveSection] = useState<ParentSection>("screen-time");

  const [mediaMode, setMediaMode] = useState<"upload" | "youtube">("upload");

  const [mediaTitle, setMediaTitle] = useState("");

  const [mediaCategory, setMediaCategory] = useState("Parent Upload");

  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const [selectedMediaChildIds, setSelectedMediaChildIds] = useState<number[]>([]);

  const [mediaSaving, setMediaSaving] = useState(false);

  const [mediaMessage, setMediaMessage] = useState("");

  const [mediaError, setMediaError] = useState("");

  const [parentMediaItems, setParentMediaItems] = useState<ParentMediaItem[]>([]);

  const [parentMediaLoading, setParentMediaLoading] = useState(false);

  const [parentMediaActionId, setParentMediaActionId] = useState<number | null>(null);

  const [editingMediaId, setEditingMediaId] = useState<number | null>(null);

  const [editingMediaTitle, setEditingMediaTitle] = useState("");

  const [editingMediaCategory, setEditingMediaCategory] = useState("");

  const [deletingDatabaseChildId, setDeletingDatabaseChildId] = useState<number | null>(null);

  const [newBlockedChannel, setNewBlockedChannel] = useState("");
  const [videoFilterQuery, setVideoFilterQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [newParentPin, setNewParentPin] = useState(settings.parentPin || "1234");

  const [settingsMessage, setSettingsMessage] = useState("");

  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);

  const [editProfileName, setEditProfileName] = useState("");

  const [editProfileAge, setEditProfileAge] = useState(5);

  const [editProfileEmoji, setEditProfileEmoji] = useState("🦁");

  const [editProfileColor, setEditProfileColor] = useState("#ffb703");

  const profileAvatarOptions = ["🦁", "🐼", "🐰", "🐻", "🦊"];

  const startEditingProfile = (child: ManagedCustomProfile) => {
    setEditingProfileId(child.id);
    setEditProfileName(child.name);
    setEditProfileAge(child.age ?? 5);
    setEditProfileEmoji(child.emoji);
    setEditProfileColor(child.color);
  };

  const cancelEditingProfile = () => {
    setEditingProfileId(null);
  };

  const saveEditedProfile = (child: ManagedCustomProfile) => {
    const cleanName = editProfileName.trim();

    if (cleanName.length < 2) {
      window.alert("Profile name must contain at least 2 characters.");
      return;
    }

    onUpdateCustomProfile({
      ...child,
      name: cleanName,
      age: editProfileAge,
      emoji: editProfileEmoji,
      color: editProfileColor,
    });

    setEditingProfileId(null);
  };

  const loadWatchHistory = (): WatchHistoryItem[] => {
    try {
      const saved = localStorage.getItem("sasa-watch-history");

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (item): item is WatchHistoryItem => item && Number(item.profileId) === Number(profileId),
      );
    } catch {
      return [];
    }
  };

  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    setWatchHistory(loadWatchHistory());
  }, [profileId, activeSection]);
  const {
    screenLimitEnabled,
    screenMinutes,
    bedtimeEnabled,
    bedtimeStart,
    bedtimeEnd,
    deviceLocked,
    blockedChannels,
    blockedVideoIds = [],
    parentPin = "1234",
    requireParentPin = true,
  } = settings;

  const updateSettings = (changes: Partial<ParentControlSettings>) => {
    onSettingsChange({
      ...settings,
      ...changes,
    });
  };

  const formattedTime = formatMinutes(screenMinutes);

  const unblockChannel = (channelId: number) => {
    updateSettings({
      blockedChannels: blockedChannels.filter((channel) => channel.id !== channelId),
    });
  };

  const blockChannel = () => {
    const name = newBlockedChannel.trim();

    if (!name) {
      return;
    }

    const alreadyBlocked = blockedChannels.some(
      (channel) => channel.name.toLowerCase() === name.toLowerCase(),
    );

    if (alreadyBlocked) {
      setNewBlockedChannel("");
      return;
    }

    const initial = name.charAt(0).toUpperCase();

    const avatar = `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" rx="28" fill="#dbeafe"/>
        <text x="60" y="76" text-anchor="middle"
          font-family="Arial" font-size="58" font-weight="700"
          fill="#2563eb">${initial}</text>
      </svg>
    `)}`;

    updateSettings({
      blockedChannels: [
        ...blockedChannels,
        {
          id: Date.now(),
          name,
          image: avatar,
        },
      ],
    });

    setNewBlockedChannel("");
  };

  const toggleVideoBlock = (videoId: number) => {
    const blocked = blockedVideoIds.includes(videoId);

    updateSettings({
      blockedVideoIds: blocked
        ? blockedVideoIds.filter((id) => id !== videoId)
        : [...blockedVideoIds, videoId],
    });
  };

  const saveParentPin = () => {
    const cleanPin = newParentPin.trim();

    if (!/^\d{4,6}$/.test(cleanPin)) {
      setSettingsMessage("PIN must contain 4 to 6 numbers.");
      return;
    }

    updateSettings({
      parentPin: cleanPin,
    });

    setSettingsMessage("Parent PIN saved.");
  };

  const resetScreenTimer = () => {
    if (profileId !== null) {
      const expiryKey = `sasa-screen-expiry-${profileId}`;

      if (screenLimitEnabled) {
        localStorage.setItem(expiryKey, String(Date.now() + screenMinutes * 60 * 1000));
      } else {
        localStorage.removeItem(expiryKey);
      }
    }

    setSettingsMessage("Screen-time timer restarted.");
  };

  const resetAllParentSettings = () => {
    const resetSettings = {
      ...defaultParentControlSettings,
      deviceLocked: false,
    };

    onSettingsChange(resetSettings);
    setNewParentPin(resetSettings.parentPin);

    if (profileId !== null) {
      localStorage.removeItem(`sasa-screen-expiry-${profileId}`);
    }

    setSettingsMessage("Parental settings restored to defaults.");
  };

  const clearWatchHistory = () => {
    try {
      const saved = localStorage.getItem("sasa-watch-history");

      const parsed = saved ? JSON.parse(saved) : [];
      const allHistory = Array.isArray(parsed) ? parsed : [];

      const remaining = allHistory.filter((item) => Number(item.profileId) !== Number(profileId));

      localStorage.setItem("sasa-watch-history", JSON.stringify(remaining));

      setWatchHistory([]);
    } catch {
      setWatchHistory([]);
    }
  };

  const toggleMediaChild = (childId: number) => {
    setSelectedMediaChildIds((current) =>
      current.includes(childId) ? current.filter((id) => id !== childId) : [...current, childId],
    );
  };

  const saveParentMedia = async () => {
    setMediaError("");
    setMediaMessage("");

    if (selectedMediaChildIds.length === 0) {
      setMediaError("Select at least one child.");
      return;
    }

    if (!mediaTitle.trim()) {
      setMediaError("Enter a title.");
      return;
    }

    if (mediaMode === "upload" && !mediaFile) {
      setMediaError("Select a photo or video file.");
      return;
    }

    if (mediaMode === "youtube" && !youtubeUrl.trim()) {
      setMediaError("Enter a YouTube link.");
      return;
    }

    setMediaSaving(true);

    try {
      if (mediaMode === "upload" && mediaFile) {
        await uploadParentVideo(parentToken, mediaFile, {
          title: mediaTitle.trim(),
          category: mediaCategory.trim() || "Parent Upload",
          childIds: selectedMediaChildIds,
        });
      } else {
        await addParentYoutubeVideo(parentToken, {
          url: youtubeUrl.trim(),
          title: mediaTitle.trim(),
          category: mediaCategory.trim() || "Parent Upload",
          childIds: selectedMediaChildIds,
        });
      }

      setMediaMessage(`Media assigned to ${selectedMediaChildIds.length} child profile(s).`);

      setMediaTitle("");
      setYoutubeUrl("");
      setMediaFile(null);
      setSelectedMediaChildIds([]);

      await loadParentMedia();

      const fileInput = document.getElementById("parent-media-file") as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      playSuccessSound();
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Unable to save media.");
    } finally {
      setMediaSaving(false);
    }
  };

  const loadParentMedia = async () => {
    setParentMediaLoading(true);

    try {
      const items = await getParentMedia(parentToken);
      setParentMediaItems(items);
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Unable to load your media.");
    } finally {
      setParentMediaLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "kids-media" || activeSection === "content-filters") {
      loadParentMedia();
    }
  }, [activeSection, parentToken]);

  const startEditingParentMedia = (item: ParentMediaItem) => {
    setEditingMediaId(item.id);
    setEditingMediaTitle(item.title || item.original_name || "");
    setEditingMediaCategory(item.category || "Parent Upload");
    setMediaError("");
    setMediaMessage("");
  };

  const saveParentMediaDetails = async (item: ParentMediaItem) => {
    if (!editingMediaTitle.trim()) {
      setMediaError("Enter a media title.");
      return;
    }

    setParentMediaActionId(item.id);
    setMediaError("");
    setMediaMessage("");

    try {
      await updateParentMedia(parentToken, item.id, {
        title: editingMediaTitle.trim(),
        category: editingMediaCategory.trim() || "Parent Upload",
      });

      setEditingMediaId(null);
      setMediaMessage("Media details updated.");
      await loadParentMedia();
      playSuccessSound();
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Unable to update media.");
    } finally {
      setParentMediaActionId(null);
    }
  };

  const setParentMediaChildren = async (item: ParentMediaItem, childIds: number[]) => {
    setParentMediaActionId(item.id);
    setMediaError("");
    setMediaMessage("");

    try {
      await updateParentMediaAccess(parentToken, item.id, childIds);

      setMediaMessage(
        childIds.length > 0
          ? `Media assigned to ${childIds.length} child profile(s).`
          : "Media blocked from all children.",
      );

      await loadParentMedia();
      playSuccessSound();
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Unable to update child access.");
    } finally {
      setParentMediaActionId(null);
    }
  };

  const toggleParentMediaChild = async (item: ParentMediaItem, childId: number) => {
    const currentIds = item.access.map((entry) => Number(entry.child_id));

    const nextIds = currentIds.includes(childId)
      ? currentIds.filter((id) => id !== childId)
      : [...currentIds, childId];

    await setParentMediaChildren(item, nextIds);
  };

  const removeParentMediaItem = async (item: ParentMediaItem) => {
    const confirmed = window.confirm(
      `Delete "${item.title || item.original_name || "this media"}" permanently?`,
    );

    if (!confirmed) return;

    setParentMediaActionId(item.id);
    setMediaError("");
    setMediaMessage("");

    try {
      await deleteParentMedia(parentToken, item.id);

      setMediaMessage("Media deleted.");
      await loadParentMedia();
      playSuccessSound();
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Unable to delete media.");
    } finally {
      setParentMediaActionId(null);
    }
  };

  const removeDatabaseChild = async (child: DatabaseChild) => {
    const confirmed = window.confirm(`Delete ${child.display_name}'s profile permanently?`);

    if (!confirmed) {
      return;
    }

    setDeletingDatabaseChildId(child.id);

    try {
      await deleteChild(parentToken, child.id);

      localStorage.removeItem(`sasa-child-image-${child.id}`);

      localStorage.removeItem(`sasa-screen-expiry-${child.id}`);

      onDatabaseChildDeleted(child.id);
      playSuccessSound();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete child profile.");
    } finally {
      setDeletingDatabaseChildId(null);
    }
  };

  const uploadedContentFilterItems = parentMediaItems.map((item) => {
    const sourceValue = item.public_url || item.storage_path || "";

    const youtubeMatch = sourceValue.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,20})/,
    );

    const youtubeVideoId = youtubeMatch?.[1];

    const assetUrl = getApiAssetUrl(sourceValue);

    const videoPlaceholder = `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#7c3aed"/>
                <stop offset="100%" stop-color="#2563eb"/>
              </linearGradient>
            </defs>
            <rect width="640" height="360" fill="url(#g)"/>
            <circle cx="320" cy="170" r="62" fill="white" fill-opacity="0.95"/>
            <polygon points="300,132 300,208 365,170" fill="#7c3aed"/>
            <text x="320" y="292" text-anchor="middle"
              font-family="Arial" font-size="28" font-weight="700"
              fill="white">Uploaded Video</text>
          </svg>
        `)}`;

    return {
      id: 1000000 + Number(item.id),
      title: item.title || item.original_name || "Uploaded Media",
      category: item.category || (item.media_type === "photo" ? "Photos" : "Videos"),
      image: youtubeVideoId
        ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
        : item.media_type === "photo"
          ? assetUrl
          : videoPlaceholder,
      duration: youtubeVideoId ? "YouTube" : item.media_type === "photo" ? "Photo" : "Video",
    };
  });

  const contentFilterItems = [...uploadedContentFilterItems, ...kidsVideos];

  const contentFilterCategories = [
    "All",
    ...Array.from(new Set(contentFilterItems.map((item) => item.category).filter(Boolean))),
  ];

  return (
    <div className="parent-dashboard">
      <MobileHeader
        activeSection={activeSection}
        onSelectSection={(section) => {
          playPopSound();
          setActiveSection(section);
        }}
        onClose={onClose}
      />

      <aside className="parent-sidebar">
        <div className="parent-brand">WonderWatch</div>

        <nav className="parent-sidebar-nav">
          <button
            type="button"
            className={
              activeSection === "screen-time" ? "parent-nav-item active" : "parent-nav-item"
            }
            onClick={() => {
              playPopSound();
              setActiveSection("screen-time");
            }}
          >
            <Clock3 size={26} />
            Screen Time
          </button>

          <button
            type="button"
            className={
              activeSection === "content-filters" ? "parent-nav-item active" : "parent-nav-item"
            }
            onClick={() => {
              playPopSound();
              setActiveSection("content-filters");
            }}
          >
            <Shield size={26} />
            Content Filters
          </button>

          <button
            type="button"
            className={
              activeSection === "kids-media" ? "parent-nav-item active" : "parent-nav-item"
            }
            onClick={() => {
              playPopSound();
              setActiveSection("kids-media");
            }}
          >
            <Film size={26} />
            Kids Media
          </button>

          <button
            type="button"
            className={activeSection === "profiles" ? "parent-nav-item active" : "parent-nav-item"}
            onClick={() => {
              playPopSound();
              setActiveSection("profiles");
            }}
          >
            <span className="parent-nav-emoji">👨‍👩‍👧</span>
            Profiles
          </button>

          <button
            type="button"
            className={
              activeSection === "activity-history" ? "parent-nav-item active" : "parent-nav-item"
            }
            onClick={() => {
              playPopSound();
              setActiveSection("activity-history");
            }}
          >
            <BarChart3 size={26} />
            Activity & History
          </button>
        </nav>

        <div className="parent-sidebar-footer">
          <button
            type="button"
            className={
              activeSection === "settings"
                ? "parent-settings-button active"
                : "parent-settings-button"
            }
            onClick={() => {
              playPopSound();
              setActiveSection("settings");
            }}
          >
            <Settings size={21} />
            Settings
          </button>

          <button
            className="parent-close-button"
            onClick={() => {
              playPopSound();
              onClose();
            }}
          >
            <X size={21} />
            Exit dashboard
          </button>
        </div>
      </aside>

      <main className="parent-dashboard-main">
        <header className="parent-desktop-header">
          <h1>
            {activeSection === "screen-time"
              ? "Screen Time Dashboard"
              : activeSection === "content-filters"
                ? "Content Filters"
                : activeSection === "activity-history"
                  ? "Activity & History"
                  : activeSection === "kids-media"
                    ? "Kids Media"
                    : activeSection === "profiles"
                      ? "Profile Management"
                      : "Parent Settings"}
          </h1>

          <div className="parent-account-area">
            <button className="parent-round-button">
              <Bell size={21} />
            </button>

            <div className="parent-account">
              <span>P</span>
              <strong>Parent Account</strong>
            </div>

            <button className="parent-round-button" onClick={onClose}>
              <X size={21} />
            </button>
          </div>
        </header>

        <div className="parent-dashboard-content">
          <h2 className="parent-mobile-title">
            {activeSection === "screen-time"
              ? "Screen Time"
              : activeSection === "content-filters"
                ? "Content Filters"
                : activeSection === "activity-history"
                  ? "Activity & History"
                  : activeSection === "kids-media"
                    ? "Kids Media"
                    : activeSection === "profiles"
                      ? "Profiles"
                      : "Parent Settings"}
          </h2>

          {activeSection === "screen-time" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Daily Screen Time Control Card */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="text-sky-500" size={24} />
                      <h3 className="text-2xl font-black text-slate-800">
                        Daily Screen Time Limit
                      </h3>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                      Set maximum viewing time per day. App locks automatically when limit is
                      reached.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        screenLimitEnabled
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {screenLimitEnabled ? `Active: ${formattedTime}` : "Limit Disabled"}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        playPopSound();
                        updateSettings({
                          screenLimitEnabled: !screenLimitEnabled,
                        });
                      }}
                      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        screenLimitEnabled ? "bg-sky-500" : "bg-slate-300"
                      }`}
                      aria-label="Toggle screen limit"
                    >
                      <span
                        className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          screenLimitEnabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Range Slider & Fine Adjustments */}
                <div className="py-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-sky-50/60 p-5 rounded-2xl border border-sky-100">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-black uppercase tracking-wider text-sky-600">
                        Target Daily Limit
                      </span>
                      <div className="text-4xl font-black text-sky-950 mt-0.5">
                        {screenLimitEnabled ? formattedTime : "Unlimited"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!screenLimitEnabled || screenMinutes <= 15}
                        onClick={() => {
                          playPopSound();
                          updateSettings({
                            screenMinutes: Math.max(15, screenMinutes - 15),
                          });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-100 disabled:opacity-40 font-black text-sky-700 shadow-sm border border-sky-200 text-sm transition"
                      >
                        -15 min
                      </button>

                      <button
                        type="button"
                        disabled={!screenLimitEnabled}
                        onClick={() => {
                          playPopSound();
                          updateSettings({
                            screenMinutes: screenMinutes + 15,
                          });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 font-black text-white shadow-sm text-sm transition"
                      >
                        +15 min
                      </button>
                    </div>
                  </div>

                  {/* Range Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>15 min</span>
                      <span>1 hour</span>
                      <span>2 hours</span>
                      <span>3 hours</span>
                      <span>4 hours</span>
                    </div>

                    <input
                      type="range"
                      min="15"
                      max="240"
                      step="15"
                      value={screenMinutes}
                      disabled={!screenLimitEnabled}
                      onChange={(e) => {
                        updateSettings({
                          screenMinutes: Number(e.target.value),
                        });
                      }}
                      className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:opacity-40"
                    />
                  </div>

                  {/* Preset Chips */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 block mb-2">
                      Quick Time Presets:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                      {[15, 30, 45, 60, 90, 120, 180].map((minutes) => (
                        <button
                          key={minutes}
                          type="button"
                          className={`py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm border transition-all ${
                            screenLimitEnabled && screenMinutes === minutes
                              ? "bg-sky-500 text-white border-sky-600 shadow-md scale-105"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                          onClick={() => {
                            playPopSound();
                            updateSettings({
                              screenLimitEnabled: true,
                              screenMinutes: minutes,
                            });
                          }}
                        >
                          {minutes < 60
                            ? `${minutes} min`
                            : minutes === 60
                              ? "1 hour"
                              : `${Math.floor(minutes / 60)}h ${minutes % 60 ? (minutes % 60) + "m" : ""}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
                  <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-amber-900 font-medium">
                    <strong>Timer behavior:</strong> The daily countdown activates when your child
                    enters the kid profile and pauses when returning to the parent dashboard.
                  </p>
                </div>
              </section>

              {/* Grid Layout: Weekly Overview & Side Cards */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Analytics Chart Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-100">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Weekly Usage Overview</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Total watch & play activity this week
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-xs rounded-full border border-sky-200">
                      14h 25m total
                    </span>
                  </div>

                  <div className="parent-chart">
                    {chartData.map((item) => (
                      <div className="parent-chart-column" key={item.day}>
                        <div className="parent-bars">
                          <div
                            className="bar videos"
                            style={{ height: `${item.videos}%` }}
                            title={`Videos: ${item.videos}%`}
                          />
                          <div
                            className="bar reading"
                            style={{ height: `${item.reading}%` }}
                            title={`Reading: ${item.reading}%`}
                          />
                          <div
                            className="bar games"
                            style={{ height: `${item.games}%` }}
                            title={`Games: ${item.games}%`}
                          />
                        </div>
                        <span>{item.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="chart-legend">
                    <Legend colorClass="videos" label="Videos" />
                    <Legend colorClass="games" label="Games" />
                    <Legend colorClass="reading" label="Reading" />
                  </div>
                </div>

                {/* Right Column: Bedtime & Instant Lock */}
                <div className="space-y-6">
                  {/* Bedtime Mode Card */}
                  <article className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                      <Bed size={120} />
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          <Bed size={22} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">Bedtime Curfew</h3>
                          <p className="text-xs text-slate-400">Lock app during sleep hours</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playPopSound();
                          updateSettings({
                            bedtimeEnabled: !bedtimeEnabled,
                          });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase transition ${
                          bedtimeEnabled
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {bedtimeEnabled ? "ACTIVE" : "OFF"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 my-4">
                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Curfew Starts
                        </span>
                        <input
                          type="time"
                          value={bedtimeStart}
                          onChange={(e) =>
                            updateSettings({
                              bedtimeStart: e.target.value,
                            })
                          }
                          className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none cursor-pointer mt-0.5"
                        />
                      </div>

                      <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Curfew Ends
                        </span>
                        <input
                          type="time"
                          value={bedtimeEnd}
                          onChange={(e) =>
                            updateSettings({
                              bedtimeEnd: e.target.value,
                            })
                          }
                          className="w-full bg-transparent text-white font-mono font-bold text-base focus:outline-none cursor-pointer mt-0.5"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-indigo-200/70 font-medium">
                      🌙 Screen locks automatically between {bedtimeStart} and {bedtimeEnd}.
                    </p>
                  </article>

                  {/* Instant Break / Lock Card */}
                  <article className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-6 border-2 border-rose-200 shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-sm">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-rose-950">Dinner / Study Break</h3>
                        <p className="text-xs text-rose-700 font-medium">
                          Instantly lock app anytime
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
                      Need immediate attention for dinner, homework, or bedtime? Tap below to lock
                      the video player instantly.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        playSuccessSound();
                        updateSettings({ deviceLocked: !deviceLocked });
                      }}
                      className={`w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                        deviceLocked
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-rose-600 hover:bg-rose-700 text-white"
                      }`}
                    >
                      {deviceLocked ? (
                        <>
                          <Unlock size={18} /> Unlock Device Now
                        </>
                      ) : (
                        <>
                          <Lock size={18} /> Lock Device Instantly
                        </>
                      )}
                    </button>
                  </article>
                </div>
              </section>
            </div>
          )}

          {activeSection === "content-filters" && (
            <section className="parent-content-filter-page">
              <article className="content-filter-card">
                <div className="content-filter-card-heading">
                  <div>
                    <h2>Blocked Channels</h2>
                    <p>Restricted channels will not appear in the child&apos;s view.</p>
                  </div>

                  <strong>{blockedChannels.length} blocked</strong>
                </div>

                <div className="channel-block-form">
                  <input
                    type="text"
                    value={newBlockedChannel}
                    placeholder="Enter channel name to block"
                    onChange={(event) => setNewBlockedChannel(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        blockChannel();
                      }
                    }}
                  />

                  <button type="button" onClick={blockChannel}>
                    + Block
                  </button>
                </div>

                <div className="content-blocked-list">
                  {blockedChannels.map((channel) => (
                    <div className="content-blocked-row" key={channel.id}>
                      <div className="content-blocked-info">
                        <img src={channel.image} alt={channel.name} />

                        <div>
                          <h3>{channel.name}</h3>
                          <span>Restricted by Parent</span>
                        </div>
                      </div>

                      <button type="button" onClick={() => unblockChannel(channel.id)}>
                        Unblock
                      </button>
                    </div>
                  ))}

                  {blockedChannels.length === 0 && (
                    <div className="content-filter-empty">No channels are currently blocked.</div>
                  )}
                </div>
              </article>

              <article className="content-filter-card">
                <div className="content-filter-card-heading">
                  <div>
                    <h2>Video Catalog Management</h2>
                    <p>Toggle block or allow status for individual cartoons & shows.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                      onClick={() => {
                        playSuccessSound();
                        updateSettings({ blockedVideoIds: [] });
                      }}
                    >
                      Allow All
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                      onClick={() => {
                        playPopSound();
                        updateSettings({
                          blockedVideoIds: kidsVideos.map((v) => v.id),
                        });
                      }}
                    >
                      Block All
                    </button>
                    <strong className="text-slate-700 ml-2">
                      {blockedVideoIds.length} blocked
                    </strong>
                  </div>
                </div>

                {/* Video Catalog Search and Category Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search videos by title..."
                      value={videoFilterQuery}
                      onChange={(e) => setVideoFilterQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {contentFilterCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          playPopSound();
                          setFilterCategory(cat);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                          filterCategory === cat
                            ? "bg-sky-500 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="video-filter-grid">
                  {contentFilterItems
                    .filter((video) => {
                      const matchesSearch = video.title
                        .toLowerCase()
                        .includes(videoFilterQuery.toLowerCase());
                      const matchesCategory =
                        filterCategory === "All" ||
                        video.category.toLowerCase().includes(filterCategory.toLowerCase());
                      return matchesSearch && matchesCategory;
                    })
                    .map((video) => {
                      const blocked = blockedVideoIds.includes(video.id);

                      return (
                        <div
                          className={blocked ? "video-filter-item blocked" : "video-filter-item"}
                          key={video.id}
                        >
                          <img src={video.image} alt={video.title} />

                          <div className="video-filter-details">
                            <h3>{video.title}</h3>
                            <p>{video.category}</p>
                          </div>

                          <button
                            type="button"
                            className={blocked ? "allow-video-button" : "block-video-button"}
                            onClick={() => {
                              playPopSound();
                              toggleVideoBlock(video.id);
                            }}
                          >
                            {blocked ? "Allow" : "Block"}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </article>
            </section>
          )}

          {activeSection === "activity-history" && (
            <section className="activity-history-page">
              <div className="activity-summary-grid">
                <article className="activity-summary-card">
                  <span>▶️</span>
                  <div>
                    <strong>{watchHistory.length}</strong>
                    <p>Total video opens</p>
                  </div>
                </article>

                <article className="activity-summary-card">
                  <span>🎬</span>
                  <div>
                    <strong>{new Set(watchHistory.map((item) => item.videoId)).size}</strong>
                    <p>Unique videos</p>
                  </div>
                </article>

                <article className="activity-summary-card">
                  <span>👤</span>
                  <div>
                    <strong>{profileName}</strong>
                    <p>Selected profile</p>
                  </div>
                </article>
              </div>

              <article className="activity-history-card">
                <div className="activity-history-heading">
                  <div>
                    <h2>Watch History</h2>
                    <p>Videos opened by {profileName}.</p>
                  </div>

                  <button
                    type="button"
                    disabled={watchHistory.length === 0}
                    onClick={clearWatchHistory}
                  >
                    Clear History
                  </button>
                </div>

                {watchHistory.length === 0 ? (
                  <div className="activity-history-empty">
                    <span>📺</span>
                    <h3>No watch history yet</h3>
                    <p>Videos will appear here after the child opens them.</p>
                  </div>
                ) : (
                  <div className="activity-history-list">
                    {watchHistory.map((item) => (
                      <article className="activity-history-row" key={item.historyId}>
                        <img src={item.image} alt={item.title} />

                        <div className="activity-history-details">
                          <h3>{item.title}</h3>

                          <div>
                            <span>{item.category}</span>
                            <span>{item.duration}</span>
                          </div>
                        </div>

                        <time>{new Date(item.watchedAt).toLocaleString()}</time>
                      </article>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}

          {activeSection === "kids-media" && (
            <section className="max-w-5xl mx-auto space-y-6">
              <article className="bg-white rounded-3xl border border-slate-200 shadow-md p-4 sm:p-7">
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                      <Film size={24} />
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        Assign Media to Children
                      </h2>

                      <p className="text-sm text-slate-500 font-medium">
                        Upload a photo or video, or add a YouTube link, then select who can see it.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-5">
                  <button
                    type="button"
                    onClick={() => setMediaMode("upload")}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm transition ${
                      mediaMode === "upload"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    Upload Photo or Video
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaMode("youtube")}
                    className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm transition ${
                      mediaMode === "youtube"
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    YouTube Link
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-black text-slate-700">Title</span>

                    <input
                      type="text"
                      value={mediaTitle}
                      onChange={(event) => setMediaTitle(event.target.value)}
                      placeholder="My child video"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </label>

                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-black text-slate-700">Category</span>

                    <input
                      type="text"
                      list="parent-media-categories"
                      value={mediaCategory}
                      onChange={(event) => setMediaCategory(event.target.value)}
                      placeholder="Family, Learning, Holiday..."
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    <datalist id="parent-media-categories">
                      <option value="Family" />
                      <option value="Learning" />
                      <option value="Holidays" />
                      <option value="Cartoons" />
                      <option value="Photos" />
                      <option value="Videos" />
                      <option value="Music" />
                      <option value="Stories" />
                    </datalist>

                    <div className="flex flex-wrap gap-2">
                      {["Family", "Learning", "Holidays", "Cartoons", "Photos", "Videos"].map(
                        (category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              playPopSound();
                              setMediaCategory(category);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-black transition ${
                              mediaCategory === category
                                ? "bg-purple-600 text-white"
                                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            }`}
                          >
                            {category}
                          </button>
                        ),
                      )}
                    </div>
                  </label>
                </div>

                <div className="mt-4">
                  {mediaMode === "upload" ? (
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-black text-slate-700">Photo or video file</span>

                      <input
                        id="parent-media-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                        onChange={(event) => setMediaFile(event.target.files?.[0] || null)}
                        className="w-full rounded-2xl border border-dashed border-purple-300 bg-purple-50 px-4 py-4 text-sm"
                      />

                      <span className="text-xs font-semibold text-slate-500">
                        Photos: JPG, PNG, WEBP, GIF. Videos: MP4, WEBM, MOV.
                      </span>
                    </label>
                  ) : (
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-black text-slate-700">YouTube URL</span>

                      <input
                        type="url"
                        value={youtubeUrl}
                        onChange={(event) => setYoutubeUrl(event.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
                      />
                    </label>
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="font-black text-slate-900">Select children</h3>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMediaChildIds(
                          selectedMediaChildIds.length === databaseChildren.length
                            ? []
                            : databaseChildren.map((child) => child.id),
                        )
                      }
                      className="text-xs font-black text-purple-700"
                    >
                      {selectedMediaChildIds.length === databaseChildren.length
                        ? "Clear all"
                        : "Select all"}
                    </button>
                  </div>

                  {databaseChildren.length === 0 ? (
                    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm font-bold text-amber-900">
                      Create a database child profile first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {databaseChildren.map((child) => {
                        const selected = selectedMediaChildIds.includes(child.id);

                        return (
                          <button
                            type="button"
                            key={child.id}
                            onClick={() => toggleMediaChild(child.id)}
                            className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                              selected
                                ? "border-purple-600 bg-purple-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <span className="w-11 h-11 rounded-full bg-sky-100 flex items-center justify-center text-xl shrink-0">
                              {selected ? "✅" : "👤"}
                            </span>

                            <span className="min-w-0">
                              <strong className="block text-sm text-slate-900 truncate">
                                {child.display_name}
                              </strong>

                              <small className="text-slate-500">Age {child.age ?? "not set"}</small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {mediaError && (
                  <p className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-3 text-sm font-bold text-red-700">
                    {mediaError}
                  </p>
                )}

                {mediaMessage && (
                  <p className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-bold text-emerald-700">
                    {mediaMessage}
                  </p>
                )}

                <button
                  type="button"
                  disabled={mediaSaving || databaseChildren.length === 0}
                  onClick={saveParentMedia}
                  className="mt-5 w-full rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black py-3.5 px-5"
                >
                  {mediaSaving ? "Saving..." : "Save and Assign Media"}
                </button>
              </article>

              <article className="bg-white rounded-3xl border border-slate-200 shadow-md p-4 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      My Uploaded Media
                    </h2>

                    <p className="text-sm text-slate-500 font-medium mt-1">
                      Preview, edit, assign, block, or delete photos and videos you uploaded.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={parentMediaLoading}
                    onClick={loadParentMedia}
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 px-4 py-2 text-sm font-black text-slate-700"
                  >
                    {parentMediaLoading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {parentMediaLoading && parentMediaItems.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center font-bold text-slate-500">
                    Loading your media...
                  </div>
                ) : parentMediaItems.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center">
                    <span className="text-4xl">🖼️</span>
                    <h3 className="mt-2 font-black text-slate-800">No uploaded media yet</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Upload a photo, video, or YouTube link above.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {parentMediaItems.map((item) => {
                      const assetValue = item.public_url || item.storage_path || "";

                      const assetUrl = getApiAssetUrl(assetValue);

                      const youtubeMatch = assetValue.match(
                        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,20})/,
                      );

                      const youtubeVideoId = youtubeMatch?.[1];

                      const assignedIds = item.access.map((entry) => Number(entry.child_id));

                      const isBusy = parentMediaActionId === item.id;

                      const isEditing = editingMediaId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden"
                        >
                          <div className="aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                            {youtubeVideoId ? (
                              <iframe
                                className="w-full h-full"
                                src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0`}
                                title={item.title || "YouTube video"}
                                allowFullScreen
                              />
                            ) : item.media_type === "photo" ? (
                              <img
                                src={assetUrl}
                                alt={item.title || item.original_name || "Uploaded photo"}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <video
                                src={assetUrl}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-contain"
                              >
                                Your browser does not support video playback.
                              </video>
                            )}
                          </div>

                          <div className="p-4 space-y-4">
                            {isEditing ? (
                              <div className="space-y-3">
                                <label className="block">
                                  <span className="text-xs font-black text-slate-600">Title</span>
                                  <input
                                    type="text"
                                    value={editingMediaTitle}
                                    onChange={(event) => setEditingMediaTitle(event.target.value)}
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400"
                                  />
                                </label>

                                <label className="block">
                                  <span className="text-xs font-black text-slate-600">
                                    Category
                                  </span>
                                  <input
                                    type="text"
                                    value={editingMediaCategory}
                                    onChange={(event) =>
                                      setEditingMediaCategory(event.target.value)
                                    }
                                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400"
                                  />
                                </label>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => saveParentMediaDetails(item)}
                                    className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black py-2.5"
                                  >
                                    Save Details
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => setEditingMediaId(null)}
                                    className="rounded-xl bg-slate-200 hover:bg-slate-300 px-4 py-2.5 font-black text-slate-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h3 className="font-black text-slate-900 truncate">
                                      {item.title || item.original_name || "Untitled media"}
                                    </h3>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                      <span className="rounded-full bg-purple-100 text-purple-700 px-2.5 py-1 text-xs font-black">
                                        {item.category || "Uncategorized"}
                                      </span>

                                      <span className="rounded-full bg-sky-100 text-sky-700 px-2.5 py-1 text-xs font-black capitalize">
                                        {youtubeVideoId ? "YouTube" : item.media_type}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => startEditingParentMedia(item)}
                                    className="shrink-0 rounded-xl bg-slate-200 hover:bg-slate-300 px-3 py-2 text-xs font-black text-slate-700"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>
                            )}

                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <h4 className="text-sm font-black text-slate-800">Child Access</h4>

                                <span className="text-xs font-bold text-slate-500">
                                  {assignedIds.length} assigned
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {databaseChildren.map((child) => {
                                  const assigned = assignedIds.includes(child.id);

                                  return (
                                    <button
                                      key={child.id}
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() => toggleParentMediaChild(item, child.id)}
                                      className={`rounded-xl border-2 px-3 py-2 text-left text-sm font-black transition disabled:opacity-50 ${
                                        assigned
                                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                          : "border-slate-200 bg-white text-slate-600"
                                      }`}
                                    >
                                      {assigned ? "✅ " : "🚫 "}
                                      {child.display_name}
                                    </button>
                                  );
                                })}
                              </div>

                              {assignedIds.length > 0 && (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => setParentMediaChildren(item, [])}
                                  className="mt-3 w-full rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-900 font-black py-2.5 text-sm"
                                >
                                  Block From All Children
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => removeParentMediaItem(item)}
                              className="w-full rounded-xl bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-700 font-black py-2.5 text-sm"
                            >
                              {isBusy ? "Working..." : "Delete Media"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            </section>
          )}

          {activeSection === "profiles" && (
            <section className="profile-management-page">
              <div className="profile-management-heading">
                <div>
                  <h2>Child Profiles</h2>
                  <p>View built-in profiles and manage profiles created by the parent.</p>
                </div>

                <strong>{3 + customProfiles.length} profiles</strong>
              </div>

              <article className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
                <div className="mb-4">
                  <h3 className="text-lg font-black text-slate-900">Database Child Profiles</h3>

                  <p className="text-sm text-slate-500">
                    These profiles belong to the logged-in parent account.
                  </p>
                </div>

                {databaseChildren.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                    No database child profiles.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {databaseChildren.map((child) => (
                      <div
                        key={child.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-2xl shrink-0">
                          👤
                        </div>

                        <div className="min-w-0 flex-1">
                          <strong className="block text-slate-900 truncate">
                            {child.display_name}
                          </strong>

                          <span className="text-xs text-slate-500">
                            {child.login_name || "No login name"}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={deletingDatabaseChildId === child.id}
                          onClick={() => removeDatabaseChild(child)}
                          className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 flex items-center justify-center disabled:opacity-50"
                          title={`Delete ${child.display_name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <div className="profile-management-grid">
                {[
                  {
                    id: 1,
                    name: "Leo",
                    emoji: "🦁",
                    color: "#ffa62b",
                    image:
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA",
                  },
                  {
                    id: 2,
                    name: "Poppy",
                    emoji: "🐼",
                    color: "#95d5b2",
                    image:
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ",
                  },
                  {
                    id: 3,
                    name: "Ruby",
                    emoji: "🐰",
                    color: "#ff8fa3",
                    image:
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0",
                  },
                ].map((child) => (
                  <article key={child.id} className="profile-management-card">
                    <div
                      className="profile-management-avatar overflow-hidden"
                      style={{
                        backgroundColor: child.color,
                      }}
                    >
                      {child.image ? (
                        <img
                          src={child.image}
                          alt={child.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        child.emoji
                      )}
                    </div>

                    <div className="profile-management-info">
                      <h3>{child.name}</h3>
                      <p>Built-in profile</p>
                    </div>

                    <span className="profile-protected-badge">Protected</span>
                  </article>
                ))}

                {customProfiles.map((child) => {
                  const isEditing = editingProfileId === child.id;
                  const photoUrl = child.avatarUrl || child.image;

                  return (
                    <article
                      key={child.id}
                      className={
                        child.isProtected
                          ? "profile-management-card protected"
                          : "profile-management-card"
                      }
                    >
                      {isEditing ? (
                        <div className="profile-edit-form">
                          <div className="profile-edit-preview">
                            <div
                              className="profile-management-avatar overflow-hidden"
                              style={{
                                backgroundColor: editProfileColor,
                              }}
                            >
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={child.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                editProfileEmoji
                              )}
                            </div>
                          </div>

                          <label>
                            <span>Name</span>
                            <input
                              type="text"
                              maxLength={20}
                              value={editProfileName}
                              onChange={(event) => setEditProfileName(event.target.value)}
                            />
                          </label>

                          <label>
                            <span>Age</span>
                            <input
                              type="number"
                              min={2}
                              max={17}
                              value={editProfileAge}
                              onChange={(event) =>
                                setEditProfileAge(
                                  Math.min(17, Math.max(2, Number(event.target.value))),
                                )
                              }
                            />
                          </label>

                          <div className="profile-edit-avatars">
                            {profileAvatarOptions.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                className={editProfileEmoji === emoji ? "selected" : ""}
                                onClick={() => setEditProfileEmoji(emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          <label>
                            <span>Profile color</span>
                            <input
                              type="color"
                              value={editProfileColor}
                              onChange={(event) => setEditProfileColor(event.target.value)}
                            />
                          </label>

                          <div className="profile-edit-actions">
                            <button
                              type="button"
                              className="profile-save-button"
                              onClick={() => saveEditedProfile(child)}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              className="profile-cancel-button"
                              onClick={cancelEditingProfile}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className="profile-management-avatar overflow-hidden"
                            style={{
                              backgroundColor: child.color,
                            }}
                          >
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={child.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              child.emoji
                            )}
                          </div>

                          <div className="profile-management-info">
                            <h3>
                              {child.name}
                              {child.isProtected && (
                                <span className="profile-lock-icon" title="Protected profile">
                                  🔒
                                </span>
                              )}
                            </h3>

                            <p>{child.age ? `Age ${child.age}` : "Custom profile"}</p>
                          </div>

                          <div className="profile-management-actions">
                            <button
                              type="button"
                              className="profile-edit-button"
                              onClick={() => startEditingProfile(child)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="profile-protect-button"
                              onClick={() => onToggleProfileProtection(child.id)}
                            >
                              {child.isProtected ? "Unprotect" : "Protect"}
                            </button>

                            <button
                              type="button"
                              className="profile-delete-button"
                              disabled={child.isProtected}
                              onClick={() => {
                                if (child.isProtected) {
                                  return;
                                }

                                const confirmed = window.confirm(`Delete ${child.name}'s profile?`);

                                if (confirmed) {
                                  onDeleteCustomProfile(child.id);
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </article>
                  );
                })}
              </div>

              {customProfiles.length === 0 && (
                <div className="profile-management-empty">
                  <span>➕</span>
                  <h3>No custom profiles yet</h3>
                  <p>Custom profiles created from the profile-selection page will appear here.</p>
                </div>
              )}
            </section>
          )}

          {activeSection === "settings" && (
            <section className="parent-settings-page">
              <article className="parent-settings-card">
                <div className="parent-settings-heading">
                  <div>
                    <h2>Parent Access</h2>
                    <p>Protect parental controls with a private numeric PIN.</p>
                  </div>
                </div>

                <label className="parent-settings-toggle-row">
                  <div>
                    <strong>Require Parent PIN</strong>
                    <span>Ask for the PIN before opening the parent dashboard.</span>
                  </div>

                  <button
                    type="button"
                    className={requireParentPin ? "parent-switch enabled" : "parent-switch"}
                    onClick={() =>
                      updateSettings({
                        requireParentPin: !requireParentPin,
                      })
                    }
                  >
                    <span />
                  </button>
                </label>

                <div className="parent-pin-form">
                  <label>
                    <span>New Parent PIN</span>

                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={newParentPin}
                      onChange={(event) => {
                        setNewParentPin(event.target.value.replace(/\D/g, ""));

                        setSettingsMessage("");
                      }}
                      placeholder="4 to 6 numbers"
                    />
                  </label>

                  <button type="button" onClick={saveParentPin}>
                    Save PIN
                  </button>
                </div>
              </article>

              <article className="parent-settings-card">
                <div className="parent-settings-heading">
                  <div>
                    <h2>Screen-Time Tools</h2>
                    <p>Restart the current child&apos;s screen-time allowance.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="parent-reset-timer-button"
                  onClick={resetScreenTimer}
                >
                  Restart Screen-Time Timer
                </button>
              </article>

              <article className="parent-settings-card danger">
                <div className="parent-settings-heading">
                  <div>
                    <h2>Reset Parental Settings</h2>
                    <p>Restore screen time, bedtime, filters and PIN to their defaults.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="parent-reset-all-button"
                  onClick={resetAllParentSettings}
                >
                  Reset All Parental Settings
                </button>
              </article>

              {settingsMessage && <div className="parent-settings-message">{settingsMessage}</div>}
            </section>
          )}
        </div>
      </main>

      <MobileBottomNavigation
        activeSection={activeSection}
        onSelectSection={(section) => {
          playPopSound();
          setActiveSection(section);
        }}
      />
    </div>
  );
}

function MobileHeader({
  activeSection,
  onSelectSection,
  onClose,
}: {
  activeSection: ParentSection;
  onSelectSection: (section: ParentSection) => void;
  onClose: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const sectionTitles: Record<string, string> = {
    "screen-time": "Screen Time",
    "content-filters": "Content Filters",
    "kids-media": "Kids Media",
    profiles: "Profiles",
    "activity-history": "Activity & History",
    settings: "Settings",
  };

  return (
    <header className="parent-dashboard-mobile-header relative z-30 bg-slate-900 text-white border-b border-slate-800 px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            playPopSound();
            setMenuOpen(!menuOpen);
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <Shield className="text-sky-400" size={20} />
          <h1 className="text-base font-black tracking-tight text-white">
            {sectionTitles[activeSection] || "Parent Dashboard"}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            playPopSound();
            onClose();
          }}
          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
          aria-label="Exit dashboard"
        >
          <X size={22} />
        </button>
      </div>

      {/* Slide-down Mobile Navigation Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3 pt-3 border-t border-slate-800 space-y-1"
          >
            {(
              [
                { id: "screen-time", label: "Screen Time", icon: Clock3 },
                { id: "content-filters", label: "Content Filters", icon: Shield },
                { id: "kids-media", label: "Kids Media", icon: Film },
                { id: "profiles", label: "Profiles", icon: Users },
                { id: "activity-history", label: "Activity & History", icon: BarChart3 },
                { id: "settings", label: "Settings", icon: Settings },
              ] satisfies Array<{
                id: ParentSection;
                label: string;
                icon: typeof Clock3;
              }>
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    onSelectSection(tab.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${
                    isActive
                      ? "bg-sky-500 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-rose-400 hover:bg-rose-500/10 mt-2 transition"
            >
              <X size={18} />
              <span>Exit Dashboard</span>
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileBottomNavigation({
  activeSection,
  onSelectSection,
}: {
  activeSection: ParentSection;
  onSelectSection: (section: ParentSection) => void;
}) {
  const tabs = [
    { id: "screen-time", label: "Screen", icon: Clock3 },
    { id: "content-filters", label: "Filters", icon: Shield },
    { id: "kids-media", label: "Media", icon: Film },
    { id: "profiles", label: "Profiles", icon: Users },
    { id: "activity-history", label: "Activity", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ] satisfies Array<{
    id: ParentSection;
    label: string;
    icon: typeof Clock3;
  }>;

  return (
    <nav className="parent-dashboard-bottom-nav fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 px-1 py-1.5 flex items-center justify-around md:hidden shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeSection === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectSection(tab.id)}
            className={`min-w-0 flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition ${
              isActive ? "text-sky-400 font-extrabold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon size={20} className={isActive ? "scale-110" : ""} />
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Legend({ colorClass, label }: { colorClass: string; label: string }) {
  return (
    <div>
      <span className={`legend-color ${colorClass}`} />
      <strong>{label}</strong>
    </div>
  );
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}
