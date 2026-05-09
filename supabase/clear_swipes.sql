-- Run this in your Supabase SQL Editor to clear your swipe history
-- This will reset your deck so you can see the mock profiles again!

DELETE FROM public.swipe_history;
DELETE FROM public.matches;

-- Optional: This ensures any "caught up" states are cleared
-- so you can test swiping from scratch.
