import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Avatars } from "@/components/Avatars";
import { getCategory } from "@/lib/categories";
import { fetchRoomsBySlug, canCreateRoom, type StudyRoom } from "@/lib/rooms";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useAuth } from "@/lib/useAuth";

export const Route = createFileRoute("/rooms/$slug")({
  head: ({ params }) => {
    const c = getCategory(params.slug);
    const title = c ? `${c.name} study rooms — StudyDate` : "Study rooms — StudyDate";
    return {
      meta: [
        { title },
        {
          name: "description",
          content: c
            ? `Live ${c.name} study rooms. ${c.description}`
            : "Live study rooms on StudyDate.",
        },
        { property: "og:title", content: title },
      ],
    };
  },
  component: RoomBrowser,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <Link to="/" className="text-rose-gradient">← Back to home</Link>
    </div>
  ),
});

function RoomBrowser() {
  const { slug } = Route.useParams();
  const cat = getCategory(slug);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; to?: string }>({ open: false });

  // Inline create-room form state
  const [showForm, setShowForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomTopic, setRoomTopic] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchRoomsBySlug(slug).then((res) => {
      setRooms(res);
      setLoading(false);
    });
  }, [slug]);

  const join = (roomId: string) => {
    const to = `/room/${slug}/${roomId}`;
    if (isAuthenticated) navigate({ to });
    else setModal({ open: true, to });
  };

  const openCreateForm = () => {
    if (!isAuthenticated) { setModal({ open: true }); return; }
    setShowForm(true);
    setCreateError("");
    setRoomName("");
    setRoomTopic("");
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const { createStudyRoom } = await import("@/lib/rooms");
      const newRoom = await createStudyRoom({
        slug,
        name: roomName.trim(),
        topic: roomTopic.trim() || "Open study session",
        capacity: 8,
      });
      if (newRoom) {
        setRooms((prev) => [newRoom, ...prev]);
        setShowForm(false);
        navigate({ to: `/room/${slug}/${newRoom.id}` });
      }
    } catch (err: any) {
      setCreateError(err?.message || "Something went wrong. Try again.");
    } finally {
      setCreating(false);
    }
  };

  if (!cat) {
    return (
      <div className="min-h-screen pt-32 px-6 max-w-3xl mx-auto">
        <Navbar />
        <p>Category not found.</p>
        <Link to="/" className="text-rose-gradient">← Back</Link>
      </div>
    );
  }

  const allowCreate = canCreateRoom(rooms);
  const totalOnline = rooms.reduce((acc, r) => acc + (r.participantCount || 0), 0);

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="ambient-orbs" />
      <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to categories
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: "color-mix(in oklab, var(--rose-accent) 12%, var(--surface-2))" }}
            >
              {cat.icon}
            </div>
            <div>
              <h1 className="text-3xl font-display font-extrabold">{cat.name}</h1>
              <div className="mt-1 text-sm text-[color:var(--text-secondary)] flex items-center gap-2">
                <span className="live-dot" /> {totalOnline} students online
              </div>
            </div>
          </div>

          {/* Create Room — only shown when real room is ≥75% full */}
          {allowCreate && !showForm && (
            <button
              onClick={openCreateForm}
              className="btn-pill bg-rose-gradient text-[color:var(--primary-foreground)] px-5 py-2.5 font-semibold inline-flex items-center gap-2"
              style={{ boxShadow: "var(--shadow-rose)" }}
            >
              <Plus className="h-4 w-4" /> Create Room
            </button>
          )}
        </div>

        {/* Inline Create Room Form */}
        {showForm && (
          <form
            onSubmit={submitCreate}
            className="mt-6 surface-card p-6 rounded-2xl"
            style={{ border: "1px solid rgba(255,107,158,0.35)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Start a New Room</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1 block">
                  Room Name *
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder={`e.g. "${cat.name} Sprint"`}
                  maxLength={60}
                  required
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-[color:var(--hairline)] bg-[color:var(--surface-2)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--rose-accent)] transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider mb-1 block">
                  Topic / Focus Area
                </label>
                <input
                  type="text"
                  value={roomTopic}
                  onChange={(e) => setRoomTopic(e.target.value)}
                  placeholder="e.g. Chapter 5 revision, silent session"
                  maxLength={80}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border border-[color:var(--hairline)] bg-[color:var(--surface-2)] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:border-[color:var(--rose-accent)] transition"
                />
              </div>

              {createError && <p className="text-xs text-red-400">{createError}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={creating || !roomName.trim()}
                  className="btn-pill bg-rose-gradient text-[color:var(--primary-foreground)] px-5 py-2 font-semibold flex items-center gap-2 disabled:opacity-50"
                  style={{ boxShadow: "var(--shadow-rose)" }}
                >
                  {creating
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                    : <><Plus className="h-4 w-4" /> Create & Join</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-pill border border-[color:var(--hairline)] px-5 py-2 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[10px] text-[color:var(--text-muted)]">
                Rooms with no activity for 15 minutes are automatically removed.
              </p>
            </div>
          </form>
        )}

        <div className="mt-10 space-y-4">
          {loading ? (
            <div className="surface-card p-10 text-center text-[color:var(--text-secondary)]">
              Loading rooms...
            </div>
          ) : rooms.length > 0 ? (
            rooms.map((r) => (
              <div
                key={r.id}
                className="surface-card p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5"
              >
                <Avatars count={Math.min(5, r.participantCount || 0)} size={34} />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-lg truncate">{r.name}</div>
                  <div className="text-sm text-[color:var(--text-secondary)] truncate">{r.topic}</div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
                  <span className="live-dot" />
                  <span>
                    <span className="text-[color:var(--text-primary)] font-semibold">
                      {r.participantCount}
                    </span>
                    /{r.capacity} studying
                  </span>
                </div>
                <button
                  onClick={() => join(r.id)}
                  className="btn-pill bg-rose-gradient text-[color:var(--primary-foreground)] px-5 py-2 font-semibold"
                  style={{ boxShadow: "var(--shadow-rose)" }}
                >
                  Join Room
                </button>
              </div>
            ))
          ) : (
            <div className="surface-card p-10 text-center text-[color:var(--text-secondary)]">
              No rooms active right now — be the first to create one.
            </div>
          )}
        </div>
      </div>
      <WelcomeModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        redirectTo={modal.to}
      />
    </div>
  );
}
