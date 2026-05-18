import { supabase, isSupabaseConfigured } from "./supabase";

type StoredSwipeCounts = {
  date: string;
  right: number;
  left: number;
  superlike: number;
};

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function todayKey() {
  // YYYY-MM-DD in local time
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function monthKey() {
  // YYYY-MM in local time
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

const SWIPE_COUNTS_KEY = "sd_swipes_today";
const PROMPT_COUNTS_KEY_PREFIX = "sd_prompts_month_";

export type Gender = "male" | "female" | "non-binary";
export type StudyStyle = "visual" | "audio" | "reading" | "hands-on";
export type GroupPref = "1v1" | "small-group" | "any";

export type Profile = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  city: string;
  college: string;
  year: string;
  examFocus: string[];
  careerGoal: string;
  bio: string;
  studyStyle: StudyStyle;
  intent: string;
  studyFormats: string[];
  interests: string[];
  availability: string;
  lookingForPrompt: string;
  avatarColor: string;
  avatarEmoji: string;
  isOnline: boolean;
  hoursStudied: number;
  streak: number;
  groupPref: GroupPref;
  genderPref: "male" | "female" | "any";
  studentEmail?: string;
  isVerified: boolean;
  isPro: boolean;
  photoUrls: string[];
  isMock?: boolean;
};

export type MatchStatus = "pending" | "matched" | "study-date" | "completed" | "unmatched";

export type Match = {
  id: string;
  profileA: string;
  profileB: string;
  status: MatchStatus;
  timestamp: number;
  lastMessage?: string;
  unread: number;
  /** Which user ID is "me" in this match — set by getMatches() for safe partner resolution */
  _myId?: string;
};

export type Message = {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: number;
};

export type MatchPreferences = {
  ageRange: { min: number; max: number } | null;
  genderPref: "male" | "female" | "any";
  examFocus: string[];
  colleges: string[];
  cities: string[];
  locationMode: string;
  groupPref: GroupPref;
  onlineOnly: boolean;
  intent: string[];
  careerGoals: string[];
};

export function getTodaySwipeCounts(): { right: number; left: number; superlike: number } {
  if (typeof window === "undefined") return { right: 0, left: 0, superlike: 0 };
  const stored = safeParseJson<StoredSwipeCounts>(localStorage.getItem(SWIPE_COUNTS_KEY));
  const today = todayKey();
  if (!stored || stored.date !== today) return { right: 0, left: 0, superlike: 0 };
  return { right: stored.right || 0, left: stored.left || 0, superlike: stored.superlike || 0 };
}

function setTodaySwipeCounts(next: { right: number; left: number; superlike?: number }) {
  if (typeof window === "undefined") return;
  const current = getTodaySwipeCounts();
  const payload: StoredSwipeCounts = {
    date: todayKey(),
    right: Math.max(0, next.right || 0),
    left: Math.max(0, next.left || 0),
    superlike: Math.max(0, next.superlike ?? current.superlike),
  };
  localStorage.setItem(SWIPE_COUNTS_KEY, JSON.stringify(payload));
}

export function getMonthlyPromptCount(): number {
  if (typeof window === "undefined") return 0;
  const key = `${PROMPT_COUNTS_KEY_PREFIX}${monthKey()}`;
  const raw = localStorage.getItem(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function incrementMonthlyPromptCount(by = 1): number {
  if (typeof window === "undefined") return 0;
  const key = `${PROMPT_COUNTS_KEY_PREFIX}${monthKey()}`;
  const next = Math.max(0, getMonthlyPromptCount() + Math.max(0, by));
  localStorage.setItem(key, String(next));
  return next;
}

// Map DB snake_case to frontend camelCase
function mapProfile(data: any): Profile {
  return {
    id: data.id,
    name: data.name,
    age: data.age,
    gender: data.gender,
    city: data.city,
    college: data.college,
    year: data.year,
    examFocus: data.exam_focus || [],
    careerGoal: data.career_goal || "",
    bio: data.bio || "",
    studyStyle: data.study_style,
    intent: data.intent,
    studyFormats: data.study_formats || [],
    interests: data.interests || [],
    availability: data.availability || "",
    lookingForPrompt: data.looking_for_prompt || "",
    avatarColor: data.avatar_color || "",
    avatarEmoji: data.avatar_emoji || "",
    isOnline: data.is_online || false,
    hoursStudied: data.hours_studied || 0,
    streak: data.streak || 0,
    groupPref: data.group_pref,
    genderPref: data.gender_pref,
    studentEmail: data.student_email,
    isVerified: data.is_verified || false,
    isPro: data.is_pro || false,
    photoUrls: data.photo_urls || [],
  };
}

export async function getMyProfile(): Promise<Profile | null> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.session.user.id)
    .single();

  if (error || !data) return null;
  return mapProfile(data);
}

export async function saveMyProfile(profileUpdates: Partial<Profile>) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) throw new Error("Not authenticated");

  // SECURITY: is_pro, is_verified, hours_studied, and streak are SERVER-MANAGED ONLY.
  // They must NEVER be set from the client. Use Supabase Edge Functions or admin dashboard.
  const dbUpdates = {
    id: session.session.user.id,
    name: profileUpdates.name,
    age: profileUpdates.age,
    gender: profileUpdates.gender,
    city: profileUpdates.city,
    college: profileUpdates.college,
    year: profileUpdates.year,
    exam_focus: profileUpdates.examFocus,
    career_goal: profileUpdates.careerGoal,
    bio: profileUpdates.bio,
    study_style: profileUpdates.studyStyle,
    intent: profileUpdates.intent,
    study_formats: profileUpdates.studyFormats,
    interests: profileUpdates.interests,
    availability: profileUpdates.availability,
    looking_for_prompt: profileUpdates.lookingForPrompt,
    avatar_color: profileUpdates.avatarColor,
    avatar_emoji: profileUpdates.avatarEmoji,
    is_online: profileUpdates.isOnline,
    group_pref: profileUpdates.groupPref,
    gender_pref: profileUpdates.genderPref,
    student_email: profileUpdates.studentEmail,
    photo_urls: profileUpdates.photoUrls,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert(dbUpdates as any);
  if (error) throw error;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  // Check for bot profile
  if (id === BOT_PROFILE.id) return BOT_PROFILE;

  // Check Supabase
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (!error && data) return mapProfile(data);
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// DEMO BOT — A fake user for testing chat & video call features
// ═══════════════════════════════════════════════════════════════════

export const BOT_PROFILE: Profile = {
  id: "studydate-bot",
  name: "Arya (StudyDate Bot)",
  age: 21,
  gender: "female",
  city: "Mumbai",
  college: "IIT Bombay",
  year: "3rd Year",
  examFocus: ["jee", "engineering"],
  careerGoal: "AI/ML Engineer",
  bio: "Hey! 👋 I'm your demo study buddy. Test the chat, video call, and matching features with me. I'll respond to your messages automatically!",
  studyStyle: "visual",
  intent: "study-buddy,accountability",
  studyFormats: ["Pomodoro", "Video call sessions"],
  interests: ["Coding", "Physics", "Coffee"],
  availability: "Evenings + Weekends",
  lookingForPrompt:
    "Someone who's serious about studying but knows how to have fun. Let's crack this together! 🚀",
  avatarColor: "#FF6B9E",
  avatarEmoji: "🤖",
  isOnline: true,
  hoursStudied: 342,
  streak: 45,
  groupPref: "any",
  genderPref: "any",
  isVerified: true,
  isPro: true,
  photoUrls: [],
};

const BOT_REPLIES = [
  "Hey! Ready to study? Let's pick a room 📚",
  "Nice! What are you working on today?",
  "I'm revising calculus right now. Want to join a video room?",
  "That's awesome! Consistency > intensity 🔥",
  "Let's do a 25-min Pomodoro sprint together?",
  "I just hit a 45-day streak! Your turn 💪",
  "Haha same! This topic is tricky but we'll crack it.",
  "Click the Study Date button above to start a video session with me! 📹",
  "Pro tip: use the Pomodoro timer in the room — it really helps focus.",
  "You're doing great! Keep going 🚀",
  "I love how StudyDate makes studying less lonely 💛",
  "Want to try the video room? It's like body doubling but better!",
];

// ─── Realtime Database Integration ──────────────────────────────────
export async function getMatches(): Promise<Match[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return [];
  const uid = session.session.user.id;

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .or(`profile_a.eq.${uid},profile_b.eq.${uid}`)
    .neq("status", "unmatched")          // ← never show unmatched rows
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map((m) => ({
    id: m.id,
    profileA: m.profile_a,
    profileB: m.profile_b,
    status: m.status as MatchStatus,
    timestamp: new Date(m.updated_at).getTime(),
    lastMessage: m.last_message || undefined,
    unread: m.profile_a === uid ? m.unread_a : m.unread_b,
    // Store which side the current user is on so getPartnerId is always correct
    _myId: uid,
  }));
}

export async function updateMatch(matchId: string, updates: Partial<Match>) {
  const dbUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.lastMessage) dbUpdates.last_message = updates.lastMessage;

  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;
  const uid = session.session.user.id;

  if (updates.unread === 0) {
    // Determine if user is profile_a or profile_b to reset unread
    const { data: match } = await supabase
      .from("matches")
      .select("profile_a")
      .eq("id", matchId)
      .single();
    if (match) {
      if (match.profile_a === uid) dbUpdates.unread_a = 0;
      else dbUpdates.unread_b = 0;
    }
  }

  await supabase.from("matches").update(dbUpdates).eq("id", matchId);
}

