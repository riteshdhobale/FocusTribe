-- ═══════════════════════════════════════════════════════════════════
-- StudyDate — Database Migration v1
-- Run this ENTIRE script in Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════════

-- ─── Enable required extensions ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. PROFILES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  age INTEGER NOT NULL DEFAULT 18 CHECK (age >= 18 AND age <= 99),
  gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female', 'non-binary')),
  city TEXT NOT NULL DEFAULT '',
  college TEXT NOT NULL DEFAULT '',
  year TEXT NOT NULL DEFAULT '',
  exam_focus TEXT[] NOT NULL DEFAULT '{}',
  career_goal TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '' CHECK (char_length(bio) <= 500),
  study_style TEXT NOT NULL DEFAULT 'visual' CHECK (study_style IN ('visual', 'audio', 'reading', 'hands-on')),
  intent TEXT NOT NULL DEFAULT 'study-partner',
  study_formats TEXT[] NOT NULL DEFAULT '{}',
  interests TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT NOT NULL DEFAULT 'Flexible',
  looking_for_prompt TEXT NOT NULL DEFAULT '' CHECK (char_length(looking_for_prompt) <= 300),
  avatar_color TEXT NOT NULL DEFAULT '',
  avatar_emoji TEXT NOT NULL DEFAULT '📚',
  is_online BOOLEAN NOT NULL DEFAULT false,
  hours_studied NUMERIC NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  group_pref TEXT NOT NULL DEFAULT 'any' CHECK (group_pref IN ('1v1', 'small-group', 'any')),
  gender_pref TEXT NOT NULL DEFAULT 'any' CHECK (gender_pref IN ('male', 'female', 'any')),
  student_email TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_pro BOOLEAN NOT NULL DEFAULT false,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 2. SWIPE HISTORY ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.swipe_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swiper_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super-like')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)  -- can only swipe someone once
);

CREATE INDEX idx_swipe_history_swiper ON public.swipe_history(swiper_id);
CREATE INDEX idx_swipe_history_swiped ON public.swipe_history(swiped_id);
CREATE INDEX idx_swipe_history_action ON public.swipe_history(action) WHERE action IN ('like', 'super-like');

-- ─── 3. MATCHES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_a UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_b UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'matched' CHECK (status IN ('pending', 'matched', 'study-date', 'completed', 'unmatched')),
  last_message TEXT,
  unread_a INTEGER NOT NULL DEFAULT 0,
  unread_b INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_a, profile_b)
);

CREATE INDEX idx_matches_profile_a ON public.matches(profile_a);
CREATE INDEX idx_matches_profile_b ON public.matches(profile_b);

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── 4. MESSAGES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) <= 2000),
  is_filtered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_match ON public.messages(match_id, created_at);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

-- ─── 5. STUDY SESSIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  started_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  pomodoros_completed INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_study_sessions_match ON public.study_sessions(match_id);

-- ─── 6. CONTACT UNLOCKS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, level)
);

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipe_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;

-- ── Profiles: anyone can read, owner can update ────────────────────
CREATE POLICY "Anyone can read profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Swipe History: only swiper can see/create ──────────────────────
CREATE POLICY "Users can see own swipes"
  ON public.swipe_history FOR SELECT
  USING (auth.uid() = swiper_id);

CREATE POLICY "Users can create swipes"
  ON public.swipe_history FOR INSERT
  WITH CHECK (auth.uid() = swiper_id);

-- ── Matches: both participants can see ─────────────────────────────
CREATE POLICY "Users can see own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = profile_a OR auth.uid() = profile_b);

CREATE POLICY "System can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = profile_a);

CREATE POLICY "Participants can update match"
  ON public.matches FOR UPDATE
  USING (auth.uid() = profile_a OR auth.uid() = profile_b);

-- ── Messages: match participants can read/write ────────────────────
CREATE POLICY "Match participants can read messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = messages.match_id
      AND (matches.profile_a = auth.uid() OR matches.profile_b = auth.uid())
    )
  );

CREATE POLICY "Match participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_id
      AND status = 'matched'
      AND (matches.profile_a = auth.uid() OR matches.profile_b = auth.uid())
    )
  );

-- ── Study Sessions: match participants ─────────────────────────────
CREATE POLICY "Participants can see study sessions"
  ON public.study_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = study_sessions.match_id
      AND (matches.profile_a = auth.uid() OR matches.profile_b = auth.uid())
    )
  );

CREATE POLICY "Participants can create study sessions"
  ON public.study_sessions FOR INSERT
  WITH CHECK (auth.uid() = started_by);

CREATE POLICY "Participants can update study sessions"
  ON public.study_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = study_sessions.match_id
      AND (matches.profile_a = auth.uid() OR matches.profile_b = auth.uid())
    )
  );

