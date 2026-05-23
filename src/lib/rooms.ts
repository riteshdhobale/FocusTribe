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
  created_at?: string;
  last_active_at?: string;
};

/** Minutes before an empty user-created room is auto-archived */
const EMPTY_ROOM_TTL_MINUTES = 15;

/** A new overflow room is only allowed when the fullest room is this % full */
const OVERFLOW_THRESHOLD = 0.75;

/** Maximum user-created rooms per category slug */
const MAX_USER_ROOMS_PER_CATEGORY = 5;

const LOCAL_ROOMS_KEY = "focustribe_rooms";

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

/**
 * Auto-archives localStorage rooms that have been empty (0 participants)
 * for longer than EMPTY_ROOM_TTL_MINUTES. Called on every room list load.
 */
function pruneEmptyLocalRooms() {
  const now = Date.now();
  const cutoff = EMPTY_ROOM_TTL_MINUTES * 60 * 1000;
  const rooms = getLocalRooms();
  const alive = rooms.filter((r) => {
    if (!r.is_active) return false;
    // System seeds never get pruned
    if (r.created_by === "system") return true;
    // If 0 participants and older than TTL, prune
    const count = r.participantCount ?? 0;
    const createdAt = r.created_at ? new Date(r.created_at).getTime() : 0;
    if (count === 0 && createdAt && now - createdAt > cutoff) return false;
    return true;
  });
  if (alive.length !== rooms.length) saveLocalRooms(alive);
  return alive;
}

// ─── Seed Rooms — MVP: 3 flagship rooms by life stage ────────────
//
// Concentrates all users into 3 rooms so the platform always looks
// alive. Expand when DAU justifies splitting (see milestones in
// categories.ts).
//
// liveCount(min, peak) — varies by time of day so rooms look
// realistically busy during Indian study peak hours.
//
function liveCount(min: number, peak: number): number {
  const hour = new Date().getHours();
  const isPeak =
    (hour >= 8 && hour < 12) ||
    (hour >= 14 && hour < 19) ||
    (hour >= 21 && hour <= 23);
  const isNight = hour >= 0 && hour < 6;
  if (isNight) return min;
  if (isPeak) return peak;
  return Math.floor((min + peak) / 2);
}

