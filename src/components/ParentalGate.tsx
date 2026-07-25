import { useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { playPopSound, playSuccessSound } from '../lib/sound';
import { Lock, Calculator, Eye, EyeOff, ShieldCheck, Delete, Sparkles } from 'lucide-react';
import penguinImg from '../assets/images/penguin_avatar_1784920051288.jpg';

type ParentalGateProps = {
  onSuccess: () => void;
  onCancel: () => void;
  parentPin: string;
  requireParentPin: boolean;
};

// Generate random simple math question
function generateMathQuestion() {
  const num1 = Math.floor(Math.random() * 8) + 5; // 5-12
  const num2 = Math.floor(Math.random() * 8) + 4; // 4-11
  const correctAnswer = num1 + num2;
  
  // Wrong answers
  const offset1 = Math.random() > 0.5 ? 2 : -2;
  const offset2 = Math.random() > 0.5 ? 3 : -1;
  const wrong1 = correctAnswer + offset1;
  const wrong2 = correctAnswer + offset2;

  const choices = [correctAnswer, wrong1, wrong2].sort(() => Math.random() - 0.5);

  return { num1, num2, correctAnswer, choices };
}

export default function ParentalGate({
  onSuccess,
  onCancel,
  parentPin,
  requireParentPin,
}: ParentalGateProps) {
  const [gateMode, setGateMode] = useState<'pin' | 'math'>(
    requireParentPin ? 'pin' : 'math'
  );
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [mathProblem, setMathProblem] = useState(generateMathQuestion);

  const triggerSuccess = (e?: MouseEvent) => {
    playSuccessSound();

    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 45,
        spread: 90,
        origin: { x, y },
        colors: ['#3a86ff', '#8338ec', '#ff006e', '#fb5607', '#ffbe0b'],
      });
    }

    setTimeout(() => {
      onSuccess();
    }, 400);
  };

  const handleKeypadPress = (digit: string) => {
    playPopSound();
    setError('');
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin === parentPin) {
        triggerSuccess();
      }
    }
  };

  const handleKeypadDelete = () => {
    playPopSound();
    setError('');
    setPin((prev) => prev.slice(0, -1));
  };

  const submitPin = (e?: MouseEvent) => {
    if (pin === parentPin) {
      triggerSuccess(e);
    } else {
      playPopSound();
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleMathAnswer = (answer: number, e: MouseEvent) => {
    if (answer === mathProblem.correctAnswer) {
      triggerSuccess(e);
    } else {
      playPopSound();
      setError('That answer is incorrect. Try another one!');
      setMathProblem(generateMathQuestion());
    }
  };

  return (
    <motion.main
      className="parental-gate-page relative min-h-screen w-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-500 overflow-hidden"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Floating Elements */}
      <div className="gate-floating gate-star-one pointer-events-none opacity-80">
        <StarIcon />
      </div>
      <div className="gate-floating gate-star-two pointer-events-none opacity-80">
        <StarIcon />
      </div>
      <div className="gate-floating gate-bubble-one pointer-events-none" />
      <div className="gate-floating gate-bubble-two pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-sm mb-3 shadow-sm border border-white/30">
          <ShieldCheck size={18} className="text-amber-300" /> Grown-Ups Only
        </div>

        <h1 className="parental-gate-title text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
          Parental Gate
        </h1>
        <p className="mt-1 text-lg sm:text-xl font-bold text-sky-100 drop-shadow">
          Verify to access parent settings & controls
        </p>
      </header>

      {/* Mode Toggle Switch */}
      <div className="relative z-10 flex items-center bg-sky-900/20 p-1.5 rounded-2xl backdrop-blur-md border border-white/30 shadow-inner mb-4">
        <button
          type="button"
          onClick={() => {
            playPopSound();
            setGateMode('pin');
            setError('');
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all ${
            gateMode === 'pin'
              ? 'bg-white text-sky-800 shadow-md scale-105'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <Lock size={16} /> Parent PIN
        </button>

        <button
          type="button"
          onClick={() => {
            playPopSound();
            setGateMode('math');
            setError('');
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all ${
            gateMode === 'math'
              ? 'bg-white text-sky-800 shadow-md scale-105'
              : 'text-white hover:bg-white/10'
          }`}
        >
          <Calculator size={16} /> Math Challenge
        </button>
      </div>

      {/* Content Area */}
      <section className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center my-auto">
        {/* Animated Cute Penguin Cartoon Mascot */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          className="relative z-10 -mb-6 flex flex-col items-center pointer-events-none"
        >
          {/* Speech Bubble */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-2 bg-white text-sky-900 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg border-2 border-sky-200 flex items-center gap-1.5"
          >
            <span className="text-sm">🐧</span>
            <span>Pippin the Penguin is guarding the gate!</span>
          </motion.div>

          {/* Penguin Avatar Frame */}
          <div className="relative w-36 h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-b from-sky-200 to-indigo-300 ring-4 ring-sky-300/50">
            <img
              src={penguinImg}
              alt="Pippin the Cute Penguin Mascot"
              className="w-full h-full object-cover scale-105"
            />
            
            {/* Security Badge Ribbon */}
            <div className="absolute bottom-1 right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full border-2 border-white shadow-md">
              <ShieldCheck size={16} className="stroke-[2.5]" />
            </div>
          </div>
        </motion.div>

        {/* PIN MODE */}
        {gateMode === 'pin' ? (
          <motion.div
            key="pin-box"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="relative z-10 w-full bg-white p-6 sm:p-8 text-center shadow-2xl rounded-3xl border-4 border-sky-100"
          >
            <h2 className="text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
              <Lock className="text-sky-500" size={22} /> Enter Parent PIN
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
              Enter your 4 to 6 digit private PIN
            </p>

            {/* PIN Display Dots */}
            <div className="relative flex items-center justify-center gap-3 my-4">
              <div className="flex items-center gap-2.5 bg-slate-100 px-6 py-3 rounded-2xl border-2 border-slate-200">
                {Array.from({ length: Math.max(4, pin.length) }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-4 w-4 rounded-full transition-all ${
                      i < pin.length
                        ? 'bg-sky-500 scale-110 shadow-sm'
                        : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-slate-400 hover:text-sky-600 p-2"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {showPin && pin && (
              <p className="text-lg font-mono font-bold text-sky-600 tracking-widest my-1">
                {pin}
              </p>
            )}

            {/* Touch Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mt-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <motion.button
                  key={digit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="h-12 rounded-2xl bg-sky-50 hover:bg-sky-100 font-black text-xl text-sky-800 shadow-sm border border-sky-100 flex items-center justify-center"
                >
                  {digit}
                </motion.button>
              ))}

              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => {
                  playPopSound();
                  setPin('');
                  setError('');
                }}
                className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-600 flex items-center justify-center"
              >
                Clear
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-12 rounded-2xl bg-sky-50 hover:bg-sky-100 font-black text-xl text-sky-800 shadow-sm border border-sky-100 flex items-center justify-center"
              >
                0
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleKeypadDelete}
                className="h-12 rounded-2xl bg-rose-50 hover:bg-rose-100 font-bold text-rose-600 flex items-center justify-center"
              >
                <Delete size={20} />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              className="mt-5 w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black rounded-2xl shadow-lg transition-all text-base"
              onClick={submitPin}
            >
              Unlock Dashboard
            </motion.button>
          </motion.div>
        ) : (
          /* MATH CHALLENGE MODE */
          <motion.div
            key="math-box"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="relative z-10 w-full bg-white p-6 sm:p-8 text-center shadow-2xl rounded-3xl border-4 border-sky-100"
          >
            <p className="text-sm font-extrabold text-sky-600 uppercase tracking-wider mb-2">
              Solve to Prove You&apos;re an Adult
            </p>

            <div className="bg-sky-50 rounded-2xl p-6 border-2 border-sky-100 my-2 shadow-inner">
              <div className="text-5xl font-black text-slate-800 tracking-wider flex items-center justify-center gap-3">
                <span className="text-sky-600">{mathProblem.num1}</span>
                <span className="text-amber-500">+</span>
                <span className="text-sky-600">{mathProblem.num2}</span>
                <span className="text-slate-400">=</span>
                <span className="text-purple-600 font-extrabold">?</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {mathProblem.choices.map((choice) => (
                <motion.button
                  key={choice}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  className="py-4 rounded-2xl bg-gradient-to-b from-sky-100 to-sky-200 hover:from-sky-200 hover:to-sky-300 border-2 border-sky-300 shadow-md text-3xl font-black text-sky-900 transition-all"
                  onClick={(e) => handleMathAnswer(choice, e)}
                >
                  {choice}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 font-black text-rose-600 bg-white/95 border-2 border-rose-200 px-5 py-2.5 rounded-full shadow-lg text-sm"
            >
              ⚠️ {error}
            </motion.p>
          )}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pb-6 pt-4">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          type="button"
          className="flex items-center gap-2 rounded-full border-2 border-white/40 bg-white/80 hover:bg-white px-8 py-3 text-lg font-black text-sky-800 shadow-lg backdrop-blur-md transition-all"
          onClick={() => {
            playPopSound();
            onCancel();
          }}
        >
          <GearIcon />
          Cancel & Return
        </motion.button>
      </footer>
    </motion.main>
  );
}

function StarIcon() {
  return (
    <svg fill="currentColor" height="24" width="24" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.66.07 1l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z" />
    </svg>
  );
}
