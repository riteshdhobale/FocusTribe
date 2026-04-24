import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Avatars } from "@/components/Avatars";
import { getCategory, roomsFor } from "@/lib/categories";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { WelcomeModal } from "@/components/WelcomeModal";

export const Route = createFileRoute("/rooms/$slug")({
  head: ({ params }) => {
    const c = getCategory(params.slug);
    const title = c ? `${c.name} study rooms — FocusTribe` : "Study rooms — FocusTribe";
    return {
      meta: [
        { title },
        { name: "description", content: c ? `Live ${c.name} study rooms. ${c.description}` : "Live study rooms on FocusTribe." },
        { property: "og:title", content: title },
      ],
    };
  },
  component: RoomBrowser,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <Link to="/" className="text-gold-gradient">← Back to home</Link>
    </div>
  ),
});

function RoomBrowser() {
  const { slug } = Route.useParams();
  const cat = getCategory(slug);
  const rooms = roomsFor(slug);
  const navigate = useNavigate();
  const [modal, setModal] = useState<{ open: boolean; to?: string }>({ open: false });

  const join = (idx: number) => {
    const to = `/room/${slug}/${idx}`;
    if (typeof window !== "undefined" && localStorage.getItem("ft_name")) navigate({ to });
    else setModal({ open: true, to });
  };

  if (!cat) {
    return (
      <div className="min-h-screen pt-32 px-6 max-w-3xl mx-auto">
        <Navbar />
        <p>Category not found.</p>
        <Link to="/" className="text-gold-gradient">← Back</Link>
      </div>
    );
  }

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
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: "color-mix(in oklab, var(--gold) 12%, var(--surface-2))" }}>
              {cat.icon}
            </div>
            <div>
              <h1 className="text-3xl font-display font-extrabold">{cat.name}</h1>
              <div className="mt-1 text-sm text-[color:var(--text-secondary)] flex items-center gap-2">
                <span className="live-dot" /> {cat.studying} students online
              </div>
            </div>
          </div>
          <button className="btn-pill bg-gold-gradient text-[color:var(--primary-foreground)] px-5 py-2.5 font-semibold inline-flex items-center gap-2"
            style={{ boxShadow: "var(--shadow-gold)" }}>
            <Plus className="h-4 w-4" /> Create Room
          </button>
        </div>

        <div className="mt-10 space-y-4">
          {rooms.map((r, i) => (
            <div key={i} className="surface-card p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5">
              <Avatars count={Math.min(5, r.in)} size={34} />
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-lg truncate">{r.name}</div>
                <div className="text-sm text-[color:var(--text-secondary)] truncate">{r.topic}</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
                <span className="live-dot" />
                <span><span className="text-[color:var(--text-primary)] font-semibold">{r.in}</span>/{r.cap} studying</span>
              </div>
              <button
                onClick={() => join(i)}
                className="btn-pill bg-gold-gradient text-[color:var(--primary-foreground)] px-5 py-2 font-semibold"
                style={{ boxShadow: "var(--shadow-gold)" }}
              >
                Join Room
              </button>
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="surface-card p-10 text-center text-[color:var(--text-secondary)]">
              No rooms yet — be the first to create one.
            </div>
          )}
        </div>
      </div>
      <WelcomeModal open={modal.open} onClose={() => setModal({ open: false })} redirectTo={modal.to} />
    </div>
  );
}
