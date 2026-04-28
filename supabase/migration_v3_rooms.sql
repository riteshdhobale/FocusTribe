-- ═══════════════════════════════════════════════════════════════════
-- StudyDate — Database Migration v3 (Study Rooms)
-- Run this script in Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════════

-- ─── STUDY ROOMS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,          -- e.g., 'medical', 'engineering'
  name TEXT NOT NULL,          -- e.g., 'NEET Biology Grind'
  topic TEXT NOT NULL,         -- e.g., 'Human Physiology'
  capacity INTEGER NOT NULL DEFAULT 12,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ROOM PARTICIPANTS (For Live Count) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

-- RLS
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active study rooms"
  ON public.study_rooms FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create rooms"
  ON public.study_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can view participants"
  ON public.room_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join rooms"
  ON public.room_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON public.room_participants FOR UPDATE
  USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own participation"
  ON public.room_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime
-- Go to Database -> Replication and enable Realtime for study_rooms, room_participants
