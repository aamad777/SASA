import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Heart,
  Volume2,
  VolumeX,
  Sparkles,
  Disc,
} from "lucide-react";
import confetti from "canvas-confetti";
import { playHeartSound, playPopSound, playSuccessSound } from "../lib/sound";

type Song = {
  id: number;
  title: string;
  artist: string;
  emoji: string;
  duration: number; // in seconds
  color: string;
  bgGradient: string;
  notes: { freq: number; duration: number }[]; // Web Audio melody notes
  lyrics: string[];
};

const SONGS: Song[] = [
  {
    id: 1,
    title: "Twinkle Twinkle Little Star",
    artist: "Nursery Rhyme",
    emoji: "⭐",
    duration: 32,
    color: "#f59e0b",
    bgGradient: "from-amber-400 via-orange-500 to-amber-600",
    notes: [
      { freq: 261.63, duration: 0.5 },
      { freq: 261.63, duration: 0.5 },
      { freq: 392.0, duration: 0.5 },
      { freq: 392.0, duration: 0.5 },
      { freq: 440.0, duration: 0.5 },
      { freq: 440.0, duration: 0.5 },
      { freq: 392.0, duration: 1.0 },
      { freq: 349.23, duration: 0.5 },
      { freq: 349.23, duration: 0.5 },
      { freq: 329.63, duration: 0.5 },
      { freq: 329.63, duration: 0.5 },
      { freq: 293.66, duration: 0.5 },
      { freq: 293.66, duration: 0.5 },
      { freq: 261.63, duration: 1.0 },
    ],
    lyrics: [
      "Twinkle, twinkle, little star, 🌟",
      "How I wonder what you are! ✨",
      "Up above the world so high, ☁️",
      "Like a diamond in the sky. 💎",
      "Twinkle, twinkle, little star, ⭐",
      "How I wonder what you are! 💖",
    ],
  },
  {
    id: 2,
    title: "The ABC Alphabet Song",
    artist: "Learning Tunes",
    emoji: "🔤",
    duration: 28,
    color: "#8b5cf6",
    bgGradient: "from-purple-500 via-indigo-600 to-purple-700",
    notes: [
      { freq: 261.63, duration: 0.4 },
      { freq: 261.63, duration: 0.4 },
      { freq: 392.0, duration: 0.4 },
      { freq: 392.0, duration: 0.4 },
      { freq: 440.0, duration: 0.4 },
      { freq: 440.0, duration: 0.4 },
      { freq: 392.0, duration: 0.8 },
      { freq: 349.23, duration: 0.4 },
      { freq: 349.23, duration: 0.4 },
      { freq: 329.63, duration: 0.4 },
      { freq: 329.63, duration: 0.4 },
      { freq: 293.66, duration: 0.4 },
      { freq: 293.66, duration: 0.4 },
      { freq: 261.63, duration: 0.8 },
    ],
    lyrics: [
      "A B C D E F G 🎵",
      "H I J K L M N O P 🎶",
      "Q R S, T U V 🌟",
      "W X Y and Z! 🚀",
      "Now I know my ABCs, 🎉",
      "Next time won't you sing with me! ❤️",
    ],
  },
  {
    id: 3,
    title: "Old MacDonald Had a Farm",
    artist: "Farm Animals",
    emoji: "🐮",
    duration: 35,
    color: "#10b981",
    bgGradient: "from-emerald-400 via-teal-500 to-green-600",
    notes: [
      { freq: 261.63, duration: 0.4 },
      { freq: 261.63, duration: 0.4 },
      { freq: 261.63, duration: 0.4 },
      { freq: 196.0, duration: 0.4 },
      { freq: 220.0, duration: 0.4 },
      { freq: 220.0, duration: 0.4 },
      { freq: 196.0, duration: 0.8 },
      { freq: 329.63, duration: 0.4 },
      { freq: 329.63, duration: 0.4 },
      { freq: 293.66, duration: 0.4 },
      { freq: 293.66, duration: 0.4 },
      { freq: 261.63, duration: 0.8 },
    ],
    lyrics: [
      "Old MacDonald had a farm, E-I-E-I-O! 🚜",
      "And on his farm he had a cow, E-I-E-I-O! 🐮",
      "With a moo-moo here, and a moo-moo there! 🌾",
      "Here a moo, there a moo, everywhere a moo-moo! 🐮",
      "Old MacDonald had a farm, E-I-E-I-O! 🎉",
    ],
  },
  {
    id: 4,
    title: "The Wheels on the Bus",
    artist: "City Adventures",
    emoji: "🚌",
    duration: 30,
    color: "#ef4444",
    bgGradient: "from-red-500 via-rose-600 to-pink-600",
    notes: [
      { freq: 261.63, duration: 0.4 },
      { freq: 329.63, duration: 0.4 },
      { freq: 392.0, duration: 0.4 },
      { freq: 329.63, duration: 0.4 },
      { freq: 261.63, duration: 0.4 },
      { freq: 329.63, duration: 0.4 },
      { freq: 392.0, duration: 0.8 },
      { freq: 349.23, duration: 0.4 },
      { freq: 329.63, duration: 0.4 },
      { freq: 293.66, duration: 0.4 },
      { freq: 261.63, duration: 0.8 },
    ],
    lyrics: [
      "The wheels on the bus go round and round! 🚌",
      "Round and round, round and round! 🔄",
      "The wheels on the bus go round and round, 🚌",
      "All through the town! 🌆",
      "The wipers on the bus go swish, swish, swish! 🌧️",
      "All through the town! 💖",
    ],
  },
  {
    id: 5,
    title: "Five Little Ducks",
    artist: "Pippin & Friends",
    emoji: "🐥",
    duration: 26,
    color: "#06b6d4",
    bgGradient: "from-cyan-400 via-sky-500 to-blue-600",
    notes: [
      { freq: 392.0, duration: 0.4 },
      { freq: 392.0, duration: 0.4 },
      { freq: 329.63, duration: 0.4 },
      { freq: 261.63, duration: 0.4 },
      { freq: 293.66, duration: 0.4 },
      { freq: 329.63, duration: 0.4 },
      { freq: 261.63, duration: 0.8 },
    ],
    lyrics: [
      "Five little ducks went out one day, 🐥",
      "Over the hill and far away! 🏞️",
      'Mother duck said, "Quack, quack, quack, quack!" 🦆',
      "But only four little ducks came back! 🐥",
      "Quack quack quack quack! 🎉",
    ],
  },
];

