import { useState, useRef, type MouseEvent, type ChangeEvent } from 'react';
import { Camera, Check, Image as ImageIcon, Sparkles, Upload, X, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { playPopSound, playSuccessSound } from '../lib/sound';
import './AddProfile.css';

import puppyImg from '../assets/images/puppy_avatar_1784920038818.jpg';
import penguinImg from '../assets/images/penguin_avatar_1784920051288.jpg';
import kittyImg from '../assets/images/kitty_avatar_1784920065128.jpg';
import monkeyImg from '../assets/images/monkey_avatar_1784920076703.jpg';
import koalaImg from '../assets/images/koala_avatar_1784920089417.jpg';

export type CreatedProfile = {
  id: number;
  name: string;
  age: number;
  emoji: string;
  color: string;
  avatarUrl?: string;
  isProtected?: boolean;
};

type AddProfileProps = {
  onClose: () => void;
  onCreate: (profile: CreatedProfile) => void;
};

const cartoonAvatars = [
  {
    id: 'lion',
    emoji: '🦁',
    color: '#ffb703',
    label: 'Leo Lion',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA',
  },
  {
    id: 'panda',
    emoji: '🐼',
    color: '#8ecae6',
    label: 'Poppy Panda',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ',
  },
  {
    id: 'rabbit',
    emoji: '🐰',
    color: '#ffafcc',
    label: 'Ruby Bunny',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0',
  },
  {
    id: 'puppy',
    emoji: '🐶',
    color: '#fdb813',
    label: 'Percy Puppy',
    image: puppyImg,
  },
  {
    id: 'penguin',
    emoji: '🐧',
    color: '#38bdf8',
    label: 'Pippin Penguin',
    image: penguinImg,
  },
  {
    id: 'kitty',
    emoji: '🐱',
    color: '#f472b6',
    label: 'Cleo Kitty',
    image: kittyImg,
  },
  {
    id: 'monkey',
    emoji: '🐵',
    color: '#fb923c',
    label: 'Milo Monkey',
    image: monkeyImg,
  },
  {
    id: 'koala',
    emoji: '🐨',
    color: '#a7f3d0',
    label: 'Kiki Koala',
    image: koalaImg,
  },
];

export default function AddProfile({ onClose, onCreate }: AddProfileProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState(5);
  const [avatarMode, setAvatarMode] = useState<'cartoon' | 'upload'>('cartoon');
  const [selectedAvatar, setSelectedAvatar] = useState(cartoonAvatars[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      playPopSound();
      setError('Image file is too large. Please choose an image under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        playSuccessSound();
        setCustomPhotoUrl(result);
        setAvatarMode('upload');
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = (e?: MouseEvent) => {
    const cleanName = name.trim();

    if (cleanName.length < 2) {
      playPopSound();
      setError('Please enter at least 2 characters for the name.');
      return;
    }

    playSuccessSound();

    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 45,
        spread: 80,
        origin: { x, y },
        colors: ['#ffb703', '#8ecae6', '#ffafcc', '#fb8500', '#66bb6a'],
      });
    }

    const avatarUrl =
      avatarMode === 'upload' && customPhotoUrl
        ? customPhotoUrl
        : selectedAvatar.image;

    onCreate({
      id: Date.now(),
      name: cleanName,
      age,
      emoji: avatarMode === 'upload' ? '👶' : selectedAvatar.emoji,
      color: avatarMode === 'upload' ? '#38bdf8' : selectedAvatar.color,
      avatarUrl,
    });
  };

  return (
    <main className="add-profile-page">
      <motion.div
        className="add-profile-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          playPopSound();
          onClose();
        }}
      />

      <motion.section
        className="add-profile-dialog"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <motion.button
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.85 }}
          type="button"
          className="add-profile-close"
          onClick={() => {
            playPopSound();
            onClose();
          }}
          aria-label="Close"
        >
          <X size={22} />
        </motion.button>

        <div className="add-profile-content">
          <div className="new-buddy-badge">
            <Sparkles size={18} />
            <span>New Buddy</span>
          </div>

          <h1>Add Kid Profile</h1>

          <div className="add-profile-form">
            <label className="add-profile-field">
              <span>Kid&apos;s Name</span>

              <input
                type="text"
                value={name}
                placeholder="E.G. MILO"
                maxLength={20}
                autoFocus
                onChange={(event) => {
                  setName(event.target.value);
                  setError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleCreate();
                  }
                }}
              />
            </label>

            <div className="add-profile-field">
              <span>Age ({age} years old)</span>

              <input
                type="range"
                min="2"
                max="12"
                value={age}
                className="add-profile-age-slider"
                onChange={(event) => {
                  playPopSound();
                  setAge(Number(event.target.value));
                }}
              />

              <div className="age-scale">
                <small>2 years</small>
                <small>12 years</small>
              </div>
            </div>

            {/* Profile Avatar Selection Section */}
            <div className="add-profile-field">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 text-sm">Choose Profile Photo</span>
                
                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setAvatarMode('cartoon');
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      avatarMode === 'cartoon'
                        ? 'bg-white text-sky-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ImageIcon size={13} className="inline mr-1" />
                    Cartoons
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setAvatarMode('upload');
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      avatarMode === 'upload'
                        ? 'bg-white text-sky-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Camera size={13} className="inline mr-1" />
                    Upload Photo
                  </button>
                </div>
              </div>

              {/* Cartoon Avatars Grid */}
              {avatarMode === 'cartoon' && (
                <div className="add-avatar-list">
                  {cartoonAvatars.map((avatar) => {
                    const selected =
                      avatarMode === 'cartoon' && avatar.id === selectedAvatar.id;

                    return (
                      <motion.button
                        key={avatar.id}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        type="button"
                        className={
                          selected
                            ? 'add-avatar-button selected'
                            : 'add-avatar-button'
                        }
                        onClick={() => {
                          playPopSound();
                          setSelectedAvatar(avatar);
                        }}
                        aria-label={`Select ${avatar.label}`}
                      >
                        <div
                          className="add-avatar-frame"
                          style={{
                            borderColor: selected ? avatar.color : '#e2e8f0',
                          }}
                        >
                          <img
                            src={avatar.image}
                            alt={avatar.label}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>

                        <span className="text-[11px] font-bold text-slate-600 mt-1 block truncate max-w-[70px] text-center">
                          {avatar.label}
                        </span>

                        {selected && (
                          <span className="avatar-selected-check">
                            <Check size={14} strokeWidth={4} />
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Upload Custom Photo Section */}
              {avatarMode === 'upload' && (
                <div className="bg-slate-50 border-2 border-dashed border-sky-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all hover:bg-sky-50/50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {customPhotoUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <img
                          src={customPhotoUrl}
                          alt="Kid preview"
                          className="w-24 h-24 rounded-full object-cover border-4 border-sky-400 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                        >
                          <Upload size={13} />
                          Change Photo
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playPopSound();
                            setCustomPhotoUrl(null);
                            setAvatarMode('cartoon');
                          }}
                          className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer flex flex-col items-center py-2 space-y-2"
                    >
                      <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner">
                        <Upload size={28} />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-800">
                          Click or drag kid photo here
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          PNG, JPG, or GIF (max 8MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {error && <p className="add-profile-error">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              className="create-buddy-button shadow-lg"
              onClick={handleCreate}
            >
              Create Buddy <span>🎉</span>
            </motion.button>
          </div>
        </div>
      </motion.section>
    </main>
  );
}


