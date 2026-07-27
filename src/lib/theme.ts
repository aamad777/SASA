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

export function getStoredTheme(): AppThemeId {
  try {
    const saved = localStorage.getItem("sasa-app-theme");
    if (saved && appThemes.some((t) => t.id === saved)) {
      return saved as AppThemeId;
    }
  } catch {
    // Default fallback
  }
  return "daylight";
}

export function setStoredTheme(themeId: AppThemeId): void {
  try {
    localStorage.setItem("sasa-app-theme", themeId);
    document.documentElement.setAttribute("data-theme", themeId);
  } catch {
    // Ignore error
  }
}
