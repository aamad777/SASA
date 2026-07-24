import { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import './AddProfile.css';

export type CreatedProfile = {
  id: number;
  name: string;
  age: number;
  emoji: string;
  color: string;
  isProtected?: boolean;
};

type AddProfileProps = {
  onClose: () => void;
  onCreate: (profile: CreatedProfile) => void;
};

const avatars = [
  { id: 'lion', emoji: '🦁', color: '#ffb703', label: 'Lion' },
  { id: 'panda', emoji: '🐼', color: '#8ecae6', label: 'Panda' },
  { id: 'rabbit', emoji: '🐰', color: '#ffafcc', label: 'Rabbit' },
  { id: 'bear', emoji: '🐻', color: '#c89f7a', label: 'Bear' },
  { id: 'fox', emoji: '🦊', color: '#fb8500', label: 'Fox' },
];

export default function AddProfile({
  onClose,
  onCreate,
}: AddProfileProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState(5);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [error, setError] = useState('');

  const handleCreate = () => {
    const cleanName = name.trim();

    if (cleanName.length < 2) {
      setError('Please enter at least 2 characters.');
      return;
    }

    onCreate({
      id: Date.now(),
      name: cleanName,
      age,
      emoji: selectedAvatar.emoji,
      color: selectedAvatar.color,
    });
  };

  return (
    <main className="add-profile-page">
      <div className="add-profile-backdrop" />

      <section className="add-profile-dialog">
        <button
          type="button"
          className="add-profile-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>

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
                onChange={(event) =>
                  setAge(Number(event.target.value))
                }
              />

              <div className="age-scale">
                <small>2 years</small>
                <small>12 years</small>
              </div>
            </div>

            <div className="add-profile-field">
              <span>Choose Avatar</span>

              <div className="add-avatar-list">
                {avatars.map((avatar) => {
                  const selected =
                    avatar.id === selectedAvatar.id;

                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      className={
                        selected
                          ? 'add-avatar-button selected'
                          : 'add-avatar-button'
                      }
                      onClick={() => setSelectedAvatar(avatar)}
                      aria-label={`Select ${avatar.label}`}
                    >
                      <span
                        className="add-avatar-emoji"
                        style={{
                          backgroundColor: avatar.color,
                        }}
                      >
                        {avatar.emoji}
                      </span>

                      {selected && (
                        <span className="avatar-selected-check">
                          <Check size={14} strokeWidth={4} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="add-profile-error">{error}</p>
            )}

            <button
              type="button"
              className="create-buddy-button"
              onClick={handleCreate}
            >
              Create Buddy <span>🎉</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
