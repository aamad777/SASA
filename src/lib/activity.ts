/* SARA KIDS EXPERIENCE V7 */

// SARA_KIDS_ACTIVITY_V7 — single source of truth for recording/reading child
// activity. There is no backend endpoint for this (see the audit note in
// ParentDashboard's Activity & History section) — activity has always been,
// and remains, tracked client-side in localStorage at the moment it happens
// (media opened, reaction picked). This file does not add a new storage
// mechanism; it centralizes the one that already existed inline in
// routes/index.tsx (openKidsVideo) so ParentDashboard and the player can
// both read/write it consistently instead of three copies of the same
// try/catch localStorage dance.
const ACTIVITY_STORAGE_KEY = "sasa-watch-history";
const MAX_ACTIVITY_ENTRIES = 300;

export type ActivityKind = "opened" | "reaction";

export type ActivityMediaType = "photo" | "upload" | "youtube" | "built-in";

export type ActivityEntry = {
  historyId: string;
  profileId: string;
  profileName: string;
  videoId: number;
  title: string;
  image: string;
  category: string;
  duration: string;
  mediaType: ActivityMediaType;
  kind: ActivityKind;
  reactionEmoji?: string;
  reactionLabel?: string;
  watchedAt: string;
};

export type RecordActivityInput = Omit<ActivityEntry, "historyId" | "watchedAt">;

function readAllActivity(): ActivityEntry[] {
  const saved = localStorage.getItem(ACTIVITY_STORAGE_KEY);

  if (!saved) return [];

  const parsed = JSON.parse(saved);

  if (!Array.isArray(parsed)) return [];

  // Defensive — older entries recorded before this file existed may be
  // missing mediaType/kind; default them so the UI never breaks on old data.
  return parsed
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      historyId: String(item.historyId ?? `${item.watchedAt || ""}-${item.videoId || ""}`),
      profileId: String(item.profileId ?? ""),
      profileName: String(item.profileName ?? "Child"),
      videoId: Number(item.videoId) || 0,
      title: String(item.title ?? "Untitled"),
      image: String(item.image ?? ""),
      category: String(item.category ?? ""),
      duration: String(item.duration ?? ""),
      mediaType: (item.mediaType as ActivityMediaType) || "built-in",
      kind: (item.kind as ActivityKind) || "opened",
      reactionEmoji: item.reactionEmoji || undefined,
      reactionLabel: item.reactionLabel || undefined,
      watchedAt: String(item.watchedAt ?? new Date(0).toISOString()),
    }));
}

/** Appends a real activity event. Never call this with synthetic/sample data. */
export function recordActivity(entry: RecordActivityInput): void {
  try {
    const existing = readAllActivity();

    const next: ActivityEntry = {
      ...entry,
      historyId: `${Date.now()}-${entry.profileId}-${entry.videoId}-${Math.random().toString(36).slice(2, 8)}`,
      watchedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      ACTIVITY_STORAGE_KEY,
      JSON.stringify([next, ...existing].slice(0, MAX_ACTIVITY_ENTRIES)),
    );
  } catch {
    // Activity logging must never break playback/navigation.
  }
}

/** Throws on genuine read failure (corrupt storage) — callers show an error+retry state. */
export function getActivityForProfile(profileId: string): ActivityEntry[] {
  return readAllActivity().filter((item) => item.profileId === profileId);
}

export function clearActivityForProfile(profileId: string): void {
  const remaining = readAllActivity().filter((item) => item.profileId !== profileId);

  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(remaining));
}

export function removeActivityForProfile(profileId: string): void {
  clearActivityForProfile(profileId);
}