const SEED_ROOMS: StudyRoom[] = [
  {
    id: "flagship-school",
    slug: "school",
    name: "School Focus Room",
    topic: "Boards · JEE/NEET Prep · SAT · A-Levels",
    capacity: 8,
    created_by: "system",
    is_active: true,
    participantCount: liveCount(3, 7),
  },
  {
    id: "flagship-college",
    slug: "college",
    name: "College Focus Room",
    topic: "Sem Exams · CA Inter · GRE · Engineering",
    capacity: 8,
    created_by: "system",
    is_active: true,
    participantCount: liveCount(4, 8),
  },
  {
    id: "flagship-beyond",
    slug: "beyond",
    name: "Beyond Focus Room",
    topic: "UPSC · CA Final · CFA · PhD · MBA",
    capacity: 8,
    created_by: "system",
    is_active: true,
    participantCount: liveCount(2, 6),
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   FULL SEED ROOMS — restore when expanding back to exam-specific categories
   Unlock milestones: 200 DAU → Medical + Engineering
                      500 DAU → Government + Tech + MBA
                     1000 DAU → all rooms below
   ─────────────────────────────────────────────────────────────────────────────

const FULL_SEED_ROOMS: StudyRoom[] = [
  // ── India ──
  { id: "flagship-medical",      slug: "medical",      name: "Medical Focus Room",       topic: "NEET UG · NEET PG · FMGE",           capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(2, 7) },
  { id: "flagship-engineering",  slug: "engineering",  name: "Engineering Focus Room",   topic: "JEE · GATE · Sem Prep",               capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(3, 8) },
  { id: "flagship-government",   slug: "government",   name: "Government Exam Room",     topic: "UPSC · SSC · Bank PO",                capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(2, 7) },
  { id: "flagship-mba",          slug: "mba",          name: "MBA & Business Room",      topic: "CAT · GMAT · XAT",                    capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(1, 6) },
  { id: "flagship-law",          slug: "law",          name: "Law Focus Room",           topic: "CLAT · LSAT · Bar Exam",              capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(1, 5) },
  { id: "flagship-professional", slug: "professional", name: "Professional Cert Room",   topic: "CA · CFA · CPA · CMA",                capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(1, 6) },
  // ── Global ──
  { id: "flagship-premed",       slug: "premed",       name: "Pre-Med Focus Room",       topic: "MCAT · Biochem · A&P",                capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(2, 6) },
  { id: "flagship-graduate",     slug: "graduate",     name: "Graduate Prep Room",       topic: "GRE · GMAT · Thesis",                 capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(1, 5) },
  { id: "flagship-finance",      slug: "finance",      name: "Finance & CFA Room",       topic: "CFA · FRM · CPA · Actuarial",         capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(1, 5) },
  { id: "flagship-language",     slug: "language",     name: "Language & IELTS Room",    topic: "IELTS · TOEFL · Writing",             capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(2, 6) },
  { id: "flagship-alevels",      slug: "alevels",      name: "A-Levels / IB Room",       topic: "A-Levels · IB · SAT · GCSE",          capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(1, 5) },
  // ── Both ──
  { id: "flagship-tech",         slug: "tech",         name: "Tech & Coding Room",       topic: "DSA · System Design · LeetCode",      capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(3, 8) },
  { id: "flagship-general",      slug: "general",      name: "General Study Room",       topic: "Open — any subject welcome",           capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(2, 7) },
  { id: "flagship-startup",      slug: "startup",      name: "Startup Founders Room",    topic: "MVP · Product · Fundraising",          capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(1, 5) },
  { id: "flagship-research",     slug: "research",     name: "Research & PhD Room",      topic: "Paper writing · Literature review",    capacity: 8, created_by: "system", is_active: true, participantCount: liveCount(1, 4) },
];
*/


// ─── Fetch Rooms ────────────────────────────────────────────────
export async function fetchRoomsBySlug(slug: string): Promise<StudyRoom[]> {
  let dbRooms: StudyRoom[] = [];

  // Try Supabase first — also soft-delete rooms empty for 20+ min
  if (isSupabaseConfigured()) {
    try {
      // Auto-archive empty user rooms older than TTL (never touch system rooms)
      await supabase
        .from("study_rooms" as any)
        .update({ is_active: false })
        .eq("slug", slug)
        .eq("is_active", true)
        .lt(
          "last_active_at",
          new Date(Date.now() - EMPTY_ROOM_TTL_MINUTES * 60 * 1000).toISOString(),
        )
        .neq("created_by", "system");

      const { data: rooms, error } = await supabase
        .from("study_rooms" as any)
        .select(
          `
          id, slug, name, topic, capacity, created_by, is_active, created_at, last_active_at,
          participants:room_participants(count)
        `,
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .order("last_active_at", { ascending: false });

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

  // Prune and get local rooms
  const allLocalRooms = pruneEmptyLocalRooms();
  const localRooms = allLocalRooms.filter((r) => r.slug === slug && r.is_active);

  // Helper: hide rooms with 0 participants (never show dead rooms)
  const isVisible = (r: StudyRoom) =>
    r.created_by === "system" || (r.participantCount ?? 0) > 0;

  // If we got DB rooms, return those sorted, hiding empty user rooms
  if (dbRooms.length > 0) {
    return [...dbRooms]
      .filter(isVisible)
      .sort((a, b) => (b.participantCount ?? 0) - (a.participantCount ?? 0));
  }

  // No DB — seeds + local user rooms (non-empty only)
  const seeds = SEED_ROOMS.filter((r) => r.slug === slug);
  const userLocalRooms = localRooms
    .filter((r) => r.created_by !== "system" && (r.participantCount ?? 0) > 0);

  return [...seeds, ...userLocalRooms].sort(
    (a, b) => (b.participantCount ?? 0) - (a.participantCount ?? 0),
  );
}

/**
 * A new room can be created when the fullest REAL (user-created) room is ≥75% full.
 * Seed/system rooms are excluded — their participant counts are simulated for display
 * only and must never drive the overflow trigger.
 * Returns false when only seed rooms exist (demo / early stage).
 */
export function canCreateRoom(existingRooms: StudyRoom[]): boolean {
  // Only look at real user-created rooms with actual participants
  const realRooms = existingRooms.filter(
    (r) => r.created_by !== "system" && (r.participantCount ?? 0) > 0,
  );

  // No real activity yet → hide the button, keep the platform clean
  if (realRooms.length === 0) return false;

  // Find the most-full real room
  const busiest = realRooms.reduce(
    (best, r) =>
      (r.participantCount ?? 0) / (r.capacity || 8) >
      (best.participantCount ?? 0) / (best.capacity || 8)
        ? r
        : best,
    realRooms[0],
  );

  const fillRate = (busiest.participantCount ?? 0) / (busiest.capacity || 8);
  return fillRate >= OVERFLOW_THRESHOLD;
}


export async function fetchRoomById(id: string): Promise<StudyRoom | null> {
  // Check localStorage first (for user-created demo rooms)
  const localRoom = getLocalRooms().find((r) => r.id === id);
  if (localRoom) return localRoom;

  // Check seeds
  const seedRoom = SEED_ROOMS.find((r) => r.id === id);
  if (seedRoom) return seedRoom;

  // Try Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data: room, error } = await supabase
        .from("study_rooms" as any)
        .select(
          `
          id, slug, name, topic, capacity, created_by, is_active,
          participants:room_participants(count)
        `,
        )
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
        .insert([
          {
            ...room,
            created_by: userId,
          },
        ])
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
    created_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
  };
  const existing = getLocalRooms();
  // Enforce cap even for localStorage
  const userRoomsForSlug = existing.filter(
    (r) => r.slug === newRoom.slug && r.created_by !== "system" && r.is_active,
  );
  if (userRoomsForSlug.length >= MAX_USER_ROOMS_PER_CATEGORY) {
    throw new Error(`Maximum ${MAX_USER_ROOMS_PER_CATEGORY} rooms per category reached.`);
  }
  saveLocalRooms([...existing, newRoom]);
  return newRoom;
}

// ─── Participant Tracking ───────────────────────────────────────
export async function joinRoom(roomId: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("room_participants" as any).upsert(
        [
          {
            room_id: roomId,
            user_id: session.session.user.id,
            joined_at: new Date().toISOString(),
            left_at: null,
          },
        ],
        { onConflict: "room_id, user_id" },
      );
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
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silently fail — best effort on page teardown
  }
}
