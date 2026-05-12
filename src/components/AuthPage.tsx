import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

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

  const pillars = [
    {
      title: "Less friction → more starts",
      copy: "No endless browsing. You match by exam + intent, then jump into a room.",
    },
    {
      title: "Accountability without awkwardness",
      copy: "A partner + a timebox turns “later” into “done”.",
    },
    {
      title: "Progress cues that keep you coming back",
      copy: "Streaks and tiny wins make consistency feel natural.",
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
    "Got exams ahead? Match with people on the same grind.",
    "Study 1:1 or in small groups — built for real sessions, not texting forever.",
    "Turn screen time into score time: quick starts, clear structure, consistent streaks.",
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
    <div className="min-h-screen px-4 py-12" style={{ background: "var(--bg-main)" }}>
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        {/* Onboarding */}
        <div className="space-y-6">
          <div
            className="p-8 rounded-2xl border"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
          >
            <div className="inline-flex items-center gap-2.5 mb-5">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ background: "var(--rose-accent)", color: "var(--primary-foreground)" }}
              >
                S
              </span>
              <span className="font-display font-bold text-2xl">
                <span style={{ color: "var(--rose-accent)" }}>Study</span>
                <span style={{ color: "var(--text-primary)" }}>Date</span>
              </span>
            </div>
            <h1
              className="font-display font-extrabold text-3xl mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              The productive alternative to swiping + streaming
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              StudyDate pairs chemistry with structure: match by intent and exam focus, then
              actually study. It’s the “Netflix & chill” energy — but for your future.
            </p>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition"
              style={{
                background: "var(--rose-accent)",
                color: "var(--primary-foreground)",
                opacity: loading ? 0.7 : 1,
                boxShadow: "var(--shadow-rose-soft)",
              }}
            >
              Continue with Google
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              {pillars.map((p) => (
                <div
                  key={p.title}
                  className="p-4 rounded-xl border"
                  style={{ borderColor: "var(--hairline)", background: "var(--bg-card-2)" }}
                >
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {p.title}
                  </p>
                  <p
                    className="text-sm mt-2 leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs font-mono tracking-widest uppercase"
                style={{ color: "var(--rose-accent)" }}
              >
                Why it wins
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Designed around behavior, not willpower
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {alternatives.map((a) => (
                <div
                  key={a.label}
                  className="p-4 rounded-xl border"
                  style={{
                    borderColor: a.featured
                      ? "color-mix(in oklab, var(--rose-accent) 55%, transparent)"
                      : "var(--hairline)",
                    background: a.featured
                      ? "color-mix(in oklab, var(--rose-accent) 10%, var(--bg-card-2))"
                      : "var(--bg-card-2)",
                    boxShadow: a.featured ? "var(--shadow-rose-soft)" : undefined,
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {a.label}
                  </p>
                  <p
                    className="text-xl font-extrabold mt-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {a.headline}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    {a.sub}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mt-4 p-4 rounded-2xl border"
              style={{ borderColor: "var(--hairline)", background: "var(--bg-card-2)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Got exams ahead?
              </p>
              <div className="mt-2 space-y-2">
                {examPitch.map((line) => (
                  <p
                    key={line}
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {line}
                  </p>
                ))}
              </div>
              <div className="rose-divider mt-4" />
              <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
                Price check: StudyDate Pro (₹199/mo) is less than a Netflix plan — and it pays back
                in consistency.
              </p>
            </div>
          </div>
        </div>

        {/* Auth */}
        <div className="w-full max-w-md justify-self-center">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ background: "var(--rose-accent)", color: "var(--primary-foreground)" }}
              >
                S
              </span>
              <span className="font-display font-bold text-2xl">
                <span style={{ color: "var(--rose-accent)" }}>Study</span>
                <span style={{ color: "var(--text-primary)" }}>Date</span>
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {mode === "signup"
                ? "Create your account to start matching"
                : mode === "signin"
                  ? "Welcome back! Sign in to continue"
                  : "Enter your email to reset your password"}
            </p>
          </div>

          {/* Card */}
          <div
            className="p-6 rounded-2xl border"
            style={{ borderColor: "var(--gold-soft)", background: "var(--bg-card)" }}
          >
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