export async function getMessages(matchId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((m) => ({
    id: m.id,
    matchId: m.match_id,
    senderId: m.sender_id,
    text: m.is_filtered ? "[Message blocked by filter]" : m.text,
    timestamp: new Date(m.created_at).getTime(),
  }));
}

export async function sendMessage(matchId: string, text: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;
  const uid = session.session.user.id;

  const { error } = await supabase.from("messages").insert({
    match_id: matchId,
    sender_id: uid,
    text: text,
  });

  if (error) {
    console.error("Failed to send message:", error);
    throw error;
  }

  // Update match last message and increment unread for the other person
  const { data: match } = await supabase
    .from("matches")
    .select("profile_a, unread_a, unread_b")
    .eq("id", matchId)
    .single();
  if (match) {
    const isUserA = match.profile_a === uid;
    const dbUpdates: any = {
      last_message: text,
      updated_at: new Date().toISOString(),
    };
    if (isUserA) dbUpdates.unread_b = match.unread_b + 1;
    else dbUpdates.unread_a = match.unread_a + 1;

    await supabase.from("matches").update(dbUpdates).eq("id", matchId);
  }
}

const PREFS_KEY = "sd_match_prefs";

export function getPreferences(): MatchPreferences {
  if (typeof window === "undefined")
    return {
      ageRange: null,
      genderPref: "any",
      examFocus: [],
      colleges: [],
      cities: [],
      locationMode: "my-city",
      groupPref: "any",
      onlineOnly: false,
      intent: [],
      careerGoals: [],
    };
  const stored = localStorage.getItem(PREFS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }
  return {
    ageRange: null,
    genderPref: "any",
    examFocus: [],
    colleges: [],
    cities: [],
    locationMode: "my-city",
    groupPref: "any",
    onlineOnly: false,
    intent: [],
    careerGoals: [],
  };
}

