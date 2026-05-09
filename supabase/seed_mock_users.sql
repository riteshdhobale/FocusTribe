-- ═══════════════════════════════════════════════════════════════════
-- StudyDate — Database Seed Mock Users
-- Run this ENTIRE script in Supabase SQL Editor (Dashboard → SQL)
-- This creates 8 mock users so you have a realistic Discover deck!
-- ═══════════════════════════════════════════════════════════════════

-- Make sure pgcrypto is enabled to hash passwords
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  -- Generate consistent UUIDs for our mock users
  user_1 UUID := '11111111-1111-1111-1111-111111111111';
  user_2 UUID := '22222222-2222-2222-2222-222222222222';
  user_3 UUID := '33333333-3333-3333-3333-333333333333';
  user_4 UUID := '44444444-4444-4444-4444-444444444444';
  user_5 UUID := '55555555-5555-5555-5555-555555555555';
  user_6 UUID := '66666666-6666-6666-6666-666666666666';
  user_7 UUID := '77777777-7777-7777-7777-777777777777';
  user_8 UUID := '88888888-8888-8888-8888-888888888888';
BEGIN

  -- ─── 1. Insert into auth.users ───────────────────────────────────────
  -- We use ON CONFLICT DO NOTHING so you can run this script multiple times safely.
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    (user_1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aisha.mock@studydate.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user_2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rahul.mock@studydate.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user_3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.mock@studydate.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user_4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arjun.mock@studydate.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user_5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'zoya.mock@studydate.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user_6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'neha.mock@studydate.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user_7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'karan.mock@studydate.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
    (user_8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'isha.mock@studydate.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- ─── 2. Insert into public.profiles ────────────────────────────────
  INSERT INTO public.profiles (
    id, name, age, gender, city, college, year, exam_focus, career_goal, bio, study_style, intent, study_formats, interests, availability, looking_for_prompt, avatar_color, avatar_emoji, is_online, hours_studied, streak, group_pref, gender_pref, is_verified, is_pro, photo_urls
  )
  VALUES
    (
      user_1, 'Aisha', 21, 'female', 'Mumbai', 'IIT Bombay', '3rd Year', ARRAY['Coding', 'Startup'], 'Founder', 'Building a SaaS in Powai. Need someone for deep work sprints after 7pm.', 'visual', 'accountability', ARRAY['Pomodoro', 'Silent'], ARRAY['Startups', 'Coffee', 'Design'], 'Evenings', 'Someone who ships, not just plans.', '#FF6B9E', '🚀', true, 142, 12, '1v1', 'any', true, true, ARRAY['https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80']
    ),
    (
      user_2, 'Rahul', 22, 'male', 'Delhi', 'Delhi University', '4th Year', ARRAY['UPSC'], 'Civil Services', 'UPSC grind in North Campus. Quiet library sessions only.', 'reading', 'study-buddy', ARRAY['Library', 'Flashcards'], ARRAY['History', 'Politics', 'Chess'], 'All Day', 'A silent partner for marathon sessions.', '#3B82F6', '📚', false, 450, 45, 'small-group', 'any', true, false, ARRAY['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80']
    ),
    (
      user_3, 'Priya', 20, 'female', 'Bangalore', 'NIFT', '2nd Year', ARRAY['Design'], 'UI/UX Designer', 'Lofi beats, Figma, and Indiranagar cafes. Co-work + critique?', 'hands-on', 'friends-first', ARRAY['Screen Share', 'Music'], ARRAY['Art', 'Anime', 'Web3'], 'Late Night', 'Creative vibes only.', '#8B5CF6', '✨', true, 89, 5, '1v1', 'any', false, false, ARRAY['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80']
    ),
    (
      user_4, 'Arjun', 23, 'male', 'Hyderabad', 'BITS Pilani (Hyd)', 'Final Year', ARRAY['DSA', 'Interview Prep'], 'Product Engineer', 'Hitec City evenings. Let''s do mock interviews and fast sprints.', 'hands-on', 'accountability', ARRAY['Pair study', 'Pomodoro'], ARRAY['Basketball', 'Fintech', 'Podcasts'], 'Weeknights', 'Someone who actually runs the checklist.', '#22C55E', '⚡', true, 210, 8, '1v1', 'any', true, false, ARRAY['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80']
    ),
    (
      user_5, 'Zoya', 19, 'female', 'Pune', 'Symbiosis', '2nd Year', ARRAY['Law'], 'Corporate Lawyer', 'Case briefs at FC Road cafes. I keep it structured and calm.', 'reading', 'study-buddy', ARRAY['Library', 'Notes'], ARRAY['Debate', 'Journaling', 'Badminton'], 'Mornings', 'A consistent partner for long-term prep.', '#F97316', '🧠', false, 120, 6, 'small-group', 'any', false, false, ARRAY['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80']
    ),
    (
      user_6, 'Neha', 24, 'female', 'Chennai', 'Anna University', 'Final Year', ARRAY['MBA', 'CAT'], 'Strategy Analyst', 'Early mornings, steady pace. Coffee on the Marina after sessions.', 'visual', 'accountability', ARRAY['Pomodoro', 'Flashcards'], ARRAY['Books', 'Running', 'Economics'], 'Mornings', 'Someone who likes a calm, consistent rhythm.', '#14B8A6', '📈', true, 180, 10, '1v1', 'any', true, false, ARRAY['https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80']
    ),
    (
      user_7, 'Karan', 21, 'male', 'Kolkata', 'Jadavpur University', '3rd Year', ARRAY['GATE'], 'Research Engineer', 'Gariahat weekends. No fluff, just focused problem sets.', 'reading', 'study-buddy', ARRAY['Problem Sets', 'Library'], ARRAY['Robotics', 'Tea', 'Football'], 'Weekends', 'A partner who doesn''t fear hard questions.', '#6366F1', '🧩', false, 260, 15, 'small-group', 'any', false, false, ARRAY['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80']
    ),
    (
      user_8, 'Isha', 22, 'female', 'Jaipur', 'MNIT', '4th Year', ARRAY['AI', 'ML'], 'ML Engineer', 'Pink City sunsets + Kaggle nights. Pair study is my thing.', 'hands-on', 'friends-first', ARRAY['Pair study', 'Screen Share'], ARRAY['Photography', 'Hiking', 'Tech'], 'Late Night', 'Someone curious and low-ego.', '#EC4899', '🌸', true, 98, 4, '1v1', 'any', true, false, ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=1200&q=80']
    )
  ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    college = EXCLUDED.college,
    photo_urls = EXCLUDED.photo_urls;

END $$;
