// ─── ReferralModal ───────────────────────────────────────────────────
// Growth-hacked "Invite friends, earn free Pro" modal.
// The reward (3 days) only applies once per unique signup, but the UX
// is designed to maximize the number of invites sent per session.

import { useState } from "react";
import { Copy, Check, Twitter, MessageCircle, Gift, Users, Flame, Sparkles, Send, Trophy, Target, Zap } from "lucide-react";
import { useReferral } from "@/lib/useReferral";
import { analytics } from "@/lib/analytics";

interface ReferralModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── Motivational messages shown after each share action ─────────────
const SHARE_CELEBRATIONS = [
  "Nice! Keep going 🔥",
  "Your future study partner might be next!",
  "1 more share = 1 step closer to Pro 💪",
  "You're on a roll! Share again →",
  "The more you share, the faster you grow 🚀",
  "Almost there! One more share? 👀",
  "You're building your study squad! 🎯",
];

// ─── Milestone badges to gamify sharing ──────────────────────────────
const SHARE_MILESTONES = [
  { count: 3, emoji: "🌱", label: "Starter" },
  { count: 5, emoji: "⚡", label: "Active Sharer" },
  { count: 10, emoji: "🔥", label: "Growth Machine" },
  { count: 20, emoji: "🏆", label: "Campus Legend" },
];

