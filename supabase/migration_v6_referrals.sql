-- ═══════════════════════════════════════════════════════════════════
-- StudyDate — Migration v6: Referral System
-- Run in Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════════

-- ─── REFERRAL CODES ─────────────────────────────────────────────────
-- Each user gets exactly one referral code. Generated on first use.
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code          TEXT NOT NULL UNIQUE,             -- e.g. "RITESH7X"
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)                                 -- one code per user
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);

-- ─── REFERRALS LOG ──────────────────────────────────────────────────
-- Tracks who referred whom and whether the reward was granted.
CREATE TABLE IF NOT EXISTS public.referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_used       TEXT NOT NULL,
  reward_granted  BOOLEAN NOT NULL DEFAULT false, -- true after 7-day bonus applied
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referred_id)                             -- a user can only be referred once
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);

-- ─── RLS ────────────────────────────────────────────────────────────
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals      ENABLE ROW LEVEL SECURITY;

-- Anyone can look up a referral code (needed during signup)
CREATE POLICY "Anyone can read referral codes"
  ON public.referral_codes FOR SELECT
  USING (true);

-- Users can insert/read their own code
CREATE POLICY "Users can insert own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can read referrals they made
CREATE POLICY "Users can read own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Edge functions insert referrals (service role bypasses RLS)

-- ─── FUNCTION: Generate a referral code for a user ──────────────────
CREATE OR REPLACE FUNCTION get_or_create_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_attempt INT := 0;
BEGIN
  -- Check if code already exists
  SELECT code INTO v_code FROM public.referral_codes WHERE user_id = p_user_id;
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  -- Generate a unique 8-char alphanumeric code
  LOOP
    v_code := upper(
      substring(
        replace(replace(encode(gen_random_bytes(6), 'base64'), '+', ''), '/', ''),
        1, 8
      )
    );
    BEGIN
      INSERT INTO public.referral_codes (user_id, code) VALUES (p_user_id, v_code);
      RETURN v_code;
    EXCEPTION WHEN unique_violation THEN
      v_attempt := v_attempt + 1;
      IF v_attempt > 10 THEN
        RAISE EXCEPTION 'Could not generate unique referral code';
      END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── FUNCTION: Apply referral on signup ─────────────────────────────
-- Call this from your auth callback / Edge Function when a user signs up with ?ref=CODE
CREATE OR REPLACE FUNCTION apply_referral_code(p_referred_id UUID, p_code TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Look up the referrer
  SELECT user_id INTO v_referrer_id FROM public.referral_codes WHERE code = upper(p_code);
  IF v_referrer_id IS NULL THEN
    RETURN false; -- invalid code
  END IF;

  -- Can't refer yourself
  IF v_referrer_id = p_referred_id THEN
    RETURN false;
  END IF;

  -- Insert referral (ignore if already referred)
  INSERT INTO public.referrals (referrer_id, referred_id, code_used)
  VALUES (v_referrer_id, p_referred_id, upper(p_code))
  ON CONFLICT (referred_id) DO NOTHING;

  -- Extend trial by 3 days for the referred user
  UPDATE public.subscriptions
  SET trial_end = GREATEST(trial_end, now()) + INTERVAL '3 days',
      updated_at = now()
  WHERE user_id = p_referred_id;

  -- Extend trial by 3 days for the referrer too (reward)
  UPDATE public.subscriptions
  SET trial_end = GREATEST(trial_end, now()) + INTERVAL '3 days',
      updated_at = now()
  WHERE user_id = v_referrer_id;

  -- Mark reward as granted
  UPDATE public.referrals SET reward_granted = true
  WHERE referred_id = p_referred_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (for client-side use)
GRANT EXECUTE ON FUNCTION get_or_create_referral_code(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION apply_referral_code(UUID, TEXT)   TO authenticated;

-- Done! Next: wire up useReferral.ts hook + ReferralModal component
