import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  X,
  Sparkles,
  Send,
  CheckCircle2,
  Play,
  Pause,
  Heart,
  Radio,
  PartyPopper,
} from "lucide-react";
import confetti from "canvas-confetti";
import { playPopSound, playSuccessSound, playHeartSound } from "../lib/sound";

export type WatchPartyBuddy = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  avatarUrl?: string;
  image?: string;
};

type WatchPartyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentProfileName: string;
  currentProfileEmoji: string;
  currentProfileAvatarUrl?: string;
  availableBuddies: WatchPartyBuddy[];
  activeBuddy: WatchPartyBuddy | null;
  onStartWatchParty: (buddy: WatchPartyBuddy) => void;
  onEndWatchParty: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  videoTitle: string;
};

export default function WatchPartyModal({
  isOpen,
  onClose,
  currentProfileName,
  currentProfileEmoji,
  currentProfileAvatarUrl,
  availableBuddies,
  activeBuddy,
  onStartWatchParty,
  onEndWatchParty,
  isPlaying,
  onTogglePlay,
  videoTitle,
}: WatchPartyModalProps) {
  const [selectedBuddy, setSelectedBuddy] = useState<WatchPartyBuddy | null>(
    activeBuddy || (availableBuddies.length > 0 ? availableBuddies[0] : null),
  );
  const [inviteSent, setInviteSent] = useState(false);

  if (!isOpen) return null;

  const handleSendInvite = (buddy: WatchPartyBuddy) => {
    playSuccessSound();
    setSelectedBuddy(buddy);
    setInviteSent(true);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ff72aa", "#ffd166", "#06d6a0", "#118ab2", "#38bdf8"],
    });

    setTimeout(() => {
      onStartWatchParty(buddy);
      setInviteSent(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border-4 border-sky-200 relative overflow-hidden"
        >
          {/* Header decorative background */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 opacity-90 -z-0" />

          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 pt-2 text-center">
            {/* Title Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-sky-700 shadow-md font-black text-xs uppercase tracking-wider mb-2">
              <PartyPopper size={14} className="text-amber-500" />
              Watch Party Together
            </div>

            <h2 className="text-2xl font-black text-white drop-shadow-md">
              {activeBuddy ? "Synced Watch Party" : "Invite a Buddy to Watch!"}
            </h2>
            <p className="text-xs text-sky-100 font-medium mt-0.5 max-w-xs mx-auto truncate">
              "{videoTitle}"
            </p>

            {/* Active Watch Party View */}
            {activeBuddy ? (
              <div className="mt-6 space-y-5">
                {/* Dual Connected Avatars */}
                <div className="flex items-center justify-center gap-4 bg-sky-50/80 p-4 rounded-2xl border border-sky-100">
                  {/* Current Profile */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-sky-400 shadow-md overflow-hidden bg-amber-100 flex items-center justify-center text-3xl">
                      {currentProfileAvatarUrl ? (
                        <img
                          src={currentProfileAvatarUrl}
                          alt={currentProfileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        currentProfileEmoji
                      )}
                    </div>
                    <span className="text-xs font-black text-slate-800 mt-1">
                      {currentProfileName}
                    </span>
                  </div>

                  {/* Sync Pulsing Beam */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-purple-500 text-white flex items-center justify-center shadow-lg animate-pulse">
                      <Radio size={20} />
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mt-1">
                      SYNCED
                    </span>
                  </div>

                  {/* Active Buddy */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-full border-4 border-purple-400 shadow-md overflow-hidden flex items-center justify-center text-3xl"
                      style={{ backgroundColor: activeBuddy.color || "#e0e7ff" }}
                    >
                      {activeBuddy.avatarUrl || activeBuddy.image ? (
                        <img
                          src={activeBuddy.avatarUrl || activeBuddy.image}
                          alt={activeBuddy.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        activeBuddy.emoji
                      )}
                    </div>
                    <span className="text-xs font-black text-slate-800 mt-1">
                      {activeBuddy.name}
                    </span>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-xs font-bold text-emerald-900">
                      {isPlaying ? "Video playing synchronously" : "Playback paused for both"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      onTogglePlay();
                    }}
                    className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>

                {/* End Watch Party Action */}
                <button
                  type="button"
                  onClick={() => {
                    playPopSound();
                    onEndWatchParty();
                    onClose();
                  }}
                  className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-black rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  End Watch Party
                </button>
              </div>
            ) : (
              /* Invite Buddy Selection List */
              <div className="mt-6 space-y-4">
                <p className="text-xs font-bold text-slate-500 text-left">
                  Select a profile to invite to watch together:
                </p>

                {inviteSent ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-8 bg-sky-50 rounded-2xl border border-sky-200 flex flex-col items-center space-y-2"
                  >
                    <CheckCircle2 size={48} className="text-emerald-500" />
                    <h3 className="text-lg font-black text-slate-800">Invitation Sent!</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Joining watch party with {selectedBuddy?.name}...
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {availableBuddies.map((buddy) => (
                      <motion.button
                        key={buddy.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => handleSendInvite(buddy)}
                        className="flex items-center justify-between p-3 rounded-2xl border-2 border-slate-100 hover:border-sky-300 bg-slate-50 hover:bg-sky-50/50 transition group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-2xl shrink-0"
                            style={{ backgroundColor: buddy.color || "#bae6fd" }}
                          >
                            {buddy.avatarUrl || buddy.image ? (
                              <img
                                src={buddy.avatarUrl || buddy.image}
                                alt={buddy.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              buddy.emoji
                            )}
                          </div>

                          <div>
                            <span className="font-extrabold text-sm text-slate-800 block">
                              {buddy.name}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              Ready to watch
                            </span>
                          </div>
                        </div>

                        <span className="px-3 py-1.5 rounded-xl bg-sky-500 group-hover:bg-sky-600 text-white font-black text-xs shadow-sm flex items-center gap-1 transition">
                          <Send size={12} />
                          Invite
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