export function ReferralModal({ open, onClose }: ReferralModalProps) {
  const { code, shareUrl, stats, loading, copied, copyLink, shareOnTwitter, shareOnWhatsApp } =
    useReferral();

  // Track shares in this session to show celebrations
  const [sessionShares, setSessionShares] = useState(0);
  const [celebration, setCelebration] = useState<string | null>(null);

  if (!open) return null;

  // Pick a random celebration message
  function celebrate() {
    const msg = SHARE_CELEBRATIONS[Math.floor(Math.random() * SHARE_CELEBRATIONS.length)];
    setCelebration(msg);
    setTimeout(() => setCelebration(null), 2500);
  }

  function handleCopy() {
    copyLink();
    setSessionShares((s) => s + 1);
    celebrate();
    analytics.referralShared("copy");
  }

  function handleWhatsApp() {
    shareOnWhatsApp();
    setSessionShares((s) => s + 1);
    celebrate();
    analytics.referralShared("whatsapp");
  }

  function handleTwitter() {
    shareOnTwitter();
    setSessionShares((s) => s + 1);
    celebrate();
    analytics.referralShared("twitter");
  }

  // Calculate current milestone
  const totalShares = stats.totalReferrals + sessionShares;
  const currentMilestone = [...SHARE_MILESTONES].reverse().find((m) => totalShares >= m.count);
  const nextMilestone = SHARE_MILESTONES.find((m) => totalShares < m.count);

  // Progress bar to next milestone
  const prevCount = currentMilestone
    ? currentMilestone.count
    : 0;
  const nextCount = nextMilestone ? nextMilestone.count : prevCount + 5;
  const progressPct = Math.min(100, ((totalShares - prevCount) / (nextCount - prevCount)) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-[28px] border overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0F1729 0%, #0B1120 100%)",
          borderColor: "rgba(255,107,158,0.3)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255,107,158,0.1)",
        }}
      >
        {/* Glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(255,107,158,0.25), transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        <div className="relative p-7" style={{ maxHeight: "85vh", overflowY: "auto" }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-5 h-5" style={{ color: "#FF6B9E" }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#FF6B9E" }}
                >
                  Invite & Earn
                </span>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white">
                Your trial ends soon.
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF7B90, #FF58A6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Earn free Pro days.
                </span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              ✕
            </button>
          </div>

          {/* Urgency + value prop */}
          <div
            className="flex items-center gap-3 p-3 rounded-2xl border mb-5"
            style={{
              background: "rgba(255,107,158,0.06)",
              borderColor: "rgba(255,107,158,0.2)",
            }}
          >
            <Zap className="w-5 h-5 shrink-0" style={{ color: "#FBBF24" }} />
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              Each friend who joins with your link = <strong className="text-white">3 free Pro days for BOTH of you</strong>.
              {" "}The more friends you invite, the longer you stay Pro for free!
            </p>
          </div>

          {/* Celebration toast */}
          {celebration && (
            <div
              className="mb-4 py-2.5 px-4 rounded-xl text-center text-sm font-semibold animate-pulse"
              style={{
                background: "rgba(52,211,153,0.12)",
                color: "#34D399",
                border: "1px solid rgba(52,211,153,0.25)",
              }}
            >
              {celebration}
            </div>
          )}

          {/* Milestone progress bar */}
          {nextMilestone && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {currentMilestone
                    ? `${currentMilestone.emoji} ${currentMilestone.label}`
                    : "🎯 Get started"}
                </span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Next: {nextMilestone.emoji} {nextMilestone.label}
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(90deg, #FF6B9E, #FF58A6)",
                  }}
                />
              </div>
              <p className="text-[10px] mt-1 text-right" style={{ color: "rgba(255,255,255,0.3)" }}>
                {nextMilestone.count - totalShares} more to unlock
              </p>
            </div>
          )}

          {/* Stats grid — always show, even if 0 */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: <Send className="w-4 h-4" />, val: stats.totalReferrals + sessionShares, label: "Invites Sent" },
              {
                icon: <Users className="w-4 h-4" />,
                val: stats.rewardedReferrals,
                label: "Friends Joined",
              },
              {
                icon: <Flame className="w-4 h-4" />,
                val: `${stats.bonusDaysEarned}d`,
                label: "Days Earned",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-3 text-center border"
                style={{
                  background: "rgba(255,107,158,0.06)",
                  borderColor: "rgba(255,107,158,0.15)",
                }}
              >
                <div
                  className="flex justify-center mb-1"
                  style={{ color: "#FF6B9E" }}
                >
                  {s.icon}
                </div>
                <div className="font-display font-bold text-white text-lg">{s.val}</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Link box */}
          <div
            className="flex items-center gap-3 rounded-2xl border p-3 mb-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,107,158,0.2)",
            }}
          >
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="h-4 w-48 rounded bg-white/10 animate-pulse" />
              ) : (
                <>
                  <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Your invite link
                  </div>
                  <div className="text-sm font-mono text-white truncate">
                    {shareUrl || "studydate.in/?ref=..."}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={handleCopy}
              disabled={loading || !shareUrl}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition"
              style={{
                background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,107,158,0.15)",
                color: copied ? "#10B981" : "#FF6B9E",
                border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "rgba(255,107,158,0.3)"}`,
              }}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>

          {/* Code display */}
          {code && (
            <div className="text-center mb-4">
              <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
                Or share your code
              </span>
              <div
                className="mt-1 font-mono font-bold text-2xl tracking-[0.3em]"
                style={{
                  background: "linear-gradient(135deg, #FF7B90, #FF58A6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {code}
              </div>
            </div>
          )}

          {/* Share buttons — big and prominent */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={handleWhatsApp}
              disabled={loading || !shareUrl}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
              style={{ background: "#25D366", color: "white" }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={handleTwitter}
              disabled={loading || !shareUrl}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
              style={{ background: "#1DA1F2", color: "white" }}
            >
              <Twitter className="w-4 h-4" />
              Twitter / X
            </button>
          </div>

          {/* "Send to more" nudge — the growth hack */}
          <button
            onClick={handleCopy}
            disabled={loading || !shareUrl}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition hover:opacity-90 disabled:opacity-40 mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,158,0.15), rgba(255,88,166,0.15))",
              color: "#FF6B9E",
              border: "1px solid rgba(255,107,158,0.3)",
            }}
          >
            <Send className="w-4 h-4" />
            Copy link & send to more friends
          </button>

          {/* Social proof + urgency */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" style={{ color: "#FBBF24" }} />
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              Top referrers have earned <strong className="text-white">30+ days</strong> of free Pro.
              Share in your class WhatsApp groups for fastest results!
            </p>
          </div>

          {/* Fine print — honest about the reward */}
          <p
            className="text-center text-[10px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            <Sparkles className="w-3 h-3 inline mr-1" style={{ color: "#FF6B9E" }} />
            3 bonus days applied automatically when your friend signs up & creates a profile.
          </p>
        </div>
      </div>
    </div>
  );
}
