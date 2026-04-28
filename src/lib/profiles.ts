import { supabase } from "./supabase";

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
};

export type MatchStatus = "pending" | "matched" | "study-date" | "completed";

export type Match = {
  id: string;
  profileA: string;
  profileB: string;
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
    hours_studied: profileUpdates.hoursStudied,
    streak: profileUpdates.streak,
    group_pref: profileUpdates.groupPref,
    gender_pref: profileUpdates.genderPref,
    student_email: profileUpdates.studentEmail,
    is_verified: profileUpdates.isVerified,
    is_pro: profileUpdates.isPro,
    photo_urls: profileUpdates.photoUrls,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from("profiles").upsert(dbUpdates);
  if (error) throw error;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error || !data) return null;
  return mapProfile(data);
}

// STUBS to prevent compile errors for deprecated matchmaking features
export function getMatches(): Match[] { return []; }
export function getMessages(matchId: string): Message[] { return []; }
export function sendMessage(msg: Message) {}
export function saveMatch(match: Match) {}
export function updateMatch(matchId: string, updates: Partial<Match>) {}
export function getPreferences(): MatchPreferences { return { ageRange: null, genderPref: "any", examFocus: [], colleges: [], cities: [], locationMode: "my-city", groupPref: "any", onlineOnly: false, intent: [], careerGoals: [] }; }
export function savePreferences(prefs: MatchPreferences) {}
export function getFilteredDeck(prefs: MatchPreferences): Profile[] { return seedProfiles; }
export function addToSwipeHistory(profileId: string) {}
export function compatibilityScore(a: Profile, b: Profile): number { return 0; }
export function getAutoReply(): string { return "Hey! I'm currently studying in a room. Come join me!"; }
export const seedProfiles: Profile[] = [
  {
    id: "mock_1", name: "Aisha", age: 21, gender: "female", city: "Mumbai",
    college: "IIT Bombay", year: "3rd Year", examFocus: ["Coding", "Startup"],
    careerGoal: "Founder", bio: "Building a SaaS. Need someone to keep me accountable during deep work sprints.",
    studyStyle: "visual", intent: "accountability", studyFormats: ["Pomodoro", "Silent"],
    interests: ["Startups", "Coffee", "Design"], availability: "Evenings",
    lookingForPrompt: "Someone who doesn't quit after 2 hours.", avatarColor: "#FF6B9E",
    avatarEmoji: "🚀", isOnline: true, hoursStudied: 142, streak: 12,
    groupPref: "1v1", genderPref: "any", isVerified: true, isPro: true, photoUrls: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop"]
  },
  {
    id: "mock_2", name: "Rahul", age: 22, gender: "male", city: "Delhi",
    college: "Delhi University", year: "4th Year", examFocus: ["UPSC"],
    careerGoal: "Civil Services", bio: "12 hours a day. Hardcore prep. If you want to chat, swipe left.",
    studyStyle: "reading", intent: "study-buddy", studyFormats: ["Library", "Flashcards"],
    interests: ["History", "Politics", "Chess"], availability: "All Day",
    lookingForPrompt: "A silent partner for marathon sessions.", avatarColor: "#3B82F6",
    avatarEmoji: "📚", isOnline: false, hoursStudied: 450, streak: 45,
    groupPref: "small-group", genderPref: "any", isVerified: true, isPro: false, photoUrls: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop"]
  },
  {
    id: "mock_3", name: "Priya", age: 20, gender: "female", city: "Bangalore",
    college: "NIFT", year: "2nd Year", examFocus: ["Design"],
    careerGoal: "UI/UX Designer", bio: "Lofi beats and Figma. Let's co-work and share screens!",
    studyStyle: "hands-on", intent: "friends-first", studyFormats: ["Screen Share", "Music"],
    interests: ["Art", "Anime", "Web3"], availability: "Late Night",
    lookingForPrompt: "Creative vibes only 🎨", avatarColor: "#8B5CF6",
    avatarEmoji: "✨", isOnline: true, hoursStudied: 89, streak: 5,
    groupPref: "1v1", genderPref: "any", isVerified: false, isPro: false, photoUrls: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop"]
  }
];
