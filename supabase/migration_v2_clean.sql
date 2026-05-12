-- ═══════════════════════════════════════════════════════════════════
-- StudyDate Migration v2 — CLEAN RE-RUN
-- Drops any partially created objects, then creates everything fresh
-- ═══════════════════════════════════════════════════════════════════

-- Clean up partial run
DROP TRIGGER IF EXISTS trg_check_report_threshold ON reports;
DROP FUNCTION IF EXISTS check_report_threshold();
DROP FUNCTION IF EXISTS is_user_banned(UUID);
DROP VIEW IF EXISTS user_report_summary;
DROP TABLE IF EXISTS bans;
DROP TABLE IF EXISTS reports;
DROP TYPE IF EXISTS ban_type;
DROP TYPE IF EXISTS report_status;
DROP TYPE IF EXISTS report_type;

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
CREATE TABLE reports (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type   report_type NOT NULL,
  description   TEXT NOT NULL CHECK (length(description) BETWEEN 10 AND 2000),
  context       TEXT,
  evidence_url  TEXT,
  status        report_status DEFAULT 'pending',
  admin_notes   TEXT,
  reviewed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id, created_at DESC);
CREATE INDEX idx_reports_dedup ON reports(reporter_id, reported_user_id, report_type, created_at DESC);

-- ── Bans table ───────────────────────────────────────────────────
CREATE TABLE bans (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ban_type      ban_type NOT NULL,
  reason        TEXT NOT NULL,
  report_id     UUID REFERENCES reports(id) ON DELETE SET NULL,
  ip_address    INET,
  banned_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at    TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bans_user_active ON bans(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_bans_ip ON bans(ip_address) WHERE ip_address IS NOT NULL AND is_active = true;

-- ── Report counts view ──────────────────────────────────────────
-- SECURITY: security_invoker=on ensures RLS on the `reports` table
-- is respected by the querying user. Without this, the view runs as
-- the superuser and bypasses RLS entirely (Supabase security advisory).
-- Access is also revoked from anon/authenticated — only service_role
-- (admin dashboard) should ever query this view.
CREATE OR REPLACE VIEW user_report_summary
WITH (security_invoker = on)
AS
SELECT
  reported_user_id,
  COUNT(*) AS total_reports,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_reports,
  COUNT(*) FILTER (WHERE status = 'action_taken') AS actioned_reports,
  MAX(created_at) AS last_reported_at
FROM reports
GROUP BY reported_user_id;

-- Revoke public API access (admins use service_role key only)
REVOKE SELECT ON public.user_report_summary FROM anon, authenticated;

-- ── Auto-flag trigger ───────────────────────────────────────────
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

-- ── RLS ──────────────────────────────────────────────────────────
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can see reports they filed"
  ON reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can check their own ban status"
  ON bans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ── Ban check function ──────────────────────────────────────────
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
-- DONE! Reports & Bans system is ready.
-- ═══════════════════════════════════════════════════════════════════
