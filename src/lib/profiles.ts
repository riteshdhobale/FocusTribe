// ─── StudyDate data layer ──────────────────────────────────────────
// All data is stored in localStorage for the prototype.
// Replace with Supabase / API calls in production.

export type Gender = "male" | "female" | "non-binary";
export type StudyStyle = "visual" | "audio" | "reading" | "hands-on";
export type GroupPref = "1v1" | "small-group" | "any"; // small-group = 3-4

export type Profile = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  college: string;
  year: string; // "1st Year", "2nd Year", etc.
  examFocus: string[]; // slugs from categories
  bio: string;
  studyStyle: StudyStyle;
  lookingFor: string; // "Study Partner" | "Accountability Buddy" | "Group Study"
  interests: string[];
  avatarColor: string; // hsl color
  avatarEmoji: string;
  isOnline: boolean;
  hoursStudied: number;
  streak: number;
  groupPref: GroupPref;
  genderPref: "male" | "female" | "any"; // who they want to study with
};

export type MatchStatus = "pending" | "matched" | "study-date" | "completed";

export type Match = {
  id: string;
  profileA: string; // my id
  profileB: string; // their id
  status: MatchStatus;
  timestamp: number;
  lastMessage?: string;
  unread: number;
};

export type Message = {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: number;
};

export type MatchPreferences = {
  ageMin: number;
  ageMax: number;
  genderPref: "male" | "female" | "any";
  examFocus: string[]; // empty = any
  colleges: string[]; // empty = any
  groupPref: GroupPref;
  onlineOnly: boolean;
};

// ─── Avatar colors ─────────────────────────────────────────────────
const AVATAR_COLORS = [
  "hsl(340, 82%, 52%)", "hsl(262, 83%, 58%)", "hsl(199, 89%, 48%)",
  "hsl(142, 71%, 45%)", "hsl(45, 93%, 47%)", "hsl(16, 85%, 57%)",
  "hsl(280, 67%, 51%)", "hsl(190, 80%, 42%)", "hsl(350, 80%, 60%)",
  "hsl(220, 70%, 55%)",
];

const AVATAR_EMOJIS = ["📚", "🎯", "💡", "🔬", "⚡", "🧠", "🎓", "💻", "📖", "🏆", "🌟", "🔥"];

