import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Play, Pause, RotateCcw, Award, Music, Volume2, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { playPopSound, playSuccessSound, playHeartSound } from "../lib/sound";
import penguinImg from "../assets/images/penguin_avatar_1784920051288.jpg";

const numberItems = [
  {
    num: 1,
    word: "ONE",
    emoji: "🎈",
    name: "Balloons",
    count: 1,
    bg: "from-amber-400 to-rose-400",
  },
  {
    num: 2,
    word: "TWO",
    emoji: "🐥",
    name: "Little Ducks",
    count: 2,
    bg: "from-sky-400 to-indigo-400",
  },
  {
    num: 3,
    word: "THREE",
    emoji: "🌟",
    name: "Shining Stars",
    count: 3,
    bg: "from-yellow-400 to-amber-500",
  },
  {
    num: 4,
    word: "FOUR",
    emoji: "🍎",
    name: "Juicy Apples",
    count: 4,
    bg: "from-emerald-400 to-teal-500",
  },
  {
    num: 5,
    word: "FIVE",
    emoji: "🦋",
    name: "Butterflies",
    count: 5,
    bg: "from-pink-400 to-purple-500",
  },
  {
    num: 6,
    word: "SIX",
    emoji: "🚗",
    name: "Speedy Cars",
    count: 6,
    bg: "from-blue-400 to-cyan-500",
  },
  {
    num: 7,
    word: "SEVEN",
    emoji: "🚀",
    name: "Rockets",
    count: 7,
    bg: "from-indigo-500 to-violet-600",
  },
  {
    num: 8,
    word: "EIGHT",
    emoji: "🍦",
    name: "Ice Creams",
    count: 8,
    bg: "from-fuchsia-400 to-pink-500",
  },
  {
    num: 9,
    word: "NINE",
    emoji: "🐬",
    name: "Playful Dolphins",
    count: 9,
    bg: "from-sky-500 to-blue-600",
  },
  {
    num: 10,
    word: "TEN",
    emoji: "👑",
    name: "Golden Crowns",
    count: 10,
    bg: "from-amber-400 to-yellow-500",
  },
];

type NumbersLearningVideoProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
};

export default function NumbersLearningVideo({
  isPlaying,
  onTogglePlay,
}: NumbersLearningVideoProps) {
  const [currentNumIndex, setCurrentNumIndex] = useState(0);
  const [tappedItems, setTappedItems] = useState<number[]>([]);
  const [completedAll, setCompletedAll] = useState(false);

  const activeItem = numberItems[currentNumIndex];

  // Auto-advance counting sequence when video is playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !completedAll) {
      timer = setInterval(() => {
        setCurrentNumIndex((prev) => {
          if (prev >= numberItems.length - 1) {
            setCompletedAll(true);
            confetti({
              particleCount: 80,
              spread: 80,
              origin: { y: 0.6 },
            });
            return prev;
          }
          playPopSound();
          return prev + 1;
        });
      }, 3500); // 3.5s per number
    }
    return () => clearInterval(timer);
  }, [isPlaying, completedAll]);

  const handleItemTap = (idx: number) => {
    playHeartSound();
    if (!tappedItems.includes(idx)) {
      setTappedItems((prev) => [...prev, idx]);
    }
    if (tappedItems.length + 1 >= activeItem.count) {
      playSuccessSound();
    }
  };

  const handleSelectNumber = (index: number) => {
    playPopSound();
    setCurrentNumIndex(index);
    setTappedItems([]);
    setCompletedAll(false);
  };

  const handleRestart = () => {
    playPopSound();
    setCurrentNumIndex(0);
    setTappedItems([]);
    setCompletedAll(false);
  };

  return (
    <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-4 border-sky-300 text-white min-h-[360px] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Banner / Progress Indicator */}
      <div className="flex flex-wrap items-center justify-between z-10 gap-2">
        {/* Pippin Mascot */}
        <div className="flex min-w-0 items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-sky-200 shrink-0">
            <img src={penguinImg} alt="Pippin" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black tracking-tight block truncate text-amber-300">
              Pippin's Number School 🐧
            </span>
            <span className="text-[10px] text-sky-200 font-bold">
              {completedAll ? "Yay! You counted to 10!" : `Counting Number ${activeItem.num}`}
            </span>
          </div>
        </div>

        {/* Quick Number Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full sm:max-w-xs scrollbar-none py-1">
          {numberItems.map((item, idx) => (
            <button
              key={item.num}
              type="button"
              onClick={() => handleSelectNumber(idx)}
              className={`w-11 h-11 sm:w-9 sm:h-9 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition cursor-pointer shrink-0 ${
                currentNumIndex === idx
                  ? "bg-amber-400 text-amber-950 scale-110 shadow-lg shadow-amber-400/40 ring-2 ring-white"
                  : "bg-white/15 text-white hover:bg-white/30"
              }`}
            >
              {item.num}
            </button>
          ))}
        </div>
      </div>

      {/* Main Animated Scene */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem.num}
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -15 }}
          transition={{ duration: 0.4 }}
          className="my-auto py-6 flex flex-col items-center text-center relative z-10"
        >
          {completedAll ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="w-20 h-20 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-4xl shadow-xl animate-bounce">
                👑
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300">
                GREAT JOB! YOU LEARNED 1 TO 10!
              </h3>
              <p className="text-xs sm:text-sm text-sky-100 font-medium max-w-sm">
                Pippin the Penguin is so proud of you! Tap play or restart to count again!
              </p>

              <button
                type="button"
                onClick={handleRestart}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Count Again</span>
              </button>
            </motion.div>
          ) : (
            <>
              {/* Number Card Display */}
              <div className="flex min-w-0 flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-4">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className={`w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr ${activeItem.bg} border-4 border-white/80 shadow-2xl flex flex-col items-center justify-center text-white relative`}
                >
                  <span className="text-6xl sm:text-7xl font-black drop-shadow-lg leading-none">
                    {activeItem.num}
                  </span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-widest mt-1 opacity-90">
                    {activeItem.word}
                  </span>
                </motion.div>

                <div className="text-center sm:text-left">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-amber-300">
                    {activeItem.count} {activeItem.name}!
                  </h3>
                  <p className="text-xs sm:text-sm text-sky-200 font-medium mt-1">
                    Tap the {activeItem.name.toLowerCase()} below to count together!
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full mt-2 text-xs font-bold text-amber-200">
                    <Sparkles size={14} />
                    <span>
                      Counted: {tappedItems.length} / {activeItem.count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Emoji Items to Count */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-lg mt-2">
                {Array.from({ length: activeItem.count }).map((_, idx) => {
                  const isTapped = tappedItems.includes(idx);
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.25, rotate: 8 }}
                      whileTap={{ scale: 0.85 }}
                      type="button"
                      onClick={() => handleItemTap(idx)}
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 transition cursor-pointer relative ${
                        isTapped
                          ? "bg-amber-300/30 border-amber-400 scale-110 shadow-amber-400/20"
                          : "bg-white/10 border-white/20 hover:bg-white/20"
                      }`}
                    >
                      {activeItem.emoji}
                      {isTapped && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-400 text-amber-950 rounded-full text-[10px] font-black flex items-center justify-center border border-white">
                          ✓
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between z-10 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? "Pause Counting" : "Play Auto-Count"}</span>
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Restart counting from 1"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="text-[11px] font-bold text-sky-200 hidden sm:block">
          Interactive Numbers Video · 1 to 10
        </div>
      </div>
    </div>
  );
}
