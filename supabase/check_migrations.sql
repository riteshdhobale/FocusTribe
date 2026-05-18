-- Run this in Supabase SQL Editor to check which migrations are already applied
-- https://supabase.com/dashboard/project/danqahkphojdbrppautc/sql

SELECT
  'profiles table'        AS check_item, EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public')        AS exists
UNION ALL SELECT
  'matches table',         EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matches'  AND table_schema = 'public')
UNION ALL SELECT
  'messages table',        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public')
UNION ALL SELECT
  'swipe_history table',   EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'swipe_history' AND table_schema = 'public')
UNION ALL SELECT
  'reports table (v2)',    EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports'  AND table_schema = 'public')
UNION ALL SELECT
  'bans table (v2)',       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bans'     AND table_schema = 'public')
UNION ALL SELECT
  'rooms table (v3)',      EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms'    AND table_schema = 'public')
UNION ALL SELECT
  'subscriptions table (v4)', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public')
UNION ALL SELECT
  'mock users seeded',     EXISTS (SELECT 1 FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111')
ORDER BY check_item;