export default function KidsSongsStudio() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("sasa-favorite-songs");
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  const song = SONGS[currentSongIndex];
  const isFavorite = favorites.includes(song.id);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const noteIndexRef = useRef(0);

  // Play synthesized melody notes when playing
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Play synthesized melody
    const playNextNote = () => {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          )();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        if (!isMuted) {
          const note = song.notes[noteIndexRef.current % song.notes.length];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(note.freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + note.duration);
        }

        noteIndexRef.current += 1;
      } catch {
        // Safe fallback if audio fails
      }
    };

    playNextNote();
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= song.duration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
      playNextNote();
    }, 1000);

    timerRef.current = window.setInterval(() => {}, 1000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSongIndex, isMuted, song]);

  const handleTogglePlay = () => {
    if (!isPlaying) {
      playSuccessSound();
      setIsPlaying(true);
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { x: 0.5, y: 0.6 },
        colors: ["#f59e0b", "#8b5cf6", "#10b981", "#ef4444"],
      });
    } else {
      playPopSound();
      setIsPlaying(false);
    }
  };

  const handleNextSong = () => {
    playPopSound();
    noteIndexRef.current = 0;
    setCurrentTime(0);
    setCurrentSongIndex((prev) => (prev + 1) % SONGS.length);
  };

  const handlePrevSong = () => {
    playPopSound();
    noteIndexRef.current = 0;
    setCurrentTime(0);
    setCurrentSongIndex((prev) => (prev - 1 + SONGS.length) % SONGS.length);
  };

  const handleToggleFavorite = () => {
    const updated = isFavorite ? favorites.filter((id) => id !== song.id) : [...favorites, song.id];
    setFavorites(updated);
    localStorage.setItem("sasa-favorite-songs", JSON.stringify(updated));

    if (!isFavorite) {
      playHeartSound();
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#ff72aa", "#ffb703", "#fb8500"],
      });
    } else {
      playPopSound();
    }
  };

  const currentLyricIndex = Math.min(
    Math.floor((currentTime / song.duration) * song.lyrics.length),
    song.lyrics.length - 1,
  );

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-5 p-4 sm:p-6 bg-white/95 backdrop-blur-md rounded-3xl border-4 border-amber-200 shadow-xl my-2">
      {/* Header Banner */}
      <div
        className={`p-5 rounded-3xl bg-gradient-to-r ${song.bgGradient} text-white shadow-lg flex items-center justify-between relative overflow-hidden`}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={
              isPlaying ? { repeat: Infinity, duration: 6, ease: "linear" } : { duration: 0.5 }
            }
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 flex items-center justify-center text-4xl shadow-inner shrink-0"
          >
            {song.emoji}
          </motion.div>
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase text-amber-200 tracking-wider flex items-center gap-1">
              <Sparkles size={13} /> Sing-Along Nursery Rhymes
            </span>
            <h2 className="text-xl sm:text-2xl font-black drop-shadow-sm">{song.title}</h2>
            <p className="text-xs font-bold text-white/90">{song.artist}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleToggleFavorite}
          className={`p-3 rounded-2xl shadow-md border-2 transition cursor-pointer shrink-0 ${
            isFavorite
              ? "bg-pink-500 border-pink-300 text-white"
              : "bg-white/20 border-white/40 text-white"
          }`}
        >
          <Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
        </motion.button>
      </div>

      {/* Main Sing-Along Lyrics Stage */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-inner flex flex-col items-center justify-center text-center gap-3 relative min-h-[160px] overflow-hidden">
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-around">
            <Music className="animate-bounce text-amber-300" size={32} />
            <Sparkles className="animate-pulse text-purple-300" size={28} />
            <Disc className="animate-spin text-pink-300" size={36} />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.p
            key={currentLyricIndex}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="text-lg sm:text-2xl font-black text-amber-300 drop-shadow-md px-2"
          >
            {song.lyrics[currentLyricIndex] || song.lyrics[0]}
          </motion.p>
        </AnimatePresence>

        <p className="text-xs font-bold text-slate-400">
          Line {currentLyricIndex + 1} of {song.lyrics.length} • Keep singing! 🎤
        </p>
      </div>

      {/* Progress & Music Controls Bar */}
      <div className="flex flex-col gap-3 p-4 bg-amber-50/80 rounded-2xl border border-amber-200">
        <div className="flex items-center justify-between text-xs font-black text-amber-900">
          <span>0:{(currentTime % 60).toString().padStart(2, "0")}</span>
          <div className="flex-1 mx-3 h-3 bg-amber-200 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
              style={{ width: `${(currentTime / song.duration) * 100}%` }}
            />
          </div>
          <span>0:{song.duration}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl bg-white text-amber-800 border border-amber-300 hover:bg-amber-100 transition cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handlePrevSong}
              className="p-3 rounded-2xl bg-white text-slate-800 border-2 border-slate-200 shadow-sm hover:bg-slate-100 transition cursor-pointer"
            >
              <SkipBack size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={handleTogglePlay}
              className={`p-4 rounded-3xl text-white font-black shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                isPlaying ? "bg-amber-500 hover:bg-amber-600" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isPlaying ? (
                <Pause size={26} fill="currentColor" />
              ) : (
                <Play size={26} fill="currentColor" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleNextSong}
              className="p-3 rounded-2xl bg-white text-slate-800 border-2 border-slate-200 shadow-sm hover:bg-slate-100 transition cursor-pointer"
            >
              <SkipForward size={20} />
            </motion.button>
          </div>

          <div className="text-xs font-black text-amber-800 px-2">
            Song {currentSongIndex + 1}/{SONGS.length}
          </div>
        </div>
      </div>

      {/* Playlist Grid */}
      <div className="flex flex-col gap-2 pt-2">
        <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <Music size={16} className="text-purple-600" />
          <span>More Nursery Rhymes Playlist ({SONGS.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SONGS.map((s, idx) => {
            const active = idx === currentSongIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  playPopSound();
                  noteIndexRef.current = 0;
                  setCurrentTime(0);
                  setCurrentSongIndex(idx);
                  setIsPlaying(true);
                }}
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition cursor-pointer ${
                  active
                    ? "bg-amber-100 border-amber-400 shadow-md scale-[1.01]"
                    : "bg-white hover:bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-2xl flex items-center justify-center shrink-0">
                  {s.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">{s.title}</p>
                  <p className="text-[10px] font-bold text-slate-500">
                    {s.artist} • 0:{s.duration}
                  </p>
                </div>
                {active && isPlaying && (
                  <Sparkles size={16} className="text-amber-600 animate-spin shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