// ─── Seed profiles ─────────────────────────────────────────────────
export const seedProfiles: Profile[] = [
  {
    id: "p1", name: "Ananya Sharma", age: 20, gender: "female",
    college: "AIIMS Delhi", year: "2nd Year",
    examFocus: ["medical"], bio: "NEET topper vibes only 🧬 Looking for a serious study buddy for anatomy marathons. I bring notes, you bring commitment.",
    studyStyle: "visual", lookingFor: "Study Partner",
    interests: ["Biology", "Research", "Yoga", "Coffee"],
    avatarColor: AVATAR_COLORS[0], avatarEmoji: "🔬",
    isOnline: true, hoursStudied: 847, streak: 23, groupPref: "1v1", genderPref: "female",
  },
  {
    id: "p2", name: "Arjun Mehta", age: 21, gender: "male",
    college: "IIT Bombay", year: "3rd Year",
    examFocus: ["engineering", "tech"], bio: "JEE AIR 342. Now grinding DSA for placements. Let's solve problems together — I explain, you question. 💪",
    studyStyle: "hands-on", lookingFor: "Accountability Buddy",
    interests: ["Competitive Programming", "Physics", "Gaming", "Chess"],
    avatarColor: AVATAR_COLORS[1], avatarEmoji: "⚡",
    isOnline: true, hoursStudied: 1203, streak: 45, groupPref: "any", genderPref: "any",
  },
  {
    id: "p3", name: "Priya Patel", age: 22, gender: "female",
    college: "St. Xavier's Mumbai", year: "Final Year",
    examFocus: ["mba"], bio: "CAT 99.2%ile last year, aiming for 99.9 this time. Quant grind sessions from 6 AM. Early birds only! 🌅",
    studyStyle: "reading", lookingFor: "Study Partner",
    interests: ["Case Studies", "Economics", "Debate", "Running"],
    avatarColor: AVATAR_COLORS[2], avatarEmoji: "📊",
    isOnline: false, hoursStudied: 632, streak: 12, groupPref: "1v1", genderPref: "any",
  },
  {
    id: "p4", name: "Rahul Kumar", age: 23, gender: "male",
    college: "JNU Delhi", year: "Graduated",
    examFocus: ["government"], bio: "3rd attempt UPSC CSE. Prelims cleared twice. Need a study partner who takes GS seriously. Let's crack it this time. 🏛️",
    studyStyle: "reading", lookingFor: "Accountability Buddy",
    interests: ["History", "Current Affairs", "Writing", "Documentaries"],
    avatarColor: AVATAR_COLORS[3], avatarEmoji: "🎯",
    isOnline: true, hoursStudied: 2100, streak: 67, groupPref: "small-group", genderPref: "any",
  },
  {
    id: "p5", name: "Sneha Reddy", age: 19, gender: "female",
    college: "NIT Warangal", year: "1st Year",
    examFocus: ["engineering"], bio: "Fresh out of JEE! Now exploring web dev and ML. Looking for coding buddies to build cool stuff 💻✨",
    studyStyle: "hands-on", lookingFor: "Group Study",
    interests: ["Web Dev", "AI/ML", "Design", "K-Pop"],
    avatarColor: AVATAR_COLORS[4], avatarEmoji: "💻",
    isOnline: true, hoursStudied: 189, streak: 8, groupPref: "small-group", genderPref: "female",
  },
  {
    id: "p6", name: "Vikram Singh", age: 24, gender: "male",
    college: "SRCC Delhi", year: "Graduated",
    examFocus: ["professional"], bio: "CA Finals Nov 2025. Audit + SFM left. Need someone who won't let me slack off. Mutual accountability 🤝",
    studyStyle: "audio", lookingFor: "Accountability Buddy",
    interests: ["Finance", "Investing", "Cricket", "Podcasts"],
    avatarColor: AVATAR_COLORS[5], avatarEmoji: "💼",
    isOnline: false, hoursStudied: 1450, streak: 34, groupPref: "1v1", genderPref: "male",
  },
  {
    id: "p7", name: "Isha Gupta", age: 20, gender: "female",
    college: "Lady Shri Ram", year: "2nd Year",
    examFocus: ["law"], bio: "CLAT prep + moot court queen 👑 Looking for someone to discuss constitutional law with over chai.",
    studyStyle: "reading", lookingFor: "Study Partner",
    interests: ["Constitutional Law", "Debate", "Writing", "Theatre"],
    avatarColor: AVATAR_COLORS[6], avatarEmoji: "⚖️",
    isOnline: true, hoursStudied: 520, streak: 15, groupPref: "1v1", genderPref: "any",
  },
  {
    id: "p8", name: "Aditya Joshi", age: 21, gender: "male",
    college: "BITS Pilani", year: "3rd Year",
    examFocus: ["tech", "engineering"], bio: "System design nerd. Building my startup on the side. Let's do deep work sessions — no distractions 🔥",
    studyStyle: "visual", lookingFor: "Study Partner",
    interests: ["System Design", "Startups", "Product", "Coffee"],
    avatarColor: AVATAR_COLORS[7], avatarEmoji: "🧠",
    isOnline: true, hoursStudied: 890, streak: 28, groupPref: "any", genderPref: "any",
  },
  {
    id: "p9", name: "Kavya Nair", age: 22, gender: "female",
    college: "CMC Vellore", year: "3rd Year",
    examFocus: ["medical"], bio: "Pathology is my love language 🔬 8-hour study sessions are my normal. Matching with serious med students only.",
    studyStyle: "visual", lookingFor: "Study Partner",
    interests: ["Pathology", "Microscopy", "Classical Music", "Painting"],
    avatarColor: AVATAR_COLORS[8], avatarEmoji: "🏥",
    isOnline: false, hoursStudied: 1567, streak: 52, groupPref: "1v1", genderPref: "female",
  },
  {
    id: "p10", name: "Rohan Desai", age: 20, gender: "male",
    college: "IIT Delhi", year: "2nd Year",
    examFocus: ["engineering", "tech"], bio: "CP addict. Codeforces purple. Let's do virtual contests together and discuss approaches after 🏆",
    studyStyle: "hands-on", lookingFor: "Group Study",
    interests: ["CP", "Math", "Algorithms", "Anime"],
    avatarColor: AVATAR_COLORS[9], avatarEmoji: "🏆",
    isOnline: true, hoursStudied: 743, streak: 19, groupPref: "small-group", genderPref: "any",
  },
  {
    id: "p11", name: "Meera Krishnan", age: 23, gender: "female",
    college: "IIM Bangalore", year: "1st Year",
    examFocus: ["mba"], bio: "From CAT to IIM-B! Happy to mentor CAT aspirants. Let's do case studies and GD practice 📈",
    studyStyle: "audio", lookingFor: "Group Study",
    interests: ["Strategy", "Finance", "Public Speaking", "Travel"],
    avatarColor: AVATAR_COLORS[0], avatarEmoji: "📈",
    isOnline: true, hoursStudied: 980, streak: 31, groupPref: "small-group", genderPref: "any",
  },
  {
    id: "p12", name: "Deepak Rathore", age: 25, gender: "male",
    college: "Delhi University", year: "Graduated",
    examFocus: ["government"], bio: "UPSC CSE Mains qualified. Optional: History. Looking for answer writing practice partners. Consistency > motivation.",
    studyStyle: "reading", lookingFor: "Accountability Buddy",
    interests: ["Indian History", "Geopolitics", "Fitness", "Meditation"],
    avatarColor: AVATAR_COLORS[1], avatarEmoji: "🏛️",
    isOnline: true, hoursStudied: 3200, streak: 89, groupPref: "1v1", genderPref: "any",
  },
  {
    id: "p13", name: "Tanvi Malhotra", age: 19, gender: "female",
    college: "Manipal University", year: "1st Year",
    examFocus: ["medical"], bio: "First year MBBS and already drowning in anatomy 😅 Need a study partner who makes biochem less painful!",
    studyStyle: "visual", lookingFor: "Study Partner",
    interests: ["Anatomy", "Sketching", "Music", "Dogs"],
    avatarColor: AVATAR_COLORS[2], avatarEmoji: "📚",
    isOnline: true, hoursStudied: 145, streak: 5, groupPref: "any", genderPref: "female",
  },
  {
    id: "p14", name: "Karthik Venkatesh", age: 22, gender: "male",
    college: "NIT Trichy", year: "Final Year",
    examFocus: ["tech"], bio: "Full-stack dev grinding for product roles. React + Node + System Design. Let's whiteboard together 🖥️",
    studyStyle: "hands-on", lookingFor: "Study Partner",
    interests: ["React", "Node.js", "Startups", "Basketball"],
    avatarColor: AVATAR_COLORS[3], avatarEmoji: "💡",
    isOnline: false, hoursStudied: 670, streak: 14, groupPref: "1v1", genderPref: "any",
  },
  {
    id: "p15", name: "Ritika Saxena", age: 21, gender: "female",
    college: "NLSIU Bangalore", year: "3rd Year",
    examFocus: ["law"], bio: "Judiciary prep + law school. Looking for someone to practice answer writing with. Discipline is everything ⚖️",
    studyStyle: "reading", lookingFor: "Accountability Buddy",
    interests: ["Criminal Law", "Moots", "Philosophy", "Hiking"],
    avatarColor: AVATAR_COLORS[4], avatarEmoji: "🎓",
    isOnline: true, hoursStudied: 890, streak: 27, groupPref: "1v1", genderPref: "any",
  },
  {
    id: "p16", name: "Saurabh Pandey", age: 20, gender: "male",
    college: "Allen Kota", year: "Dropper",
    examFocus: ["medical"], bio: "NEET 2nd attempt. 650+ target. Physics is my weakness — looking for someone strong in physics to study with 🎯",
    studyStyle: "audio", lookingFor: "Study Partner",
    interests: ["Biology", "NCERT", "YouTube lectures", "Football"],
    avatarColor: AVATAR_COLORS[5], avatarEmoji: "🔥",
    isOnline: true, hoursStudied: 420, streak: 11, groupPref: "1v1", genderPref: "male",
  },
  {
    id: "p17", name: "Nandini Sharma", age: 24, gender: "female",
    college: "ICAI", year: "Articleship",
    examFocus: ["professional"], bio: "CA Final Group 2. FR + Audit specialist. 4 AM study sessions hit different. Let's clear this together! 💪",
    studyStyle: "reading", lookingFor: "Accountability Buddy",
    interests: ["Accounting", "Tax", "Finance", "Cooking"],
    avatarColor: AVATAR_COLORS[6], avatarEmoji: "📖",
    isOnline: false, hoursStudied: 1890, streak: 56, groupPref: "small-group", genderPref: "female",
  },
  {
    id: "p18", name: "Harsh Vardhan", age: 21, gender: "male",
    college: "IIT Kharagpur", year: "3rd Year",
    examFocus: ["engineering", "tech"], bio: "GATE CSE + placement prep dual mode. Algorithms are life. Looking for someone to do timed problem sets with ⏱️",
    studyStyle: "hands-on", lookingFor: "Study Partner",
    interests: ["Algorithms", "OS", "DBMS", "Photography"],
    avatarColor: AVATAR_COLORS[7], avatarEmoji: "⚡",
    isOnline: true, hoursStudied: 560, streak: 16, groupPref: "any", genderPref: "any",
  },
  {
    id: "p19", name: "Aisha Khan", age: 22, gender: "female",
    college: "Jamia Millia", year: "Final Year",
    examFocus: ["government"], bio: "SSC CGL + RBI Grade B aspirant. Quant queen 👑 Need someone for reasoning & English practice sessions.",
    studyStyle: "visual", lookingFor: "Study Partner",
    interests: ["Maths", "Current Affairs", "Calligraphy", "Poetry"],
    avatarColor: AVATAR_COLORS[8], avatarEmoji: "🌟",
    isOnline: true, hoursStudied: 780, streak: 22, groupPref: "small-group", genderPref: "any",
  },
  {
    id: "p20", name: "Dev Malhotra", age: 23, gender: "male",
    college: "ISB Hyderabad", year: "PGP",
    examFocus: ["mba"], bio: "Ex-consultant, now at ISB. Happy to do case prep for CAT/GMAT aspirants. Let's crack it! 📊",
    studyStyle: "audio", lookingFor: "Group Study",
    interests: ["Consulting", "Strategy", "Networking", "Tennis"],
    avatarColor: AVATAR_COLORS[9], avatarEmoji: "📊",
    isOnline: true, hoursStudied: 1100, streak: 38, groupPref: "small-group", genderPref: "any",
  },
  {
    id: "p21", name: "Pooja Iyer", age: 19, gender: "female",
    college: "Christ University", year: "1st Year",
    examFocus: ["general"], bio: "BBA 1st year! Learning everything from scratch. Need a study buddy for exams + personality development 🌸",
    studyStyle: "audio", lookingFor: "Study Partner",
    interests: ["Business", "Soft Skills", "Dance", "Books"],
    avatarColor: AVATAR_COLORS[0], avatarEmoji: "🌸",
    isOnline: true, hoursStudied: 89, streak: 3, groupPref: "1v1", genderPref: "female",
  },
  {
    id: "p22", name: "Abhishek Tiwari", age: 22, gender: "male",
    college: "DTU Delhi", year: "Final Year",
    examFocus: ["tech"], bio: "LeetCode 400+ problems. Knight rating on Codeforces. Let's grind DSA daily — 2 problems minimum! 🖥️",
    studyStyle: "hands-on", lookingFor: "Study Partner",
    interests: ["DSA", "Competitive Coding", "System Design", "Music Production"],
    avatarColor: AVATAR_COLORS[1], avatarEmoji: "💻",
    isOnline: false, hoursStudied: 920, streak: 41, groupPref: "small-group", genderPref: "any",
  },
  {
    id: "p23", name: "Shruti Mishra", age: 21, gender: "female",
    college: "BHU Varanasi", year: "3rd Year",
    examFocus: ["engineering"], bio: "GATE EE prep going strong. Power systems my jam ⚡ Need someone for numerical practice + concept discussions.",
    studyStyle: "visual", lookingFor: "Accountability Buddy",
    interests: ["Electrical", "Power Systems", "Robotics", "Yoga"],
    avatarColor: AVATAR_COLORS[2], avatarEmoji: "⚡",
    isOnline: true, hoursStudied: 450, streak: 18, groupPref: "1v1", genderPref: "any",
  },
  {
    id: "p24", name: "Nikhil Aggarwal", age: 24, gender: "male",
    college: "LBSNAA", year: "Training",
    examFocus: ["government"], bio: "IAS officer in training! Willing to mentor UPSC aspirants on weekends. Let's discuss optional strategy 🏛️",
    studyStyle: "reading", lookingFor: "Group Study",
    interests: ["Public Policy", "Administration", "Reading", "Trekking"],
    avatarColor: AVATAR_COLORS[3], avatarEmoji: "🏛️",
    isOnline: false, hoursStudied: 4500, streak: 120, groupPref: "small-group", genderPref: "any",
  },
  {
    id: "p25", name: "Sakshi Verma", age: 20, gender: "female",
    college: "KGMU Lucknow", year: "2nd Year",
    examFocus: ["medical"], bio: "Physiology nerd 🧬 Guyton is my bible. Looking for someone to do topic-wise discussions + quick revisions.",
    studyStyle: "audio", lookingFor: "Study Partner",
    interests: ["Physiology", "Pharmacology", "Sketching", "Cooking"],
    avatarColor: AVATAR_COLORS[4], avatarEmoji: "🧬",
    isOnline: true, hoursStudied: 340, streak: 9, groupPref: "1v1", genderPref: "female",
  },
  {
    id: "p26", name: "Ravi Shankar", age: 23, gender: "male",
    college: "IISc Bangalore", year: "MS Research",
    examFocus: ["tech"], bio: "ML researcher at IISc. Working on NLP. Looking for reading group partners for latest papers 📄🧠",
    studyStyle: "reading", lookingFor: "Group Study",
    interests: ["Machine Learning", "NLP", "Research Papers", "Photography"],
    avatarColor: AVATAR_COLORS[5], avatarEmoji: "🧠",
    isOnline: true, hoursStudied: 1340, streak: 44, groupPref: "small-group", genderPref: "any",
  },
  {
    id: "p27", name: "Divya Chauhan", age: 21, gender: "female",
    college: "Miranda House", year: "3rd Year",
    examFocus: ["government", "general"], bio: "UPSC + NET double prep mode 📚 History optional. Need someone disciplined for 10-hour study days.",
    studyStyle: "reading", lookingFor: "Accountability Buddy",
    interests: ["History", "Political Science", "Essays", "Journaling"],
    avatarColor: AVATAR_COLORS[6], avatarEmoji: "📚",
    isOnline: true, hoursStudied: 1670, streak: 63, groupPref: "1v1", genderPref: "any",
  },
  {
    id: "p28", name: "Akash Banerjee", age: 20, gender: "male",
    college: "Jadavpur University", year: "2nd Year",
    examFocus: ["engineering"], bio: "Mechanical engineering + GATE prep. Thermodynamics and Fluid Mechanics grind 🔧 Night owl study sessions preferred.",
    studyStyle: "visual", lookingFor: "Study Partner",
    interests: ["Mechanics", "CAD", "3D Printing", "Gaming"],
    avatarColor: AVATAR_COLORS[7], avatarEmoji: "🔧",
    isOnline: false, hoursStudied: 280, streak: 7, groupPref: "any", genderPref: "any",
  },
  {
    id: "p29", name: "Zara Ahmed", age: 22, gender: "female",
    college: "Symbiosis Pune", year: "Final Year",
    examFocus: ["mba", "professional"], bio: "CFA L2 + MBA dual track. Equity research is life 📈 Looking for finance study partners who geek out on markets.",
    studyStyle: "hands-on", lookingFor: "Study Partner",
    interests: ["Equity Research", "Valuation", "Markets", "Cycling"],
    avatarColor: AVATAR_COLORS[8], avatarEmoji: "📈",
    isOnline: true, hoursStudied: 820, streak: 25, groupPref: "1v1", genderPref: "any",
  },
  {
    id: "p30", name: "Manish Chandra", age: 21, gender: "male",
    college: "IIIT Hyderabad", year: "3rd Year",
    examFocus: ["tech"], bio: "Open source contributor. Rust + Go enthusiast. Let's pair program and learn systems programming together 🦀",
    studyStyle: "hands-on", lookingFor: "Study Partner",
    interests: ["Rust", "Go", "Open Source", "Linux"],
    avatarColor: AVATAR_COLORS[9], avatarEmoji: "🦀",
    isOnline: true, hoursStudied: 670, streak: 20, groupPref: "1v1", genderPref: "any",
  },
];

