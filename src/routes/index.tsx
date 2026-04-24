import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Avatars } from "@/components/Avatars";
import { WelcomeModal } from "@/components/WelcomeModal";
import { CountUp } from "@/components/CountUp";
import { Marquee } from "@/components/Marquee";
import { categories } from "@/lib/categories";
import {
  Check, Clock, Target, Timer, ListChecks, Flame, Wallet,
  Sparkles, Star, ArrowRight, Quote, ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FocusTribe — Study with people who get your grind" },
      { name: "description", content: "Live exam-specific study rooms — NEET, JEE, UPSC, CA, GATE. Real accountability, unlimited hours, ₹149/mo." },
      { property: "og:title", content: "FocusTribe — Live study rooms for serious students" },
      { property: "og:description", content: "Co-working for students. Pomodoro, task tracker, exam-specific rooms. Unlimited at ₹149/mo." },
    ],
  }),
  component: Landing,
});

function useLiveCount(initial: number) {
  const [n, setN] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => {
      setN((v) => Math.max(initial - 8, v + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)));
    }, 8000);
    return () => clearInterval(id);
  }, [initial]);
  return n;
}

function Landing() {
  const live = useLiveCount(230);
  const [modal, setModal] = useState<{ open: boolean; to?: string }>({ open: false });
  const navigate = useNavigate();

  const open = (to?: string) => {
    if (typeof window !== "undefined" && localStorage.getItem("ft_name")) {
      if (to) navigate({ to });
      else document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" });
    } else {
      setModal({ open: true, to });
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
            <span className="badge-chip !py-1 !px-3">
              <Sparkles className="h-3 w-3" /> New
            </span>
            <span className="text-[color:var(--text-secondary)]">
              <span className="live-dot mr-2" />
              <span className="text-[color:var(--text-primary)] font-semibold">{live}+</span> students studying right now
            </span>
          </div>

          <h1
            className="mt-8 font-display font-extrabold leading-[1.02] animate-fade-up"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5.4rem)" }}
          >
            Study with people who
            <br />
            <span className="text-gold-gradient">get your grind.</span>
          </h1>

          <p className="mt-7 max-w-2xl mx-auto text-lg text-[color:var(--text-secondary)] animate-fade-up">
            Join exam-specific live study rooms — NEET, JEE, UPSC, CA, GATE.
            Real accountability. Unlimited hours. <span className="text-[color:var(--text-primary)] font-semibold">Half the price.</span>
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-up">
            <button
              onClick={() => open()}
              className="group btn-pill bg-gold-gradient text-[color:var(--primary-foreground)] px-7 py-3.5 font-semibold transition inline-flex items-center gap-2"
              style={{ boxShadow: "var(--shadow-gold)" }}
            >
              Start studying — it's free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <a
              href="#rooms"
              className="btn-pill border border-[color:var(--hairline)] px-7 py-3.5 font-semibold text-[color:var(--text-primary)] hover:border-[color:var(--gold)] transition bg-[color:var(--surface)]/50 backdrop-blur"
            >
              Explore rooms
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 animate-fade-up">
            <Avatars count={5} />
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[color:var(--gold)]" style={{ color: "var(--gold)" }} />
                ))}
              </div>
              <span className="text-sm text-[color:var(--text-secondary)]">
                Loved by <span className="text-[color:var(--text-primary)] font-semibold">12,400+</span> students
              </span>
            </div>
          </div>

          {/* Hero showcase card */}
          <div className="relative mt-16 mx-auto max-w-4xl animate-fade-up">
            <div className="absolute -inset-2 rounded-[28px] bg-gold-gradient opacity-20 blur-2xl" />
            <div className="relative surface-card overflow-hidden p-2 ring-gold-soft">
              <div
                className="rounded-2xl p-6 md:p-8"
                style={{
                  background:
                    "radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, var(--gold) 18%, transparent) 0%, transparent 55%), linear-gradient(180deg, #0F1729, #0B1120)",
                }}
              >
                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { tag: "NEET", title: "Biology Grind", live: 8, of: 12 },
                    { tag: "JEE", title: "Maths Beast Mode", live: 9, of: 12 },
                    { tag: "UPSC", title: "Prelims 2025", live: 14, of: 20 },
                  ].map((r) => (
                    <div key={r.title} className="rounded-xl border border-[color:var(--hairline)] bg-[color:var(--surface-2)]/60 p-4 text-left">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                        <span className="text-gold-gradient font-bold">{r.tag}</span>
                        <span className="flex items-center gap-1.5 text-[color:var(--text-secondary)]">
                          <span className="live-dot" /> live
                        </span>
                      </div>
                      <div className="mt-3 font-display font-bold">{r.title}</div>
                      <div className="mt-2 text-xs text-[color:var(--text-muted)]">{r.live}/{r.of} studying</div>
                      <div className="mt-3 flex items-center justify-between">
                        <Avatars count={Math.min(4, r.live)} size={26} />
                        <span className="text-[10px] text-[color:var(--text-secondary)]">25:00 focus</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* mini timer bar */}
                <div className="mt-6 flex items-center gap-4">
                  <div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)]">Pomodoro</div>
                  <div className="flex-1 h-1.5 rounded-full bg-[color:var(--surface-2)] overflow-hidden">
                    <div className="h-full bg-gold-gradient" style={{ width: "62%" }} />
                  </div>
                  <div className="font-display tabular-nums text-sm text-gold-gradient font-bold">09:32</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div className="relative max-w-5xl mx-auto mt-20 pt-8 border-t border-[color:var(--hairline)] grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { k: "Studying Now", v: <CountUp to={live} suffix="+" /> },
            { k: "Active Rooms", v: <CountUp to={75} /> },
            { k: "Exam Categories", v: <CountUp to={8} /> },
            { k: "Free Tier", v: "₹0" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-gold-gradient">{s.v}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{s.k}</div>
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

      {/* CATEGORIES */}
      <section id="rooms" className="relative px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="badge-chip mx-auto"><Sparkles className="h-3 w-3" /> Study Rooms</div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">Find your tribe</h2>
            <p className="mt-4 text-[color:var(--text-secondary)]">
              Pick your exam. Join a room. Study with students on the exact same path as you.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => open(`/rooms/${c.slug}`)}
                className="surface-card text-left p-7 group relative overflow-hidden"
              >
                <div
                  className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition"
                  style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
                />
                <div
                  className="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-0 group-hover:opacity-30 transition"
                  style={{ background: "radial-gradient(circle, var(--gold), transparent 60%)", filter: "blur(20px)" }}
                />
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: "color-mix(in oklab, var(--gold) 12%, var(--surface-2))" }}>
                    {c.icon}
                  </div>
                  <div>
                    <div className="font-display font-bold text-lg">{c.name}</div>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-[color:var(--text-muted)] group-hover:text-[color:var(--gold)] group-hover:translate-x-1 transition" />
                </div>
                <p className="mt-4 text-sm text-[color:var(--text-secondary)]">{c.description}</p>
                <div className="mt-6 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[color:var(--text-secondary)]">
                    <span className="live-dot" /> {c.studying} studying
                  </div>
                  <div className="text-[color:var(--text-muted)]">{c.rooms} rooms</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="gold-divider max-w-5xl mx-auto" />

      {/* FEATURES — Bento layout */}
      <section id="features" className="relative px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="badge-chip mx-auto"><Target className="h-3 w-3" /> Features</div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">
              Built for students who <span className="text-gold-gradient">mean business</span>
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-6 gap-5 auto-rows-[minmax(220px,auto)]">
            {/* Big — Pomodoro */}
            <div className="surface-card p-7 md:col-span-3 md:row-span-2 relative overflow-hidden">
              <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, var(--gold), transparent 60%)", filter: "blur(40px)" }} />
              <div className="relative">
                <div className="badge-chip"><Timer className="h-3 w-3" /> Pomodoro</div>
                <h3 className="mt-5 font-display font-bold text-2xl">25 min deep focus, baked-in</h3>
                <p className="mt-2 text-[color:var(--text-secondary)]">
                  Structured focus + break cycles in every room. Boost retention by up to 40%.
                </p>
                <div className="mt-8 mx-auto max-w-sm">
                  <div className="text-center font-display font-extrabold text-7xl text-gold-gradient tabular-nums">
                    24:58
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-[color:var(--surface-2)] overflow-hidden">
                    <div className="h-full bg-gold-gradient" style={{ width: "8%" }} />
                  </div>
                  <div className="mt-3 flex justify-center gap-2 text-[10px] uppercase tracking-widest text-[color:var(--text-muted)]">
                    <span className="px-2 py-1 rounded-full bg-gold-gradient text-[color:var(--primary-foreground)]">Focus</span>
                    <span className="px-2 py-1 rounded-full border border-[color:var(--hairline)]">Short</span>
                    <span className="px-2 py-1 rounded-full border border-[color:var(--hairline)]">Long</span>
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
              copy="₹149/mo unlimited vs ₹690/mo for 4 hrs elsewhere."
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

      <div className="gold-divider max-w-5xl mx-auto" />

      {/* TESTIMONIALS */}
      <section className="relative px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="badge-chip mx-auto"><Star className="h-3 w-3" /> Loved by students</div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">
              Real grind. Real results.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Aarav R.", exam: "NEET Aspirant", quote: "10x more accountable than studying alone. The room dynamic is unreal." },
              { name: "Meera K.", exam: "UPSC CSE", quote: "I went from 3 to 9 hours/day in two weeks. The pomodoro + tribe combo is magic." },
              { name: "Siddharth P.", exam: "JEE Advanced", quote: "₹149 for unlimited? I cancelled three other apps. Wish this existed last year." },
            ].map((t) => (
              <div key={t.name} className="surface-card p-7 relative">
                <Quote className="h-6 w-6" style={{ color: "var(--gold)" }} />
                <p className="mt-4 text-[color:var(--text-primary)] leading-relaxed">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center font-bold text-[color:var(--primary-foreground)]">
                    {t.name[0]}
                  </div>
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

      <div className="gold-divider max-w-5xl mx-auto" />

      {/* PRICING */}
      <section id="pricing" className="relative px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="badge-chip mx-auto"><Wallet className="h-3 w-3" /> Pricing</div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">
              Transparent. Simple. <span className="text-gold-gradient">Fair.</span>
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <PricingCard
              name="Free" price="₹0" period="3 hrs/day, forever free"
              features={["3 hours daily", "All categories", "Pomodoro timer", "Task tracker", "—  No streaks", "—  No priority rooms"]}
            />
            <PricingCard
              popular name="Pro" price="₹149" period="per month · unlimited"
              features={["Unlimited study time", "All categories", "Pomodoro + Tasks", "Study streaks", "Priority rooms", "Cancel anytime"]}
            />
            <PricingCard
              name="Annual" price="₹99" period="₹1,188/yr · save 34%"
              features={["Everything in Pro", "Exclusive rooms", "Early access", "Priority support", "Annual streak badges"]}
            />
          </div>

          {/* competitor strip */}
          <div className="mt-10 surface-card p-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="text-[color:var(--text-muted)]">StudyStream:</span>
            <span className="line-through" style={{ color: "var(--crimson)" }}>₹690/mo · 4 hrs/day</span>
            <span className="text-[color:var(--text-muted)]">VS FocusTribe:</span>
            <span className="font-semibold text-gold-gradient">₹149/mo · Unlimited</span>
          </div>

          {/* weekly pass */}
          <div className="mt-6 rounded-2xl px-6 py-5 flex flex-wrap items-center justify-center gap-3 text-sm"
            style={{
              background: "linear-gradient(135deg, color-mix(in oklab, var(--gold) 12%, var(--surface)), var(--surface))",
              border: "1px solid color-mix(in oklab, var(--gold) 35%, transparent)"
            }}>
            <span>⚡</span>
            <span className="font-semibold">Weekly Pass — ₹29</span>
            <span className="text-[color:var(--text-secondary)]">Full unlimited for 7 days. No auto-renewal. Pay via UPI.</span>
          </div>
        </div>
      </section>

      <div className="gold-divider max-w-5xl mx-auto" />

      {/* FAQ */}
      <section className="relative px-6 py-32">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="badge-chip mx-auto">FAQ</div>
            <h2 className="mt-5 text-4xl md:text-5xl font-display font-extrabold">Quick answers</h2>
          </div>
          <div className="mt-12 space-y-3">
            {[
              { q: "Is FocusTribe really free?", a: "Yes — 3 hours of free study every day, forever. Upgrade to Pro for unlimited." },
              { q: "Can I switch off my camera?", a: "Of course. Use camera, audio-only, or just presence. Whatever helps you focus." },
              { q: "What payment methods do you support?", a: "UPI, cards, and net banking. Weekly passes don't auto-renew." },
              { q: "Do you have rooms for my exam?", a: "Yes — and if not, create one. Rooms can be public or invite-only." },
            ].map((f) => (
              <details key={f.q} className="group surface-card p-5 cursor-pointer">
                <summary className="flex items-center justify-between list-none">
                  <span className="font-display font-semibold">{f.q}</span>
                  <span className="text-[color:var(--text-muted)] group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-3 text-sm text-[color:var(--text-secondary)]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-6 pb-32">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl border border-[color:var(--hairline)] p-10 md:p-16 text-center"
          style={{
            background:
              "radial-gradient(80% 100% at 50% 0%, color-mix(in oklab, var(--gold) 25%, transparent) 0%, transparent 60%), linear-gradient(180deg, var(--surface), #0B1120)",
          }}>
          <div className="absolute inset-0 grid-lines opacity-30" />
          <div className="relative">
            <h3 className="font-display font-extrabold text-3xl md:text-5xl">
              Your tribe is studying <span className="text-gold-gradient">right now.</span>
            </h3>
            <p className="mt-4 text-[color:var(--text-secondary)] max-w-xl mx-auto">
              Join {live}+ students. Pick a room. Hit start. We'll handle the rest.
            </p>
            <button
              onClick={() => open()}
              className="mt-8 btn-pill bg-gold-gradient text-[color:var(--primary-foreground)] px-8 py-4 font-semibold inline-flex items-center gap-2"
              style={{ boxShadow: "var(--shadow-gold)" }}
            >
              Start studying — it's free
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 pt-12 pb-12 border-t border-[color:var(--hairline)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-extrabold text-xl">
            Focus<span className="text-gold-gradient">Tribe</span>
          </div>
          <p className="text-sm text-[color:var(--text-secondary)]">
            Unlimited studying. Half the price. Built for India. 🇮🇳
          </p>
        </div>
      </footer>

      <WelcomeModal open={modal.open} onClose={() => setModal({ open: false })} redirectTo={modal.to} />
    </div>
  );
}

function BentoCell({
  icon, tag, title, copy, span,
}: { icon: React.ReactNode; tag: string; title: string; copy: string; span: string }) {
  return (
    <div className={`surface-card p-7 ${span}`}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center"
          style={{ background: "color-mix(in oklab, var(--gold) 14%, var(--surface-2))", color: "var(--gold)" }}>
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{tag}</span>
      </div>
      <h3 className="mt-4 font-display font-bold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{copy}</p>
    </div>
  );
}

function PricingCard({
  name, price, period, features, popular,
}: { name: string; price: string; period: string; features: string[]; popular?: boolean }) {
  if (popular) {
    return (
      <div className="relative md:scale-[1.04]">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gold-gradient text-[color:var(--primary-foreground)] z-10">
          Most Popular
        </div>
        <div className="shimmer-border">
          <div className="p-8 rounded-[22px] relative" style={{ boxShadow: "var(--shadow-gold-soft)" }}>
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
  name, price, period, features, popular,
}: { name: string; price: string; period: string; features: string[]; popular?: boolean }) {
  return (
    <>
      <div className="text-sm uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{name}</div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-5xl font-display font-extrabold">{price}</div>
      </div>
      <div className="mt-1 text-sm text-[color:var(--text-secondary)]">{period}</div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--gold)" }} />
            <span className="text-[color:var(--text-secondary)]">{f}</span>
          </li>
        ))}
      </ul>
      <button
        className={`mt-7 w-full btn-pill py-3 font-semibold transition ${
          popular ? "bg-gold-gradient text-[color:var(--primary-foreground)]" : "border border-[color:var(--hairline)] hover:border-[color:var(--gold)]"
        }`}
        style={popular ? { boxShadow: "var(--shadow-gold)" } : undefined}
      >
        {popular ? "Get Pro" : "Choose plan"}
      </button>
    </>
  );
}