export function savePreferences(prefs: MatchPreferences) {
  if (typeof window !== "undefined") {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }
}

export async function getFilteredDeck(prefs: MatchPreferences): Promise<Profile[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return [];
  const uid = session.session.user.id;

  const { data, error } = await supabase.rpc("get_filtered_deck", {
    p_user_id: uid,
    p_age_min: prefs.ageRange?.min || 18,
    p_age_max: prefs.ageRange?.max || 99,
    p_gender_filter: prefs.genderPref || "any",
    p_exam_filter: prefs.examFocus.length ? prefs.examFocus : undefined,
    p_city_filter: prefs.cities.length ? prefs.cities : undefined,
    p_college_filter: prefs.colleges.length ? prefs.colleges : undefined,
  });

  if (error) {
    console.error("Failed to fetch deck:", error);
    return [];
  }

  if (!data || data.length === 0) {
    // If no real users match, maybe return seedProfiles for demo purposes?
    // In production, we'd just return empty. Let's return real empty array.
    return [];
  }

  return data.map(mapProfile);
}

export async function addToSwipeHistory(
  profileId: string,
  action: "left" | "right" | "super-like" = "right",
) {
  if (typeof window !== "undefined" && action) {
    const { right, left, superlike } = getTodaySwipeCounts();
    if (action === "super-like")
      setTodaySwipeCounts({ right: right + 1, left, superlike: superlike + 1 });
    else if (action === "right")
      setTodaySwipeCounts({ right: right + 1, left });
    else
      setTodaySwipeCounts({ right, left: left + 1 });
  }

  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;
  const uid = session.session.user.id;

  const dbAction = action === "left" ? "pass" : action === "super-like" ? "super-like" : "like";

  // Insert swipe into DB. The Supabase trigger `check_mutual_like` will handle auto-creating a match!
  const { error } = await supabase.from("swipe_history").insert({
    swiper_id: uid,
    swiped_id: profileId,
    action: dbAction,
  });

  if (error) {
    console.error("Failed to record swipe:", error);
    return;
  }

  // DEMO MODE — instant match for mock users (UUIDs like 11111111-... to 88888888-...)
  // Use LEAST/GREATEST ordering to match what the DB trigger `check_mutual_like` would do,
  // preventing duplicate/conflicting rows from two different orderings.
  if (
    (dbAction === "like" || dbAction === "super-like") &&
    /^[1-8]{8}-[1-8]{4}-[1-8]{4}-[1-8]{4}-[1-8]{12}$/.test(profileId)
  ) {
    const a = uid < profileId ? uid : profileId;   // LEAST
    const b = uid < profileId ? profileId : uid;   // GREATEST
    await supabase
      .from("matches")
      .insert({ profile_a: a, profile_b: b, status: "matched" })
      .select()  // avoids a 406 on some Supabase versions
      .maybeSingle();  // silently ignore UNIQUE conflicts
  }
}

