import { useState, useEffect } from "react";
import { BookOpen, Zap, ChevronRight, Clock, Target } from "lucide-react";

type Task = { id: string; text: string; done: boolean };

type TaskGateProps = {
  /** localStorage key used by the room's task list — so we can surface existing tasks */
  storeKey: string;
  /** Partner display name for the "commitment witness" copy */
  partnerName?: string;
  /** Session duration options */
  durations?: { label: string; minutes: number }[];
  /** Fires when the user commits — passes the goal text and chosen duration in minutes */
  onCommit: (goal: string, durationMinutes: number) => void;
};

const DEFAULT_DURATIONS = [
  { label: "25 min", minutes: 25 },
  { label: "50 min", minutes: 50 },
  { label: "75 min", minutes: 75 },
];

const SUBJECT_SUGGESTIONS = [
  "📐 Solve 20 maths problems",
  "📖 Read 30 pages",
  "✍️ Write 500 words of my essay",
  "💻 Complete 2 LeetCode problems",
  "🔬 Finish chapter revision",
  "📝 Complete past paper questions",
];

export function TaskGate({
  storeKey,
  partnerName,
  durations = DEFAULT_DURATIONS,
  onCommit,
}: TaskGateProps) {
  const [existingTasks, setExistingTasks] = useState<Task[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [customGoal, setCustomGoal] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(durations[1].minutes); // default 50 min
  const [animIn, setAnimIn] = useState(false);

  // Load existing tasks from the room's localStorage store
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const parsed: Task[] = JSON.parse(raw);
        const undone = parsed.filter((t) => !t.done);
        setExistingTasks(undone);
        if (undone.length > 0) setSelectedGoal(undone[0].text);
      }
    } catch {}
    // Trigger entrance animation
    requestAnimationFrame(() => setAnimIn(true));
  }, [storeKey]);

  const activeGoal = useCustom ? customGoal.trim() : selectedGoal;
  const canCommit = activeGoal.length > 0;

  const handleCommit = () => {
    if (!canCommit) return;
    onCommit(activeGoal, selectedDuration);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(255,107,158,0.12) 0%, #0B1120 55%)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="w-full max-w-lg rounded-3xl border p-8 transition-all duration-500"
        style={{
          background: "linear-gradient(145deg, #111827 0%, #0B1120 100%)",
          borderColor: "rgba(255,107,158,0.25)",
          boxShadow: "0 0 60px rgba(255,107,158,0.08), 0 25px 50px rgba(0,0,0,0.5)",
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,107,158,0.15)", border: "1px solid rgba(255,107,158,0.3)" }}
          >
            <Target className="h-5 w-5" style={{ color: "#FF6B9E" }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-white leading-tight">
              What's your goal for this session?
            </h2>
            {partnerName && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "#FF6B9E" }}>{partnerName}</span> will see your commitment
              </p>
            )}
          </div>
        </div>

        <p className="text-sm mb-6 mt-3" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Saying your goal out loud to a study partner increases completion by{" "}
          <span className="font-semibold" style={{ color: "#FF6B9E" }}>40%</span>. Make it count.
        </p>

        {/* Existing tasks from the room */}
        {existingTasks.length > 0 && !useCustom && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              Your open tasks
            </p>
            <div className="space-y-2">
              {existingTasks.slice(0, 4).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedGoal(t.text)}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200"
                  style={{
                    background:
                      selectedGoal === t.text
                        ? "rgba(255,107,158,0.12)"
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      selectedGoal === t.text
                        ? "rgba(255,107,158,0.5)"
                        : "rgba(255,255,255,0.08)",
                    color: selectedGoal === t.text ? "#FF6B9E" : "var(--text-primary)",
                  }}
                >
                  <div
                    className="h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
                    style={{
                      borderColor:
                        selectedGoal === t.text ? "#FF6B9E" : "rgba(255,255,255,0.2)",
                      background:
                        selectedGoal === t.text ? "#FF6B9E" : "transparent",
                    }}
                  >
                    {selectedGoal === t.text && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">{t.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions (shown when no existing tasks) */}
        {existingTasks.length === 0 && !useCustom && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              Quick select
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECT_SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedGoal(s)}
                  className="text-left px-3 py-2.5 rounded-xl border text-xs transition-all duration-200"
                  style={{
                    background:
                      selectedGoal === s ? "rgba(255,107,158,0.12)" : "rgba(255,255,255,0.03)",
                    borderColor:
                      selectedGoal === s ? "rgba(255,107,158,0.5)" : "rgba(255,255,255,0.08)",
                    color: selectedGoal === s ? "#FF6B9E" : "var(--text-secondary)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom goal toggle */}
        {!useCustom ? (
          <button
            onClick={() => { setUseCustom(true); setSelectedGoal(""); }}
            className="w-full text-sm py-2.5 rounded-xl border border-dashed transition-all duration-200 mb-4"
            style={{
              borderColor: "rgba(255,255,255,0.12)",
              color: "var(--text-muted)",
              background: "transparent",
            }}
          >
            ✏️ Type a custom goal instead
          </button>
        ) : (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              Your commitment
            </p>
            <div className="relative">
              <BookOpen
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                autoFocus
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCommit()}
                placeholder="e.g. Finish Organic Chemistry MCQs"
                maxLength={80}
                className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-white placeholder:text-[color:var(--text-muted)] focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: customGoal
                    ? "rgba(255,107,158,0.5)"
                    : "rgba(255,255,255,0.12)",
                }}
              />
            </div>
            <button
              onClick={() => { setUseCustom(false); setCustomGoal(""); }}
              className="text-xs mt-2 transition"
              style={{ color: "var(--text-muted)" }}
            >
              ← Back to my tasks
            </button>
          </div>
        )}

        {/* Duration picker */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            Session length
          </p>
          <div className="flex gap-2">
            {durations.map((d) => (
              <button
                key={d.minutes}
                onClick={() => setSelectedDuration(d.minutes)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200"
                style={{
                  background:
                    selectedDuration === d.minutes
                      ? "rgba(255,107,158,0.15)"
                      : "rgba(255,255,255,0.03)",
                  borderColor:
                    selectedDuration === d.minutes
                      ? "rgba(255,107,158,0.5)"
                      : "rgba(255,255,255,0.08)",
                  color: selectedDuration === d.minutes ? "#FF6B9E" : "var(--text-secondary)",
                }}
              >
                <Clock className="h-3.5 w-3.5" />
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleCommit}
          disabled={!canCommit}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background: canCommit
              ? "linear-gradient(135deg, #FF6B9E 0%, #e8437e 100%)"
              : "rgba(255,255,255,0.06)",
            color: canCommit ? "#fff" : "var(--text-muted)",
            boxShadow: canCommit ? "0 8px 30px rgba(255,107,158,0.35)" : "none",
            cursor: canCommit ? "pointer" : "not-allowed",
            transform: canCommit ? "none" : undefined,
          }}
        >
          <Zap className="h-5 w-5" />
          Start Study Session
          <ChevronRight className="h-4 w-4" />
        </button>

        {canCommit && (
          <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Your goal will be pinned at the top of the room for accountability
          </p>
        )}
      </div>
    </div>
  );
}
