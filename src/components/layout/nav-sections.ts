import {
  BookOpen,
  Users,
  Gamepad2,
  Home,
  Music,
  Paintbrush,
  Search,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";

/** Section ids are the kid-home tab ids already used across the app. */
export type KidsSectionId =
  | "home"
  | "search"
  | "library"
  | "songs"
  | "games"
  | "studio"
  | "profile"
  | "friends";

export type SectionDef = {
  id: KidsSectionId;
  label: string;
  icon: LucideIcon;
  /** Short heading shown at the top of that section's page. */
  title: string;
  subtitle: string;
};

export const KIDS_SECTIONS: Record<KidsSectionId, SectionDef> = {
  home: {
    id: "home",
    label: "Home",
    icon: Home,
    title: "Home",
    subtitle: "Everything a grown-up has shared with you",
  },
  search: {
    id: "search",
    label: "Search",
    icon: Search,
    title: "Search",
    subtitle: "Find a video or photo by name or category",
  },
  library: {
    id: "library",
    label: "Library",
    icon: BookOpen,
    title: "Library",
    subtitle: "The videos you saved with the heart button",
  },
  friends: {
    id: "friends",
    label: "Friends",
    icon: Users,
    title: "Friends",
    subtitle: "Add a friend with their Friend ID and share your videos and photos",
  },
  songs: {
    id: "songs",
    label: "Songs",
    icon: Music,
    title: "Songs",
    subtitle: "Sing along together",
  },
  games: {
    id: "games",
    label: "Games",
    icon: Gamepad2,
    title: "Games",
    subtitle: "Little games to play",
  },
  studio: {
    id: "studio",
    label: "Studio",
    icon: Paintbrush,
    title: "Studio",
    subtitle: "Draw and save your own artwork",
  },
  profile: {
    id: "profile",
    label: "Profile",
    icon: User,
    title: "Profile",
    subtitle: "Your name, avatar and badges",
  },
};

/** Desktop rail: real sections, grouped the way the app is organised. */
export const RAIL_GROUPS: Array<{ title?: string; items: SectionDef[] }> = [
  { items: [KIDS_SECTIONS.home, KIDS_SECTIONS.search, KIDS_SECTIONS.library] },
  {
    title: "Play & create",
    items: [KIDS_SECTIONS.songs, KIDS_SECTIONS.games, KIDS_SECTIONS.studio],
  },
  { title: "You", items: [KIDS_SECTIONS.friends, KIDS_SECTIONS.profile] },
];

/** Sections that live behind the bottom bar's "Play" sheet on phones. */
export const SHEET_SECTIONS: SectionDef[] = [
  KIDS_SECTIONS.songs,
  KIDS_SECTIONS.games,
  KIDS_SECTIONS.studio,
];

/** The four fixed bottom-bar destinations (the fifth slot is the sheet). */
export const TABBAR_SECTIONS: SectionDef[] = [
  KIDS_SECTIONS.home,
  KIDS_SECTIONS.search,
  KIDS_SECTIONS.library,
  KIDS_SECTIONS.friends,
];

export const PARENT_CONTROLS_ICON: LucideIcon = ShieldCheck;
