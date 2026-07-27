import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, UserPlus, X, ArrowRight } from "lucide-react";
import { playPopSound, playSuccessSound } from "../lib/sound";

type FreeAccountBannerProps = {
  onCreateAccount: () => void;
  className?: string;
};

export default function FreeAccountBanner({
  onCreateAccount,
  className = "",
}: FreeAccountBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className={`w-full bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border-b border-sky-200/80 px-3.5 py-2.5 sm:px-6 relative shadow-sm z-40 ${className}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left info area */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-amber-400 text-amber-950 rounded-2xl shadow-sm shrink-0 flex items-center justify-center">
              <Sparkles size={18} className="stroke-[2.5]" />
            </div>

            <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-tight">
                  Free Guest Account
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300 text-[10px] font-black tracking-wider uppercase">
                  FREE
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate sm:whitespace-normal">
                Create a free account to save custom profiles, time limits, & watch history!
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                playSuccessSound();
                onCreateAccount();
              }}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black shadow-md hover:shadow-sky-500/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <UserPlus size={14} />
              <span className="hidden xs:inline sm:inline">Create Free Account</span>
              <span className="xs:hidden sm:hidden">Sign Up</span>
              <ArrowRight size={13} className="opacity-80" />
            </button>

            <button
              type="button"
              onClick={() => {
                playPopSound();
                setDismissed(true);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
