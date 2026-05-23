import { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import {
  Shield,
  Users,
  Activity,
  CreditCard,
  AlertTriangle,
  Ban,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";

export const Route = (createFileRoute as any)("/admin")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Admin — FocusTribe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

// ─── Admin email whitelist ─────────────────────────────────────────
// Add your admin emails here
const ADMIN_EMAILS = [
  "ritesh@focustribe.in",
  "admin@focustribe.in",
  // Add more admins as needed
];

type Tab = "overview" | "reports" | "bans" | "users";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Check admin access
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-main)" }}
      >
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#FF6B9E" }} />
          <p style={{ color: "var(--text-muted)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-main)" }}
      >
        <div className="text-center max-w-sm">
          <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: "#EF4444" }} />
          <h1
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Access Denied
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            You don't have admin access. Please sign in with an admin account.
          </p>
          <button
            onClick={() => navigate({ to: "/discover" })}
            className="px-6 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "#FF6B9E", color: "#0B1120" }}
          >
            Go to FocusTribe
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { key: "reports", label: "Reports", icon: <AlertTriangle className="w-4 h-4" /> },
    { key: "bans", label: "Bans", icon: <Ban className="w-4 h-4" /> },
    { key: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      {/* Top bar */}
      <div
        className="h-16 px-6 flex items-center justify-between border-b"
        style={{
          borderColor: "var(--hairline)",
          background: "rgba(15,23,42,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5" style={{ color: "#FF6B9E" }} />
          <span
            className="font-bold text-lg"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            FocusTribe Admin
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
          <span>{user.email}</span>
          <button
            onClick={() => navigate({ to: "/discover" })}
            className="px-3 py-1.5 rounded-lg border text-xs"
            style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}
          >
            Exit Admin
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab navigation */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{
                background:
                  activeTab === tab.key
                    ? "rgba(255,107,158,0.12)"
                    : "rgba(255,255,255,0.03)",
                color: activeTab === tab.key ? "#FF6B9E" : "var(--text-secondary)",
                border:
                  activeTab === tab.key
                    ? "1px solid rgba(255,107,158,0.3)"
                    : "1px solid var(--hairline)",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "bans" && <BansTab />}
        {activeTab === "users" && <UsersTab />}
      </div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalMatches: number;
    totalSessions: number;
    totalPayments: number;
    revenueINR: number;
    activeSubscriptions: number;
    pendingReports: number;
    activeBans: number;
  }>({
    totalUsers: 0,
    totalMatches: 0,
    totalSessions: 0,
    totalPayments: 0,
    revenueINR: 0,
    activeSubscriptions: 0,
    pendingReports: 0,
    activeBans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const [users, matches, sessions, payments, subs, reports, bans] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("matches").select("id", { count: "exact", head: true }),
        supabase.from("study_sessions").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount_cents, status", { count: "exact" }).eq("status", "captured"),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("bans").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);

      const revenue = (payments.data || []).reduce(
        (sum: number, p: any) => sum + (p.amount_cents || 0),
        0,
      );

      setStats({
        totalUsers: users.count || 0,
        totalMatches: matches.count || 0,
        totalSessions: sessions.count || 0,
        totalPayments: payments.count || 0,
        revenueINR: revenue,
        activeSubscriptions: subs.count || 0,
        pendingReports: reports.count || 0,
        activeBans: bans.count || 0,
      });
    } catch (err) {
      console.error("[Admin] Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: "#818CF8" },
    { label: "Total Matches", value: stats.totalMatches, icon: <Activity className="w-5 h-5" />, color: "#FF6B9E" },
    { label: "Study Sessions", value: stats.totalSessions, icon: <Activity className="w-5 h-5" />, color: "#34D399" },
    { label: "Paid Conversions", value: stats.totalPayments, icon: <CreditCard className="w-5 h-5" />, color: "#FBBF24" },
    { label: "Revenue (paise)", value: `₹${(stats.revenueINR / 100).toLocaleString("en-IN")}`, icon: <CreditCard className="w-5 h-5" />, color: "#10B981" },
    { label: "Active Subs", value: stats.activeSubscriptions, icon: <CheckCircle className="w-5 h-5" />, color: "#8B5CF6" },
    { label: "Pending Reports", value: stats.pendingReports, icon: <AlertTriangle className="w-5 h-5" />, color: "#F97316" },
    { label: "Active Bans", value: stats.activeBans, icon: <Ban className="w-5 h-5" />, color: "#EF4444" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          Dashboard Overview
        </h2>
        <button
          onClick={loadStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border"
          style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="p-5 rounded-2xl border"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div style={{ color: card.color }}>{card.icon}</div>
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {card.label}
              </span>
            </div>
            <div
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              {loading ? "—" : card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reports Tab ───────────────────────────────────────────────────
function ReportsTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    const { data } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setReports(data || []);
    setLoading(false);
  }

  async function resolveReport(reportId: string, action: "action_taken" | "dismissed") {
    await supabase.from("reports").update({ status: action }).eq("id", reportId);
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: action } : r)));
  }

  async function banUser(userId: string, reason: string) {
    await supabase.from("bans").insert({
      user_id: userId,
      reason,
      banned_by: "admin",
      ban_type: "temporary" as const,
      is_active: true,
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          User Reports
        </h2>
        <button
          onClick={loadReports}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border"
          style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading reports...</p>
      ) : reports.length === 0 ? (
        <div
          className="p-10 rounded-2xl border text-center"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
        >
          <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "#10B981" }} />
          <p style={{ color: "var(--text-secondary)" }}>No reports. Community is clean! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center gap-4"
              style={{
                borderColor:
                  report.status === "pending"
                    ? "rgba(249,115,22,0.3)"
                    : "var(--hairline)",
                background: "var(--bg-card)",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{
                      background:
                        report.status === "pending"
                          ? "rgba(249,115,22,0.15)"
                          : "rgba(16,185,129,0.15)",
                      color: report.status === "pending" ? "#F97316" : "#10B981",
                    }}
                  >
                    {report.status}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {report.reason}
                  </span>
                </div>
                <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {report.description || "No description provided."}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                  Reporter: {report.reporter_id?.slice(0, 8)}… → Reported: {report.reported_id?.slice(0, 8)}…
                  {" · "}
                  {new Date(report.created_at).toLocaleString()}
                </p>
              </div>

              {report.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => resolveReport(report.id, "action_taken")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Resolve
                  </button>
                  <button
                    onClick={() => {
                      resolveReport(report.id, "action_taken");
                      if (report.reported_user_id) {
                        banUser(report.reported_user_id, `Report: ${report.reason || report.report_type}`);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
                  >
                    <Ban className="w-3.5 h-3.5" /> Ban User
                  </button>
                  <button
                    onClick={() => resolveReport(report.id, "dismissed")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Bans Tab ──────────────────────────────────────────────────────
function BansTab() {
  const [bans, setBans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBans();
  }, []);

  async function loadBans() {
    setLoading(true);
    const { data } = await supabase
      .from("bans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setBans(data || []);
    setLoading(false);
  }

  async function liftBan(banId: string) {
    await supabase.from("bans").update({ is_active: false }).eq("id", banId);
    setBans((prev) => prev.map((b) => (b.id === banId ? { ...b, is_active: false } : b)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          User Bans
        </h2>
        <button
          onClick={loadBans}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border"
          style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading bans...</p>
      ) : bans.length === 0 ? (
        <div
          className="p-10 rounded-2xl border text-center"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
        >
          <p style={{ color: "var(--text-secondary)" }}>No bans issued yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bans.map((ban) => (
            <div
              key={ban.id}
              className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center gap-4"
              style={{
                borderColor: ban.is_active ? "rgba(239,68,68,0.3)" : "var(--hairline)",
                background: "var(--bg-card)",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    style={{
                      background: ban.is_active
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(255,255,255,0.05)",
                      color: ban.is_active ? "#EF4444" : "var(--text-muted)",
                    }}
                  >
                    {ban.is_active ? "Active" : "Lifted"}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {ban.reason || "No reason specified."}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                  User: {ban.user_id?.slice(0, 8)}… · {new Date(ban.created_at).toLocaleString()}
                  {ban.expires_at && ` · Expires: ${new Date(ban.expires_at).toLocaleString()}`}
                </p>
              </div>

              {ban.is_active && (
                <button
                  onClick={() => liftBan(ban.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shrink-0"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Lift Ban
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ─────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  async function searchUsers() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    const q = searchQuery.trim().toLowerCase();

    // Search by name, email (from user_metadata), or ID
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`name.ilike.%${q}%,college.ilike.%${q}%,city.ilike.%${q}%`)
      .limit(20);

    setUsers(data || []);
    setLoading(false);
  }

  async function togglePro(userId: string, isPro: boolean) {
    if (isPro) {
      // Remove pro
      await supabase
        .from("subscriptions")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      await supabase
        .from("profiles")
        .update({ is_pro: false, updated_at: new Date().toISOString() })
        .eq("id", userId);
    } else {
      // Grant pro manually
      const now = new Date();
      const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          plan: "pro",
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: end.toISOString(),
          payment_provider: "manual",
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" },
      );
      await supabase
        .from("profiles")
        .update({ is_pro: true, updated_at: now.toISOString() })
        .eq("id", userId);
    }

    // Refresh search results
    searchUsers();
  }

  return (
    <div>
      <h2
        className="text-xl font-bold mb-6"
        style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
      >
        User Management
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          searchUsers();
        }}
        className="flex gap-3 mb-6"
      >
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, college, or city..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--hairline)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 rounded-xl text-sm font-semibold"
          style={{ background: "#FF6B9E", color: "#0B1120" }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {users.length > 0 && (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center gap-4"
              style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {u.photo_urls?.[0] ? (
                  <img
                    src={u.photo_urls[0]}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ background: "var(--surface-2)" }}
                  >
                    👤
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {u.name}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {u.age}
                    </span>
                    {u.is_pro && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: "rgba(255,107,158,0.15)", color: "#FF6B9E" }}
                      >
                        PRO
                      </span>
                    )}
                    {u.is_verified && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}
                      >
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {u.college} · {u.city} · Streak: {u.streak || 0} · Hours: {u.hours_studied || 0}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    ID: {u.id?.slice(0, 12)}…
                  </p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => togglePro(u.id, u.is_pro)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: u.is_pro ? "rgba(239,68,68,0.1)" : "rgba(255,107,158,0.1)",
                    color: u.is_pro ? "#EF4444" : "#FF6B9E",
                  }}
                >
                  {u.is_pro ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" /> Remove Pro
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Grant Pro
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && users.length === 0 && searchQuery && (
        <p className="text-center text-sm py-8" style={{ color: "var(--text-muted)" }}>
          No users found for "{searchQuery}".
        </p>
      )}
    </div>
  );
}
