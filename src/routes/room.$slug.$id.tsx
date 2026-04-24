import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCategory, roomsFor } from "@/lib/categories";
import { ArrowLeft, Pause, Play, RotateCcw, SkipForward, Plus, Trash2 } from "lucide-react";
import { JitsiMeet } from "@/components/JitsiMeet";

export const Route = createFileRoute("/room/$slug/$id")({
  head: ({ params }) => {
    const c = getCategory(params.slug);
    return {
      meta: [
        { title: `${c?.name ?? "Study"} room — FocusTribe` },
        { name: "description", content: "Live study room with Pomodoro and tasks." },
      ],
    };
  },
  component: StudyRoom,
});

type Mode = "focus" | "short" | "long";
const DURATIONS: Record<Mode, number> = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };

type Task = { id: string; text: string; done: boolean };

function StudyRoom() {
  const { slug, id } = Route.useParams();
  const cat = getCategory(slug);
  const rooms = roomsFor(slug);
  const room = rooms[Number(id)] ?? rooms[0];

  // Get username for Jitsi display name
  const [userName, setUserName] = useState("Tribe Member");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("ft_name");
    if (stored) setUserName(stored);
  }, []);

  // Generate a deterministic Jitsi room name from slug + room name
  const jitsiRoomName = useMemo(() => {
    const base = room?.name ?? `room-${id}`;
    return `${slug}-${base}`.replace(/\s+/g, "-").toLowerCase();
  }, [slug, room, id]);

  // Pomodoro
  const [mode, setMode] = useState<Mode>("focus");
  const [secs, setSecs] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  useEffect(() => { setSecs(DURATIONS[mode]); setRunning(false); }, [mode]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const pct = useMemo(() => 1 - secs / DURATIONS[mode], [secs, mode]);

  // Tasks
  const storeKey = `ft_tasks_${slug}_${id}`;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storeKey);
    if (raw) try { setTasks(JSON.parse(raw)); } catch {}
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

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[color:var(--background)]">
      {/* top bar */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-[color:var(--hairline)] glass-nav">
        <Link to="/rooms/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition">
          <ArrowLeft className="h-4 w-4" /> Leave
        </Link>
        <div className="text-sm text-center min-w-0 px-4">
          <span className="font-display font-bold truncate">{room?.name ?? "Study Room"}</span>
          <span className="text-[color:var(--text-muted)]"> · {cat?.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
          <span className="live-dot" /> {room?.in ?? 1} live
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Jitsi video */}
        <div className="flex-1 p-5">
          <JitsiMeet
            roomName={jitsiRoomName}
            displayName={userName}
            categoryName={cat?.name}
          />
        </div>

        {/* sidebar */}
        <aside className="w-[340px] border-l border-[color:var(--hairline)] p-5 flex flex-col gap-5 overflow-y-auto">
          {/* timer */}
          <div className="surface-card p-5">
            <div className="flex gap-2 mb-5">
              {(["focus","short","long"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 text-xs py-1.5 btn-pill font-semibold transition ${
                    mode === m ? "bg-gold-gradient text-[color:var(--primary-foreground)]" : "border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                  }`}
                >
                  {m === "focus" ? "Focus" : m === "short" ? "Short" : "Long"}
                </button>
              ))}
            </div>
            <div className="text-center font-display font-extrabold text-6xl text-gold-gradient tracking-tight tabular-nums">
              {mm}:{ss}
            </div>
            <div className="mt-4 h-1.5 rounded-full overflow-hidden bg-[color:var(--surface-2)]">
              <div className="h-full bg-gold-gradient transition-all" style={{ width: `${pct * 100}%` }} />
            </div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => { setSecs(DURATIONS[mode]); setRunning(false); }}
                className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center hover:border-[color:var(--gold)] transition"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setRunning((r) => !r)}
                className="h-12 w-12 rounded-full bg-gold-gradient text-[color:var(--primary-foreground)] flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-gold)" }}
                aria-label={running ? "Pause" : "Play"}
              >
                {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  const order: Mode[] = ["focus","short","focus","short","focus","long"];
                  const next = order[(order.indexOf(mode) + 1) % order.length];
                  setMode(next);
                }}
                className="h-10 w-10 rounded-full border border-[color:var(--hairline)] flex items-center justify-center hover:border-[color:var(--gold)] transition"
                aria-label="Skip"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* tasks */}
          <div className="surface-card p-5 flex-1 min-h-[260px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display font-bold">📋 Session Tasks</div>
              <span className="text-xs text-[color:var(--text-muted)]">
                {tasks.filter(t => t.done).length}/{tasks.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {tasks.map((t) => (
                <div key={t.id} className="group flex items-center gap-3 py-1.5">
                  <button
                    onClick={() => setTasks((arr) => arr.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}
                    className="h-5 w-5 rounded-full border flex items-center justify-center transition"
                    style={{
                      borderColor: t.done ? "var(--emerald-live)" : "var(--hairline)",
                      background: t.done ? "color-mix(in oklab, var(--emerald-live) 90%, transparent)" : "transparent",
                    }}
                  >
                    {t.done && <span className="text-[10px] text-[color:var(--background)]">✓</span>}
                  </button>
                  <span className={`flex-1 text-sm ${t.done ? "line-through text-[color:var(--text-muted)]" : ""}`}>{t.text}</span>
                  <button
                    onClick={() => setTasks((arr) => arr.filter(x => x.id !== t.id))}
                    className="opacity-0 group-hover:opacity-100 transition text-[color:var(--text-muted)] hover:text-[color:var(--crimson)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-xs text-[color:var(--text-muted)] py-4 text-center">
                  Add your first task to get started.
                </div>
              )}
            </div>
            <form onSubmit={addTask} className="mt-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add a task…"
                className="flex-1 bg-[color:var(--surface-2)] border border-[color:var(--hairline)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)] transition"
              />
              <button type="submit" className="h-9 w-9 rounded-lg bg-gold-gradient text-[color:var(--primary-foreground)] flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
