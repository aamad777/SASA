import { useState, type MouseEvent } from "react";
import { BookOpen, Camera, LogIn, Plus, Video } from "lucide-react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { playPopSound, playSuccessSound } from "../lib/sound";
import BrandMark from "./layout/BrandMark";
import ProfileAvatar from "./layout/ProfileAvatar";

type CustomProfile = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  age?: number;
  avatarUrl?: string;
  image?: string;
};

type ProfileSelectionProps = {
  customProfiles: CustomProfile[];
  onSelectProfile: (name: string, emoji: string, color: string, id: number, image?: string) => void;
  onAddProfile: () => void;
  /** Called just before navigating to the Parent Login screen — lets the
   * caller clear guest/kid session state so it doesn't linger once a parent
   * signs back in. */
  onLogin?: () => void;
};

const profiles = [
  {
    id: 1,
    name: "Leo",
    emoji: "🦁",
    color: "#ffa62b",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA",
  },
  {
    id: 2,
    name: "Poppy",
    emoji: "🐼",
    color: "#95d5b2",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ",
  },
  {
    id: 3,
    name: "Ruby",
    emoji: "🐰",
    color: "#ff8fa3",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0",
  },
];

/** Standalone pages a guest can browse without picking a kid profile. */
const GUEST_LINKS = [
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/photos", label: "Photos", icon: Camera },
  { href: "/learn", label: "Play & learn", icon: BookOpen },
];

export default function ProfileSelection({
  customProfiles,
  onSelectProfile,
  onAddProfile,
  onLogin,
}: ProfileSelectionProps) {
  const [selectingId, setSelectingId] = useState<number | string | null>(null);

  const handleProfileClick = (
    name: string,
    emoji: string,
    color: string,
    id: number | string,
    image: string | undefined,
    event: MouseEvent,
  ) => {
    if (selectingId !== null) return; // Prevent double taps during transition

    setSelectingId(id);
    playSuccessSound();

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 45,
      spread: 85,
      origin: { x, y },
      colors: ["#ff8fa3", "#ffa62b", "#ffde59", "#95d5b2", "#8ecae6"],
    });

    const numericId = typeof id === "number" ? id : Number(id) || 0;

    setTimeout(() => {
      onSelectProfile(name, emoji, color, numericId, image);
    }, 420);
  };

  return (
    <main className="sasa-auth-page">
      <header className="sasa-auth-topbar">
        <span className="sasa-brand" aria-hidden="true">
          <BrandMark />
          <span className="sasa-brand-word">
            SARA<sup>kids</sup>
          </span>
        </span>

        <div className="sasa-auth-topbar-actions">
          <a
            href="/?screen=parent-login"
            className="sasa-btn"
            onClick={() => {
              playPopSound();
              onLogin?.();
            }}
          >
            <LogIn size={18} />
            Parent login
          </a>

        </div>
      </header>

      <section className="sasa-auth-body">
        <p className="sasa-auth-eyebrow">Guest mode</p>
        <h1 className="sasa-auth-title">Who&apos;s watching?</h1>
        <p className="sasa-auth-sub">
          Pick a profile to start. A parent account keeps saved items and shared media in sync.
        </p>

        <div className="sasa-profile-grid">
          {[...profiles, ...customProfiles].map((profile) => {
            const image =
              "image" in profile && profile.image
                ? profile.image
                : "avatarUrl" in profile
                  ? profile.avatarUrl
                  : undefined;
            const isSelecting = selectingId === profile.id;

            return (
              <motion.button
                key={`${profile.name}-${profile.id}`}
                type="button"
                className={isSelecting ? "sasa-profile-card is-selecting" : "sasa-profile-card"}
                animate={selectingId !== null && !isSelecting ? { opacity: 0.4 } : { opacity: 1 }}
                transition={{ duration: 0.25 }}
                onClick={(event) =>
                  handleProfileClick(
                    profile.name,
                    profile.emoji,
                    profile.color,
                    profile.id,
                    image,
                    event,
                  )
                }
              >
                <ProfileAvatar
                  className="sasa-profile-avatar"
                  style={{ background: profile.color }}
                  image={image}
                  fallback={profile.emoji}
                />

                <span className="sasa-profile-name">{profile.name}</span>

                <span className="sasa-profile-meta">
                  {"age" in profile && profile.age ? `Age ${profile.age}` : "Kid profile"}
                </span>
              </motion.button>
            );
          })}

          <button
            type="button"
            className="sasa-profile-card is-add"
            onClick={() => {
              if (selectingId !== null) return;
              playPopSound();
              onAddProfile();
            }}
          >
            <Plus size={30} />
            <span className="sasa-profile-name">Add profile</span>
          </button>
        </div>

        <nav className="sasa-guest-links" aria-label="Browse without a profile">
          <h2 className="sasa-watch-block-title">Browse without a profile</h2>
          <div className="sasa-hscroll">
            {GUEST_LINKS.map((link) => {
              const Icon = link.icon;

              return (
                <a key={link.href} href={link.href} className="sasa-chip" onClick={playPopSound}>
                  <Icon size={16} />
                  {link.label}
                </a>
              );
            })}
          </div>
        </nav>
      </section>
    </main>
  );
}
