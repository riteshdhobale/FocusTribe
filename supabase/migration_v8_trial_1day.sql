-- ═══════════════════════════════════════════════════════════════════
-- StudyDate — Migration v8: Change trial from 7 days → 1 day
-- Run in Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Update the default column value ────────────────────────────
-- New signups will get a 1-day trial instead of 7 days.
ALTER TABLE public.subscriptions
  ALTER COLUMN trial_end SET DEFAULT (now() + INTERVAL '1 day');

-- ─── 2. Replace the trigger function ───────────────────────────────
-- The function that auto-creates a subscription on profile creation.
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_start, trial_end)
  VALUES (
    NEW.id,
    'free',
    'trial',
    now(),
    now() + INTERVAL '1 day'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger itself doesn't need re-creating — it already calls
-- create_default_subscription(). Only the function body changed.

-- Done! New users will now get a 24-hour Pro trial.
-- Existing users' trials are NOT affected (their trial_end stays as-is).
