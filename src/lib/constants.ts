// ─── StudyDate Constants ────────────────────────────────────────────

// ── Intent (what you want from the platform) ─────────────────────
export const INTENTS = [
  { value: "study-partner", label: "Study Partner", emoji: "🎯", desc: "Find someone to study specific subjects with" },
  { value: "accountability", label: "Accountability", emoji: "🤝", desc: "Hold each other responsible for daily targets" },
  { value: "study-buddy", label: "Study Buddy", emoji: "📚", desc: "Casual study companion for regular sessions" },
  { value: "just-friends", label: "Just Friends", emoji: "😊", desc: "Make new friends who share your academic goals" },
  { value: "friends-first", label: "Friends First", emoji: "👋", desc: "Build friendship through shared goals, see where it goes" },
  { value: "meaningful-dating", label: "Meaningful Dating", emoji: "💛", desc: "Open to romantic connection through studying together" },
] as const;

export type IntentValue = (typeof INTENTS)[number]["value"];

// ── Study formats ────────────────────────────────────────────────
export const STUDY_FORMATS = [
  "Library sessions",
  "Virtual focus calls",
  "Cafe study dates",
  "Camera-on accountability",
  "Voice-only check-ins",
  "Weekend marathons",
] as const;

// ── Interests / personality ──────────────────────────────────────
export const INTERESTS = [
  "Habit building", "Reading", "Fitness", "Debates", "Coffee", "Anime",
  "Music", "Entrepreneurship", "Travel", "Mindfulness", "Gaming", "Cooking",
  "Photography", "Writing", "Podcasts", "Chess", "Yoga", "Running",
  "Art", "Volunteering", "Public Speaking", "Investing",
] as const;

// ── Academic focus ───────────────────────────────────────────────
export const ACADEMIC_FOCUS = [
  { value: "neet", label: "NEET" },
  { value: "jee", label: "JEE" },
  { value: "upsc", label: "UPSC" },
  { value: "cat", label: "CAT" },
  { value: "ca", label: "CA" },
  { value: "gate", label: "GATE" },
  { value: "law", label: "Law" },
  { value: "coding", label: "Coding" },
  { value: "mba", label: "MBA" },
  { value: "design", label: "Design" },
  // International
  { value: "gre", label: "GRE" },
  { value: "gmat", label: "GMAT" },
  { value: "mcat", label: "MCAT" },
  { value: "usmle", label: "USMLE" },
  { value: "bar-exam", label: "Bar Exam" },
  { value: "cpa", label: "CPA" },
  { value: "ielts", label: "IELTS/TOEFL" },
  { value: "phd", label: "PhD Research" },
  { value: "general", label: "General" },
] as const;

// ── Career goals ─────────────────────────────────────────────────
export const CAREER_GOALS = [
  "Doctor", "Engineer", "Civil Services", "Consulting", "Finance",
  "Law", "Startup", "Product", "Research", "Design", "Academic",
  "Creative", "Data Science", "Marketing", "Management",
] as const;

// ── Cities with country grouping ─────────────────────────────────
export const CITY_GROUPS = {
  India: [
    "Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Pune", "Chennai",
    "Kolkata", "Kota", "Jaipur", "Lucknow", "Chandigarh", "Ahmedabad",
    "Indore", "Patna", "Bhopal", "Nagpur",
  ],
  USA: [
    "New York", "San Francisco", "Boston", "Los Angeles", "Chicago",
    "Austin", "Seattle", "Washington DC",
  ],
  UK: ["London", "Manchester", "Birmingham", "Edinburgh"],
  Canada: ["Toronto", "Vancouver", "Montreal"],
  Australia: ["Sydney", "Melbourne"],
  Singapore: ["Singapore"],
  UAE: ["Dubai", "Abu Dhabi"],
  Germany: ["Berlin", "Munich"],
  Japan: ["Tokyo"],
  "South Korea": ["Seoul"],
} as const;

export type Country = keyof typeof CITY_GROUPS;

export const COUNTRIES = Object.keys(CITY_GROUPS) as Country[];

export const CITIES_INDIA = CITY_GROUPS.India;
export const CITIES_INTERNATIONAL = Object.entries(CITY_GROUPS)
  .filter(([k]) => k !== "India")
  .flatMap(([, v]) => v);

export const ALL_CITIES = [...CITIES_INDIA, ...CITIES_INTERNATIONAL] as const;

/**
 * Get the country for a given city.
 */
export function getCountryForCity(city: string): Country | null {
  for (const [country, cities] of Object.entries(CITY_GROUPS)) {
    if ((cities as readonly string[]).includes(city)) return country as Country;
  }
  return null;
}

/**
 * Get all cities in the same country as the given city.
 */
