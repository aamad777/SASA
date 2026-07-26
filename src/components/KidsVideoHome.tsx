import { useMemo, useState, useEffect, type MouseEvent } from 'react';
import {
  BookOpen,
  Heart,
  Home,
  Palette,
  Play,
  Search,
  Settings,
  Volume2,
  VolumeX,
  X,
  Gamepad2,
  Paintbrush,
  User,
  Sparkles,
  Trophy,
  Award,
  ShieldCheck,
  RotateCcw,
  Edit3,
  Check,
  Star,
  Crown,
  Plus,
  Music,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { playHeartSound, playPopSound, playSuccessSound, isSoundEnabled, setSoundEnabled } from '../lib/sound';
import { appThemes, getStoredTheme, setStoredTheme, type AppThemeId } from '../lib/theme';
import KidsDrawingStudio from './KidsDrawingStudio';
import KidsGamesStudio from './KidsGamesStudio';
import KidsSongsStudio from './KidsSongsStudio';

import numbersVideoImg from '../assets/images/numbers_kids_video_1784920463079.jpg';

export type KidsVideoItem = {
  id: number;
  title: string;
  duration: string;
  image: string;
  category: string;
};

export type KidsHomeTab = 'home' | 'search' | 'library' | 'songs' | 'games' | 'studio' | 'profile';

type KidsVideoHomeProps = {
  key?: string | number;
  profileName: string;
  profileEmoji: string;
  profileId?: number;
  profileImage?: string;
  initialTab?: KidsHomeTab;
  activeTab?: KidsHomeTab;
  onTabChange?: (tab: KidsHomeTab) => void;
  onOpenVideo: (video: KidsVideoItem) => void;
  onOpenParentalControls: () => void;
  onChangeProfile: () => void;
  onOpenFreeAccount?: () => void;
};

const categories = [
  {
    name: 'Numbers',
    image: numbersVideoImg,
  },
  {
    name: 'Animals',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjAp5NZ48TuzQUwagJX3BEsOoRnHOfOQFRiaHzC_6VTHBusH5vdnyE-dw2wknaAdkSD_sTsjy4_S035njloXzb9SfVsBpcozUKLuAk_Ru8t6VD9syxltNOKUoSvF3oUXsLo8akWhFvxPSm2k8HawcXFK9cvfvBSAUSSj-l_0flPJq2RHEuQ0kZCj_WR_krtqKF_ZdJ7EFdeLJYMLZRPv_YRK6UERduzBqHzOsLRKnUVUsh20dZNsLaXSmOmukV0-omLmxDf1yuxsA',
  },
  {
    name: 'Science',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBHx_6VcyyyAkMrQ7Y-w-OURZAkou1lzLfFPib9MJvZ8Q474OGB979tU1_jyn_95spx9jIpSNEy85GZQopqNO0YfQ9pUBwLBuUHqOTLbPJ5of_LNsURwBaiZi3QIy5je5_p64nOmb_s4c_6o5NBFDnM00Ova9JScEElI9-jWPKobWVu9oXtbNfP3_831wYXyLFyVhtH9oYsNKShDEFyZj5ao_bC8_QH_i0D4NSHwZDg0iZDGPhm6ZUApCXn67AXGvsf6S8g6rW_uOo',
  },
  {
    name: 'Music',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1Xbm9EFIAa_mvtnoDyzgtc-A7uv8qtl0H_QNFVxh_WPQMF9XSYZ5oSoHBEMAtRXUi88dYmVPx_NAoLEZmVVTT4zjVdlMLl3fAT5IXLbgAsx8fnF440SBIgWZPAkymQlht1Z6NlIVJhHiLDMxYkRbdG27zpypLTYY8hQEFwTUNt_KY_u58FDDX9sPm4sNKmSfNds47k4N0SBuwe3uu1k5WmnsHMxhxacfccE_jj5avy0fi0PQr-5I7cyEhMK702e3wlHKCooQGqXE',
  },
  {
    name: 'Space',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBV2uFqV3SsOxGG5OZoIPxSK9n-z2uooMZoXphzsg7XNM_7SOnRPS-T5nk0rwvrJjl8gUyds1SkY_Jpk2XkRWF-cQLWjcXXwtG8fD5gaYqbhKO8ZedsubYFwOwwEHx7TKGdAqG-GrMzOyKejZlU9mAfQ3f-lCVUM1HSnlw4vK9VBxcc_DLbVchaJ2XXzovD_bHU6AWHEdIOU5hgJyd1aOgZU2Yph7EIVdcucHErhwbhR_9agLdyYpNOLUXwgLiaj9qd6f_Wbyxjd8I',
  },
];

export const kidsVideos: KidsVideoItem[] = [
  {
    id: 7,
    title: 'Learn Numbers 1 to 10 with Pippin!',
    duration: '04:30',
    category: 'Numbers',
    image: numbersVideoImg,
  },
  {
    id: 1,
    title: 'Learn to Count with Dinosaurs!',
    duration: '10:15',
    category: 'Numbers',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDjwcBvDtG1fe9LxHnoNeNrMGk4fTivdubiwP3TV_DPY0hq0PJKfoljdtzGCLvfWssM7kOIgxD91CkIQjV5T4wDSnMhK8XBfG8BW0ML4IYpsgiKhz8Anpj6pMGuINoL8YZOGFOedj-GecrNAlbW6xYDigch_X_Poia5K8nEDaa-WRCCeNtM4KsoU_LRARwtMPxvsh-5KfqA1iLf5Mgs1uQxd8GjNjHCvVNalC6ezmoLMkoLE6znAFA1tB7fDx5zhsVYhr49qiEXBpc',
  },
  {
    id: 2,
    title: 'The Amazing Solar System',
    duration: '15:30',
    category: 'Space',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYCIE5ObL0I7VLAVlu9S4guu3tZis6FpFWIbfo3lt8h7YwHELMjkXWpUm22oWdAvXGzdDqARBkSTL-G5nSSoHo0pby2o8GRQjz0iOlERwoh7WQoQieYKB7ey9KRjIunSXvRvXqfz95W-oOhohOmbwvGo7_9ha9VsYEH2DUbRvqXHWcYV5ZiTBQ0onEHIbr1qx7IHfklS01xpqKgxnOHpEY3zF0dgZZ7ncmW4uRlf1yLPkdr-oaAuDESMde65XhKhFE5lOOx9MnGS8',
  },
  {
    id: 3,
    title: 'Sing-Along Nursery Rhymes',
    duration: '5:00',
    category: 'Music',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBngTUq4TMGud68bpX563YhKS8fpUybHgPm2FagY7uqjDSjn5YnxN8QITXS3cqI1VSAKAySB6-GzuEXMNY38P1zE1hvCSwk9C0WUZwvOG1mwB40_k4Jl5rexXug-ap7N0H9j2JlCEHM-y7B7m14hTzTRm5PZcXs3ipLcNfFe_Jh7nTWeIOxB3luWZzuCZ2cr6_DOgUJS4T96D-WL0W1xUpoPWamZrCEa26f78ucd3uhaEVdHDv4f-paFw3t-nMDJcqNSYRdb1wQ7sQ',
  },
  {
    id: 4,
    title: 'DIY Volcano Experiment',
    duration: '12:45',
    category: 'Science',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAR6gvme4x0nZTflLk5canbiFllbfBKw-83LwR_D4Ea7GYRY8gTDi06DKL-1Vfmy-tPUivApwcH0LQf5jU1wOTdJQkGniE2iutdRwlnFibzzqKFCATB8OQwwndmGOHesq5NmBWUes66WDey5HENcFjeFZq3FCDmiz-3HIASq1Gqpo10NZOUYtk5XMr7sW8nkthJOAiWVFagHSq8rbaeyK418dVshiELkpoXUJEEbS4cNnDwLvAxeQx439IU6YDzVqYgVQQ8jINlF_c',
  },
  {
    id: 5,
    title: 'Plant and Grow Together',
    duration: '10:10',
    category: 'Science',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoW-xoowXiPjR8TL8V7ULpkCvanUpu4zojqDQZ4HYJjoRiJma4RaYu_h-1UaDzr1B9OU95WqQkZvqNRwBajNMo7uRIvVsTfP6YnNanz_oVLCzFT7wufVJ8Gxa5Ko6JP0hxyP0NMEmmujaZFJh8dLXSWcdDD7bZCWSmpufjS8JAM_e4l3Z5iu2-OV-g2Ir-YYXnNiSJTi6t4-zes9z3INlewm5J7yjp2owcaoZmRUMR5SsE-cIvOfSFCj56zAL7mER7JXOl4WyGwY',
  },
  {
    id: 6,
    title: 'Friendly Animal Adventure',
    duration: '8:20',
    category: 'Animals',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBOqr2ccQdse7AfIKOtjwamQ3RJS_kac37xmabWYdAvdrYc0wDWpKIIXEQOUxuyp8YcDZiy-KXKFXylUdmQEXwwJZZZQT8OER_GGE4MKTDQm7tpZZ9mOUfSnBpT3945Pb4IfPhiFyLTOf1nZwGCVupEyJgr9Eh77u28xt4yU1sI2RCxGqX5fKH2955kRFincic4iL0YZHgSudq2f7uRlbQo8kY2ze-hrRIUvu6MIcKCyFVtXa1752c9e7ZdJ_UheNXB4G1FHxKLZ_0',
  },
];

function loadLibrary(): number[] {
  try {
    const value = localStorage.getItem('sasa-video-library');
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function loadBlockedVideoIds(): number[] {
  try {
    const saved = localStorage.getItem('sasa-parent-controls');
    if (!saved) return [];
    const settings = JSON.parse(saved);
    return Array.isArray(settings.blockedVideoIds) ? settings.blockedVideoIds : [];
  } catch {
    return [];
  }
}

const KID_AVATARS = ['🦁', '🐼', '🐰', '🐶', '🐧', '🐱', '🐒', '🐨', '🦄', '🐥', '🚀', '🌟', '👑', '🎨'];

const BANNER_THEMES = [
  { id: 'rainbow', name: 'Rainbow', gradient: 'from-purple-600 via-pink-500 to-amber-400', border: 'border-amber-300' },
  { id: 'ocean', name: 'Ocean Sky', gradient: 'from-sky-500 via-blue-600 to-indigo-700', border: 'border-sky-300' },
  { id: 'sunshine', name: 'Sunshine', gradient: 'from-amber-400 via-orange-500 to-red-500', border: 'border-orange-300' },
  { id: 'forest', name: 'Mint Meadow', gradient: 'from-emerald-400 via-teal-500 to-cyan-600', border: 'border-emerald-300' },
];

export default function KidsVideoHome({
  profileName,
  profileEmoji,
  profileId,
  profileImage,
  initialTab = 'home',
  activeTab: activeTabProp,
  onTabChange,
  onOpenVideo,
  onOpenParentalControls,
  onChangeProfile,
  onOpenFreeAccount,
}: KidsVideoHomeProps) {
  const [currentTab, setCurrentTab] = useState<KidsHomeTab>(activeTabProp || initialTab);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [libraryIds, setLibraryIds] = useState<number[]>(loadLibrary);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppThemeId>(getStoredTheme);

  // Sync prop changes
  useEffect(() => {
    if (activeTabProp && activeTabProp !== currentTab) {
      setCurrentTab(activeTabProp);
    }
  }, [activeTabProp]);

  // Kid Profile Customization State
  const [activeEmoji, setActiveEmoji] = useState<string>(() => {
    return localStorage.getItem('sasa-active-kid-emoji') || profileEmoji;
  });
  const [activeName, setActiveName] = useState<string>(() => {
    return localStorage.getItem('sasa-active-kid-name') || profileName;
  });
  const profileImageStorageKey =
    profileId !== undefined && profileId !== null
      ? `sasa-child-image-${profileId}`
      : 'sasa-active-kid-image';

  const [activeImage, setActiveImage] = useState<string | undefined>(() => {
    return profileImage || localStorage.getItem(profileImageStorageKey) || undefined;
  });

  useEffect(() => {
    const savedImage =
      profileImage ||
      localStorage.getItem(profileImageStorageKey) ||
      undefined;

    setActiveImage(savedImage);

    if (profileImage) {
      localStorage.setItem(
        profileImageStorageKey,
        profileImage,
      );
    }
  }, [
    profileId,
    profileImage,
    profileImageStorageKey,
  ]);

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
  const [bannerThemeId, setBannerThemeId] = useState<string>(() => {
    return localStorage.getItem('sasa-kid-banner-theme') || 'rainbow';
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);

  const selectedBannerTheme = useMemo(() => {
    return BANNER_THEMES.find((t) => t.id === bannerThemeId) || BANNER_THEMES[0];
  }, [bannerThemeId]);

  const savedArtworksCount = useMemo(() => {
    try {
      const saved = localStorage.getItem('sasa-kids-artworks');
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  }, [currentTab]);

  const savedVideos = useMemo(() => {
    return kidsVideos.filter((v) => libraryIds.includes(v.id));
  }, [libraryIds]);

  const handleSelectAvatar = (emoji: string, imageUrl?: string) => {
    playSuccessSound();
    setActiveEmoji(emoji);
    localStorage.setItem('sasa-active-kid-emoji', emoji);
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
      localStorage.setItem('sasa-active-kid-name', tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleSelectBannerTheme = (themeId: string) => {
    playPopSound();
    setBannerThemeId(themeId);
    localStorage.setItem('sasa-kid-banner-theme', themeId);
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
      colors: ['#ff8fa3', '#ffa62b', '#ffde59', '#95d5b2', '#8ecae6'],
    });

    setBadgeToast(`🌟 Unlocked: ${title}! ${msg}`);
    setTimeout(() => setBadgeToast(null), 3500);
  };

  const displayedVideos = useMemo(() => {
    const blockedVideoIds = loadBlockedVideoIds();
    let list = kidsVideos.filter((video) => !blockedVideoIds.includes(video.id));

    if (currentTab === 'library') {
      list = list.filter((video) => libraryIds.includes(video.id));
    }

    if (selectedCategory !== 'All') {
      list = list.filter((video) => video.category === selectedCategory);
    }

    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      list = list.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.category.toLowerCase().includes(query),
      );
    }

    return list;
  }, [currentTab, libraryIds, searchText, selectedCategory]);

  const toggleLibrary = (videoId: number, event: MouseEvent) => {
    event.stopPropagation();
    const isAdding = !libraryIds.includes(videoId);
    const updated = isAdding
      ? [...libraryIds, videoId]
      : libraryIds.filter((id) => id !== videoId);

    setLibraryIds(updated);
    localStorage.setItem('sasa-video-library', JSON.stringify(updated));

    if (isAdding) {
      playHeartSound();
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 22,
        spread: 60,
        origin: { x, y },
        colors: ['#ff72aa', '#8b7cff', '#ffc107', '#2563eb'],
      });
    } else {
      playPopSound();
    }
  };

  const changeTab = (tab: KidsHomeTab) => {
    playPopSound();
    setCurrentTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
    setSearchText('');
    setSelectedCategory('All');
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
    setShowThemePicker(false);
  };

  return (
    <motion.div
      className="kids-video-home"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="kids-video-sticky">
        <header className="kids-video-header flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5">
          {/* Left Side: Hello Greeting, Title & Free Account Button */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-3 flex-1 min-w-0">
            <div>
              <span className="flex items-center gap-1.5 font-bold text-amber-200 text-xs sm:text-sm">
                <span className="text-lg sm:text-xl">{profileEmoji}</span> Hello, {profileName}!
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs">
                {currentTab === 'library'
                  ? 'My Library ❤️'
                  : currentTab === 'search'
                  ? 'Search Cartoons 🔍'
                  : currentTab === 'songs'
                  ? 'Sing-Along Songs 🎵'
                  : currentTab === 'games'
                  ? 'Fun Arcade 🎮'
                  : currentTab === 'studio'
                  ? 'Drawing Studio 🎨'
                  : currentTab === 'profile'
                  ? 'Kid Profile 👤'
                  : 'Kids Video 🌟'}
              </h1>
            </div>

            {/* Free Account Button - Opposite of Parental Settings */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                playSuccessSound();
                if (onOpenFreeAccount) {
                  onOpenFreeAccount();
                } else {
                  setShowFreeModal(true);
                }
              }}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm px-3.5 py-2 rounded-2xl shadow-md border-2 border-white flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Free Account Status & Details"
            >
              <Sparkles size={16} className="text-amber-900 fill-amber-300" />
              <span>Free Account</span>
              <span className="bg-amber-900 text-amber-100 text-[10px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                FREE
              </span>
            </motion.button>
          </div>

          {/* Right Side: Theme, Volume, Parental Settings */}
          <div className="topbar-actions flex items-center justify-end gap-2 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="icon-button shadow-sm cursor-pointer"
              onClick={() => {
                playPopSound();
                setShowThemePicker((v) => !v);
              }}
              title="Change Theme & Background"
              aria-label="Theme selector"
            >
              <Palette size={20} className="text-purple-600" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="icon-button shadow-sm cursor-pointer"
              onClick={handleToggleSound}
              title={soundOn ? 'Mute Sound Effects' : 'Enable Sound Effects'}
              aria-label="Toggle Sound"
            >
              {soundOn ? (
                <Volume2 size={20} className="text-teal-600" />
              ) : (
                <VolumeX size={20} className="text-slate-400" />
              )}
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              className="kids-parent-btn font-extrabold text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-md rounded-2xl px-4 py-2 flex items-center gap-2 cursor-pointer shrink-0"
              onClick={() => {
                playPopSound();
                onOpenParentalControls();
              }}
            >
              <Settings size={18} />
              <span>Parental Settings</span>
            </motion.button>
          </div>
        </header>

        {/* Top Header Quick Tab Pills Bar for Easy Desktop & Tablet Access */}
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none bg-white/60 backdrop-blur-md border-y border-purple-100/60 my-1">
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'search', label: 'Search', icon: '🔍' },
            { id: 'library', label: 'Library', icon: '❤️' },
            { id: 'songs', label: 'Songs', icon: '🎵' },
            { id: 'games', label: 'Arcade', icon: '🎮' },
            { id: 'studio', label: 'Studio', icon: '🎨' },
            { id: 'profile', label: 'Profile', icon: activeEmoji || '👤' },
          ].map((tab) => {
            const active = currentTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => changeTab(tab.id as KidsHomeTab)}
                className={`px-3.5 py-1.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shrink-0 border-2 transition cursor-pointer ${
                  active
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Theme Picker Popover */}
        <AnimatePresence>
          {showThemePicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="mx-4 my-2 p-4 rounded-3xl bg-white/95 backdrop-blur-md shadow-2xl border border-purple-200/60 z-30 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 font-extrabold text-slate-800">
                <Palette size={20} className="text-purple-500" />
                <span>Choose Cartoon Theme:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {appThemes.map((theme) => {
                  const active = currentTheme === theme.id;
                  return (
                    <motion.button
                      key={theme.id}
                      type="button"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`px-3 py-1.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 border-2 transition-all ${
                        active
                          ? 'border-purple-600 bg-purple-100 text-purple-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{theme.emoji}</span>
                      <span>{theme.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {currentTab === 'search' && (
          <div className="flex flex-col gap-2 p-3 bg-white/70 backdrop-blur-md rounded-3xl border border-purple-100/80 mx-2 my-2 shadow-sm">
            <motion.div
              className="kids-search-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Search size={21} />
              <input
                type="search"
                value={searchText}
                placeholder="Search cartoons, numbers, dinos, music..."
                autoFocus
                onChange={(event) => setSearchText(event.target.value)}
              />
              {searchText && (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setSearchText('');
                  }}
                  aria-label="Clear search"
                >
                  <X size={20} />
                </motion.button>
              )}
            </motion.div>

            {/* Quick Topic Search Pills */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
              <span className="text-[11px] font-black text-slate-400 shrink-0 uppercase tracking-wider">
                Quick Topics:
              </span>
              {[
                { label: 'Numbers', icon: '🔢' },
                { label: 'Dinosaurs', icon: '🦕' },
                { label: 'Solar System', icon: '🪐' },
                { label: 'Sing-Along', icon: '🎵' },
                { label: 'Experiment', icon: '🧪' },
                { label: 'Animals', icon: '🐾' },
              ].map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setSearchText(topic.label);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 border transition flex items-center gap-1 ${
                    searchText.toLowerCase() === topic.label.toLowerCase()
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {(currentTab === 'home' || currentTab === 'search' || currentTab === 'library') && (
          <nav className="kids-category-nav">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              type="button"
              className={selectedCategory === 'All' ? 'selected' : ''}
              onClick={() => {
                playPopSound();
                setSelectedCategory('All');
              }}
            >
              <span className="kids-all-category">🌈</span>
              <strong>All Cartoons</strong>
            </motion.button>

            {categories.map((category) => (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                type="button"
                key={category.name}
                className={selectedCategory === category.name ? 'selected' : ''}
                onClick={() => {
                  playPopSound();
                  setSelectedCategory(category.name);
                }}
              >
                <span>
                  <img src={category.image} alt={category.name} />
                </span>
                <strong>{category.name}</strong>
              </motion.button>
            ))}
          </nav>
        )}
      </div>

      <main className={`pb-28 ${['home', 'search', 'library'].includes(currentTab) ? 'kids-video-grid' : 'w-full px-3 sm:px-6 py-4'}`}>
        {currentTab === 'games' ? (
          <KidsGamesStudio />
        ) : currentTab === 'studio' ? (
          <KidsDrawingStudio />
        ) : currentTab === 'songs' ? (
          <KidsSongsStudio />
        ) : currentTab === 'profile' ? (
          <div className="max-w-lg mx-auto w-full flex flex-col items-center text-center gap-6 p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-3xl border-4 border-amber-300 shadow-2xl my-4">
            {/* Large Centered Character Profile Image or Emoji */}
            <div className="relative flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer group"
                onClick={() => {
                  playPopSound();
                  setShowAvatarPicker(!showAvatarPicker);
                }}
                title="Tap to change avatar!"
              >
                {/* Outer Halo/Glow */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 opacity-75 blur-md group-hover:opacity-100 transition duration-300 animate-pulse" />

                {/* Circle Container */}
                <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-tr from-amber-100 to-orange-100 flex items-center justify-center">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={activeName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-6xl sm:text-7xl select-none">{activeEmoji}</span>
                  )}
                </div>

                {/* Edit Badge Button */}
                <button
                  type="button"
                  className="absolute bottom-1 right-1 z-20 bg-amber-400 hover:bg-amber-300 text-amber-950 p-2.5 rounded-full border-2 border-white shadow-lg transition transform group-hover:scale-110 cursor-pointer"
                  title="Change profile avatar"
                >
                  <Edit3 size={16} />
                </button>
              </motion.div>
            </div>

            {/* Kid Profile Name & Status */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              {isEditingName ? (
                <div className="flex items-center justify-center gap-2 w-full max-w-xs">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-slate-100 text-slate-900 font-black text-2xl px-4 py-2 rounded-2xl border-2 border-amber-400 focus:outline-none text-center shadow-inner"
                    autoFocus
                    maxLength={16}
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="p-2.5 bg-amber-400 text-amber-950 rounded-2xl font-bold shadow-md hover:bg-amber-300 cursor-pointer shrink-0"
                  >
                    <Check size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {activeName}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setTempName(activeName);
                      setIsEditingName(true);
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-600 cursor-pointer"
                    title="Edit profile name"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide border border-emerald-300">
                <ShieldCheck size={14} className="text-emerald-600" />
                100% Safe Kid Account
              </span>
            </div>

            {/* Avatar Selection Picker Sheet */}
            <AnimatePresence>
              {showAvatarPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full bg-amber-50 border-2 border-amber-200 p-4 rounded-3xl flex flex-col gap-3 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <Crown size={16} className="text-amber-600" /> Choose Character or Emoji Avatar:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(false)}
                      className="text-amber-800 p-1 rounded-xl hover:bg-amber-200 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Default Character Portraits */}
                  <div className="flex items-center justify-center gap-3 py-1">
                    {[
                      {
                        name: 'Leo',
                        emoji: '🦁',
                        image:
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA',
                      },
                      {
                        name: 'Poppy',
                        emoji: '🐼',
                        image:
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ',
                      },
                      {
                        name: 'Ruby',
                        emoji: '🐰',
                        image:
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0',
                      },
                    ].map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSelectAvatar(item.emoji, item.image)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition cursor-pointer ${
                          activeImage === item.image
                            ? 'bg-amber-300 border-amber-600 shadow-md scale-105'
                            : 'bg-white hover:bg-amber-100 border-amber-200'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white shadow-xs">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-black text-amber-950">{item.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-amber-200 my-1" />

                  {/* Emoji Options */}
                  <div className="grid grid-cols-7 gap-2">
                    {KID_AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleSelectAvatar(emoji, undefined)}
                        className={`text-2xl p-2 rounded-2xl transition cursor-pointer flex items-center justify-center ${
                          activeEmoji === emoji && !activeImage
                            ? 'bg-amber-400 border-2 border-amber-600 shadow-md scale-110'
                            : 'bg-white hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Activity & Fun Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => changeTab('library')}
                className="p-4 rounded-2xl bg-pink-50 border-2 border-pink-200 hover:bg-pink-100 transition text-center flex flex-col items-center gap-1 cursor-pointer shadow-sm group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">❤️</span>
                <strong className="text-2xl font-black text-pink-700">{libraryIds.length}</strong>
                <span className="text-xs font-black text-pink-800 uppercase tracking-wider">Saved Cartoons</span>
              </button>

              <button
                type="button"
                onClick={() => changeTab('studio')}
                className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 hover:bg-purple-100 transition text-center flex flex-col items-center gap-1 cursor-pointer shadow-sm group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">🎨</span>
                <strong className="text-2xl font-black text-purple-700">{savedArtworksCount}</strong>
                <span className="text-xs font-black text-purple-800 uppercase tracking-wider">Artworks Drawn</span>
              </button>
            </div>

            {/* Kid Badges Section */}
            <div className="flex flex-col gap-3 w-full bg-slate-50 p-4 rounded-3xl border border-slate-200">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center justify-center gap-1.5">
                <Trophy size={16} className="text-amber-500" />
                <span>Kid Badges (Tap to celebrate!)</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { title: 'Star Watcher', icon: '⭐', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
                  { title: 'Junior Artist', icon: '🎨', bg: 'bg-purple-100 text-purple-900 border-purple-300' },
                  { title: 'Super Kid', icon: '🚀', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
                ].map((b) => (
                  <motion.button
                    key={b.title}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={(e) => handleTapBadge(b.title, 'Great job!', e)}
                    className={`p-3 rounded-2xl border-2 font-black text-xs flex flex-col items-center gap-1 cursor-pointer shadow-xs ${b.bg}`}
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <span>{b.title}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-1">
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  onChangeProfile();
                }}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                <User size={18} />
                <span>Switch Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  onOpenParentalControls();
                }}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition border border-slate-300 active:scale-95"
              >
                <ShieldCheck size={18} className="text-purple-600" />
                <span>Parent Controls</span>
              </button>
            </div>
          </div>
        ) : (
          /* Main Video Cards Grid */
          <>
            <AnimatePresence mode="popLayout">
              {displayedVideos.map((video, index) => {
                const saved = libraryIds.includes(video.id);

                return (
                  <motion.article
                    key={video.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.28, delay: index * 0.04 }}
                    whileHover={{ y: -6 }}
                    className="group"
                  >
                    <button
                      type="button"
                      className="kids-video-thumbnail overflow-hidden relative"
                      onClick={() => {
                        playPopSound();
                        onOpenVideo(video);
                      }}
                    >
                      <img
                        src={video.image}
                        alt={video.title}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="kids-video-dark-overlay" />

                      <motion.span
                        className="kids-video-main-play"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Play size={24} fill="currentColor" />
                      </motion.span>

                      <span className="kids-video-duration">{video.duration}</span>

                      <span className="kids-video-small-play">
                        <Play size={11} fill="currentColor" />
                      </span>
                    </button>

                    <div className="kids-video-title-row flex items-center justify-between">
                      <h2>{video.title}</h2>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.25, rotate: 10 }}
                        whileTap={{ scale: 0.8 }}
                        className={
                          saved
                            ? 'kids-library-button saved'
                            : 'kids-library-button'
                        }
                        onClick={(e) => toggleLibrary(video.id, e)}
                        aria-label={
                          saved ? 'Remove from library' : 'Add to library'
                        }
                      >
                        <Heart size={22} fill={saved ? 'currentColor' : 'none'} />
                      </motion.button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>

            {displayedVideos.length === 0 && (
              <motion.section
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="kids-empty-view"
              >
                <span>{currentTab === 'library' ? '📚' : '🔍'}</span>
                <h2>
                  {currentTab === 'library'
                    ? 'Your library is empty'
                    : 'No cartoons found'}
                </h2>
                <p>
                  {currentTab === 'library'
                    ? 'Tap the heart on any video to save it to your library!'
                    : 'Try searching another title or select "All Cartoons".'}
                </p>
                {currentTab === 'library' && (
                  <button
                    type="button"
                    onClick={() => changeTab('home')}
                    className="mt-3 px-5 py-2.5 rounded-2xl bg-amber-400 text-amber-950 font-black text-sm shadow-md hover:bg-amber-500 transition cursor-pointer"
                  >
                    Browse Cartoons 🚀
                  </button>
                )}
              </motion.section>
            )}
          </>
        )}
      </main>

      <nav className="kids-home-bottom-nav">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className={currentTab === 'home' ? 'active' : ''}
          type="button"
          onClick={() => changeTab('home')}
        >
          <span>
            <Home
              size={20}
              fill={currentTab === 'home' ? 'currentColor' : 'none'}
            />
          </span>
          Home
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className={currentTab === 'search' ? 'active' : ''}
          type="button"
          onClick={() => changeTab('search')}
        >
          <Search size={20} />
          Search
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className={currentTab === 'library' ? 'active' : ''}
          type="button"
          onClick={() => changeTab('library')}
        >
          <BookOpen size={20} />
          Library
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className={currentTab === 'songs' ? 'active' : ''}
          type="button"
          onClick={() => changeTab('songs')}
        >
          <Music size={20} />
          Songs
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className={currentTab === 'games' ? 'active' : ''}
          type="button"
          onClick={() => changeTab('games')}
        >
          <Gamepad2 size={20} />
          Games
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className={currentTab === 'studio' ? 'active' : ''}
          type="button"
          onClick={() => changeTab('studio')}
        >
          <Paintbrush size={20} />
          Studio
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          className={currentTab === 'profile' ? 'active' : ''}
          type="button"
          onClick={() => changeTab('profile')}
        >
          <span className="kids-nav-profile flex items-center justify-center w-6 h-6 rounded-full overflow-hidden shrink-0">
            {activeImage ? (
              <img src={activeImage} alt={activeName} className="w-full h-full object-cover" />
            ) : (
              activeEmoji || profileEmoji
            )}
          </span>
          Profile
        </motion.button>
      </nav>

      {/* Free Account Information Modal */}
      <AnimatePresence>
        {showFreeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowFreeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 flex flex-col items-center text-center gap-4 relative"
            >
              <button
                type="button"
                onClick={() => setShowFreeModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-800 shadow-md">
                <Sparkles size={32} className="fill-amber-400 text-amber-600" />
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black text-slate-900">100% Free Kid Account</h2>
                <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
                  Safe • Unlimited • Fun
                </span>
              </div>

              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                You are enjoying the 100% Free Kids Experience! Stream endless cartoons, play learning games, and create custom kid avatars without any subscription.
              </p>

              <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex flex-col gap-2 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Unlimited Kid Videos & Sing-Along Songs</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Interactive Drawing & Arcade Games</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>100% Safe Parent-Controlled Environment</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFreeModal(false);
                    onOpenParentalControls();
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <ShieldCheck size={16} />
                  <span>Parent Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFreeModal(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs border border-slate-300 cursor-pointer transition"
                >
                  Awesome!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