-- ── Contact Unlocks: match participants ────────────────────────────
CREATE POLICY "Participants can see contact unlocks"
  ON public.contact_unlocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = contact_unlocks.match_id
      AND (matches.profile_a = auth.uid() OR matches.profile_b = auth.uid())
    )
  );

-- ═══════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════

-- ── Check for mutual like → auto-create match ──────────────────────
CREATE OR REPLACE FUNCTION check_mutual_like()
RETURNS TRIGGER AS $$
DECLARE
  mutual_exists BOOLEAN;
  match_exists BOOLEAN;
BEGIN
  -- Only check for likes and super-likes
  IF NEW.action NOT IN ('like', 'super-like') THEN
    RETURN NEW;
  END IF;

  -- Check if they already liked us
  SELECT EXISTS (
    SELECT 1 FROM public.swipe_history
    WHERE swiper_id = NEW.swiped_id
    AND swiped_id = NEW.swiper_id
    AND action IN ('like', 'super-like')
  ) INTO mutual_exists;

  IF mutual_exists THEN
    -- Check if match already exists
    SELECT EXISTS (
      SELECT 1 FROM public.matches
      WHERE (profile_a = NEW.swiper_id AND profile_b = NEW.swiped_id)
         OR (profile_a = NEW.swiped_id AND profile_b = NEW.swiper_id)
    ) INTO match_exists;

    IF NOT match_exists THEN
      -- Create the match! 🎉
      INSERT INTO public.matches (profile_a, profile_b, status)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id),
        'matched'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_check_mutual
  AFTER INSERT ON public.swipe_history
  FOR EACH ROW EXECUTE FUNCTION check_mutual_like();

-- ── Content filter for messages ────────────────────────────────────
-- Blocks phone numbers, social handles, and URLs
CREATE OR REPLACE FUNCTION filter_message_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for phone numbers (10+ digits)
  IF NEW.text ~ '\d{10,}' THEN
    NEW.is_filtered = true;
    NEW.text = '[Message blocked: sharing contact info is not allowed until goals are completed]';
  END IF;

  -- Check for @usernames
  IF NEW.text ~ '@[a-zA-Z0-9_]{3,}' THEN
    NEW.is_filtered = true;
    NEW.text = '[Message blocked: social handles are not allowed until goals are completed]';
  END IF;

  -- Check for URLs
  IF NEW.text ~* 'https?://|www\.|\.com|\.in|\.org|\.net' THEN
    NEW.is_filtered = true;
    NEW.text = '[Message blocked: links are not allowed in chat]';
  END IF;

  -- Check for "insta", "snap", "whatsapp" etc.
  IF NEW.text ~* '\b(instagram|insta|snapchat|snap|whatsapp|telegram|signal|discord|twitter|facebook|fb)\b' THEN
    NEW.is_filtered = true;
    NEW.text = '[Message blocked: mentioning other platforms is not allowed until goals are completed]';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER filter_messages
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION filter_message_content();

-- ── Get filtered deck (server-side filtering) ─────────────────────
CREATE OR REPLACE FUNCTION get_filtered_deck(
  p_user_id UUID,
  p_age_min INTEGER DEFAULT 18,
  p_age_max INTEGER DEFAULT 99,
  p_gender_filter TEXT DEFAULT 'any',
  p_exam_filter TEXT[] DEFAULT '{}',
  p_city_filter TEXT[] DEFAULT '{}',
  p_college_filter TEXT[] DEFAULT '{}'
)
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  WHERE p.id != p_user_id
    -- Not already swiped
    AND NOT EXISTS (
      SELECT 1 FROM public.swipe_history sh
      WHERE sh.swiper_id = p_user_id AND sh.swiped_id = p.id
    )
    -- Age filter
    AND p.age BETWEEN p_age_min AND p_age_max
    -- Gender filter
    AND (p_gender_filter = 'any' OR p.gender = p_gender_filter)
    -- Exam filter (any overlap)
    AND (array_length(p_exam_filter, 1) IS NULL OR p.exam_focus && p_exam_filter)
    -- City filter
    AND (array_length(p_city_filter, 1) IS NULL OR p.city = ANY(p_city_filter))
    -- College filter
    AND (array_length(p_college_filter, 1) IS NULL OR p.college = ANY(p_college_filter))
  ORDER BY p.last_seen DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════

-- Run these separately in Supabase Dashboard → Storage → New Bucket:
-- Bucket name: "avatars"
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- ═══════════════════════════════════════════════════════════════════
-- REALTIME
-- Enable realtime for messages and matches tables
-- Go to Database → Replication → Enable for: matches, messages
-- ═══════════════════════════════════════════════════════════════════

-- Done! Your database is ready for StudyDate.
-- Next: Configure Auth providers in Supabase Dashboard → Authentication → Providers
-- Enable: Email, Google OAuth