export function getCitiesInSameCountry(city: string): string[] {
  const country = getCountryForCity(city);
  if (!country) return [city];
  return [...CITY_GROUPS[country]];
}

// ── Location mode for matching ───────────────────────────────────
export type LocationMode = "my-city" | "global";
export const LOCATION_MODES = [
  { value: "my-city" as const, label: "My City", emoji: "📍" },
  { value: "global" as const, label: "Global", emoji: "🌍" },
] as const;

// ── Availability ─────────────────────────────────────────────────
export const AVAILABILITY = [
  "Early mornings",
  "After college",
  "Late nights",
  "Weekends",
  "Flexible",
] as const;

// ── Age ranges (chip filters) ────────────────────────────────────
export const AGE_RANGES = [
  { label: "18-21", min: 18, max: 21 },
  { label: "22-25", min: 22, max: 25 },
  { label: "26-29", min: 26, max: 29 },
  { label: "30+", min: 30, max: 40 },
] as const;

// ── Colleges (popular, for filter chips) ─────────────────────────
export const COLLEGES = [
  "Delhi University", "IIT Bombay", "IIT Delhi", "IIT Madras",
  "BITS Pilani", "NIT Trichy", "NIT Warangal", "NMIMS",
  "NLSIU Bengaluru", "AIIMS Delhi", "CMC Vellore", "IISc Bangalore",
  "St. Xavier's Mumbai", "Christ University", "Manipal University",
  "Jadavpur University", "BHU Varanasi", "Symbiosis Pune",
  "ISB Hyderabad", "IIM Bangalore", "DTU Delhi", "IIIT Hyderabad",
  "SRCC Delhi", "Lady Shri Ram", "Miranda House",
  // International
  "MIT", "Stanford", "Oxford", "Cambridge", "Harvard",
  "NUS Singapore", "University of Toronto", "UCL London",
] as const;

// ── Hinge-style prompts (study edition) ──────────────────────────
export const STUDY_PROMPTS = [
  "My ideal study session looks like...",
  "My biggest academic goal right now is...",
  "The subject I could talk about for hours is...",
  "My most productive study time is...",
  "I need a study partner who...",
  "One study hack that changed my life is...",
  "My proudest academic achievement is...",
  "My biggest study struggle is...",
  "I'm most motivated when...",
  "The book/resource that helped me most is...",
] as const;

// ── Student email domains (for verification) ─────────────────────
// Common .edu and university domains for student verification
export const STUDENT_EMAIL_DOMAINS = [
  // India
  "iitb.ac.in", "iitd.ac.in", "iitm.ac.in", "iitk.ac.in", "iitkgp.ac.in",
  "bits-pilani.ac.in", "nitt.edu", "nitw.ac.in", "du.ac.in",
  "aiims.edu", "nlsiu.ac.in", "iisc.ac.in", "iimb.ac.in",
  "manipal.edu", "christuniversity.in", "symbiosis.ac.in",
  "bhu.ac.in", "jaduniv.edu.in", "dtu.ac.in", "iiit.ac.in",
  "nmims.edu", "isb.edu", "cms.ac.in", "srcc.du.ac.in",
  // USA / International (.edu catch-all + specific)
  "mit.edu", "stanford.edu", "harvard.edu", "yale.edu", "columbia.edu",
  "berkeley.edu", "princeton.edu", "cornell.edu", "upenn.edu",
  "ox.ac.uk", "cam.ac.uk", "ucl.ac.uk", "nus.edu.sg",
  "utoronto.ca", "unimelb.edu.au",
] as const;

/**
 * Check if an email domain is a recognized student email.
 * Accepts any .edu domain or domains in the whitelist.
 */
export function isStudentEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  // Any .edu domain is valid
  if (domain.endsWith(".edu")) return true;
  // Any .ac.in or .edu.in domain is valid (India)
  if (domain.endsWith(".ac.in") || domain.endsWith(".edu.in")) return true;
  // Any .ac.uk domain is valid (UK)
  if (domain.endsWith(".ac.uk")) return true;
  // Specific whitelisted
  return STUDENT_EMAIL_DOMAINS.includes(domain as any);
}

// ── Pricing ──────────────────────────────────────────────────────
export const PRICING = {
  USD: {
    free: { monthly: 0 },
    pro: { monthly: 7.99, quarterly: 19.99 },
    campus: { monthly: 4.99, annual: 59.88 },
    currency: "$",
  },
  INR: {
    free: { monthly: 0 },
    pro: { monthly: 149, quarterly: 399 },
    campus: { monthly: 99, annual: 1188 },
    currency: "₹",
  },
  GBP: {
    free: { monthly: 0 },
    pro: { monthly: 5.99, quarterly: 14.99 },
    campus: { monthly: 3.99, annual: 47.88 },
    currency: "£",
  },
} as const;
