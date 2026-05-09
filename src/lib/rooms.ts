import { supabase, isSupabaseConfigured } from "./supabase";

export type StudyRoom = {
  id: string;
  slug: string;
  name: string;
  topic: string;
  capacity: number;
  created_by: string;
  is_active: boolean;
  participantCount?: number;
};

const LOCAL_ROOMS_KEY = "studydate_rooms";

// ─── Local Storage Helpers (Demo Fallback) ──────────────────────
function getLocalRooms(): StudyRoom[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ROOMS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalRooms(rooms: StudyRoom[]) {
  localStorage.setItem(LOCAL_ROOMS_KEY, JSON.stringify(rooms));
}

// ─── Seed Rooms (shown when DB is empty/unavailable) ────────────
const SEED_ROOMS: StudyRoom[] = [
  { id: "seed-neet-1", slug: "neet", name: "NEET Biology Marathon", topic: "Human Physiology + Genetics", capacity: 12, created_by: "system", is_active: true, participantCount: 3 },
  { id: "seed-neet-2", slug: "neet", name: "NEET Chemistry Revision", topic: "Organic Chemistry — GOC + Isomerism", capacity: 8, created_by: "system", is_active: true, participantCount: 5 },
  { id: "seed-jee", slug: "jee", name: "JEE Mains PYQ Grind", topic: "Maths — Calculus + Coordinate Geometry", capacity: 10, created_by: "system", is_active: true, participantCount: 7 },
  { id: "seed-upsc", slug: "upsc", name: "UPSC GS Paper II", topic: "Polity + Governance Current Affairs", capacity: 15, created_by: "system", is_active: true, participantCount: 4 },
  { id: "seed-cat", slug: "cat", name: "CAT Quant Sprint", topic: "Number Theory + Algebra", capacity: 8, created_by: "system", is_active: true, participantCount: 2 },
  { id: "seed-gate", slug: "gate", name: "GATE CS Focus Room", topic: "DSA + OS + DBMS", capacity: 10, created_by: "system", is_active: true, participantCount: 6 },
  { id: "seed-eng-1", slug: "engineering", name: "Engineering Sprint", topic: "Semester Prep — All Branches", capacity: 12, created_by: "system", is_active: true, participantCount: 3 },
  { id: "seed-eng-2", slug: "engineering", name: "DSA & Placement Prep", topic: "Leetcode Patterns + System Design", capacity: 8, created_by: "system", is_active: true, participantCount: 4 },
  { id: "seed-med", slug: "medical", name: "Medical PG Prep", topic: "Pathology + Pharmacology Review", capacity: 10, created_by: "system", is_active: true, participantCount: 2 },
  { id: "seed-law", slug: "law", name: "CLAT & Judiciary", topic: "Legal Reasoning + Constitutional Law", capacity: 8, created_by: "system", is_active: true, participantCount: 1 },
  { id: "seed-gen-1", slug: "general", name: "General Study Room", topic: "Open study — any subject welcome", capacity: 15, created_by: "system", is_active: true, participantCount: 5 },
  { id: "seed-gen-2", slug: "general", name: "Late Night Grind 🌙", topic: "Night owls silent study session", capacity: 10, created_by: "system", is_active: true, participantCount: 3 },
  { id: "seed-board-1", slug: "boards", name: "Class 12 Physics", topic: "Optics + Modern Physics", capacity: 10, created_by: "system", is_active: true, participantCount: 4 },
  { id: "seed-board-2", slug: "boards", name: "Class 12 Maths", topic: "Calculus + Probability", capacity: 10, created_by: "system", is_active: true, participantCount: 2 },
];

// ─── Fetch Rooms ────────────────────────────────────────────────
export async function fetchRoomsBySlug(slug: string): Promise<StudyRoom[]> {
  let dbRooms: StudyRoom[] = [];

  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data: rooms, error } = await supabase
        .from("study_rooms" as any)
        .select(`
          id, slug, name, topic, capacity, created_by, is_active,
          participants:room_participants(count)
        `)
        .eq("slug", slug)
        .eq("is_active", true);

      if (!error && rooms && rooms.length > 0) {
        dbRooms = rooms.map((r: any) => ({
          ...r,
          participantCount: r.participants?.[0]?.count || 0,
        }));
      }
    } catch {
      // DB unavailable — fall through to local + seeds
    }
  }

  // Merge with localStorage rooms
  const localRooms = getLocalRooms().filter(r => r.slug === slug && r.is_active);

  // If we got DB rooms, return those + local
  if (dbRooms.length > 0) return [...dbRooms, ...localRooms];

  // No DB rooms — return local + seed rooms for this slug
  const seeds = SEED_ROOMS.filter(r => r.slug === slug);
  return [...seeds, ...localRooms];
}

export async function fetchRoomById(id: string): Promise<StudyRoom | null> {
  // Check localStorage first (for user-created demo rooms)
  const localRoom = getLocalRooms().find(r => r.id === id);
  if (localRoom) return localRoom;

  // Check seeds
  const seedRoom = SEED_ROOMS.find(r => r.id === id);
  if (seedRoom) return seedRoom;

  // Try Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data: room, error } = await supabase
        .from("study_rooms" as any)
        .select(`
          id, slug, name, topic, capacity, created_by, is_active,
          participants:room_participants(count)
        `)
        .eq("id", id)
        .single();

      if (!error && room) {
        return {
          ...(room as any),
          participantCount: (room as any).participants?.[0]?.count || 0,
        } as StudyRoom;
      }
    } catch {
      // Fall through
    }
  }

  return null;
}

// ─── Create Room (DB + localStorage fallback) ───────────────────
export async function createStudyRoom(room: Omit<StudyRoom, "id" | "is_active" | "created_by">) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id || "anonymous";

  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("study_rooms" as any)
        .insert([{
          ...room,
          created_by: userId,
        }])
        .select()
        .single();

      if (!error && data) return data as any as StudyRoom;
    } catch {
      // Fall through to localStorage
    }
  }

  // Fallback: create in localStorage
  const newRoom: StudyRoom = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...room,
    created_by: userId,
    is_active: true,
    participantCount: 1,
  };
  const existing = getLocalRooms();
  saveLocalRooms([...existing, newRoom]);
  return newRoom;
}

// ─── Participant Tracking ───────────────────────────────────────
export async function joinRoom(roomId: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from("room_participants" as any)
        .upsert([{
          room_id: roomId,
          user_id: session.session.user.id,
          joined_at: new Date().toISOString(),
          left_at: null,
        }], { onConflict: "room_id, user_id" });
    } catch {
      // Silently fail for demo rooms
    }
  }
}

export async function leaveRoom(roomId: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from("room_participants" as any)
        .update({ left_at: new Date().toISOString() })
        .match({ room_id: roomId, user_id: session.session.user.id });
    } catch {
      // Silently fail for demo rooms
    }
  }
}

/**
 * Fire-and-forget leave room via fetch keepalive.
 * Used on `beforeunload` because async fetch is unreliable during page teardown.
 */
export function leaveRoomBeacon(roomId: string, userId: string) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") return;

  const url = `${supabaseUrl}/rest/v1/room_participants?room_id=eq.${roomId}&user_id=eq.${userId}`;
  const body = JSON.stringify({ left_at: new Date().toISOString() });

  try {
    fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=minimal",
      },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silently fail — best effort on page teardown
  }
}
