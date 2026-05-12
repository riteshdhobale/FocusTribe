export type Category = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  studying: number;
  rooms: number;
  /** 'india' | 'global' | 'both' — used for geo-aware sorting */
  region: "india" | "global" | "both";
};

// ─────────────────────────────────────────────────────────────────────────────
// MVP LAUNCH ROOMS — 3 age/life-stage rooms to concentrate users and
// maximise social proof during early growth (0–500 DAU).
//
// Segmented by life stage (not exam) so it resonates globally:
//   School  → Class 9-12, JEE/NEET prep, SAT, A-Levels, Boards
//   College → Undergrad, sem exams, CA Inter, GRE/GMAT prep, engineering
//   Beyond  → UPSC, CA Final, CFA, PhD, MBA, professional certs, masters
//
// When to expand:
//   200+ DAU   → uncomment Medical + Engineering below
//   500+ DAU   → uncomment Government + Tech
//   1000+ DAU  → restore full category system (see commented section below)
// ─────────────────────────────────────────────────────────────────────────────
export const categories: Category[] = [
  {
    slug: "school",
    name: "School",
    icon: "🏫",
    description: "Class 9–12 · Boards · JEE/NEET Foundation · SAT · A-Levels",
    studying: 94,
    rooms: 1,
    region: "both",
  },
  {
    slug: "college",
    name: "College",
    icon: "🎓",
    description: "Undergrad · Sem Exams · CA Inter · GRE/GMAT Prep · Engineering",
    studying: 127,
    rooms: 1,
    region: "both",
  },
  {
    slug: "beyond",
    name: "Beyond",
    icon: "🚀",
    description: "UPSC · CA Final · CFA · PhD · MBA · Masters · Professional Certs",
    studying: 63,
    rooms: 1,
    region: "both",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

// ─────────────────────────────────────────────────────────────────────────────
// GEO-AWARE CATEGORY SORTING
// Returns categories sorted by relevance to user's region.
// Re-enable this when you have region-specific rooms to surface.
// ─────────────────────────────────────────────────────────────────────────────
export function getCategoriesForRegion(region: "india" | "global"): Category[] {
  // MVP: all 3 rooms are region-agnostic, return as-is
  return categories;
}

// ─────────────────────────────────────────────────────────────────────────────
// ░░░░░░░░░░░░░  FULL CATEGORY SYSTEM — RESTORE WHEN READY  ░░░░░░░░░░░░░░░░
// ─────────────────────────────────────────────────────────────────────────────
// Uncomment the block below and replace the `categories` export above when
// your DAU justifies splitting users across exam-specific rooms.
//
// Suggested unlock milestones:
//   Phase 2 (200 DAU)  → Medical, Engineering
//   Phase 3 (500 DAU)  → Government, Tech, MBA
//   Phase 4 (1000 DAU) → All categories below
// ─────────────────────────────────────────────────────────────────────────────

/*
export const FULL_CATEGORIES: Category[] = [
  // ── India-primary ──────────────────────────────────────────────────────────
  {
    slug: "medical",
    name: "Medical",
    icon: "🏥",
    description: "NEET UG, NEET PG, FMGE, USMLE prep",
    studying: 48,
    rooms: 12,
    region: "india",
  },
  {
    slug: "engineering",
    name: "Engineering",
    icon: "⚡",
    description: "JEE Mains, JEE Advanced, GATE prep",
    studying: 64,
    rooms: 18,
    region: "india",
  },
  {
    slug: "government",
    name: "Government",
    icon: "🏛️",
    description: "UPSC CSE, SSC, Bank PO, State PSC",
    studying: 39,
    rooms: 14,
    region: "india",
  },
  {
    slug: "law",
    name: "Law",
    icon: "⚖️",
    description: "CLAT, Judiciary, Bar Exam, LSAT prep",
    studying: 11,
    rooms: 4,
    region: "india",
  },
  {
    slug: "mba",
    name: "MBA & Business",
    icon: "📊",
    description: "CAT, GMAT, XAT, NMAT prep",
    studying: 22,
    rooms: 7,
    region: "india",
  },
  {
    slug: "professional",
    name: "Professional",
    icon: "💼",
    description: "CA, CS, CMA, CFA certification",
    studying: 18,
    rooms: 6,
    region: "india",
  },
  {
    slug: "boards",
    name: "Boards",
    icon: "📚",
    description: "Class 10 & 12 CBSE, ICSE, State boards",
    studying: 29,
    rooms: 8,
    region: "india",
  },
  // ── Global ─────────────────────────────────────────────────────────────────
  {
    slug: "premed",
    name: "Pre-Med / MCAT",
    icon: "🩺",
    description: "MCAT, A&P, Biochemistry, US med school",
    studying: 31,
    rooms: 9,
    region: "global",
  },
  {
    slug: "graduate",
    name: "Graduate / GRE",
    icon: "🎓",
    description: "GRE, GMAT, grad school apps, thesis",
    studying: 19,
    rooms: 6,
    region: "global",
  },
  {
    slug: "finance",
    name: "Finance & CFA",
    icon: "📈",
    description: "CFA, CPA, FRM, Actuarial, Finance",
    studying: 14,
    rooms: 5,
    region: "global",
  },
  {
    slug: "language",
    name: "Language & IELTS",
    icon: "🌐",
    description: "IELTS, TOEFL, language learning, writing",
    studying: 16,
    rooms: 5,
    region: "global",
  },
  {
    slug: "alevels",
    name: "A-Levels / IB / SAT",
    icon: "📝",
    description: "A-Levels, IB Diploma, GCSE, SAT/ACT",
    studying: 12,
    rooms: 4,
    region: "global",
  },
  // ── Both markets ───────────────────────────────────────────────────────────
  {
    slug: "tech",
    name: "Tech & Coding",
    icon: "💻",
    description: "DSA, System Design, Web Dev, CP",
    studying: 27,
    rooms: 9,
    region: "both",
  },
  {
    slug: "general",
    name: "General",
    icon: "📖",
    description: "Open study, any subject, any exam",
    studying: 35,
    rooms: 8,
    region: "both",
  },
  {
    slug: "startup",
    name: "Startup & Product",
    icon: "💡",
    description: "MVP, fundraising, product design, marketing",
    studying: 9,
    rooms: 3,
    region: "both",
  },
  {
    slug: "research",
    name: "Research & PhD",
    icon: "🔬",
    description: "Paper writing, literature review, thesis",
    studying: 7,
    rooms: 2,
    region: "both",
  },
];

// Geo-aware sorter for full category system
export function getCategoriesForRegionFull(region: "india" | "global"): Category[] {
  if (region === "india") {
    return [
      ...FULL_CATEGORIES.filter((c) => c.region === "india"),
      ...FULL_CATEGORIES.filter((c) => c.region === "both"),
      ...FULL_CATEGORIES.filter((c) => c.region === "global"),
    ];
  }
  return [
    ...FULL_CATEGORIES.filter((c) => c.region === "global"),
    ...FULL_CATEGORIES.filter((c) => c.region === "both"),
    ...FULL_CATEGORIES.filter((c) => c.region === "india"),
  ];
}
*/
