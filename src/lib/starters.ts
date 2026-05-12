// ─── Conversation Starters ──────────────────────────────────────────
// Context-aware openers for matches page — "Openers that feel smart, not cringe"

export type StarterCategory = "general" | "exam" | "study-date" | "icebreaker";

export interface Starter {
  text: string;
  category: StarterCategory;
  examFocus?: string[]; // show only for these exam focuses
}

const GENERAL_STARTERS: Starter[] = [
  { text: "What does your ideal library date actually look like?", category: "general" },
  {
    text: "If we did one 90-minute focus sprint this week, what would you want to finish?",
    category: "general",
  },
  {
    text: "Are you the kind of person who studies better with silence, playlists, or banter in breaks?",
    category: "general",
  },
  {
    text: "What career goal are you romantic enough to keep chasing even on your bad days?",
    category: "general",
  },
  {
    text: "What's your study environment — messy desk genius or color-coded planner?",
    category: "general",
  },
  {
    text: "If I quizzed you on your topic right now, would you ace it or cry?",
    category: "general",
  },
  {
    text: "What's one thing you wish someone would hold you accountable for this week?",
    category: "general",
  },
  { text: "Pomodoro purist or 4-hour deep-work marathons?", category: "general" },
];

const EXAM_STARTERS: Starter[] = [
  {
    text: "Anatomy or physiology — which one makes you question your life choices more?",
    category: "exam",
    examFocus: ["neet", "medical"],
  },
  {
    text: "Which NCERT chapter do you keep coming back to?",
    category: "exam",
    examFocus: ["neet", "jee"],
  },
  {
    text: "Physics or chemistry — which one do you secretly love?",
    category: "exam",
    examFocus: ["jee", "engineering"],
  },
  {
    text: "If you could instant-master one JEE topic, which would it be?",
    category: "exam",
    examFocus: ["jee", "engineering"],
  },
  {
    text: "If you could change one government policy, what would it be?",
    category: "exam",
    examFocus: ["upsc", "government"],
  },
  {
    text: "What's your optional and why did you choose it?",
    category: "exam",
    examFocus: ["upsc", "government"],
  },
  {
    text: "DILR or Quant — which one keeps you up at night?",
    category: "exam",
    examFocus: ["cat", "mba"],
  },
  {
    text: "Case study time: how would you fix a failing startup?",
    category: "exam",
    examFocus: ["cat", "mba", "gmat"],
  },
  {
    text: "Tabs or spaces? This determines if we can study together.",
    category: "exam",
    examFocus: ["coding", "tech", "gate"],
  },
  {
    text: "What's the last algorithm that made you go 'whoa'?",
    category: "exam",
    examFocus: ["coding", "tech", "gate"],
  },
  {
    text: "Audit or Tax — which paper are you dreading more?",
    category: "exam",
    examFocus: ["ca", "professional"],
  },
  {
    text: "Contract law or criminal law — where do you shine?",
    category: "exam",
    examFocus: ["law", "bar-exam"],
  },
  { text: "What's your GRE verbal score target?", category: "exam", examFocus: ["gre", "gmat"] },
  { text: "What's your dream research topic?", category: "exam", examFocus: ["phd", "research"] },
];

const STUDY_DATE_STARTERS: Starter[] = [
  {
    text: "Coffee + a 90-minute study sprint beats endless texting. When are you free?",
    category: "study-date",
  },
  { text: "I'll bring the notes, you bring the focus. Deal?", category: "study-date" },
  { text: "Let's do a 3-hour library session and grab food after?", category: "study-date" },
  {
    text: "Virtual study date tonight? I have a Pomodoro playlist ready 🎵",
    category: "study-date",
  },
  {
    text: "Want to try a camera-on deep work session? No talking, just accountability.",
    category: "study-date",
  },
];

const ICEBREAKER_STARTERS: Starter[] = [
  {
    text: "What's the most useless fact you know because of your studies?",
    category: "icebreaker",
  },
  { text: "If your study life had a theme song, what would it be?", category: "icebreaker" },
  { text: "What's your guilty procrastination habit?", category: "icebreaker" },
  {
    text: "Rate your current study setup out of 10 — and what would make it a 10?",
    category: "icebreaker",
  },
  {
    text: "What's one thing your classmates don't know about your study routine?",
    category: "icebreaker",
  },
];

const ALL_STARTERS = [
  ...GENERAL_STARTERS,
  ...EXAM_STARTERS,
  ...STUDY_DATE_STARTERS,
  ...ICEBREAKER_STARTERS,
];

/**
 * Get contextual conversation starters based on the matched profile's exam focus.
 * Returns a mix of general + exam-specific starters.
 */
export function getStartersForMatch(matchExamFocus?: string[]): Starter[] {
  const relevant: Starter[] = [];

  // Always include general starters
  relevant.push(...GENERAL_STARTERS);

  // Add exam-specific starters if we know their focus
  if (matchExamFocus && matchExamFocus.length > 0) {
    const examSpecific = EXAM_STARTERS.filter((s) =>
      s.examFocus?.some((e) => matchExamFocus.includes(e)),
    );
    relevant.push(...examSpecific);
  }

  // Always add some study-date and icebreaker options
  relevant.push(...STUDY_DATE_STARTERS.slice(0, 3));
  relevant.push(...ICEBREAKER_STARTERS.slice(0, 2));

  // Shuffle and return top 6
  return relevant.sort(() => Math.random() - 0.5).slice(0, 6);
}

/**
 * Get the "Best Next Move" advice text.
 */
export function getBestNextMove(): { title: string; body: string } {
  const moves = [
    {
      title: "Invite them to a focused first date",
      body: "Coffee + a 90-minute study sprint beats endless texting. Keep it light, specific, and time-bound.",
    },
    {
      title: "Set a shared study goal",
      body: "Suggest completing a chapter or solving 10 problems together this week. Shared goals build real connection.",
    },
    {
      title: "Start with a virtual session",
      body: "A 50-minute camera-on Pomodoro session is the perfect first study date. Low pressure, high accountability.",
    },
  ];
  return moves[Math.floor(Math.random() * moves.length)];
}