export function compatibilityScore(a: Profile, b: Profile): number {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const setA = new Set((a.examFocus || []).map((x) => x.toLowerCase()));
  const setB = new Set((b.examFocus || []).map((x) => x.toLowerCase()));
  const sharedFocus = [...setA].filter((x) => setB.has(x)).length;

  const intentsA = new Set(
    (a.intent || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  );
  const intentsB = new Set(
    (b.intent || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  );
  const sharedIntent = [...intentsA].filter((x) => intentsB.has(x)).length;

  const formatsA = new Set((a.studyFormats || []).map((x) => x.toLowerCase()));
  const formatsB = new Set((b.studyFormats || []).map((x) => x.toLowerCase()));
  const sharedFormats = [...formatsA].filter((x) => formatsB.has(x)).length;

  const interestsA = new Set((a.interests || []).map((x) => x.toLowerCase()));
  const interestsB = new Set((b.interests || []).map((x) => x.toLowerCase()));
  const sharedInterests = [...interestsA].filter((x) => interestsB.has(x)).length;

  const sameCity = a.city && b.city && a.city.toLowerCase() === b.city.toLowerCase();

  const score =
    35 +
    Math.min(20, sharedFocus * 10) +
    Math.min(15, sharedIntent * 12) +
    Math.min(15, sharedFormats * 6) +
    Math.min(10, sharedInterests * 3) +
    (sameCity ? 5 : 0);

  return clamp(score);
}

export function getAutoReply(): string {
  return BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
}
