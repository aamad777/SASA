import type { ReactNode } from 'react';

type CustomProfile = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  age?: number;
};

type ProfileSelectionProps = {
  customProfiles: CustomProfile[];
  onSelectProfile: (
    name: string,
    emoji: string,
    color: string,
    id: number,
  ) => void;
  onOpenParentalControls: () => void;
  onAddProfile: () => void;
};

const profiles = [
  {
    id: 1,
    name: 'Leo',
    emoji: '🦁',
    color: '#ffa62b',
    background: 'bg-orange-100',
    nameColor: 'text-[#ffa62b]',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBXKmBbTEschT2fVlXzamCeETx0M3rctPouvJQ6jyWboczUe-WXt302CDJtMx5T_L9-zEaxhM_vxlITgSZt9_ApPXqHF9Vx39tEHo5gDXRFuGHRZ_rrEz6fOH5KlalMKiv82rUKm_4IRONsQ-wF064xYk_0ZIzAijLaovdE2H-qhe86S9qU1K70VcVvqOQ7GxR9ujHTTCg5GPHGI4VYoTLTPpwFitUSQ7JP8kSUjWRij6OOEIBXNKbLcaKkBrH4y-J_4PM1zmklxnA',
  },
  {
    id: 2,
    name: 'Poppy',
    emoji: '🐼',
    color: '#95d5b2',
    background: 'bg-green-100',
    nameColor: 'text-white',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCONd4umMhgrulZ5f-ZZt2Uuy9-ach-KvWVrVKGmgiL58eNixQ0RjTvy4dEfDeZ1J7AjEKiLqrUKdXuuqdwFo-IF87mvFkdWZwpDs4hfs2FGU19CtmN6-k04UQXX4ibVERtYQS4ejdOmmIu6QKvrqVw2lGKdJHCiNNzzQGpdSP3Zir5sHO0B2Dt0_hf7PLpsbxeTuzJbU0-bxuCDZ2egbgYTHvpvt7p7Nl-GMz8P2cZlpqKbDqaybqBQFAYBqN6KlDGvQr8Yd7diDQ',
  },
  {
    id: 3,
    name: 'Ruby',
    emoji: '🐰',
    color: '#ff8fa3',
    background: 'bg-pink-100',
    nameColor: 'text-[#ff8fa3]',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSpgsSIXN0d0LIyQMwB5SQbDUf6iitsVRQwTNbcaYYxamCvTLMt2omcQa9RPFVNaWlGDX2OTgHS9ZHHumfzn4jTOqF8IM0wzwTvI6lEkYLR5e4j1moqa0_Wrartxg-46lIyoXuBdsEFX9pa7gJgLs0L0SshcnaM8a_OnasZM-Uogwwpf5DOLftEcb2sg4fUl5uLX5o-g-g9wxt8QgqtmJ1Zii35Iibp-f7PH3ACFzlM57Cuf4m8MVAwA0J5c_n1YsiT4-gFfBgNg0',
  },
];

