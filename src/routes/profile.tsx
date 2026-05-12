import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import {
  ACADEMIC_FOCUS,
  CAREER_GOALS,
  INTENTS,
  STUDY_FORMATS,
  INTERESTS,
  isStudentEmail,
} from "@/lib/constants";
import { getMyProfile, saveMyProfile, type Profile } from "@/lib/profiles";
import { useSubscription } from "@/lib/useSubscription";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "My Profile — StudyDate" }] }),
});

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState(false);
  const { isPro, plan } = useSubscription();

  useEffect(() => {
    getMyProfile().then((p) => setProfile(p));
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <span className="text-5xl mb-4 block">👤</span>
            <h2
              className="font-display font-bold text-xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No profile yet
            </h2>
            <button
              onClick={() => navigate({ to: "/discover" })}
              className="px-6 py-3 rounded-xl text-sm font-semibold mt-4"
              style={{ background: "var(--rose-accent)", color: "#0B1120" }}
            >
              Create profile →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const update = (updates: Partial<Profile>) => {
    const newProf = { ...profile, ...updates };
    setProfile(newProf);
    setSaved(false);
  };

  const handleSave = () => {
    if (profile) {
      // Re-check verification on save
      const verified = profile.studentEmail ? isStudentEmail(profile.studentEmail) : false;
      const updated = { ...profile, isVerified: verified };
      saveMyProfile(updated);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const examLabel =
    ACADEMIC_FOCUS.find((a) => a.value === profile.examFocus?.[0])?.label ||
    profile.examFocus?.[0] ||
    "";
  const intentObj = INTENTS.find((i) => i.value === profile.intent);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <span
              className="text-xs font-mono tracking-widest uppercase mb-1 block"
              style={{ color: "var(--rose-accent)" }}
            >
              Profile
            </span>
            <h1
              className="font-display font-bold text-2xl flex items-center gap-3"
              style={{ color: "var(--text-primary)" }}
            >
              Shape how people discover you
            </h1>
          </div>
          {isPro && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 shadow-lg animate-fade-in"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,107,158,0.15) 0%, rgba(255,107,158,0.05) 100%)",
                borderColor: "rgba(255,107,158,0.4)",
                color: "#FF6B9E",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="text-lg drop-shadow-[0_0_8px_rgba(255,107,158,0.8)]">
                {plan === "campus" ? "🎓" : "⭐"}
              </span>
              <span className="text-sm font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B9E] to-[#FFA3C0]">
                StudyDate {plan}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Display name
              </label>
              <input
                value={profile.name}
                onChange={(e) => update({ name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--hairline)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Age
              </label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => update({ age: parseInt(e.target.value) || 18 })}
                min={18}
                max={40}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--hairline)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                College
              </label>
              <input
                value={profile.college}
                onChange={(e) => update({ college: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--hairline)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                City
              </label>
              <input
                value={profile.city}
                onChange={(e) => update({ city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--hairline)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Academic focus
              </label>
              <input
                value={profile.examFocus?.[0] || ""}
                onChange={(e) => update({ examFocus: [e.target.value] })}
                placeholder="e.g. B.Tech Sem 4, JEE, etc."
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--hairline)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Career goal
              </label>
              <input
                value={profile.careerGoal}
                onChange={(e) => update({ careerGoal: e.target.value })}
                placeholder="e.g. Software Engineer, Doctor"
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--hairline)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => update({ bio: e.target.value })}
              rows={4}
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--hairline)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Looking for */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              Looking for
            </label>
            <input
              value={profile.lookingForPrompt}
              onChange={(e) => update({ lookingForPrompt: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--hairline)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Student email verification */}
          <div
            className="p-5 rounded-2xl border"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
          >
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
              🎓 Student Verification
            </h3>
            <input
              value={profile.studentEmail || ""}
              onChange={(e) => update({ studentEmail: e.target.value })}
              placeholder="you@college.ac.in or you@university.edu"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none mb-2"
              style={{
                background: "var(--bg-main)",
                borderColor: "var(--hairline)",
                color: "var(--text-primary)",
              }}
            />
            {profile.studentEmail && (
              <p
                className="text-xs"
                style={{ color: isStudentEmail(profile.studentEmail) ? "#10B981" : "#EF4444" }}
              >
                {isStudentEmail(profile.studentEmail)
                  ? "✓ Verified student email — Campus badge active!"
                  : "✕ Not a recognized student email domain"}
              </p>
            )}
            {profile.isVerified && (
              <div
                className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl"
                style={{ background: "rgba(16,185,129,0.1)" }}
              >
                <span className="text-sm">🎓</span>
                <span className="text-xs font-medium" style={{ color: "#10B981" }}>
                  Campus Verified — Get Campus plan pricing!
                </span>
              </div>
            )}
          </div>

          {/* Study stats */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className="p-4 rounded-2xl border text-center"
              style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
            >
              <span
                className="text-2xl font-display font-bold block"
                style={{ color: "var(--rose-accent)" }}
              >
                {profile.hoursStudied}
              </span>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Hours studied
              </span>
            </div>
            <div
              className="p-4 rounded-2xl border text-center"
              style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
            >
              <span
                className="text-2xl font-display font-bold block"
                style={{ color: "var(--rose-accent)" }}
              >
                {profile.streak}
              </span>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                Day streak
              </span>
            </div>
            <div
              className="p-4 rounded-2xl border text-center"
              style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
            >
              <span
                className="text-2xl font-display font-bold block"
                style={{ color: isPro ? "#FF6B9E" : "var(--text-primary)" }}
              >
                {isPro ? (plan === "campus" ? "🎓" : "⭐") : "Free"}
              </span>
              <span
                className="text-[11px]"
                style={{ color: "var(--text-muted)", textTransform: "capitalize" }}
              >
                {isPro ? `${plan} Plan` : "Plan"}
              </span>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full px-6 py-3.5 rounded-xl text-sm font-semibold transition"
            style={{
              background: saved ? "#10B981" : "var(--rose-accent)",
              color: saved ? "#fff" : "#0B1120",
            }}
          >
            {saved ? "✓ Saved!" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
