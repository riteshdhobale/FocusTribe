import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCategory } from "@/lib/categories";
import { fetchRoomById, joinRoom, leaveRoom, leaveRoomBeacon, type StudyRoom } from "@/lib/rooms";
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Target,
  Loader2,
  Scroll,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { JitsiMeet } from "@/components/JitsiMeet";
import { TaskGate } from "@/components/TaskGate";
import { useSessionGoalSync } from "@/lib/useSessionGoalSync";
import { useAuth } from "@/lib/useAuth";
import { useStudyContract } from "@/lib/useStudyContract";

export const Route = createFileRoute("/room/$slug/$id")({
  head: ({ params }) => {
    const c = getCategory(params.slug);
    return {
      meta: [
        { title: `${c?.name ?? "Study"} room — StudyDate` },
        { name: "description", content: "Live study room with Pomodoro and tasks." },
      ],
    };
  },
  component: StudyRoomView,
});

type Mode = "focus" | "short" | "long";
const DURATIONS: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

type Task = { id: string; text: string; done: boolean };

function StudyRoomView() {
  const { slug, id } = Route.useParams();
  const cat = getCategory(slug);
  const { user, isAuthenticated } = useAuth();

  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [loading, setLoading] = useState(true);

  // Load room data
  useEffect(() => {
    fetchRoomById(id).then((res) => {
      if (res) {
        setRoom(res);
      } else if (id.length > 10) {
        // Fallback: If no public room is found but the ID is a long UUID (like a Match ID),
        // we automatically create a private 1-on-1 Study Date room on the fly!
        setRoom({
          id,
          slug,
          name: "Private Study Date",
          topic: "1-on-1 Session",
          capacity: 2,
          created_by: "system",
          is_active: true,
          participantCount: 1,
        });
      }
      setLoading(false);
    });
  }, [id, slug]);

  // Handle participant tracking
  useEffect(() => {
    if (isAuthenticated) {
      joinRoom(id);
      return () => {
        leaveRoom(id);
      };
    }
  }, [id, isAuthenticated]);

  // Handle window closing / refresh for leaving — uses keepalive fetch for reliability
  useEffect(() => {
    const handleUnload = () => {
      if (isAuthenticated && user?.id) leaveRoomBeacon(id, user.id);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [id, isAuthenticated, user?.id]);

  // Get username for Jitsi display name
  const userName = useMemo(() => {
    if (user?.email) return user.email.split("@")[0];
    if (typeof window !== "undefined") return localStorage.getItem("ft_name") || "Tribe Member";
    return "Tribe Member";
  }, [user]);

  // Generate a deterministic Jitsi room name
  const jitsiRoomName = `studydate-${slug}-${id}`.replace(/[^a-zA-Z0-9-]/g, "");

  // Private 1-on-1 match rooms get mic enabled; category rooms are silent
  const isPrivateRoom =
    room?.name === "Private Study Date" ||
    (room?.capacity === 2 && id.length > 20);

  // Pomodoro — with localStorage persistence
  const timerKey = `ft_timer_${slug}_${id}`;
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "focus";
    try {
      const s = JSON.parse(localStorage.getItem(timerKey) || "{}");
      return s.mode || "focus";
    } catch {
      return "focus";
    }
  });
  const [secs, setSecs] = useState(() => {
    if (typeof window === "undefined") return DURATIONS.focus;
    try {
      const s = JSON.parse(localStorage.getItem(timerKey) || "{}");
      if (s.mode && s.secs != null && s.mode === (s.mode || "focus")) return s.secs;
    } catch {}
    return DURATIONS.focus;
  });
  const [running, setRunning] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const ref = useRef<number | null>(null);

  // Save timer state to localStorage on every tick
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(timerKey, JSON.stringify({ mode, secs }));
    }
  }, [mode, secs, timerKey]);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setSecs((s: number) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [running]);

  // When mode changes manually (not from persistence), reset to full duration
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setSecs(DURATIONS[newMode]);
    setRunning(false);
  };

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const pct = useMemo(() => 1 - secs / DURATIONS[mode], [secs, mode]);

  // Tasks
  const storeKey = `ft_tasks_${slug}_${id}`;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  // ── Task Gate state ──────────────────────────────────────────────
  // sessionGoal: the one-sentence commitment the user makes before joining
  // gateKey is per-room so refreshing the same room re-shows the gate
  const gateKey = `ft_gate_${slug}_${id}`;
  const [sessionGoal, setSessionGoal] = useState<string | null>(() => {
    try { return sessionStorage.getItem(gateKey); } catch { return null; }
  });

  // ── Sync session goal with partner via Supabase Realtime Broadcast ────
  // Called here (before any early returns) to satisfy React Rules of Hooks.
  // The hook silently no-ops when Supabase isn't configured or goal is null.
  const { partnerGoal } = useSessionGoalSync({
    roomId: id,
    userId: user?.id,
    displayName: userName,
    myGoal: sessionGoal,
  });

  // ── AI Study Contract Setup ─────────────────────────────────────
  const {
    contract,
    generating,
    generateAndShareContract,
    toggleMilestone,
    resetContract,
  } = useStudyContract({
    roomId: id,
    userId: user?.id,
    userName: userName,
  });

  const [sidebarTab, setSidebarTab] = useState<"tasks" | "contract">(() => {
    return isPrivateRoom ? "contract" : "tasks";
  });

  const [contractMode, setContractMode] = useState<"silent" | "collaborative" | "quizzing">("collaborative");

  const handleGateCommit = (goal: string, durationMinutes: number) => {
    setSessionGoal(goal);
    // Map chosen duration to a Pomodoro mode and pre-set the timer
    if (durationMinutes <= 25) {
      handleModeChange("short"); // treat ≤25 as a short break-length focus
    } else if (durationMinutes >= 60) {
      handleModeChange("long");
    } else {
      handleModeChange("focus"); // 50 min → standard focus (2× pomodoro)
    }
    // Override to exact minutes chosen
    setSecs(durationMinutes * 60);
    // Persist for this browser tab session only (cleared on tab close)
    try { sessionStorage.setItem(gateKey, goal); } catch {}
    // Also pre-populate the task list with the goal if it isn't there already
    setTasks((prev) => {
      if (prev.some((t) => t.text === goal)) return prev;
      return [{ id: crypto.randomUUID(), text: goal, done: false }, ...prev];
    });
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storeKey);
    if (raw)
      try {
        setTasks(JSON.parse(raw));
      } catch {}
  }, [storeKey]);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(storeKey, JSON.stringify(tasks));
  }, [storeKey, tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks((t) => [...t, { id: crypto.randomUUID(), text: input.trim(), done: false }]);
    setInput("");
  };

  if (loading)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[color:var(--background)]">
        Loading room...
      </div>
    );
  if (!room)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[color:var(--background)]">
        Room not found.
      </div>
    );

  // ── Show Task Gate before Jitsi connects ───────────────────────
  if (!sessionGoal) {
    return (
      <TaskGate
        storeKey={storeKey}
        partnerName={isPrivateRoom ? "your study partner" : undefined}
        onCommit={handleGateCommit}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[color:var(--background)]">
      {/* top bar */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-[color:var(--hairline)] glass-nav">
        <Link
          to="/rooms/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-2 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Leave
        </Link>

        {/* Dual goal bar — shows both users' commitments */}
        <div className="flex-1 flex items-center justify-center gap-3 min-w-0 px-3">
          {/* My goal */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Target className="h-3 w-3 shrink-0" style={{ color: "#FF6B9E" }} />
            <span
              className="text-xs font-semibold truncate max-w-[160px]"
              style={{ color: "#FF6B9E" }}
              title={`You: ${sessionGoal}`}
            >
              {sessionGoal}
            </span>
          </div>

          {/* Partner goal — only shown in private 1-on-1 rooms once received */}
          {isPrivateRoom && partnerGoal && (
            <>
              <div className="w-px h-4 shrink-0" style={{ background: "var(--hairline)" }} />
              <div className="flex items-center gap-1.5 min-w-0">
                <Target className="h-3 w-3 shrink-0" style={{ color: "#8B5CF6" }} />
                <span
                  className="text-xs font-semibold truncate max-w-[160px]"
                  style={{ color: "#8B5CF6" }}
                  title={`${partnerGoal.displayName}: ${partnerGoal.goal}`}
                >
                  {partnerGoal.goal}
                </span>
              </div>
            </>
          )}

          {/* Waiting indicator for private rooms before partner connects */}
          {isPrivateRoom && !partnerGoal && (
            <>
              <div className="w-px h-4 shrink-0" style={{ background: "var(--hairline)" }} />
              <span className="text-xs italic" style={{ color: "var(--text-muted)" }}>
                waiting for partner…
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
          <span className="live-dot" /> {room.participantCount || 1} live
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Jitsi video */}
        <div className="flex-1 p-3 lg:p-5">
          <JitsiMeet
            roomName={jitsiRoomName}
            displayName={userName}
            categoryName={cat?.name}
            allowMic={isPrivateRoom}
            completedTasksCount={tasks.filter((t) => t.done).length}
          />
        </div>

        {/* Desktop sidebar — hidden on mobile */}
        <aside className="hidden lg:flex w-[340px] border-l border-[color:var(--hairline)] p-5 flex-col gap-5 overflow-y-auto">
          {/* timer */}
          <div className="surface-card p-5">
            <div className="flex gap-2 mb-5">
              {(["focus", "short", "long"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`flex-1 text-xs py-1.5 btn-pill font-semibold transition ${
                    mode === m
                      ? "bg-rose-gradient text-[color:var(--primary-foreground)]"
                      : "border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                  }`}
                >
                  {m === "focus" ? "Focus" : m === "short" ? "Short" : "Long"}
                </button>
              ))}
            </div>
            <div className="text-center font-display font-extrabold text-6xl text-rose-gradient tracking-tight tabular-nums">
              {mm}:{ss}
            </div>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden bg-[color:var(--surface-2)]">
              <div
                className="h-full bg-rose-gradient transition-all"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSecs(DURATIONS[mode]);
                  setRunning(false);
                }}
                className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center hover:border-[color:var(--rose-accent)] transition"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                className="h-12 w-12 rounded-full bg-rose-gradient text-[color:var(--primary-foreground)] flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-rose)" }}
                aria-label={running ? "Pause" : "Play"}
              >
                {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  const order: Mode[] = ["focus", "short", "focus", "short", "focus", "long"];
                  const next = order[(order.indexOf(mode) + 1) % order.length];
                  handleModeChange(next);
                }}
                className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center hover:border-[color:var(--rose-accent)] transition"
                aria-label="Skip"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* tabbed container */}
          <div className="surface-card flex-1 min-h-[260px] flex flex-col relative overflow-hidden">
            {/* Header Tabs */}
            <div className="flex border-b border-[color:var(--hairline)] bg-[color:var(--surface-2)] shrink-0">
              <button
                onClick={() => setSidebarTab("tasks")}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition border-b-2 ${
                  sidebarTab === "tasks"
                    ? "border-[#FF6B9E] text-[#FF6B9E]"
                    : "border-transparent text-[color:var(--text-muted)] hover:text-white"
                }`}
              >
                📋 Tasks
              </button>
              {isPrivateRoom && (
                <button
                  onClick={() => setSidebarTab("contract")}
                  className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition border-b-2 ${
                    sidebarTab === "contract"
                      ? "border-[#FF6B9E] text-[#FF6B9E]"
                      : "border-transparent text-[color:var(--text-muted)] hover:text-white"
                  }`}
                >
                  📜 AI Contract
                </button>
              )}
            </div>

            {sidebarTab === "tasks" ? (
              <>
                <div className="flex-1 space-y-1 overflow-y-auto px-4 py-3 relative z-10">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="group flex items-start gap-3 p-2 rounded-xl hover:bg-[color:var(--surface-2)] transition-colors"
                    >
                      <div className="pt-0.5 relative z-10">
                        <button
                          onClick={() =>
                            setTasks((arr) =>
                              arr.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)),
                            )
                          }
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
                            t.done
                              ? "border-[color:var(--emerald-live)] bg-[color:var(--emerald-live)]"
                              : "border-slate-500 bg-[color:var(--background)] hover:border-[color:var(--rose-accent)]"
                          }`}
                        >
                          {t.done && <span className="text-[10px] text-white font-bold">✓</span>}
                        </button>
                      </div>
                      <span
                        className={`flex-1 text-sm mt-0.5 transition-colors ${t.done ? "line-through text-[color:var(--text-muted)]" : "text-slate-200"}`}
                      >
                        {t.text}
                      </span>
                      <button
                        onClick={() => setTasks((arr) => arr.filter((x) => x.id !== t.id))}
                        className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-[color:var(--text-muted)] hover:bg-rose-500/10 hover:text-[color:var(--crimson)] mt-[-4px]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-sm text-[color:var(--text-muted)] py-8 text-center italic font-light">
                      Empty slate. Add a task below.
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-[color:var(--hairline)] bg-[color:var(--surface-2)] relative z-10">
                  <form onSubmit={addTask} className="flex gap-2 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="What are we focusing on?"
                      className="flex-1 bg-[color:var(--background)] border border-[color:var(--hairline)] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[color:var(--rose-accent)] transition-colors shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="h-10 w-10 shrink-0 rounded-xl bg-rose-gradient text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-50 shadow-md"
                    >
                      <Plus className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col overflow-y-auto p-4 relative z-10 text-left">
                {!contract ? (
                  <div className="flex-1 flex flex-col justify-center text-center py-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(255,107,158,0.12)" }}>
                      <Sparkles className="h-5 w-5" style={{ color: "#FF6B9E" }} />
                    </div>
                    <h3 className="font-display font-bold text-sm text-white mb-1">
                      Collaborative Study Contract
                    </h3>
                    <p className="text-xs text-[color:var(--text-muted)] max-w-xs mx-auto mb-5 leading-relaxed">
                      Align your study goals. The AI Coach will structure a tailored study schedule for this session.
                    </p>

                    {/* Mode Selector */}
                    <div className="mb-5 text-left">
                      <label className="text-[10px] font-semibold text-[color:var(--text-muted)] uppercase tracking-wider mb-2 block">
                        Choose Session Mode
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["silent", "collaborative", "quizzing"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setContractMode(m)}
                            className={`py-2 rounded-xl text-[10px] font-bold border transition flex flex-col items-center gap-1 ${
                              contractMode === m
                                ? "bg-rose-gradient text-white border-transparent"
                                : "border-[color:var(--hairline)] text-[color:var(--text-secondary)] hover:text-white"
                            }`}
                          >
                            <span>{m === "silent" ? "🤫" : m === "collaborative" ? "💬" : "❓"}</span>
                            <span className="capitalize">{m}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button / Status message */}
                    {!sessionGoal || !partnerGoal ? (
                      <div className="text-center p-3 rounded-xl border border-dashed border-[color:var(--hairline)] bg-[color:var(--surface-2)]/30">
                        <p className="text-[11px] text-[color:var(--text-muted)] leading-relaxed">
                          ⚠️ Both study goals must be set to generate the contract.
                          <br />
                          <span className="text-[10px] italic">
                            {!sessionGoal && "Waiting for you to set your goal. "}
                            {!partnerGoal && "Waiting for partner to set their goal."}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          generateAndShareContract(
                            sessionGoal,
                            partnerGoal.goal,
                            Math.round(secs / 60) || 50,
                            contractMode
                          )
                        }
                        disabled={generating}
                        className="w-full btn-pill bg-rose-gradient text-[color:var(--primary-foreground)] py-3 font-semibold text-xs flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        style={{ boxShadow: "var(--shadow-rose)" }}
                      >
                        {generating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Consulting AI Coach...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            Generate AI Contract
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    {/* Contract Header */}
                    <div className="pb-3 border-b border-[color:var(--hairline)]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-[#FF6B9E] bg-[#FF6B9E]/10 px-2 py-0.5 rounded-full capitalize">
                          {contractMode} Session
                        </span>
                        <button
                          onClick={resetContract}
                          className="text-[10px] text-[color:var(--text-muted)] hover:text-red-400 transition"
                        >
                          Reset Plan
                        </button>
                      </div>
                      <h4 className="font-display font-extrabold text-base text-rose-gradient mt-1 leading-snug">
                        {contract.title}
                      </h4>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1 text-[10px] font-semibold text-[color:var(--text-muted)]">
                        <span>CONTRACT PROGRESS</span>
                        <span>
                          {Math.round(
                            (contract.milestones.filter((m) => m.done).length /
                              contract.milestones.length) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-[color:var(--surface-2)]">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${
                              (contract.milestones.filter((m) => m.done).length /
                                contract.milestones.length) *
                              100
                            }%`,
                            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Milestones Checklist */}
                    <div className="space-y-3.5">
                      {contract.milestones.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-start gap-2.5 p-2 rounded-xl bg-[color:var(--surface-2)]/40 hover:bg-[color:var(--surface-2)] transition-colors border border-[color:var(--hairline)]"
                        >
                          <button
                            onClick={() => toggleMilestone(m.id)}
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              m.done
                                ? "border-emerald-500 bg-emerald-500"
                                : "border-slate-500 hover:border-[#FF6B9E]"
                            }`}
                          >
                            {m.done && <span className="text-[10px] text-white font-bold">✓</span>}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-baseline mb-0.5 gap-2">
                              <span
                                className={`text-xs font-bold leading-tight ${
                                  m.done ? "line-through text-[color:var(--text-muted)]" : "text-slate-100"
                                }`}
                              >
                                {m.label}
                              </span>
                              <span className="text-[9px] font-bold text-[color:var(--text-muted)] shrink-0">
                                {m.durationMinutes} min
                              </span>
                            </div>
                            <p
                              className={`text-[10px] leading-relaxed ${
                                m.done ? "text-[color:var(--text-muted)]" : "text-slate-350"
                              }`}
                            >
                              {m.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Coach Tip */}
                    {contract.coachTip && (
                      <div className="p-3.5 rounded-xl border border-[color:var(--hairline)] bg-[color:var(--surface-2)]/20">
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] font-extrabold uppercase tracking-widest text-[#FFC107]">
                          <Sparkles className="h-3 w-3" />
                          AI Focus Coach
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-300 italic">
                          "{contract.coachTip}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Mobile floating timer button — visible only on mobile */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="lg:hidden fixed bottom-4 right-4 z-40 h-14 px-4 rounded-full flex items-center gap-3 border shadow-xl transition active:scale-95"
          style={{
            background: "color-mix(in oklab, var(--surface) 95%, transparent)",
            borderColor: running ? "var(--rose-accent)" : "var(--hairline)",
            backdropFilter: "blur(12px)",
            boxShadow: running ? "0 4px 20px rgba(255,107,158,0.3)" : "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          <span className="font-display font-bold text-lg tabular-nums text-rose-gradient">
            {mm}:{ss}
          </span>
          {showPanel ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>

        {/* Mobile slide-up panel */}
        {showPanel && (
          <div
            className="lg:hidden fixed inset-x-0 bottom-0 z-30 max-h-[70vh] overflow-y-auto rounded-t-3xl border-t p-5 space-y-4 animate-in slide-in-from-bottom duration-300"
            style={{ background: "var(--bg-main)", borderColor: "var(--hairline)" }}
          >
            {/* Timer controls */}
            <div className="flex gap-2 mb-3">
              {(["focus", "short", "long"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`flex-1 text-xs py-1.5 btn-pill font-semibold transition ${
                    mode === m
                      ? "bg-rose-gradient text-[color:var(--primary-foreground)]"
                      : "border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                  }`}
                >
                  {m === "focus" ? "Focus" : m === "short" ? "Short" : "Long"}
                </button>
              ))}
            </div>
            <div className="text-center font-display font-extrabold text-5xl text-rose-gradient tracking-tight tabular-nums">
              {mm}:{ss}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-[color:var(--surface-2)]">
              <div
                className="h-full bg-rose-gradient transition-all"
                style={{ width: `${pct * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSecs(DURATIONS[mode]);
                  setRunning(false);
                }}
                className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                className="h-12 w-12 rounded-full bg-rose-gradient text-[color:var(--primary-foreground)] flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-rose)" }}
                aria-label={running ? "Pause" : "Play"}
              >
                {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  const order: Mode[] = ["focus", "short", "focus", "short", "focus", "long"];
                  handleModeChange(order[(order.indexOf(mode) + 1) % order.length]);
                }}
                className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center"
                aria-label="Skip"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            {/* Tasks / Contract Tabs */}
            <div className="pt-5 mt-2">
              <div className="surface-card flex-1 min-h-[200px] flex flex-col relative overflow-hidden">
                {/* Header Tabs */}
                <div className="flex border-b border-[color:var(--hairline)] bg-[color:var(--surface-2)] shrink-0">
                  <button
                    onClick={() => setSidebarTab("tasks")}
                    className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition border-b-2 ${
                      sidebarTab === "tasks"
                        ? "border-[#FF6B9E] text-[#FF6B9E]"
                        : "border-transparent text-[color:var(--text-muted)] hover:text-white"
                    }`}
                  >
                    📋 Tasks
                  </button>
                  {isPrivateRoom && (
                    <button
                      onClick={() => setSidebarTab("contract")}
                      className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition border-b-2 ${
                        sidebarTab === "contract"
                          ? "border-[#FF6B9E] text-[#FF6B9E]"
                          : "border-transparent text-[color:var(--text-muted)] hover:text-white"
                      }`}
                    >
                      📜 AI Contract
                    </button>
                  )}
                </div>

                {sidebarTab === "tasks" ? (
                  <>
                    <div className="flex-1 space-y-1 max-h-48 overflow-y-auto px-3 py-2 relative z-10">
                      {tasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-start gap-3 p-2 rounded-xl hover:bg-[color:var(--surface-2)] transition-colors"
                        >
                          <div className="pt-0.5 relative z-10">
                            <button
                              onClick={() =>
                                setTasks((arr) =>
                                  arr.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)),
                                )
                              }
                              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                t.done
                                  ? "border-[color:var(--emerald-live)] bg-[color:var(--emerald-live)]"
                                  : "border-slate-500 bg-[color:var(--background)]"
                              }`}
                            >
                              {t.done && <span className="text-[10px] text-white font-bold">✓</span>}
                            </button>
                          </div>
                          <span
                            className={`flex-1 text-sm mt-0.5 ${t.done ? "line-through text-[color:var(--text-muted)]" : "text-slate-200"}`}
                          >
                            {t.text}
                          </span>
                          <button
                            onClick={() => setTasks((arr) => arr.filter((x) => x.id !== t.id))}
                            className="p-1 text-[color:var(--text-muted)] mt-[-2px]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <div className="text-xs text-[color:var(--text-muted)] py-6 text-center italic">
                          Empty slate.
                        </div>
                      )}
                    </div>

                    {/* Input area */}
                    <div className="p-3 border-t border-[color:var(--hairline)] bg-[color:var(--surface-2)]">
                      <form onSubmit={addTask} className="flex items-center gap-2">
                        <input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Add a task…"
                          className="flex-1 bg-[color:var(--background)] border border-[color:var(--hairline)] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[color:var(--rose-accent)] transition-colors shadow-inner"
                        />
                        <button
                          type="submit"
                          disabled={!input.trim()}
                          className="h-10 w-10 shrink-0 rounded-xl bg-rose-gradient text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-50 shadow-md"
                        >
                          <Plus className="h-5 w-5" strokeWidth={2.5} />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col max-h-72 overflow-y-auto p-3.5 relative z-10 text-left">
                    {!contract ? (
                      <div className="flex-1 flex flex-col justify-center text-center py-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: "rgba(255,107,158,0.12)" }}>
                          <Sparkles className="h-4 w-4" style={{ color: "#FF6B9E" }} />
                        </div>
                        <h3 className="font-display font-bold text-xs text-white mb-0.5">
                          Collaborative Study Contract
                        </h3>
                        <p className="text-[10px] text-[color:var(--text-muted)] max-w-xs mx-auto mb-4 leading-relaxed">
                          AI will structure a customized study checklist.
                        </p>

                        {/* Mode Selector */}
                        <div className="mb-4 text-left">
                          <label className="text-[9px] font-semibold text-[color:var(--text-muted)] uppercase tracking-wider mb-1 block">
                            Choose Session Mode
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {(["silent", "collaborative", "quizzing"] as const).map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setContractMode(m)}
                                className={`py-1.5 rounded-lg text-[9px] font-bold border transition flex flex-col items-center gap-0.5 ${
                                  contractMode === m
                                    ? "bg-rose-gradient text-white border-transparent"
                                    : "border-[color:var(--hairline)] text-[color:var(--text-secondary)] hover:text-white"
                                }`}
                              >
                                <span>{m === "silent" ? "🤫" : m === "collaborative" ? "💬" : "❓"}</span>
                                <span className="capitalize">{m}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Generate Button / Status message */}
                        {!sessionGoal || !partnerGoal ? (
                          <div className="text-center p-2.5 rounded-xl border border-dashed border-[color:var(--hairline)] bg-[color:var(--surface-2)]/30">
                            <p className="text-[10px] text-[color:var(--text-muted)] leading-normal">
                              ⚠️ Need both study goals to generate contract.
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              generateAndShareContract(
                                sessionGoal,
                                partnerGoal.goal,
                                Math.round(secs / 60) || 50,
                                contractMode
                              )
                            }
                            disabled={generating}
                            className="w-full btn-pill bg-rose-gradient text-[color:var(--primary-foreground)] py-2 font-semibold text-[10px] flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                            style={{ boxShadow: "var(--shadow-rose)" }}
                          >
                            {generating ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3 w-3" />
                                Generate Contract
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3.5 text-left">
                        {/* Contract Header */}
                        <div className="pb-2 border-b border-[color:var(--hairline)] flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[9px] font-bold text-[#FF6B9E] bg-[#FF6B9E]/10 px-1.5 py-0.5 rounded-full capitalize">
                              {contractMode}
                            </span>
                            <h4 className="font-display font-extrabold text-sm text-rose-gradient mt-0.5 leading-snug">
                              {contract.title}
                            </h4>
                          </div>
                          <button
                            onClick={resetContract}
                            className="text-[9px] text-[color:var(--text-muted)] hover:text-red-400 transition shrink-0"
                          >
                            Reset
                          </button>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between items-center mb-1 text-[9px] font-semibold text-[color:var(--text-muted)]">
                            <span>PROGRESS</span>
                            <span>
                              {Math.round(
                                (contract.milestones.filter((m) => m.done).length /
                                  contract.milestones.length) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden bg-[color:var(--surface-2)]">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${
                                  (contract.milestones.filter((m) => m.done).length /
                                    contract.milestones.length) *
                                  100
                                }%`,
                                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                              }}
                            />
                          </div>
                        </div>

                        {/* Milestones Checklist */}
                        <div className="space-y-2">
                          {contract.milestones.map((m) => (
                            <div
                              key={m.id}
                              className="flex items-start gap-2 p-2 rounded-xl bg-[color:var(--surface-2)]/40 border border-[color:var(--hairline)]"
                            >
                              <button
                                onClick={() => toggleMilestone(m.id)}
                                className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                  m.done
                                    ? "border-emerald-500 bg-emerald-500"
                                    : "border-slate-500"
                                }`}
                              >
                                {m.done && <span className="text-[9px] text-white font-bold">✓</span>}
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-baseline mb-0.5 gap-2">
                                  <span
                                    className={`text-[11px] font-bold leading-tight ${
                                      m.done ? "line-through text-[color:var(--text-muted)]" : "text-slate-100"
                                    }`}
                                  >
                                    {m.label}
                                  </span>
                                  <span className="text-[8px] font-bold text-[color:var(--text-muted)] shrink-0">
                                    {m.durationMinutes}m
                                  </span>
                                </div>
                                <p
                                  className={`text-[9px] leading-relaxed ${
                                    m.done ? "text-[color:var(--text-muted)]" : "text-slate-350"
                                  }`}
                                >
                                  {m.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Coach Tip */}
                        {contract.coachTip && (
                          <div className="p-2.5 rounded-xl border border-[color:var(--hairline)] bg-[color:var(--surface-2)]/20">
                            <p className="text-[9px] leading-relaxed text-slate-300 italic">
                              💡 "{contract.coachTip}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
