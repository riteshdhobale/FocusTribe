import { useState, useCallback } from "react";
import { X, AlertTriangle, Send, Shield } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type ReportType = "harassment" | "fake_profile" | "spam" | "inappropriate_content" | "underage" | "threats" | "hate_speech" | "other";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
  context: "swipe_card" | "chat" | "study_room" | "profile";
};

const REPORT_REASONS: { value: ReportType; label: string; emoji: string }[] = [
  { value: "harassment", label: "Harassment or bullying", emoji: "🚫" },
  { value: "fake_profile", label: "Fake profile / catfishing", emoji: "🎭" },
  { value: "spam", label: "Spam or scam", emoji: "📧" },
  { value: "inappropriate_content", label: "Inappropriate content", emoji: "⚠️" },
  { value: "underage", label: "Underage user", emoji: "🔞" },
  { value: "threats", label: "Threats or violence", emoji: "💀" },
  { value: "hate_speech", label: "Hate speech", emoji: "🗣️" },
  { value: "other", label: "Other", emoji: "📝" },
];

export function ReportModal({ isOpen, onClose, reportedUserId, reportedUserName, context }: ReportModalProps) {
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!reportType || description.trim().length < 10) return;
    setSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("You must be logged in to report");

        const { error: dbError } = await (supabase.from("reports") as any).insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          report_type: reportType,
          description: description.trim(),
          context,
        });

        if (dbError) {
          if (dbError.code === "23505") {
            // Duplicate report within 24h
            setError("You've already reported this person recently. Our team is reviewing it.");
          } else {
            throw dbError;
          }
          setSubmitting(false);
          return;
        }
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  }, [reportType, description, reportedUserId, context]);

  const handleClose = () => {
    setReportType(null);
    setDescription("");
    setSubmitted(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>

      <div className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--hairline)" }}>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" style={{ color: "var(--crimson, #EF4444)" }} />
            <h3 className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>
              Report {reportedUserName}
            </h3>
          </div>
          <button onClick={handleClose} className="h-8 w-8 rounded-full flex items-center justify-center transition hover:opacity-70"
            style={{ background: "var(--surface-2, rgba(255,255,255,0.05))" }}>
            <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {submitted ? (
          /* ── Success state ── */
          <div className="p-8 text-center">
            <div className="h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4"
              style={{ background: "rgba(16,185,129,0.15)" }}>
              <Shield className="h-7 w-7" style={{ color: "#10B981" }} />
            </div>
            <h4 className="font-display font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
              Report submitted
            </h4>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Our safety team will review this within <strong>24 hours</strong>. 
              If we find a violation, we'll take action including temporary or permanent bans.
            </p>
            <button onClick={handleClose}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{ background: "var(--rose-accent)", color: "#0B1120" }}>
              Done
            </button>
          </div>
        ) : (
          /* ── Report form ── */
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Reason selection */}
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase block mb-2"
                style={{ color: "var(--text-muted)" }}>
                Why are you reporting?
              </span>
              <div className="space-y-1.5">
                {REPORT_REASONS.map(r => {
                  const isActive = reportType === r.value;
                  return (
                    <button key={r.value} onClick={() => setReportType(r.value)}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left text-sm transition"
                      style={{
                        background: isActive ? "rgba(201,165,78,0.1)" : "transparent",
                        borderColor: isActive ? "var(--rose-accent)" : "var(--hairline)",
                        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      }}>
                      <span className="text-base">{r.emoji}</span>
                      <span className="font-medium">{r.label}</span>
                      {isActive && (
                        <span className="ml-auto text-xs" style={{ color: "var(--rose-accent)" }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            {reportType && (
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase block mb-2"
                  style={{ color: "var(--text-muted)" }}>
                  Tell us more <span style={{ color: "var(--text-muted)" }}>(min 10 characters)</span>
                </span>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Describe what happened so our team can investigate..."
                  className="w-full px-3.5 py-3 rounded-xl border text-sm outline-none resize-none"
                  style={{
                    background: "var(--bg-main)",
                    borderColor: "var(--hairline)",
                    color: "var(--text-primary)",
                  }}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {description.length}/2000
                  </span>
                  {description.trim().length > 0 && description.trim().length < 10 && (
                    <span className="text-[10px]" style={{ color: "#EF4444" }}>
                      Need at least 10 characters
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Safety note */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-[11px]"
              style={{ background: "rgba(201,165,78,0.05)", color: "var(--text-muted)" }}>
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--rose-accent)" }} />
              <span>
                If you're in immediate danger, contact local authorities. 
                False reports may result in action against your account.
              </span>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!reportType || description.trim().length < 10 || submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition"
              style={{
                background: reportType && description.trim().length >= 10 ? "#EF4444" : "var(--hairline)",
                color: reportType && description.trim().length >= 10 ? "white" : "var(--text-muted)",
                cursor: reportType && description.trim().length >= 10 ? "pointer" : "not-allowed",
                opacity: submitting ? 0.7 : 1,
              }}>
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