export default function ProfileSelection({
  customProfiles,
  onSelectProfile,
  onOpenParentalControls,
  onAddProfile,
}: ProfileSelectionProps) {
  return (
    <div className="kids-profile-page">
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="cloud cloud-three" />

      <div className="kids-star star-one" />
      <div className="kids-star star-two" />
      <div className="kids-star star-three" />

      <header className="relative z-10 flex w-full justify-end px-6 pt-6">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border-2 border-slate-400/30 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm transition hover:scale-105"
          onClick={onOpenParentalControls}
        >
          <svg
            className="h-7 w-7 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>

          <span className="text-left text-sm font-bold leading-tight text-slate-700">
            Parental
            <br />
            Controls
          </span>
        </button>
      </header>

      <main className="relative z-10 -mt-8 flex w-full flex-grow flex-col items-center justify-center px-8">
        <div className="mb-8 text-center">
          <h1 className="flex flex-col items-center text-5xl font-extrabold md:text-6xl">
            <span className="kids-title-text -mb-2 text-[#8ecae6]">
              Who&apos;s
            </span>

            <span className="flex">
              <span className="kids-title-text text-[#ff8fa3]">W</span>
              <span className="kids-title-text text-[#ffa62b]">a</span>
              <span className="kids-title-text text-[#ffde59]">t</span>
              <span className="kids-title-text text-[#ff8fa3]">c</span>
              <span className="kids-title-text text-[#95d5b2]">h</span>
              <span className="kids-title-text text-[#8ecae6]">i</span>
              <span className="kids-title-text text-[#ffa62b]">n</span>
              <span className="kids-title-text text-[#ff8fa3]">g</span>
              <span className="kids-title-text text-[#ffde59]">?</span>
            </span>
          </h1>
        </div>

        <div className="grid w-full max-w-sm grid-cols-2 gap-x-8 gap-y-10">
          {profiles.map((profile) => (
            <button
              type="button"
              key={profile.id}
              className="group flex flex-col items-center gap-3"
              onClick={() =>
                onSelectProfile(
                  profile.name,
                  profile.emoji,
                  profile.color,
                  profile.id,
                )
              }
            >
              <div className="relative">
                {profile.name === 'Leo' && (
                  <div className="leo-halo absolute inset-0 scale-110 rounded-full bg-white opacity-50" />
                )}

                <div
                  className={`relative z-10 h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform group-hover:scale-105 ${profile.background}`}
                >
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <span
                className={`profile-name-text text-3xl font-black uppercase ${profile.nameColor}`}
              >
                {profile.name}
              </span>
            </button>
          ))}

          {customProfiles.map((profile) => (
            <button
              type="button"
              key={profile.id}
              className="group flex flex-col items-center gap-3"
              onClick={() =>
                onSelectProfile(
                  profile.name,
                  profile.emoji,
                  profile.color,
                  profile.id,
                )
              }
            >
              <div className="relative">
                <div
                  className="relative z-10 grid h-32 w-32 place-items-center overflow-hidden rounded-full border-4 border-white shadow-lg transition-transform group-hover:scale-105"
                  style={{ backgroundColor: profile.color }}
                >
                  <span className="text-6xl">
                    {profile.emoji}
                  </span>
                </div>
              </div>

              <span
                className="profile-name-text max-w-32 truncate text-2xl font-black uppercase"
                style={{ color: profile.color }}
              >
                {profile.name}
              </span>
            </button>
          ))}

          <button
            type="button"
            className="group flex flex-col items-center gap-3"
            onClick={onAddProfile}
          >
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-white/40 shadow-lg transition-transform group-hover:scale-105">
              <svg className="h-16 w-16" viewBox="0 0 100 100">
                <path
                  d="M42 10 L58 10 L58 42 L90 42 L90 58 L58 58 L58 90 L42 90 L42 58 L10 58 L10 42 L42 42 Z"
                  fill="#66bb6a"
                  stroke="#1e293b"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
              </svg>
            </div>

            <span className="profile-name-text whitespace-nowrap text-center text-xl font-black uppercase text-[#66bb6a]">
              Add Profile
            </span>
          </button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

function BottomNavigation() {
  return (
    <nav className="relative z-20 flex w-full items-center justify-between rounded-t-3xl bg-white px-8 pb-8 pt-3 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      <NavigationItem label="Home" color="text-[#8ecae6]">
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M3 12l2-2 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </NavigationItem>

      <NavigationItem label="Search" color="text-[#f28482]">
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </NavigationItem>

      <NavigationItem label="Library" color="text-[#84a59d]">
        <div className="flex gap-0.5">
          <div className="h-7 w-2 -rotate-[10deg] rounded-sm bg-current" />
          <div className="h-7 w-2 rounded-sm bg-current" />
          <div className="h-7 w-2 rotate-[10deg] rounded-sm bg-current" />
        </div>
      </NavigationItem>

      <NavigationItem label="Profile" color="text-[#ffa62b]" active>
        <svg
          className="h-7 w-7"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H5z"
          />
        </svg>
      </NavigationItem>
    </nav>
  );
}

function NavigationItem({
  label,
  color,
  active = false,
  children,
}: {
  label: string;
  color: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" className="flex flex-col items-center gap-1">
      <div
        className={`${color} ${
          active ? 'rounded-full ring-4 ring-[#ffa62b]/20' : ''
        }`}
      >
        {children}
      </div>

      <span
        className={`text-xs font-bold uppercase ${
          active ? 'text-[#ffa62b]' : 'text-[#9a9a9a]'
        }`}
      >
        {label}
      </span>
    </button>
  );
}
