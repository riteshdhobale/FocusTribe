import { supabase } from "./supabase";

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

export async function fetchRoomsBySlug(slug: string): Promise<StudyRoom[]> {
  const { data: rooms, error } = await supabase
    .from("study_rooms")
    .select(`
      id, slug, name, topic, capacity, created_by, is_active,
      participants:room_participants(count)
    `)
    .eq("slug", slug)
    .eq("is_active", true);

  if (error || !rooms) {
    console.error("Error fetching rooms:", error);
    return [];
  }

  return rooms.map((r: any) => ({
    ...r,
    participantCount: r.participants?.[0]?.count || 0,
  }));
}

export async function fetchRoomById(id: string): Promise<StudyRoom | null> {
  const { data: room, error } = await supabase
    .from("study_rooms")
    .select(`
      id, slug, name, topic, capacity, created_by, is_active,
      participants:room_participants(count)
    `)
    .eq("id", id)
    .single();

  if (error || !room) {
    console.error("Error fetching room:", error);
    return null;
  }

  return {
    ...room,
    participantCount: room.participants?.[0]?.count || 0,
  };
}

export async function createStudyRoom(room: Omit<StudyRoom, "id" | "is_active" | "created_by">) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("study_rooms")
    .insert([{
      ...room,
      created_by: session.session.user.id,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function joinRoom(roomId: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;

  await supabase
    .from("room_participants")
    .upsert([{
      room_id: roomId,
      user_id: session.session.user.id,
      joined_at: new Date().toISOString(),
      left_at: null,
    }], { onConflict: "room_id, user_id" });
}

export async function leaveRoom(roomId: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return;

  await supabase
    .from("room_participants")
    .update({ left_at: new Date().toISOString() })
    .match({ room_id: roomId, user_id: session.session.user.id });
}
