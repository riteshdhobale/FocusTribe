// ─── ReferralModal ───────────────────────────────────────────────────
// Beautiful "Invite friends, earn free Pro" modal.
// Shows the user's unique referral link + share buttons.

import { Copy, Check, Twitter, MessageCircle, Gift, Users, Flame, Sparkles } from "lucide-react";
import { useReferral } from "@/lib/useReferral";

interface ReferralModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReferralModal({ open, onClose }: ReferralModalProps) {
  const { code, shareUrl, stats, loading, copied, copyLink, shareOnTwitter, shareOnWhatsApp } =
    useReferral();

  if (!open) return null;

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

        <div className="relative p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-5 h-5" style={{ color: "#FF6B9E" }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#FF6B9E" }}
                >
                  Refer & Earn
                </span>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white">
                Give 3 days free.
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF7B90, #FF58A6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Get 3 days free.
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

          {/* How it works */}
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
            Share your link. When a friend joins, you{" "}
            <span className="font-semibold text-white">both get 3 extra days Pro</span> — free.
          </p>

          {/* Stats */}
          {(stats.totalReferrals > 0 || stats.bonusDaysEarned > 0) && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: <Users className="w-4 h-4" />, val: stats.totalReferrals, label: "Referrals" },
                {
                  icon: <Check className="w-4 h-4" />,
                  val: stats.rewardedReferrals,
                  label: "Rewarded",
                },
                {
                  icon: <Flame className="w-4 h-4" />,
                  val: `${stats.bonusDaysEarned}d`,
                  label: "Bonus earned",
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
          )}

          {/* Link box */}
          <div
            className="flex items-center gap-3 rounded-2xl border p-3 mb-5"
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
              onClick={copyLink}
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
            <div className="text-center mb-5">
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

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareOnWhatsApp}
              disabled={loading || !shareUrl}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
              style={{ background: "#25D366", color: "white" }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={shareOnTwitter}
              disabled={loading || !shareUrl}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
              style={{ background: "#1DA1F2", color: "white" }}
            >
              <Twitter className="w-4 h-4" />
              Twitter / X
            </button>
          </div>

          {/* Fine print */}
          <p
            className="mt-5 text-center text-[11px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <Sparkles className="w-3 h-3 inline mr-1" style={{ color: "#FF6B9E" }} />
            3 free days applied automatically when your friend signs up with your link.
          </p>
        </div>
      </div>
    </div>
  );
}
