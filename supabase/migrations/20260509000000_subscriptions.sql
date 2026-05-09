-- ═══════════════════════════════════════════════════════════════════
-- StudyDate — Database Migration v4 (Subscriptions & Payments)
-- Run this script in Supabase SQL Editor (Dashboard → SQL)
-- ═══════════════════════════════════════════════════════════════════

-- ─── SUBSCRIPTIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'campus', 'weekly')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  trial_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  payment_provider TEXT CHECK (payment_provider IN ('razorpay', 'stripe', 'manual', NULL)),
  payment_subscription_id TEXT,  -- Razorpay/Stripe subscription ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)  -- one subscription per user
);

-- ─── PAYMENTS (Transaction Log) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,         -- amount in smallest currency unit (paise/cents)
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('razorpay', 'stripe', 'manual')),
  provider_payment_id TEXT,              -- Razorpay payment_id / Stripe payment_intent
  provider_order_id TEXT,                -- Razorpay order_id
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  plan TEXT NOT NULL,                    -- which plan was purchased
  metadata JSONB DEFAULT '{}',           -- extra info (receipt, notes, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status) WHERE status IN ('trial', 'active');
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Auto-update timestamps
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only server/edge functions should create/update subscriptions
-- (No INSERT/UPDATE policies for client — handled via Edge Functions)

-- Users can read their own payments
CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════

-- Auto-create a free/trial subscription when a new user signs up
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_start, trial_end)
  VALUES (
    NEW.id,
    'free',
    'trial',
    now(),
    now() + INTERVAL '7 days'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire after profile creation
CREATE TRIGGER on_profile_create_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- ═══════════════════════════════════════════════════════════════════
-- HELPER: Check if user is pro (for use in other RLS policies)
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION is_user_pro(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND plan IN ('pro', 'campus', 'weekly')
    AND (current_period_end IS NULL OR current_period_end > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
-- HELPER: Check if user is in trial period
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION is_user_in_trial(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
    AND status = 'trial'
    AND trial_end > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
-- CRON: Clean up expired bans (run this via pg_cron or Supabase Edge Cron)
-- Enable pg_cron extension first: CREATE EXTENSION IF NOT EXISTS pg_cron;
-- Then schedule: SELECT cron.schedule('cleanup-expired-bans', '0 * * * *',
--   $$UPDATE public.bans SET is_active = false WHERE is_active = true AND expires_at < now()$$
-- );
-- ═══════════════════════════════════════════════════════════════════

-- Done! Next steps:
-- 1. Integrate Razorpay SDK on frontend
-- 2. Create a Supabase Edge Function for webhook handling
-- 3. Wire useSubscription.ts to query this table
