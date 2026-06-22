import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Avatars } from "@/components/Avatars";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useAuth } from "@/lib/useAuth";
import { CountUp } from "@/components/CountUp";
import { Marquee } from "@/components/Marquee";
import { categories } from "@/lib/categories";
import { fetchRoomsBySlug } from "@/lib/rooms";
import {
  Check,
  Clock,
  Target,
  Timer,
  ListChecks,
  Flame,
  Wallet,
  Sparkles,
  Star,
  ArrowRight,
  Quote,
  ShieldCheck,
  Heart,
  Loader2,
  Video,
  MessageCircle,
  Users,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FocusTribe — Study with people who get your grind" },
      {
        name: "description",
        content:
          "Live exam-specific study rooms — NEET, JEE, UPSC, CA, GATE. Real accountability, unlimited hours. Starting at ₹199/mo.",
      },
      { property: "og:title", content: "FocusTribe — Live study rooms for serious students" },
      {
        property: "og:description",
        content:
          "Co-working for students. Pomodoro, task tracker, exam-specific rooms. Starting at ₹199/mo.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [modal, setModal] = useState<{ open: boolean; to?: string }>({ open: false });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Tracks which category slug is currently loading (spinner)
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);

  const open = (to?: string) => {
    if (typeof window !== "undefined" && isAuthenticated) {
      if (to) navigate({ to });
      else document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" });
    } else {
      setModal({ open: true, to });
    }
  };

  /**
   * Directly join the most active room for a category.
   * Falls back to a deterministic room ID so Jitsi always works.
   */
  const joinBestRoom = async (slug: string) => {
    if (!isAuthenticated) {
      setModal({ open: true, to: `/rooms/${slug}` });
      return;
    }
    setJoiningSlug(slug);
    try {
      const rooms = await fetchRoomsBySlug(slug);
      if (rooms.length > 0) {
        // Pick the room with the most participants
        const best = rooms.reduce((a, b) =>
          (b.participantCount ?? 0) > (a.participantCount ?? 0) ? b : a,
        );
        navigate({ to: `/room/${slug}/${best.id}` });
      } else {
        // No rooms found — create a deterministic public room for this category
        navigate({ to: `/room/${slug}/public-${slug}` });
      }
    } catch {
      navigate({ to: `/rooms/${slug}` });
    } finally {
      setJoiningSlug(null);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 px-6 overflow-hidden">
        <div className="mesh-bg" />
        <div className="grain" />
        <div className="absolute inset-0 grid-lines opacity-40" />

        <div className="relative max-w-6xl mx-auto text-center">
          {/* status pill */}
          <div className="inline-flex items-center gap-3 px-1 py-1 pr-4 rounded-full border border-[color:var(--hairline)] bg-[color:var(--surface)]/70 backdrop-blur-md text-sm animate-fade-up">
            <span
              className="badge-chip !py-1 !px-3"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,107,158,0.3)",
                color: "#FF6B9E",
              }}
            >
              <Heart className="h-3 w-3 mr-1" /> NEW
            </span>
            <span className="text-[color:var(--text-secondary)]">
              <span
                className="live-dot mr-2"
                style={{ background: "#10B981", boxShadow: "0 0 8px #10B981" }}
              />
              <span className="text-[color:var(--text-primary)] font-semibold">Beta is live</span> —
              free rooms open now
            </span>
          </div>

          <h1
            className="mt-8 font-display font-extrabold leading-[1.02] animate-fade-up tracking-tight"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5.4rem)" }}
          >
            Find your perfect
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #818CF8 0%, #6366F1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              study partner.
            </span>
          </h1>

          <p
            className="mt-7 max-w-2xl mx-auto text-lg text-[color:var(--text-secondary)] animate-fade-up"
            style={{ lineHeight: 1.6 }}
          >
            Join live, exam-specific study rooms. Focus with built-in Pomodoro timers. Stay
            accountable and{" "}
            <span className="text-[color:var(--text-primary)] font-semibold">
              hit your academic goals
            </span>{" "}
            together.
          </p>

          <div className="mt-6 animate-fade-up animate-delay-200">
            <p
              className="inline-block px-4 py-1.5 rounded-full border border-[color:var(--hairline)] bg-[color:var(--surface)]/50 backdrop-blur-sm text-sm font-medium"
              style={{
                color: "var(--text-secondary)",
                boxShadow: "0 4px 20px rgba(255,107,158,0.05)",
              }}
            >
              <span className="opacity-80">Stop swiping on potential.</span>{" "}
              <span style={{ color: "#FF6B9E" }}>Match with pure ambition.</span>{" "}
              <span className="text-xs opacity-50 ml-1">
                'cause action speaks louder than words.
              </span>
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-up">
            <button
              onClick={() => open()}
              className="group btn-pill px-7 py-3.5 font-bold transition inline-flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
                color: "white",
                boxShadow: "0 8px 30px rgba(99, 102, 241, 0.3)",
              }}
            >
              Find a room — it's free
              <Check className="h-4 w-4 transition group-hover:scale-110" />
            </button>
            <a
              href="#how-it-works"
              className="btn-pill border border-[color:var(--hairline)] px-7 py-3.5 font-semibold text-[color:var(--text-primary)] hover:bg-[color:var(--surface-2)] transition bg-[color:var(--surface)]/50 backdrop-blur"
            >
              How it works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 animate-fade-up">
            <Avatars count={5} />
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[color:var(--rose-accent)]"
                    style={{ color: "var(--rose-accent)" }}
                  />
                ))}
              </div>
              <span className="text-sm text-[color:var(--text-secondary)]">
                Built for{" "}
                <span className="text-[color:var(--text-primary)] font-semibold">
                  NEET · JEE · UPSC
                </span>{" "}
                aspirants
              </span>
            </div>
          </div>

          {/* Hero showcase card */}
          <div className="relative mt-16 mx-auto max-w-4xl animate-fade-up">
            <div className="absolute -inset-2 rounded-[28px] bg-rose-gradient opacity-20 blur-2xl" />
            <div className="relative surface-card overflow-hidden p-2 ring-rose-soft">
              <div
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background:
                    "radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, var(--rose-accent) 18%, transparent) 0%, transparent 55%), linear-gradient(180deg, #0F1729, #0B1120)",
                }}
              >
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { tag: "NEET", title: "Biology Grind", live: 8, of: 12 },
                    { tag: "JEE", title: "Maths Beast Mode", live: 9, of: 12 },
                    { tag: "UPSC", title: "Prelims 2025", live: 14, of: 20 },
                  ].map((r) => (
                    <div
                      key={r.title}
                      className="rounded-xl border border-[color:var(--hairline)] bg-[color:var(--surface-2)]/60 p-4 text-left"
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                        <span className="text-rose-gradient font-bold">{r.tag}</span>
                        <span className="flex items-center gap-1.5 text-[color:var(--text-secondary)]">
                          <span className="live-dot" /> live
                        </span>
                      </div>
                      <div className="mt-3 font-display font-bold">{r.title}</div>
                      <div className="mt-2 text-xs text-[color:var(--text-muted)]">
                        {r.live}/{r.of} studying
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <Avatars count={Math.min(4, r.live)} size={26} />
                        <span className="text-[10px] text-[color:var(--text-secondary)]">
                          25:00 focus
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* mini timer bar */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)]">
                    Pomodoro
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-[color:var(--surface-2)] overflow-hidden">
                    <div className="h-full bg-rose-gradient" style={{ width: "62%" }} />
                  </div>
                  <div className="font-display tabular-nums text-sm text-rose-gradient font-bold">
                    09:32
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div className="relative max-w-5xl mx-auto mt-20 pt-8 border-t border-[color:var(--hairline)] grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { k: "Exams Covered", v: <CountUp to={15} suffix="+" /> },
            { k: "Active Rooms", v: <CountUp to={75} /> },
            { k: "Exam Categories", v: <CountUp to={8} /> },
            { k: "Free Tier", v: "₹0" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-rose-gradient">
                {s.v}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                {s.k}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <section className="relative border-y border-[color:var(--hairline)] bg-[color:var(--surface)]/40">
        <div className="text-center pt-5 text-[10px] uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
          Exams our students are crushing
        </div>
        <Marquee />
      </section>

      {/* CATEGORIES — positioned right after hero so "Find a room" scroll lands here */}
      <section id="rooms" className="relative px-6 py-24 md:py-32">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 0%, color-mix(in oklab, var(--rose-accent) 18%, transparent) 0%, transparent 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-2xl mx-auto">
            <div className="badge-chip mx-auto">
              <Sparkles className="h-3 w-3" /> Study Rooms
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">
              Find your tribe
            </h2>
            <p className="mt-4 text-[color:var(--text-secondary)]">
              Pick your exam. Join a room. Study with students on the exact same path as you.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => joinBestRoom(c.slug)}
                disabled={joiningSlug === c.slug}
                className="surface-card text-left p-7 group relative overflow-hidden disabled:opacity-70 disabled:cursor-wait"
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--rose-accent), transparent)",
                  }}
                />
                <div
                  className="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-0 group-hover:opacity-30 transition"
                  style={{
                    background: "radial-gradient(circle, var(--rose-accent), transparent 60%)",
                    filter: "blur(20px)",
                  }}
                />
                <div className="flex items-center gap-4">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: "color-mix(in oklab, var(--rose-accent) 12%, var(--surface-2))",
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div className="font-display font-bold text-lg">{c.name}</div>
                  </div>
                  {joiningSlug === c.slug ? (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin text-[color:var(--rose-accent)]" />
                  ) : (
                    <ArrowRight className="ml-auto h-4 w-4 text-[color:var(--text-muted)] group-hover:text-[color:var(--rose-accent)] group-hover:translate-x-1 transition" />
                  )}
                </div>
                <p className="mt-4 text-sm text-[color:var(--text-secondary)]">{c.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[color:var(--text-secondary)]">
                    <span className="live-dot" /> {c.studying} studying
                  </div>
                  <div className="text-[color:var(--text-muted)]">{c.rooms} rooms</div>
                </div>
                {/* Big Join CTA */}
                <div
                  className="mt-5 w-full py-3 rounded-xl text-center text-sm font-bold transition-all group-hover:scale-[1.02] group-hover:shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
                    color: "white",
                    boxShadow: "0 4px 20px rgba(99, 102, 241, 0.25)",
                  }}
                >
                  {joiningSlug === c.slug ? "Joining..." : "Join Now →"}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="rose-divider max-w-5xl mx-auto" />

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="badge-chip mx-auto">
              <Target className="h-3 w-3" /> How it works
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">
              From zero to <span className="text-rose-gradient">focused</span> in 60 seconds
            </h2>
            <p className="mt-4 text-[color:var(--text-secondary)]">
              No signups that take 20 minutes. No tutorials. Just pick, join, and study.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: "🎯",
                title: "Pick your exam",
                desc: "NEET, JEE, UPSC, CAT — choose the room that matches your grind.",
              },
              {
                step: "02",
                icon: "🚪",
                title: "Join a room",
                desc: "One click. Camera on or off. You're in a live study session in seconds.",
              },
              {
                step: "03",
                icon: "⏱️",
                title: "Hit the Pomodoro",
                desc: "25 min focus, 5 min break. Structured sessions built into every room.",
              },
              {
                step: "04",
                icon: "🔥",
                title: "Build your streak",
                desc: "Track daily consistency. Watch your hours climb. Stay accountable.",
              },
            ].map((s) => (
              <div key={s.step} className="surface-card p-6 relative overflow-hidden group">
                <div
                  className="absolute -top-16 -right-16 h-32 w-32 rounded-full opacity-0 group-hover:opacity-20 transition"
                  style={{
                    background: "radial-gradient(circle, var(--rose-accent), transparent 60%)",
                    filter: "blur(20px)",
                  }}
                />
                <div className="relative">
                  <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-[color:var(--text-muted)]">
                    Step {s.step}
                  </div>
                  <div className="mt-3 text-3xl">{s.icon}</div>
                  <h3 className="mt-3 font-display font-bold text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="rose-divider max-w-5xl mx-auto" />

      {/* FEATURE SHOWCASE */}
      <section id="showcase" className="relative px-6 py-32 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(60% 40% at 30% 50%, color-mix(in oklab, var(--rose-accent) 12%, transparent) 0%, transparent 100%)",
          }}
        />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-2xl mx-auto">
            <div className="badge-chip mx-auto">
              <Zap className="h-3 w-3" /> See it in action
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">
              Everything you need to{" "}
              <span className="text-rose-gradient">study smarter</span>
            </h2>
            <p className="mt-4 text-[color:var(--text-secondary)]">
              Video rooms, study partner matching, real-time chat, and structured sessions — all in one place.
            </p>
          </div>

          {/* Feature 1 — Video Rooms */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "color-mix(in oklab, var(--rose-accent) 14%, var(--surface-2))",
                    color: "var(--rose-accent)",
                  }}
                >
                  <Video className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[color:var(--text-muted)]">
                  Live Study Rooms
                </span>
              </div>
              <h3 className="font-display font-extrabold text-2xl md:text-3xl">
                WebRTC video calls with your tribe
              </h3>
              <p className="mt-3 text-[color:var(--text-secondary)] leading-relaxed">
                Join live study rooms with built-in Pomodoro timer, task tracker, and video calling.
                Stay focused with your peers — cameras on or off, it's your call.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Pomodoro Timer", "Task Tracker", "Camera On/Off", "AI Study Contract"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative group">
              <div className="absolute -inset-3 rounded-[28px] bg-rose-gradient opacity-15 blur-2xl group-hover:opacity-25 transition-opacity duration-500" />
              <div className="relative surface-card overflow-hidden p-1.5 ring-rose-soft">
                <img
                  src="/features/video-room.png"
                  alt="Live video study room with Pomodoro timer and task tracker"
                  className="rounded-2xl w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Feature 2 — Matching */}
          <div className="mt-28 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="relative group">
              <div className="absolute -inset-3 rounded-[28px] opacity-15 blur-2xl group-hover:opacity-25 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }} />
              <div className="relative surface-card overflow-hidden p-1.5 ring-rose-soft">
                <img
                  src="/features/matching.png"
                  alt="Study partner matching with compatibility scores"
                  className="rounded-2xl w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "color-mix(in oklab, #818CF8 14%, var(--surface-2))",
                    color: "#818CF8",
                  }}
                >
                  <Heart className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[color:var(--text-muted)]">
                  Smart Matching
                </span>
              </div>
              <h3 className="font-display font-extrabold text-2xl md:text-3xl">
                Find your perfect study partner
              </h3>
              <p className="mt-3 text-[color:var(--text-secondary)] leading-relaxed">
                Swipe through profiles matched by exam, schedule, and study style.
                Three modes — Study Buddy, Accountability Partner, or Group Study — so you find exactly who you need.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Compatibility Score", "3 Match Modes", "Filters", "Super Likes"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Feature 3 — Chat */}
          <div className="mt-28 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "color-mix(in oklab, #10B981 14%, var(--surface-2))",
                    color: "#10B981",
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[color:var(--text-muted)]">
                  Chat & Connect
                </span>
              </div>
              <h3 className="font-display font-extrabold text-2xl md:text-3xl">
                Chat, plan, and study together
              </h3>
              <p className="mt-3 text-[color:var(--text-secondary)] leading-relaxed">
                Once you match, jump into real-time chat. Share notes, plan sessions, and launch
                1-on-1 private study rooms with a single click. See who liked you and manage your connections.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Real-time Chat", "1-on-1 Sessions", "Likes You", "Study Scheduling"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative group">
              <div className="absolute -inset-3 rounded-[28px] opacity-15 blur-2xl group-hover:opacity-25 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }} />
              <div className="relative surface-card overflow-hidden p-1.5 ring-rose-soft">
                <img
                  src="/features/chat.png"
                  alt="Chat and messaging with study partners"
                  className="rounded-2xl w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Feature 4 — Rooms */}
          <div className="mt-28 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="relative group">
              <div className="absolute -inset-3 rounded-[28px] opacity-15 blur-2xl group-hover:opacity-25 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, #F59E0B, #FBBF24)" }} />
              <div className="relative surface-card overflow-hidden p-1.5 ring-rose-soft">
                <img
                  src="/features/rooms.png"
                  alt="Exam-specific study rooms with live participants"
                  className="rounded-2xl w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "color-mix(in oklab, #F59E0B 14%, var(--surface-2))",
                    color: "#F59E0B",
                  }}
                >
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[color:var(--text-muted)]">
                  Exam Rooms
                </span>
              </div>
              <h3 className="font-display font-extrabold text-2xl md:text-3xl">
                Rooms for every exam category
              </h3>
              <p className="mt-3 text-[color:var(--text-secondary)] leading-relaxed">
                NEET, JEE, UPSC, CAT, GATE, CA — browse rooms by category and join one that matches your grind.
                See live participant counts and jump in with one click.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["8+ Exam Categories", "Live Counts", "One-Click Join", "Public & Private"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* FEATURES — Bento layout */}
      <section id="features" className="relative px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="badge-chip mx-auto">
              <Target className="h-3 w-3" /> Features
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">
              Built for students who <span className="text-rose-gradient">mean business</span>
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-6 gap-5 auto-rows-[minmax(220px,auto)]">
            {/* Big — Pomodoro */}
            <div className="surface-card p-7 md:col-span-3 md:row-span-2 relative overflow-hidden">
              <div
                className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full opacity-30"
                style={{
                  background: "radial-gradient(circle, var(--rose-accent), transparent 60%)",
                  filter: "blur(40px)",
                }}
              />
              <div className="relative">
                <div className="badge-chip">
                  <Timer className="h-3 w-3" /> Pomodoro
                </div>
                <h3 className="mt-5 font-display font-bold text-2xl">
                  25 min deep focus, baked-in
                </h3>
                <p className="mt-2 text-[color:var(--text-secondary)]">
                  Structured focus + break cycles in every room. Boost retention by up to 40%.
                </p>
                <div className="mt-8 mx-auto max-w-sm">
                  <div className="text-center font-display font-extrabold text-7xl text-rose-gradient tabular-nums">
                    24:58
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-[color:var(--surface-2)] overflow-hidden">
                    <div className="h-full bg-rose-gradient" style={{ width: "8%" }} />
                  </div>
                  <div className="mt-3 flex justify-center gap-2 text-[10px] uppercase tracking-widest text-[color:var(--text-muted)]">
                    <span className="px-2 py-1 rounded-full bg-rose-gradient text-[color:var(--primary-foreground)]">
                      Focus
                    </span>
                    <span className="px-2 py-1 rounded-full border border-[color:var(--hairline)]">
                      Short
                    </span>
                    <span className="px-2 py-1 rounded-full border border-[color:var(--hairline)]">
                      Long
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <BentoCell
              icon={<Clock className="h-5 w-5" />}
              tag="Time"
              title="Unlimited hours"
              copy="No 4-hour cap. No timers kicking you out mid-flow."
              span="md:col-span-3"
            />
            <BentoCell
              icon={<Target className="h-5 w-5" />}
              tag="Rooms"
              title="Exam-specific rooms"
              copy="NEET Bio, JEE Maths, UPSC Prelims — your tribe, on your topic."
              span="md:col-span-2"
            />
            <BentoCell
              icon={<ListChecks className="h-5 w-5" />}
              tag="Tasks"
              title="Session tracker"
              copy="Set goals, check them off. Pure satisfaction."
              span="md:col-span-1"
            />

            <BentoCell
              icon={<Flame className="h-5 w-5" />}
              tag="Habit"
              title="Study streaks"
              copy="Build daily consistency. Track every win."
              span="md:col-span-2"
            />
            <BentoCell
              icon={<Wallet className="h-5 w-5" />}
              tag="Pricing"
              title="Half the price"
              copy="₹199/mo unlimited vs ₹690/mo for 4 hrs elsewhere."
              span="md:col-span-2"
            />
            <BentoCell
              icon={<ShieldCheck className="h-5 w-5" />}
              tag="Safe"
              title="Zero distractions"
              copy="Mods, room rules, focus-only design. Your phone won't win today."
              span="md:col-span-2"
            />
          </div>
        </div>
      </section>

      <div className="rose-divider max-w-5xl mx-auto" />

      {/* TESTIMONIALS */}
      <section className="relative px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="badge-chip mx-auto">
              <Star className="h-3 w-3" /> Loved by students
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">
              Real grind. Real results.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Aarav R.",
                exam: "NEET Aspirant",
                photo: "/features/pfp-aarav.png",
                quote: "10x more accountable than studying alone. The room dynamic is unreal.",
              },
              {
                name: "Meera K.",
                exam: "UPSC CSE",
                photo: "/features/pfp-meera.png",
                quote:
                  "I went from 3 to 9 hours/day in two weeks. The pomodoro + tribe combo is magic.",
              },
              {
                name: "Sarah M.",
                exam: "GRE Prep · USA",
                photo: "/features/pfp-sarah.png",
                quote:
                  "I'm prepping for the GRE from my dorm and this app keeps me locked in. Found an accountability partner from Mumbai — we study every single day.",
              },
            ].map((t) => (
              <div key={t.name} className="surface-card p-7 relative">
                <Quote className="h-6 w-6" style={{ color: "var(--rose-accent)" }} />
                <p className="mt-4 text-[color:var(--text-primary)] leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-[color:var(--hairline)]"
                    loading="lazy"
                  />
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-[color:var(--text-muted)]">{t.exam}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="rose-divider max-w-5xl mx-auto" />

      {/* PRICING */}
      <section id="pricing" className="relative px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="badge-chip mx-auto">
              <Wallet className="h-3 w-3" /> Pricing
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">
              Transparent. Simple. <span className="text-rose-gradient">Fair.</span>
            </h2>
            <p className="mt-4 text-[color:var(--text-secondary)] font-medium">
              <span className="opacity-70 line-through decoration-red-500/30 mr-2">
                Delete the distractions.
              </span>
              <span className="text-rose-gradient font-bold tracking-wide">
                Invest in your actual future.
              </span>
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <PricingCard
              name="Free"
              price="₹0"
              period="3 hrs/day, forever free"
              features={[
                "3 hours daily",
                "All categories",
                "Pomodoro timer",
                "Task tracker",
                "—  No streaks",
                "—  No priority rooms",
              ]}
            />
            <PricingCard
              popular
              name="Pro"
              price="₹199"
              period="per month · unlimited"
              features={[
                "Unlimited study time",
                "All categories",
                "Pomodoro + Tasks",
                "Study streaks",
                "Priority rooms",
                "Cancel anytime",
              ]}
            />
            <PricingCard
              name="Annual"
              price="₹99"
              period="₹1,188/yr · save 34%"
              features={[
                "Everything in Pro",
                "Exclusive rooms",
                "Early access",
                "Priority support",
                "Annual streak badges",
              ]}
            />
          </div>

          {/* price anchor */}
          <div className="mt-10 surface-card p-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="text-[color:var(--text-muted)]">Hotstar: ₹299</span>
            <span className="text-[color:var(--text-muted)]">·</span>
            <span className="text-[color:var(--text-muted)]">Netflix: ₹199</span>
            <span className="text-[color:var(--text-muted)]">·</span>
            <span className="text-[color:var(--text-muted)]">Spotify: ₹119</span>
            <span className="text-[color:var(--text-muted)]">·</span>
            <span className="font-semibold text-ft-gradient">
              FocusTribe Pro: ₹199 — your co-working space from any desk
            </span>
          </div>

          {/* weekly pass */}
          <div
            className="mt-6 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-center gap-3 text-sm"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--rose-accent) 12%, var(--surface)), var(--surface))",
              border: "1px solid color-mix(in oklab, var(--rose-accent) 35%, transparent)",
            }}
          >
            <span>⚡</span>
            <span className="font-semibold">Not sure yet? Try a week for ₹59.</span>
            <span className="text-[color:var(--text-secondary)]">
              Full Pro. No auto-renewal. Cancel by doing nothing.
            </span>
          </div>
        </div>
      </section>

      <div className="rose-divider max-w-5xl mx-auto" />

      {/* FAQ */}
      <section className="relative px-6 py-32">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="badge-chip mx-auto">FAQ</div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">Quick answers</h2>
          </div>
          <div className="mt-12 space-y-3">
            {[
              {
                q: "Is FocusTribe really free?",
                a: "Yes — 3 hours of free study every day, forever. Upgrade to Pro for unlimited.",
              },
              {
                q: "Can I switch off my camera?",
                a: "Of course. Use camera, audio-only, or just presence. Whatever helps you focus.",
              },
              {
                q: "What payment methods do you support?",
                a: "UPI, cards, and net banking. Weekly passes don't auto-renew.",
              },
              {
                q: "Do you have rooms for my exam?",
                a: "Yes — and if not, create one. Rooms can be public or invite-only.",
              },
            ].map((f) => (
              <details key={f.q} className="group surface-card p-5 cursor-pointer">
                <summary className="flex items-center justify-between list-none">
                  <span className="font-display font-semibold">{f.q}</span>
                  <span className="text-[color:var(--text-muted)] group-open:rotate-45 transition">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[color:var(--text-secondary)]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-6 pb-32">
        <div
          className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl border border-[color:var(--hairline)] p-10 md:p-16 text-center"
          style={{
            background:
              "radial-gradient(80% 100% at 50% 0%, color-mix(in oklab, var(--rose-accent) 25%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--surface), #0B1120)",
          }}
        >
          <div className="absolute inset-0 grid-lines opacity-30" />
          <div className="relative">
            <h3 className="font-display font-extrabold text-3xl md:text-5xl">
              Your tribe is studying <span className="text-rose-gradient">right now.</span>
            </h3>

            <div className="mt-5 mb-2 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-rose-500/50"></div>
              <p className="text-sm md:text-base font-semibold tracking-wide text-[color:var(--text-primary)]">
                <span className="opacity-60 font-normal italic">
                  Don't settle for dead-end chats.
                </span>{" "}
                <span className="text-rose-gradient">Find a partner in the grind.</span>
              </p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-rose-500/50"></div>
            </div>

            <p className="mt-4 text-[color:var(--text-secondary)] max-w-xl mx-auto">
              Join the beta. Pick a room. Hit start. We'll handle the rest.
            </p>
            <button
              onClick={() => open()}
              className="mt-8 btn-pill bg-rose-gradient text-[color:var(--primary-foreground)] px-8 py-4 font-semibold inline-flex items-center gap-2"
              style={{ boxShadow: "var(--shadow-rose)" }}
            >
              Start studying — it's free
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 pt-12 pb-12 border-t border-[color:var(--hairline)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="font-display font-extrabold text-xl">
              Focus<span className="text-ft-gradient">Tribe</span>
            </div>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Unlimited studying. Half the price. Built for India. 🇮🇳
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[color:var(--text-muted)]">
            <Link to="/terms" className="hover:text-[color:var(--text-primary)] transition">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-[color:var(--text-primary)] transition">
              Privacy Policy
            </Link>
            <Link to="/safety" className="hover:text-[color:var(--text-primary)] transition">
              Safety
            </Link>
            <Link to="/pricing" className="hover:text-[color:var(--text-primary)] transition">
              Pricing
            </Link>
            <a
              href="mailto:support@focustribe.in"
              className="hover:text-[color:var(--text-primary)] transition"
            >
              Contact
            </a>
            <span className="text-[color:var(--hairline)]">·</span>
            <span>© {new Date().getFullYear()} FocusTribe</span>
          </div>
        </div>
      </footer>

      <WelcomeModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        redirectTo={modal.to}
      />
    </div>
  );
}

function BentoCell({
  icon,
  tag,
  title,
  copy,
  span,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  copy: string;
  span: string;
}) {
  return (
    <div className={`surface-card p-7 ${span}`}>
      <div className="flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center"
          style={{
            background: "color-mix(in oklab, var(--rose-accent) 14%, var(--surface-2))",
            color: "var(--rose-accent)",
          }}
        >
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
          {tag}
        </span>
      </div>
      <h3 className="mt-4 font-display font-bold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{copy}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  popular,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}) {
  if (popular) {
    return (
      <div className="relative md:scale-[1.04]">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-gradient text-[color:var(--primary-foreground)] z-10">
          Most Popular
        </div>
        <div className="shimmer-border">
          <div
            className="p-8 rounded-[22px] relative"
            style={{ boxShadow: "var(--shadow-rose-soft)" }}
          >
            <PricingBody name={name} price={price} period={period} features={features} popular />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="surface-card p-8 relative">
      <PricingBody name={name} price={price} period={period} features={features} />
    </div>
  );
}

function PricingBody({
  name,
  price,
  period,
  features,
  popular,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}) {
  return (
    <>
      <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
        {name}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-5xl font-display font-extrabold">{price}</div>
      </div>
      <div className="mt-1 text-sm text-[color:var(--text-secondary)]">{period}</div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--rose-accent)" }} />
            <span className="text-[color:var(--text-secondary)]">{f}</span>
          </li>
        ))}
      </ul>
      <button
        className={`mt-7 w-full btn-pill py-3 font-semibold transition ${
          popular
            ? "bg-rose-gradient text-[color:var(--primary-foreground)]"
            : "border border-[color:var(--hairline)] hover:border-[color:var(--rose-accent)]"
        }`}
        style={popular ? { boxShadow: "var(--shadow-rose)" } : undefined}
      >
        {popular ? "Get Pro" : "Choose plan"}
      </button>
    </>
  );
}
