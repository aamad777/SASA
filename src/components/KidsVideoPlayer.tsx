import { useState, type MouseEvent } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Home,
  MoreVertical,
  Pause,
  Play,
  Search,
  Sparkles,
  UserCircle,
  Users,
  PartyPopper,
  Radio,
  X,
  Volume2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { playHeartSound, playPopSound, playSuccessSound } from '../lib/sound';
import type { KidsVideoItem } from './KidsVideoHome';
import { kidsVideos } from './KidsVideoHome';
import WatchPartyModal, { type WatchPartyBuddy } from './WatchPartyModal';
import NumbersLearningVideo from './NumbersLearningVideo';

import puppyImg from '../assets/images/puppy_avatar_1784920038818.jpg';
import penguinImg from '../assets/images/penguin_avatar_1784920051288.jpg';
import kittyImg from '../assets/images/kitty_avatar_1784920065128.jpg';
import monkeyImg from '../assets/images/monkey_avatar_1784920076703.jpg';
import koalaImg from '../assets/images/koala_avatar_1784920089417.jpg';

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
  profileName?: string;
  profileEmoji?: string;
  customProfiles?: CustomProfileProp[];
  onBack: () => void;
  onOpenVideo: (video: KidsVideoItem) => void;
  onOpenHomeTab: (
    tab: 'home' | 'search' | 'library',
  ) => void;
  onChangeProfile: () => void;
};

const defaultBuddies: WatchPartyBuddy[] = [
  {
    id: 101,
    name: 'Leo',
    emoji: '🦁',
    color: '#ffa62b',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA',
  },
  {
    id: 102,
    name: 'Poppy',
    emoji: '🐼',
    color: '#95d5b2',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ',
  },
  {
    id: 103,
    name: 'Ruby',
    emoji: '🐰',
    color: '#ff8fa3',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0',
  },
  {
    id: 104,
    name: 'Percy Puppy',
    emoji: '🐶',
    color: '#fdb813',
    image: puppyImg,
  },
  {
    id: 105,
    name: 'Pippin Penguin',
    emoji: '🐧',
    color: '#38bdf8',
    image: penguinImg,
  },
  {
    id: 106,
    name: 'Cleo Kitty',
    emoji: '🐱',
    color: '#f472b6',
    image: kittyImg,
  },
  {
    id: 107,
    name: 'Milo Monkey',
    emoji: '🐵',
    color: '#fb923c',
    image: monkeyImg,
  },
  {
    id: 108,
    name: 'Kiki Koala',
    emoji: '🐨',
    color: '#a7f3d0',
    image: koalaImg,
  },
];

const reactions = [
  {
    id: 'love',
    label: 'Love it',
    emoji: '❤️',
    className: 'love',
  },
  {
    id: 'super',
    label: 'Super',
    emoji: '⭐',
    className: 'super',
  },
  {
    id: 'funny',
    label: 'Funny',
    emoji: '😂',
    className: 'funny',
  },
  {
    id: 'wow',
    label: 'Wow',
    emoji: '😲',
    className: 'wow',
  },
];

type FloatingEmoji = {
  id: number;
  emoji: string;
  left: number;
  sender: string;
};

