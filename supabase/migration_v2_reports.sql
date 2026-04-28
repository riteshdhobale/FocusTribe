-- ═══════════════════════════════════════════════════════════════════
-- StudyDate Migration v2 — Report & Ban System
-- Run in Supabase SQL Editor: https://supabase.com/dashboard → SQL
-- ═══════════════════════════════════════════════════════════════════

-- ── Report types ─────────────────────────────────────────────────
CREATE TYPE report_type AS ENUM (
  'harassment',
  'fake_profile',
  'spam',
  'inappropriate_content',
  'underage',
  'threats',
  'hate_speech',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'reviewing',
  'action_taken',
  'dismissed'
);

CREATE TYPE ban_type AS ENUM (
  'warning',
  'temporary',
  'permanent',
  'ip_ban'
);

-- ── Reports table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type   report_type NOT NULL,
  description   TEXT NOT NULL CHECK (length(description) BETWEEN 10 AND 2000),
  context       TEXT,  -- where it happened: 'swipe_card', 'chat', 'study_room', 'profile'
  evidence_url  TEXT,  -- optional screenshot from Supabase Storage
  status        report_status DEFAULT 'pending',
  admin_notes   TEXT,
  reviewed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Index for admin dashboard: fetch all pending reports
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
-- Index for checking if user has been reported multiple times
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id, created_at DESC);
-- Index for checking recent reports from same reporter about same person
CREATE INDEX idx_reports_dedup ON reports(reporter_id, reported_user_id, report_type, created_at DESC);

-- ── Bans table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bans (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ban_type      ban_type NOT NULL,
  reason        TEXT NOT NULL,
  report_id     UUID REFERENCES reports(id) ON DELETE SET NULL,  -- linked report
  ip_address    INET,  -- for IP bans
  banned_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- admin who banned
  expires_at    TIMESTAMPTZ,  -- null = permanent
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bans_user_active ON bans(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_bans_ip ON bans(ip_address) WHERE ip_address IS NOT NULL AND is_active = true;

-- ── Report counts view (for admin) ──────────────────────────────
CREATE OR REPLACE VIEW user_report_summary AS
SELECT
  reported_user_id,
  COUNT(*) AS total_reports,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_reports,
  COUNT(*) FILTER (WHERE status = 'action_taken') AS actioned_reports,
  MAX(created_at) AS last_reported_at
FROM reports
GROUP BY reported_user_id;

-- ── Auto-flag users with 3+ pending reports ─────────────────────
CREATE OR REPLACE FUNCTION check_report_threshold()
RETURNS TRIGGER AS $$
DECLARE
  report_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO report_count
  FROM reports
  WHERE reported_user_id = NEW.reported_user_id
    AND status = 'pending'
    AND created_at > now() - interval '7 days';

  -- If 3+ reports in 7 days, auto-create a warning ban
  IF report_count >= 3 THEN
    INSERT INTO bans (user_id, ban_type, reason, report_id)
    VALUES (
      NEW.reported_user_id,
      'warning',
      'Auto-flagged: 3+ reports received within 7 days. Pending admin review.',
      NEW.id
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_report_threshold
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION check_report_threshold();

-- ── RLS Policies ─────────────────────────────────────────────────
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;

-- Reports: users can create reports, can see their own reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can see reports they filed"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Bans: users can check their own ban status
CREATE POLICY "Users can check their own ban status"
  ON bans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ── Function to check if a user is banned ────────────────────────
CREATE OR REPLACE FUNCTION is_user_banned(check_user_id UUID)
RETURNS TABLE (
  is_banned BOOLEAN,
  ban_reason TEXT,
  ban_type ban_type,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    true::BOOLEAN,
    b.reason,
    b.ban_type,
    b.expires_at
  FROM bans b
  WHERE b.user_id = check_user_id
    AND b.is_active = true
    AND b.ban_type IN ('temporary', 'permanent', 'ip_ban')
    AND (b.expires_at IS NULL OR b.expires_at > now())
  ORDER BY b.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════
-- DONE! Run this in your Supabase SQL Editor after migration_v1.sql
-- ═══════════════════════════════════════════════════════════════════
