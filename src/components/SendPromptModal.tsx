import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import type { Profile } from "@/lib/profiles";

type Props = {
  profile: Profile;
  /** Remaining likes today — prompt/spark uses 1 like */
  likesRemaining: number;
  /** Spark mode (Hinge Rose equivalent) — weekly limited, required message, shown at top */
  isSpark?: boolean;
  sparksRemaining?: number;
  onSend: (text: string) => void;
  onClose: () => void;
};

const STARTER_PROMPTS = [
  "Your study sessions sound intense — what does a typical one look like?",
  "What's the hardest topic you're working through right now?",
  "Let's do a Pomodoro sprint together this week!",
  "You seem focused — what keeps you motivated on tough days?",
  "What's your biggest study challenge right now?",
];

export function SendPromptModal({
  profile,
  likesRemaining,
  isSpark = false,
  sparksRemaining = 0,
  onSend,
  onClose,
}: Props) {
  const [text, setText] = useState("");
  const MAX = 200;
  const remaining = MAX - text.length;

  const accent = isSpark ? "#FFC107" : "#FF6B9E";
  const accentBg = isSpark ? "rgba(255,193,7,0.06)" : "rgba(255,107,158,0.06)";
  const accentBorder = isSpark ? "rgba(255,193,7,0.2)" : "rgba(255,107,158,0.18)";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const blocked = isSpark ? sparksRemaining === 0 : likesRemaining === 0;
    if (text.trim() && !blocked) onSend(text.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 relative"
        style={{
          background: isSpark ? "linear-gradient(145deg, #1a1700, #0F1200)" : "linear-gradient(145deg, #1a1f35, #0F1729)",
          border: `1px solid ${isSpark ? "rgba(255,193,7,0.3)" : "rgba(255,107,158,0.2)"}`,
          boxShadow: isSpark
            ? "0 -20px 80px rgba(255,193,7,0.12)"
            : "0 -20px 80px rgba(255,107,158,0.1)",
        }}
      >
        {/* Spark floating badge */}
        {isSpark && (
          <div
            className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
            style={{ background: "#FFC107", color: "#0B1120" }}
          >
            ⚡ Spark — {sparksRemaining} left this week
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
              style={{
                background: isSpark
                  ? "linear-gradient(135deg, #FFC107, #FF8F00)"
                  : `linear-gradient(135deg, ${profile.avatarColor}, color-mix(in oklab, ${profile.avatarColor} 50%, #0B1120))`,
              }}
            >
              {isSpark ? "⚡" : profile.avatarEmoji}
            </div>
            <div>
              <h2 className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
                {isSpark ? `Send ${profile.name} a Spark` : `Comment on ${profile.name}'s profile`}
              </h2>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {isSpark
                  ? "Goes to the top of their queue — 1 per week"
                  : "Your message goes with your like — stand out"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center transition hover:bg-white/10"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Their prompt */}
        <div className="p-4 rounded-xl mb-4" style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageSquare className="h-3 w-3" style={{ color: accent }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent }}>
              Their prompt
            </span>
          </div>
          <p className="text-sm italic leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            "{profile.lookingForPrompt || "Looking for a focused study partner for serious sessions."}"
          </p>
        </div>

        {/* Spark callout */}
        {isSpark && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs"
            style={{ background: "rgba(255,193,7,0.08)", border: "1px solid rgba(255,193,7,0.2)" }}
          >
            <span className="text-base leading-none">⚡</span>
            <div style={{ color: "#FFC107" }}>
              <p className="font-bold mb-0.5">Spark stands out</p>
              <p className="opacity-80">Your profile jumps to the top of their Likes You queue and is highlighted in amber. A message is required.</p>
            </div>
          </div>
        )}

        {/* Quota warning for regular likes */}
        {!isSpark && likesRemaining <= 1 && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-xs"
            style={{
              background: likesRemaining === 0 ? "rgba(239,68,68,0.1)" : "rgba(255,193,7,0.1)",
              border: `1px solid ${likesRemaining === 0 ? "rgba(239,68,68,0.3)" : "rgba(255,193,7,0.3)"}`,
              color: likesRemaining === 0 ? "#f87171" : "#FFC107",
            }}
          >
            {likesRemaining === 0 ? "⚠️ No likes left today — upgrade for more" : "⚡ Last like of the day — make it count!"}
          </div>
        )}

        {/* Text area */}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-3">
            <textarea
              autoFocus
              rows={3}
              maxLength={MAX}
              placeholder={
                isSpark
                  ? "Write something genuine — Sparks with real messages convert 3x better"
                  : "Reply to their prompt... be specific, be genuine."
              }
              className="w-full text-sm rounded-xl p-4 resize-none focus:outline-none transition"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-primary)",
                caretColor: accent,
              }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = isSpark ? "rgba(255,193,7,0.5)" : "rgba(255,107,158,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
            <span
              className="absolute bottom-3 right-3 text-[10px] font-mono"
              style={{ color: remaining < 30 ? "#f87171" : "var(--text-muted)" }}
            >
              {remaining}
            </span>
          </div>

          {/* Quick starters — only for regular prompts */}
          {!isSpark && (
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                Quick starters
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setText(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full border transition hover:border-[#FF6B9E] hover:text-[#FF6B9E]"
                    style={{ borderColor: "var(--hairline)", color: "var(--text-muted)", background: "transparent" }}
                  >
                    {s.length > 40 ? s.slice(0, 38) + "…" : s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border transition hover:bg-white/5"
              style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || (isSpark ? sparksRemaining === 0 : likesRemaining === 0)}
              className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
              style={{
                background: isSpark ? "linear-gradient(135deg, #FFC107, #FF8F00)" : "linear-gradient(135deg, #FF6B9E, #FF8FB5)",
                color: "#0B1120",
                boxShadow: isSpark ? "0 4px 20px rgba(255,193,7,0.35)" : "0 4px 20px rgba(255,107,158,0.35)",
              }}
            >
              <Send className="h-4 w-4" />
              {isSpark ? "Send Spark ⚡" : "Send + Like"}
            </button>
          </div>

          <p className="text-center text-[10px] mt-3" style={{ color: "var(--text-muted)" }}>
            {isSpark
              ? `Uses 1 of your ${sparksRemaining} Spark${sparksRemaining !== 1 ? "s" : ""} this week`
              : `Uses 1 of your ${likesRemaining} remaining likes today`}
          </p>
        </form>
      </div>
    </div>
  );
}
