import { useMemo, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { formatPrice, getRegionPricing } from "@/lib/geoPrice";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Flame,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Mode = "signin" | "signup" | "forgot";

export function AuthPage({ onLocalMode }: { onLocalMode: () => void }) {
  const { signIn, signUp, signInWithGoogle, resetPassword, loading, error, isSupabaseMode } =
    useAuth();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const pricing = useMemo(() => getRegionPricing(), []);
  const proPrice = formatPrice(pricing.plans.pro.amount, pricing.currencySymbol);
  const priceAnchor =
    pricing.region === "india"
      ? `Price check: StudyDate Pro (${proPrice}/mo) is less than a Netflix plan — and it pays back in consistency.`
      : `Price check: StudyDate Pro (${proPrice}/mo) is less than a typical streaming plan — and it pays back in consistency.`;

  const pillars = [
    {
      title: "Match by intent",
      copy: "Find people studying for the same exam, goal, or weekly routine.",
      icon: GraduationCap,
    },
    {
      title: "Start a real session",
      copy: "Move from chat to a focused room instead of collecting matches.",
      icon: CalendarClock,
    },
    {
      title: "Keep momentum visible",
      copy: "Streaks, sparks, and small wins make consistency easier to repeat.",
      icon: Flame,
    },
  ];

  const alternatives = [
    {
      label: "Tinder / Hinge",
      headline: "Chemistry",
      sub: "…but often no follow-through",
    },
    {
      label: "Netflix",
      headline: "Comfort",
      sub: "…but your backlog stays",
    },
    {
      label: "Spotify",
      headline: "Vibes",
      sub: "…but no momentum",
    },
    {
      label: "StudyDate",
      headline: "Momentum",
      sub: "focus + chemistry + progress",
      featured: true,
    },
  ];

  const examPitch = [
    "Match with people on the same grind.",
    "Study 1:1 or in small groups built for real sessions.",
    "Turn screen time into score time with quick starts and visible progress.",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMsg("");

    if (!isSupabaseMode) {
      onLocalMode();
      return;
    }

    if (mode === "forgot") {
      const { error } = await resetPassword(email);
      if (error) setLocalError(error.message);
      else setSuccessMsg("Password reset email sent! Check your inbox.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters");
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) setLocalError(error.message);
      else setSuccessMsg("Account created! Check your email to verify, then sign in.");
    } else {
      const { error } = await signIn(email, password);
      if (error) setLocalError(error.message);
    }
  };

  const handleGoogle = async () => {
    if (!isSupabaseMode) {
      onLocalMode();
      return;
    }
    await signInWithGoogle();
  };

  return (
    <div
      className="min-h-screen px-4 py-8 sm:py-10"
      style={{
        background:
          "linear-gradient(135deg, #070d1d 0%, #0b1120 46%, #100b1f 100%)",
      }}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_500px] lg:gap-14">
        {/* Onboarding */}
        <div className="pt-2 lg:pt-6">
          <div className="inline-flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-extrabold"
              style={{ background: "var(--rose-accent)", color: "var(--primary-foreground)" }}
            >
              S
            </span>
            <span className="font-display text-3xl font-extrabold">
              <span style={{ color: "var(--rose-accent)" }}>Study</span>
              <span style={{ color: "var(--text-primary)" }}>Date</span>
            </span>
          </div>

          <div className="mt-12 max-w-3xl">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-extrabold uppercase"
              style={{
                borderColor: "rgba(255,107,158,0.28)",
                background: "rgba(255,107,158,0.08)",
                color: "#FF8FB5",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Built for students who need momentum
            </span>
            <h1
              className="mt-5 max-w-4xl font-display text-5xl font-extrabold leading-[1.05] sm:text-6xl"
              style={{ color: "var(--text-primary)" }}
            >
              Stop collecting matches. Start finishing study sessions.
            </h1>
            <p
              className="mt-5 max-w-2xl text-lg leading-8"
              style={{ color: "var(--text-secondary)" }}
            >
              StudyDate matches you by exam focus, intent, and availability, then nudges both of
              you into a real study room before motivation fades.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-extrabold transition hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "var(--rose-accent)",
                  color: "var(--primary-foreground)",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 18px 42px rgba(255,107,158,0.28)",
                }}
              >
                Continue with Google
                <ArrowRight className="h-4 w-4" />
              </button>
              <span
                className="inline-flex items-center gap-2 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                <ShieldCheck className="h-4 w-4" style={{ color: "var(--emerald-live)" }} />
                Free to start. Student-first matching.
              </span>
            </div>
          </div>

          <div className="mt-11 grid grid-cols-1 gap-3 md:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background:
                      "linear-gradient(180deg, rgba(30,40,62,0.88), rgba(18,27,47,0.72))",
                  }}
                >
                  <Icon className="mb-5 h-5 w-5" style={{ color: "#FF8FB5" }} />
                  <p className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
                    {p.title}
                  </p>
                  <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                    {p.copy}
                  </p>
                </div>
              );
            })}
          </div>

          <div
            className="mt-8 rounded-[1.75rem] border p-5 sm:p-6"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(18,27,47,0.78)",
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span
                  className="text-[11px] font-extrabold uppercase"
                  style={{ color: "#FF8FB5" }}
                >
                  Why it wins
                </span>
                <h2
                  className="mt-1 font-display text-2xl font-extrabold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Designed around follow-through.
                </h2>
              </div>
              <p className="max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>
                Chemistry gets you interested. Structure gets you studying.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {alternatives.map((a) => (
                <div
                  key={a.label}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: a.featured
                      ? "color-mix(in oklab, var(--rose-accent) 62%, transparent)"
                      : "rgba(255,255,255,0.08)",
                    background: a.featured
                      ? "linear-gradient(145deg, rgba(255,107,158,0.2), rgba(37,30,58,0.95))"
                      : "rgba(255,255,255,0.035)",
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {a.label}
                  </p>
                  <p
                    className="mt-2 text-2xl font-extrabold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {a.headline}
                  </p>
                  <p className="mt-1 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>
                    {a.sub}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-2">
              {examPitch.map((line) => (
                <div key={line} className="flex items-center gap-3">
                  <CheckCircle2
                    className="h-4 w-4 shrink-0"
                    style={{ color: "var(--emerald-live)" }}
                  />
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {line}
                  </p>
                </div>
              ))}
            </div>
            <div
              className="mt-5 rounded-2xl border px-4 py-3"
              style={{
                borderColor: "rgba(255,107,158,0.24)",
                background: "rgba(255,107,158,0.08)",
              }}
            >
              <p className="text-sm font-bold leading-6" style={{ color: "var(--text-primary)" }}>
                {priceAnchor}
              </p>
            </div>
          </div>
        </div>

        {/* Auth */}
        <div className="w-full justify-self-center lg:sticky lg:top-8">
          {/* Card */}
          <div
            className="overflow-hidden rounded-[2rem] border"
            style={{
              borderColor: "rgba(255,107,158,0.38)",
              background:
                "linear-gradient(180deg, rgba(23,34,56,0.96) 0%, rgba(15,23,42,0.98) 100%)",
              boxShadow: "0 28px 90px rgba(0,0,0,0.36)",
            }}
          >
            <div className="border-b px-7 py-7" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2.5">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-extrabold"
                    style={{ background: "var(--rose-accent)", color: "var(--primary-foreground)" }}
                  >
                    S
                  </span>
                  <span className="font-display text-2xl font-extrabold">
                    <span style={{ color: "var(--rose-accent)" }}>Study</span>
                    <span style={{ color: "var(--text-primary)" }}>Date</span>
                  </span>
                </div>
                <span
                  className="rounded-full border px-3 py-1 text-[11px] font-bold"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
                >
                  2 min setup
                </span>
              </div>
              <h2
                className="mt-7 font-display text-3xl font-extrabold"
                style={{ color: "var(--text-primary)" }}
              >
                {mode === "signup"
                  ? "Create your study profile"
                  : mode === "signin"
                    ? "Welcome back"
                    : "Reset your password"}
              </h2>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                {mode === "signup"
                  ? "Join with Google or email, then tell us what you are studying for."
                  : mode === "signin"
                    ? "Pick up your matches, rooms, and progress where you left off."
                    : "Enter your email and we will send a reset link."}
              </p>
            </div>

            <div className="p-7">
            {/* Google Sign In */}
            {mode !== "forgot" && (
              <>
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition hover:opacity-90 mb-4"
                  style={{
                    borderColor: "var(--hairline)",
                    color: "var(--text-primary)",
                    background: "var(--bg-main)",
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: "var(--hairline)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    or
                  </span>
                  <div className="flex-1 h-px" style={{ background: "var(--hairline)" }} />
                </div>
              </>
            )}

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Full name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{
                      background: "var(--bg-main)",
                      borderColor: "var(--hairline)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                  style={{
                    background: "var(--bg-main)",
                    borderColor: "var(--hairline)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{
                      background: "var(--bg-main)",
                      borderColor: "var(--hairline)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              )}

              {/* Error / Success */}
              {(localError || error) && (
                <p
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
                >
                  {localError || error}
                </p>
              )}
              {successMsg && (
                <p
                  className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}
                >
                  {successMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold transition"
                style={{
                  background: "var(--rose-accent)",
                  color: "var(--primary-foreground)",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: "var(--shadow-rose-soft)",
                }}
              >
                {loading
                  ? "Loading..."
                  : mode === "signup"
                    ? "Create account"
                    : mode === "signin"
                      ? "Sign in"
                      : "Send reset email"}
              </button>
            </form>

            {/* Mode toggles */}
            <div className="mt-5 text-center text-sm space-y-2">
              {mode === "signup" && (
                <p style={{ color: "var(--text-muted)" }}>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("signin");
                      setLocalError("");
                      setSuccessMsg("");
                    }}
                    className="font-medium"
                    style={{ color: "var(--rose-accent)" }}
                  >
                    Sign in
                  </button>
                </p>
              )}
              {mode === "signin" && (
                <>
                  <p style={{ color: "var(--text-muted)" }}>
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setMode("signup");
                        setLocalError("");
                        setSuccessMsg("");
                      }}
                      className="font-medium"
                      style={{ color: "var(--rose-accent)" }}
                    >
                      Sign up
                    </button>
                  </p>
                  <p>
                    <button
                      onClick={() => {
                        setMode("forgot");
                        setLocalError("");
                        setSuccessMsg("");
                      }}
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Forgot password?
                    </button>
                  </p>
                </>
              )}
              {mode === "forgot" && (
                <p style={{ color: "var(--text-muted)" }}>
                  <button
                    onClick={() => {
                      setMode("signin");
                      setLocalError("");
                      setSuccessMsg("");
                    }}
                    className="font-medium"
                    style={{ color: "var(--rose-accent)" }}
                  >
                    ← Back to sign in
                  </button>
                </p>
              )}
            </div>
          </div>
          </div>
          {/* Demo mode */}
          {!isSupabaseMode && (
            <div
              className="mt-4 p-4 rounded-xl border text-center"
              style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
            >
              <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                Supabase not configured yet
              </p>
              <button
                onClick={onLocalMode}
                className="text-xs font-semibold px-4 py-2 rounded-lg transition"
                style={{
                  background: "var(--rose-accent)",
                  color: "var(--primary-foreground)",
                  boxShadow: "var(--shadow-rose-soft)",
                }}
              >
                Continue in demo mode →
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] mt-6" style={{ color: "var(--text-muted)" }}>
            By continuing, you agree to StudyDate's{" "}
            <a
              href="/terms"
              className="underline hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="underline hover:opacity-80"
              style={{ color: "var(--text-secondary)" }}
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
