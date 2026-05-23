-- ═══════════════════════════════════════════════════════════════════
-- StudyDate — Migration v9: Fix Matches RLS Insert Policy
-- Run in Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════════

-- Drop the existing insert policy which only checks profile_a
DROP POLICY IF EXISTS "System can create matches" ON public.matches;

-- Recreate the policy to check that the inserting user is either profile_a OR profile_b
CREATE POLICY "System can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = profile_a OR auth.uid() = profile_b);
