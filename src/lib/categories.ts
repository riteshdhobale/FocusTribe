export type Category = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  studying: number;
  rooms: number;
};

export const categories: Category[] = [
  { slug: "medical", name: "Medical", icon: "🏥", description: "NEET UG, NEET PG, FMGE, USMLE prep", studying: 48, rooms: 12 },
  { slug: "engineering", name: "Engineering", icon: "⚡", description: "JEE Mains, JEE Advanced, GATE prep", studying: 64, rooms: 18 },
  { slug: "mba", name: "MBA & Business", icon: "📊", description: "CAT, GMAT, XAT, NMAT prep", studying: 22, rooms: 7 },
  { slug: "government", name: "Government", icon: "🏛️", description: "UPSC CSE, SSC, Bank PO, State PSC", studying: 39, rooms: 14 },
  { slug: "professional", name: "Professional", icon: "💼", description: "CA, CS, CMA, CFA certification", studying: 18, rooms: 6 },
  { slug: "law", name: "Law", icon: "⚖️", description: "CLAT, Judiciary, LLB exam prep", studying: 11, rooms: 4 },
  { slug: "tech", name: "Tech & Coding", icon: "💻", description: "DSA, System Design, Web Dev, CP", studying: 27, rooms: 9 },
  { slug: "general", name: "General Study", icon: "📚", description: "College exams, skill building, reading", studying: 14, rooms: 5 },
  { slug: "startup", name: "Startup Founders", icon: "🚀", description: "Product building, fundraising, growth", studying: 9, rooms: 3 },
  { slug: "research", name: "Research & PhD", icon: "🔬", description: "Paper writing, literature review, thesis", studying: 7, rooms: 2 },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

export const roomsFor = (slug: string) => {
  const base: Record<string, { name: string; topic: string; in: number; cap: number }[]> = {
    medical: [
      { name: "NEET Biology Grind", topic: "Human Physiology · Ch. 17", in: 8, cap: 12 },
      { name: "NEET PG Crashroom", topic: "Pharma rapid revision", in: 5, cap: 10 },
      { name: "Anatomy Deep Dive", topic: "Upper limb dissection notes", in: 3, cap: 8 },
      { name: "FMGE Mock Marathon", topic: "Mixed MCQs · 200 Qs", in: 11, cap: 15 },
    ],
    engineering: [
      { name: "JEE Maths Beast Mode", topic: "Calculus + Vectors", in: 9, cap: 12 },
      { name: "JEE Advanced Physics", topic: "Rotational Mechanics", in: 6, cap: 10 },
      { name: "GATE CSE Algorithms", topic: "Graph algorithms", in: 7, cap: 12 },
      { name: "Chemistry Speedrun", topic: "Organic — GOC", in: 4, cap: 10 },
    ],
    mba: [
      { name: "CAT Quant Killers", topic: "Arithmetic · LR", in: 7, cap: 12 },
      { name: "GMAT Verbal Lab", topic: "SC + CR drills", in: 4, cap: 10 },
    ],
    government: [
      { name: "UPSC Prelims 2025", topic: "Modern History + Polity", in: 14, cap: 20 },
      { name: "SSC CGL Quant", topic: "Maths PYQs", in: 8, cap: 15 },
      { name: "Bank PO Reasoning", topic: "Puzzles + Seating", in: 6, cap: 12 },
    ],
    professional: [
      { name: "CA Inter Audit", topic: "SA 200 series", in: 5, cap: 10 },
      { name: "CFA L1 Quant", topic: "Time value of money", in: 3, cap: 8 },
    ],
    law: [
      { name: "CLAT Legal Reasoning", topic: "Contract law", in: 4, cap: 10 },
      { name: "Judiciary Mains", topic: "CrPC answer writing", in: 2, cap: 8 },
    ],
    tech: [
      { name: "DSA Daily 2 Problems", topic: "Sliding window", in: 9, cap: 15 },
      { name: "System Design Club", topic: "Designing Twitter feed", in: 6, cap: 12 },
      { name: "LeetCode Marathon", topic: "Mediums · 5 problems", in: 4, cap: 10 },
    ],
    general: [
      { name: "Deep Reading Room", topic: "Atomic Habits · ch. 4", in: 5, cap: 12 },
      { name: "College Finals", topic: "Open syllabus session", in: 6, cap: 15 },
    ],
    startup: [
      { name: "Product Builders", topic: "MVP sprint session", in: 4, cap: 8 },
      { name: "Pitch Deck Workshop", topic: "Investor readiness", in: 3, cap: 8 },
    ],
    research: [
      { name: "Paper Writing Lab", topic: "IEEE format drafting", in: 2, cap: 6 },
      { name: "Literature Review", topic: "Cross-discipline readings", in: 3, cap: 8 },
    ],
  };
  return base[slug] ?? [];
};
