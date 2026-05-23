-- ═══════════════════════════════════════════════════════════════════
-- StudyDate — Migration v7: Streak & Study Stats
-- Run in Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════════

-- ─── FUNCTION: Update study stats after a session ──────────────────
-- Called after each completed study session.
-- Atomically updates: hours_studied, streak, last_seen
--
-- Streak logic:
--   • If last study was yesterday → increment streak
--   • If last study was today (already counted) → keep streak
--   • If gap > 1 day → reset streak to 1
--   • First ever session → streak = 1

CREATE OR REPLACE FUNCTION update_study_stats(
  p_user_id UUID,
  p_duration_minutes INTEGER
)
RETURNS TABLE(new_streak INTEGER, new_hours NUMERIC) AS $$
DECLARE
  v_last_seen DATE;
  v_today DATE := CURRENT_DATE;
  v_current_streak INTEGER;
  v_current_hours NUMERIC;
  v_new_streak INTEGER;
  v_new_hours NUMERIC;
BEGIN
  -- Get current stats
  SELECT
    profiles.last_seen::date,
    profiles.streak,
    profiles.hours_studied
  INTO v_last_seen, v_current_streak, v_current_hours
  FROM public.profiles
  WHERE id = p_user_id;

  -- Calculate new hours (add session duration)
  v_new_hours := COALESCE(v_current_hours, 0) + ROUND(p_duration_minutes / 60.0, 2);

  -- Calculate new streak
  IF v_last_seen IS NULL THEN
    -- First ever session
    v_new_streak := 1;
  ELSIF v_last_seen = v_today THEN
    -- Already studied today — keep current streak
    v_new_streak := COALESCE(v_current_streak, 1);
  ELSIF v_last_seen = v_today - INTERVAL '1 day' THEN
    -- Studied yesterday — increment streak
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    -- Gap > 1 day — reset streak
    v_new_streak := 1;
  END IF;

  -- Update the profile
  UPDATE public.profiles
  SET
    hours_studied = v_new_hours,
    streak = v_new_streak,
    last_seen = now(),
    updated_at = now()
  WHERE id = p_user_id;

  -- Return the new values (so the client can show them)
  new_streak := v_new_streak;
  new_hours := v_new_hours;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION update_study_stats(UUID, INTEGER) TO authenticated;

-- Done! This function is called from saveStudySession.ts on the client.
