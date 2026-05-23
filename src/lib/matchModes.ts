// ─── FocusTribe Match Modes ─────────────────────────────────────────
// Three matching modes live under the FocusTribe umbrella brand.
// Each mode adjusts UI color, card emphasis, compatibility weights,
// and action button labels.

export type MatchMode = "study-date" | "accountability-buddy" | "study-buddy";

export type CompatWeights = {
  subject: number;
  habits: number;
  interests: number;
  proximity: number;
};

export type MatchModeConfig = {
  id: MatchMode;
  name: string;
  tagline: string;
  emoji: string;
  icon: string; // lucide icon name
  color: string;
  colorSoft: string;
  colorGlow: string;
  gradient: string;
  description: string;
  cardEmphasis: "exam-focus" | "streaks" | "interests";
  compatWeights: CompatWeights;
  actions: {
    pass: string;
    like: string;
    superLike: string;
  };
  emptyStateMessage: string;
  celebrationTitle: (name: string) => string;
  celebrationSubtitle: string;
};

export const MATCH_MODES: MatchModeConfig[] = [
  {
    id: "study-date",
    name: "StudyDate",
    tagline: "Find your exam prep partner",
    emoji: "🎯",
    icon: "Target",
    color: "#FF6B9E",
    colorSoft: "rgba(255,107,158,0.12)",
    colorGlow: "rgba(255,107,158,0.35)",
    gradient: "linear-gradient(135deg, #FF6B9E 0%, #FF3B7F 100%)",
    description:
      "Swipe to find students on the same exam path. Match on academic alignment and study habits.",
    cardEmphasis: "exam-focus",
    compatWeights: { subject: 0.4, habits: 0.3, interests: 0.2, proximity: 0.1 },
    actions: { pass: "Pass", like: "Match", superLike: "Super" },
    emptyStateMessage:
      "You've seen every profile in this lane. Try switching to a different mode or resetting filters.",
    celebrationTitle: (name: string) => `It's a match! You and ${name} are on the same exam path.`,
    celebrationSubtitle: "Schedule your first study session together.",
  },
  {
    id: "accountability-buddy",
    name: "Accountability Buddy",
    tagline: "Find someone who won't let you quit",
    emoji: "🤝",
    icon: "Handshake",
    color: "#F59E0B",
    colorSoft: "rgba(245,158,11,0.12)",
    colorGlow: "rgba(245,158,11,0.35)",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    description:
      "Get matched with a committed partner. Check in daily, track goals, hold each other accountable.",
    cardEmphasis: "streaks",
    compatWeights: { subject: 0.2, habits: 0.45, interests: 0.1, proximity: 0.25 },
    actions: { pass: "Skip", like: "Commit", superLike: "Priority" },
    emptyStateMessage:
      "No accountability partners in this lane right now. Expand your filters or check back later.",
    celebrationTitle: (name: string) =>
      `Commitment locked! You and ${name} are accountability partners.`,
    celebrationSubtitle: "Time to set your first daily check-in.",
  },
  {
    id: "study-buddy",
    name: "Study Buddy",
    tagline: "Find your vibe, share the grind",
    emoji: "📚",
    icon: "BookOpen",
    color: "#10B981",
    colorSoft: "rgba(16,185,129,0.12)",
    colorGlow: "rgba(16,185,129,0.35)",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    description:
      "Casual study companion matching. Similar interests, compatible schedules, good energy.",
    cardEmphasis: "interests",
    compatWeights: { subject: 0.25, habits: 0.25, interests: 0.35, proximity: 0.15 },
    actions: { pass: "Pass", like: "Connect", superLike: "Vibe" },
    emptyStateMessage:
      "No study buddies matching your vibe right now. Try different interest filters.",
    celebrationTitle: (name: string) => `New study buddy! You and ${name} vibed.`,
    celebrationSubtitle: "Jump into a room together and start the grind.",
  },
] as const;

export function getModeConfig(mode: MatchMode): MatchModeConfig {
  return MATCH_MODES.find((m) => m.id === mode) ?? MATCH_MODES[0];
}

const MODE_STORAGE_KEY = "ft_match_mode";

export function getStoredMode(): MatchMode {
  if (typeof window === "undefined") return "study-date";
  const stored = localStorage.getItem(MODE_STORAGE_KEY);
  if (stored && MATCH_MODES.some((m) => m.id === stored)) return stored as MatchMode;
  return "study-date";
}

export function setStoredMode(mode: MatchMode): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }
}