export default function KidsVideoPlayer({
  video,
  profileName = 'Leo',
  profileEmoji = '🦁',
  customProfiles = [],
  onBack,
  onOpenVideo,
  onOpenHomeTab,
  onChangeProfile,
}: KidsVideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showWatchPartyModal, setShowWatchPartyModal] = useState(false);
  const [activeWatchPartyBuddy, setActiveWatchPartyBuddy] = useState<WatchPartyBuddy | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [reaction, setReaction] = useState(() => {
    return (
      localStorage.getItem(
        `sasa-video-reaction-${video.id}`,
      ) ?? ''
    );
  });

  const upNext = kidsVideos
    .filter((item) => item.id !== video.id)
    .slice(0, showAll ? kidsVideos.length : 3);

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

  const handleTogglePlay = () => {
    playPopSound();
    const nextState = !playing;
    setPlaying(nextState);

    if (activeWatchPartyBuddy) {
      showToast(
        nextState
          ? `Synced! Playing for ${profileName} & ${activeWatchPartyBuddy.name}`
          : `Synced! Paused for both profiles`
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
    const updated = reaction === id ? '' : id;
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
        colors: ['#ff72aa', '#ffd166', '#06d6a0', '#118ab2', '#8338ec'],
      });

      if (activeWatchPartyBuddy) {
        handleSendEmojiReaction(reactions.find((r) => r.id === id)?.emoji || '❤️');
      }
    } else {
      localStorage.removeItem(`sasa-video-reaction-${video.id}`);
      playPopSound();
    }
  };

  return (
    <motion.div
      className="kids-player-page relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
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
          <ArrowLeft size={25} />
        </motion.button>

        <h1 className="flex items-center gap-1.5 font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
          WonderWatch <Sparkles size={18} className="text-amber-400 inline" />
        </h1>

        {/* Watch Party Quick Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={() => {
            playPopSound();
            setShowWatchPartyModal(true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all shadow-sm cursor-pointer ${
            activeWatchPartyBuddy
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          <Users size={15} />
          <span>{activeWatchPartyBuddy ? 'Watch Party Active' : 'Invite to Watch'}</span>
          {activeWatchPartyBuddy && (
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          )}
        </motion.button>
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
                  style={{ backgroundColor: activeWatchPartyBuddy.color || '#bae6fd' }}
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
              {['🍿', '🎉', '💖', '👏'].map((emoji) => (
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

        {video.sourceType === 'youtube' &&
        video.youtubeVideoId ? (
          <section className="kids-player-hero relative rounded-3xl overflow-hidden shadow-xl bg-black aspect-video">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?rel=0&modestbranding=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </section>
        ) : video.sourceType === 'upload' &&
          video.sourceUrl ? (
          <section className="kids-player-hero relative rounded-3xl overflow-hidden shadow-xl bg-black aspect-video">
            <video
              className="w-full h-full object-contain bg-black"
              src={video.sourceUrl}
              controls
              playsInline
              preload="metadata"
              poster={video.image}
            >
              Your browser does not support video playback.
            </video>
          </section>
        ) : video.id === 7 ||
          video.category === 'Numbers' ? (
          <NumbersLearningVideo
            isPlaying={playing}
            onTogglePlay={handleTogglePlay}
          />
        ) : (
          <section className="kids-player-hero relative group rounded-3xl overflow-hidden shadow-xl">
            <img src={video.image} alt={video.title} />

            {/* Floating Emoji Reactions Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <AnimatePresence>
                {floatingEmojis.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 1, y: 160, scale: 0.5 }}
                    animate={{ opacity: 0, y: -100, scale: 1.8 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
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
              aria-label={playing ? 'Pause video' : 'Play video'}
            >
              {playing ? (
                <Pause size={42} fill="currentColor" />
              ) : (
                <Play size={42} fill="currentColor" />
              )}
            </motion.button>
          </section>
        )}

        <div className="kids-player-progress rounded-full overflow-hidden mt-3">
          <motion.span
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-full block"
            initial={{ width: '0%' }}
            animate={{ width: playing ? '65%' : '40%' }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <section className="kids-player-info mt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">{video.title}</h2>
              <p className="font-semibold text-slate-500 text-xs sm:text-sm mt-0.5">
                2.4M Views · Safe Kids Content
              </p>
            </div>

            {/* Invite to Watch Action Button */}
            {!activeWatchPartyBuddy && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  playPopSound();
                  setShowWatchPartyModal(true);
                }}
                className="shrink-0 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-black text-xs shadow-md hover:shadow-sky-400/30 flex items-center gap-1.5 cursor-pointer transition"
              >
                <PartyPopper size={16} />
                <span>Invite to Watch</span>
              </motion.button>
            )}
          </div>

          <section className="kids-reaction-section mt-6">
            <h3>How do you feel about this cartoon?</h3>

            <div className="kids-reaction-grid">
              {reactions.map((item) => {
                const selected = reaction === item.id;

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    className={[
                      'kids-reaction-choice',
                      item.className,
                      selected ? 'selected ring-4 ring-purple-400' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={(e) => handleReactionClick(item.id, e)}
                    aria-pressed={selected}
                  >
                    <span className="kids-reaction-face text-3xl">
                      {item.emoji}
                    </span>
                    <span className="kids-reaction-label font-bold">
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <div className="kids-up-next-heading flex items-center justify-between mt-6">
            <h3 className="text-xl font-black">Up Next Cartoons</h3>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              className="font-bold text-purple-600 bg-purple-100 hover:bg-purple-200 px-3 py-1 rounded-full text-sm cursor-pointer"
              onClick={() => {
                playPopSound();
                setShowAll((value) => !value);
              }}
            >
              {showAll ? 'Show Less' : 'See All'}
            </motion.button>
          </div>

          <div className="kids-up-next-list grid gap-3 mt-3">
            <AnimatePresence>
              {upNext.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  className="kids-up-next-card text-left cursor-pointer"
                  onClick={() => {
                    playPopSound();
                    setPlaying(false);
                    setReaction(
                      localStorage.getItem(
                        `sasa-video-reaction-${item.id}`,
                      ) ?? '',
                    );
                    onOpenVideo(item);
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    });
                  }}
                >
                  <img src={item.image} alt={item.title} className="rounded-2xl object-cover" />
                  <span className="flex flex-col justify-center">
                    <strong className="text-base text-slate-800">{item.title}</strong>
                    <small className="text-slate-500">{item.duration} · Safe Kids</small>
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </section>
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
            onOpenHomeTab('home');
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
            onOpenHomeTab('search');
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
            onOpenHomeTab('library');
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


