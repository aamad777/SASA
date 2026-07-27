import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Sparkles, RotateCcw, Award, Star, Gamepad2, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { playPopSound, playSuccessSound, playHeartSound } from "../lib/sound";
import penguinImg from "../assets/images/penguin_avatar_1784920051288.jpg";

type MemoryCard = {
  id: number;
  value: string | number;
  matchKey: number;
  type: "num" | "items";
  isFlipped: boolean;
  isMatched: boolean;
};

const CARDS_DATA = [
  { num: 1, label: "1", items: "🎈" },
  { num: 2, label: "2", items: "🐥🐥" },
  { num: 3, label: "3", items: "🌟🌟🌟" },
  { num: 4, label: "4", items: "🍎🍎🍎🍎" },
  { num: 5, label: "5", items: "🦋🦋🦋🦋🦋" },
  { num: 6, label: "6", items: "🚗🚗🚗🚗🚗🚗" },
];

export default function KidsGamesStudio() {
  const [activeGame, setActiveGame] = useState<"memory" | "quiz">("memory");
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  // Quiz game state
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  const quizQuestions = [
    {
      question: "Which number comes after 4?",
      options: ["3", "5", "7"],
      answer: "5",
      emoji: "🔢",
    },
    {
      question: "How many stars are here? 🌟 🌟 🌟",
      options: ["2", "3", "4"],
      answer: "3",
      emoji: "⭐",
    },
    {
      question: "Which animal swims in the ice with Pippin? 🐧",
      options: ["Penguin", "Monkey", "Koala"],
      answer: "Penguin",
      emoji: "❄️",
    },
    {
      question: "Count the apples: 🍎 🍎 🍎 🍎 🍎",
      options: ["5", "6", "4"],
      answer: "5",
      emoji: "🍎",
    },
  ];

  const initMemoryGame = () => {
    playPopSound();
    const newCards: MemoryCard[] = [];
    let idCounter = 1;

    CARDS_DATA.slice(0, 4).forEach((item) => {
      // Card 1: Number label
      newCards.push({
        id: idCounter++,
        value: item.label,
        matchKey: item.num,
        type: "num",
        isFlipped: false,
        isMatched: false,
      });
      // Card 2: Items emoji
      newCards.push({
        id: idCounter++,
        value: item.items,
        matchKey: item.num,
        type: "items",
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = [...newCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setScore(0);
    setGameWon(false);
  };

  useEffect(() => {
    initMemoryGame();
  }, []);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;
    const target = cards.find((c) => c.id === cardId);
    if (!target || target.isFlipped || target.isMatched) return;

    playPopSound();

    // Flip target card
    const updated = cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c));
    setCards(updated);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const firstCard = updated.find((c) => c.id === newFlipped[0])!;
      const secondCard = updated.find((c) => c.id === newFlipped[1])!;

      if (firstCard.matchKey === secondCard.matchKey) {
        // MATCH!
        playSuccessSound();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.matchKey === firstCard.matchKey ? { ...c, isMatched: true } : c)),
          );
          setFlippedCards([]);
          setScore((s) => s + 10);
          setStreak((st) => st + 1);

          // Check if all matched
          const remaining = updated.filter(
            (c) => !c.isMatched && c.matchKey !== firstCard.matchKey,
          );
          if (remaining.length === 0) {
            setGameWon(true);
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          }
        }, 500);
      } else {
        // NO MATCH
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === newFlipped[0] || c.id === newFlipped[1] ? { ...c, isFlipped: false } : c,
            ),
          );
          setFlippedCards([]);
          setStreak(0);
        }, 1000);
      }
    }
  };

  const handleQuizAnswer = (option: string) => {
    const currentQ = quizQuestions[quizQuestionIndex];
    if (option === currentQ.answer) {
      playSuccessSound();
      setQuizScore((s) => s + 1);
      confetti({ particleCount: 30, spread: 50 });
    } else {
      playPopSound();
    }

    if (quizQuestionIndex + 1 < quizQuestions.length) {
      setQuizQuestionIndex((prev) => prev + 1);
    } else {
      setGameWon(true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 p-4 sm:p-6 bg-gradient-to-b from-indigo-900 via-sky-900 to-slate-900 text-white rounded-3xl border-4 border-sky-400 shadow-2xl">
      {/* Game Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-300 bg-sky-200">
            <img src={penguinImg} alt="Pippin" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-black text-amber-300 tracking-tight flex items-center gap-1.5">
              <span>Pippin's Fun Arcade</span>
              <Gamepad2 className="text-sky-300" size={18} />
            </h2>
            <p className="text-xs font-bold text-sky-200">
              Play mini-games, earn stars & learn numbers!
            </p>
          </div>
        </div>

        {/* Game Mode Switcher */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setActiveGame("memory");
              setGameWon(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
              activeGame === "memory"
                ? "bg-amber-400 text-amber-950 shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            🧩 Number Match
          </button>
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setActiveGame("quiz");
              setQuizQuestionIndex(0);
              setQuizScore(0);
              setGameWon(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
              activeGame === "quiz"
                ? "bg-amber-400 text-amber-950 shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            ⭐ Kids Quiz
          </button>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="min-h-[360px] flex flex-col justify-center items-center py-6 relative">
        {gameWon ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-6 bg-white/15 backdrop-blur-md rounded-3xl border-2 border-amber-300 max-w-md w-full shadow-2xl"
          >
            <div className="w-20 h-20 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg animate-bounce">
              👑
            </div>
            <h3 className="text-2xl font-black text-amber-300">YOU ARE A WINNER!</h3>
            <p className="text-xs text-sky-100 mt-1 font-medium">
              Pippin is super proud of you! You earned 3 Gold Stars!
            </p>
            <div className="flex items-center justify-center gap-2 my-4 text-3xl">⭐ ⭐ ⭐</div>

            <button
              type="button"
              onClick={() => {
                if (activeGame === "memory") initMemoryGame();
                else {
                  setQuizQuestionIndex(0);
                  setQuizScore(0);
                  setGameWon(false);
                }
              }}
              className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-lg transition inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} />
              <span>Play Again</span>
            </button>
          </motion.div>
        ) : activeGame === "memory" ? (
          <div className="w-full flex flex-col items-center">
            {/* Memory Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-xl w-full">
              {cards.map((card) => {
                const showContent = card.isFlipped || card.isMatched;
                return (
                  <motion.button
                    key={card.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    type="button"
                    onClick={() => handleCardClick(card.id)}
                    className={`h-28 sm:h-32 rounded-2xl border-4 font-black text-2xl sm:text-3xl flex flex-col items-center justify-center transition shadow-xl cursor-pointer ${
                      card.isMatched
                        ? "bg-emerald-500/30 border-emerald-400 text-emerald-200 opacity-60"
                        : showContent
                          ? "bg-amber-400 text-amber-950 border-white"
                          : "bg-sky-700 hover:bg-sky-600 border-sky-400 text-sky-200"
                    }`}
                  >
                    {showContent ? (
                      <span className="p-2 text-center leading-tight break-all max-w-full">
                        {card.value}
                      </span>
                    ) : (
                      <span className="text-3xl opacity-80">❓</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={initMemoryGame}
              className="mt-6 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sky-200 font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Shuffle Cards</span>
            </button>
          </div>
        ) : (
          /* Quiz Game */
          <div className="max-w-md w-full bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center flex flex-col items-center shadow-xl">
            <span className="text-4xl mb-2">{quizQuestions[quizQuestionIndex].emoji}</span>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Question {quizQuestionIndex + 1} of {quizQuestions.length}
            </span>
            <h3 className="text-xl font-black text-white my-3">
              {quizQuestions[quizQuestionIndex].question}
            </h3>

            <div className="flex flex-col gap-2.5 w-full mt-2">
              {quizQuestions[quizQuestionIndex].options.map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleQuizAnswer(option)}
                  className="w-full py-3 px-4 rounded-2xl bg-white/20 hover:bg-amber-400 hover:text-amber-950 font-black text-base transition shadow-md border border-white/10 cursor-pointer"
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
