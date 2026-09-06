export type AppThemeId = "daylight" | "space" | "jungle" | "magic" | "dino" | "night";

export type AppTheme = {
  id: AppThemeId;
  name: string;
  emoji: string;
  badge: string;
  bgGradient: string;
  cardBg: string;
  accentColor: string;
  buttonBg: string;
};

export const appThemes: AppTheme[] = [
  {
    id: "daylight",
    name: "Bright Daylight",
    emoji: "☀️",
    badge: "Classic",
    bgGradient: "from-amber-100/60 via-pink-100/40 to-sky-100/60",
    cardBg: "rgba(255, 255, 255, 0.88)",
    accentColor: "#ff6b9d",
    buttonBg: "linear-gradient(135deg, #ff72aa, #8b7cff)",
  },
  {
    id: "space",
    name: "Space Explorer",
    emoji: "🌌",
    badge: "Cosmic",
    bgGradient: "from-slate-900 via-indigo-950 to-purple-950",
    cardBg: "rgba(30, 27, 75, 0.85)",
    accentColor: "#38bdf8",
    buttonBg: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
  },
  {
    id: "jungle",
    name: "Jungle Safari",
    emoji: "🌴",
    badge: "Adventure",
    bgGradient: "from-emerald-100 via-teal-50 to-amber-100/70",
    cardBg: "rgba(255, 255, 255, 0.88)",
    accentColor: "#10b981",
    buttonBg: "linear-gradient(135deg, #10b981, #059669)",
  },
  {
    id: "magic",
    name: "Magic Kingdom",
    emoji: "🦄",
    badge: "Sparkle",
    bgGradient: "from-pink-100 via-purple-100 to-indigo-100",
    cardBg: "rgba(255, 255, 255, 0.9)",
    accentColor: "#ec4899",
    buttonBg: "linear-gradient(135deg, #ec4899, #a855f7)",
  },
  {
    id: "dino",
    name: "Dino World",
    emoji: "🦖",
    badge: "Prehistoric",
    bgGradient: "from-orange-100 via-amber-50 to-lime-100/60",
    cardBg: "rgba(255, 255, 255, 0.88)",
    accentColor: "#f97316",
    buttonBg: "linear-gradient(135deg, #f97316, #eab308)",
  },
  {
    id: "night",
    name: "Cozy Night",
    emoji: "🌙",
    badge: "Bedtime",
    bgGradient: "from-slate-950 via-blue-950 to-slate-900",
    cardBg: "rgba(15, 23, 42, 0.88)",
    accentColor: "#818cf8",
    buttonBg: "linear-gradient(135deg, #6366f1, #3b82f6)",
  },
];

/* SASA_KID_THEMES_V34 — a theme belongs to a child, not to the device.
 *
 * One shared key meant a sibling switching profiles inherited whatever the
 * last child chose. The active profile id is written by the kid shell and
 * read back here so each child keeps their own.
 */
const THEME_KEY = "sasa-app-theme";
const ACTIVE_PROFILE_KEY = "sasa-active-kid-id";

function themeKeyFor(profileId?: string | null): string {
  const id = profileId ?? safeGet(ACTIVE_PROFILE_KEY);
  return id ? `${THEME_KEY}:${id}` : THEME_KEY;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Records which child the kid shell is currently showing. */
export function setActiveThemeProfile(profileId: string | null | undefined): void {
  try {
    if (profileId) localStorage.setItem(ACTIVE_PROFILE_KEY, String(profileId));
    else localStorage.removeItem(ACTIVE_PROFILE_KEY);
  } catch {
    /* Storage unavailable — themes simply fall back to the shared key. */
  }
}

export function getStoredTheme(profileId?: string | null): AppThemeId {
  // This child's own choice first, then any older shared value so an existing
  // selection is not lost the first time the per-child key is used.
  for (const key of [themeKeyFor(profileId), THEME_KEY]) {
    const saved = safeGet(key);
    if (saved && appThemes.some((t) => t.id === saved)) return saved as AppThemeId;
  }
  return "daylight";
}

export function setStoredTheme(themeId: AppThemeId, profileId?: string | null): void {
  try {
    localStorage.setItem(themeKeyFor(profileId), themeId);
    // Kept so the pre-paint script in index.html has something to read before
    // it knows which profile is active.
    localStorage.setItem(THEME_KEY, themeId);
  } catch {
    /* Ignore: the attribute below still applies for this session. */
  }
  applyThemeAttribute(themeId);
}

/**
 * Kid themes are styled off `data-app-theme` on <html> (see the theme block
 * in src/styles/app-shell.css). The older `data-theme` attribute is kept in
 * place because it is what the picker has always written.
 */
export function applyThemeAttribute(themeId: AppThemeId): void {
  const root = document.documentElement;

  root.setAttribute("data-theme", themeId);
  root.setAttribute("data-app-theme", themeId);
}

/** Themes whose surface reads as night-time and drive the dark shell. */
export function isNightTheme(themeId: AppThemeId): boolean {
  return themeId === "space" || themeId === "night";
}