// ─── Colleges list for filters ─────────────────────────────────────
export const COLLEGES = [
  "AIIMS Delhi", "IIT Bombay", "IIT Delhi", "IIT Kharagpur", "IIT Madras",
  "BITS Pilani", "NIT Trichy", "NIT Warangal", "DTU Delhi", "IIIT Hyderabad",
  "IISc Bangalore", "JNU Delhi", "Delhi University", "St. Xavier's Mumbai",
  "Lady Shri Ram", "Miranda House", "SRCC Delhi", "Christ University",
  "Jadavpur University", "BHU Varanasi", "Symbiosis Pune", "Manipal University",
  "CMC Vellore", "KGMU Lucknow", "ISB Hyderabad", "IIM Bangalore",
  "NLSIU Bangalore", "Jamia Millia", "Allen Kota", "ICAI",
];

// ─── My profile key ────────────────────────────────────────────────
const MY_PROFILE_KEY = "sd_my_profile";
const MATCHES_KEY = "sd_matches";
const MESSAGES_KEY = "sd_messages";
const SWIPE_HISTORY_KEY = "sd_swipe_history"; // ids already swiped
const PREFS_KEY = "sd_preferences";

// ─── Helpers ───────────────────────────────────────────────────────
export function getMyProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(MY_PROFILE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveMyProfile(profile: Profile) {
  localStorage.setItem(MY_PROFILE_KEY, JSON.stringify(profile));
}

export function getPreferences(): MatchPreferences {
  if (typeof window === "undefined") return defaultPrefs();
  const raw = localStorage.getItem(PREFS_KEY);
  if (!raw) return defaultPrefs();
  try { return JSON.parse(raw); } catch { return defaultPrefs(); }
}

export function savePreferences(prefs: MatchPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function defaultPrefs(): MatchPreferences {
  return {
    ageMin: 16, ageMax: 35,
    genderPref: "any",
    examFocus: [],
    colleges: [],
    groupPref: "any",
    onlineOnly: false,
  };
}

// ─── Swipe history ─────────────────────────────────────────────────
export function getSwipeHistory(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = localStorage.getItem(SWIPE_HISTORY_KEY);
  if (!raw) return new Set();
  try { return new Set(JSON.parse(raw)); } catch { return new Set(); }
}

export function addToSwipeHistory(profileId: string) {
  const history = getSwipeHistory();
  history.add(profileId);
  localStorage.setItem(SWIPE_HISTORY_KEY, JSON.stringify([...history]));
}

// ─── Matches ───────────────────────────────────────────────────────
export function getMatches(): Match[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(MATCHES_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveMatch(match: Match) {
  const matches = getMatches();
  matches.push(match);
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
}

export function updateMatch(matchId: string, updates: Partial<Match>) {
  const matches = getMatches();
  const idx = matches.findIndex(m => m.id === matchId);
  if (idx >= 0) {
    matches[idx] = { ...matches[idx], ...updates };
    localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  }
}

export function getMatchById(matchId: string): Match | undefined {
  return getMatches().find(m => m.id === matchId);
}

// ─── Messages ──────────────────────────────────────────────────────
export function getMessages(matchId: string): Message[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(MESSAGES_KEY);
  if (!raw) return [];
  try {
    const all: Message[] = JSON.parse(raw);
    return all.filter(m => m.matchId === matchId);
  } catch { return []; }
}

export function sendMessage(msg: Message) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(MESSAGES_KEY);
  const all: Message[] = raw ? JSON.parse(raw) : [];
  all.push(msg);
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
  // update match lastMessage
  updateMatch(msg.matchId, { lastMessage: msg.text });
}

// ─── Profile lookup ────────────────────────────────────────────────
export function getProfileById(id: string): Profile | undefined {
  if (id === getMyProfile()?.id) return getMyProfile()!;
  return seedProfiles.find(p => p.id === id);
}

// ─── Compatibility score ──────────────────────────────────────────
export function compatibilityScore(a: Profile, b: Profile): number {
  let score = 0;
  let total = 0;

  // Exam overlap (high weight)
  total += 40;
  const examOverlap = a.examFocus.filter(e => b.examFocus.includes(e)).length;
  score += Math.min(40, (examOverlap / Math.max(1, a.examFocus.length)) * 40);

  // Study style match
  total += 20;
  if (a.studyStyle === b.studyStyle) score += 20;
  else score += 8; // partial

  // Interest overlap
  total += 20;
  const intOverlap = a.interests.filter(i => b.interests.some(bi => bi.toLowerCase() === i.toLowerCase())).length;
  score += Math.min(20, (intOverlap / Math.max(1, a.interests.length)) * 20);

  // Group preference compatibility
  total += 10;
  if (a.groupPref === b.groupPref) score += 10;
  else if (a.groupPref === "any" || b.groupPref === "any") score += 7;
  else score += 3;

  // Same college bonus
  total += 10;
  if (a.college === b.college) score += 10;

  return Math.round((score / total) * 100);
}

// ─── Filtered deck ─────────────────────────────────────────────────
export function getFilteredDeck(prefs: MatchPreferences): Profile[] {
  const me = getMyProfile();
  const swiped = getSwipeHistory();

  return seedProfiles.filter(p => {
    if (me && p.id === me.id) return false;
    if (swiped.has(p.id)) return false;
    if (p.age < prefs.ageMin || p.age > prefs.ageMax) return false;
    if (prefs.genderPref !== "any" && p.gender !== prefs.genderPref) return false;
    if (prefs.examFocus.length > 0 && !p.examFocus.some(e => prefs.examFocus.includes(e))) return false;
    if (prefs.colleges.length > 0 && !prefs.colleges.includes(p.college)) return false;
    if (prefs.onlineOnly && !p.isOnline) return false;
    if (prefs.groupPref !== "any" && p.groupPref !== "any" && p.groupPref !== prefs.groupPref) return false;
    return true;
  });
}

// ─── Auto-reply simulation (for demo) ─────────────────────────────
const AUTO_REPLIES = [
  "Hey! Excited to study together! 📚",
  "What subjects are you focusing on this week?",
  "I usually study from 6-10 PM, does that work?",
  "Let's set up a study date! When are you free?",
  "I'm grinding hard for the exam, let's do this 💪",
  "Do you prefer Pomodoro or long focus blocks?",
  "I made some great notes, I can share them in our session!",
  "Ready for a study marathon? 🔥",
];

export function getAutoReply(): string {
  return AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
}
