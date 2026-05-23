import { useState, useEffect, useRef } from "react";
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
import { ProfileCardPreview } from "@/components/ProfileCardPreview";
import { ImageCropModal } from "@/components/ImageCropModal";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "My Profile — FocusTribe" }] }),
});

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState(false);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const { isPro, plan } = useSubscription();

  // Photo management state
  const maxPhotos = 6;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);

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

  // ── Photo handlers ──────────────────────────────────────────────
  const handlePickFile = (files: FileList | null) => {
    if (!files || files.length === 0 || !profile) return;
    if ((profile.photoUrls || []).length >= maxPhotos) {
      setPhotoError(`You can only add ${maxPhotos} photos.`);
      return;
    }
    const objectUrl = URL.createObjectURL(files[0]);
    setCropImageUrl(objectUrl);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadCroppedPhoto = async (blob: Blob) => {
    setCropImageUrl(null);
    if (!profile) return;
    setUploading(true);
    setPhotoError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? `anon_${Date.now()}`;
      const path = `${userId}/${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (error) {
        setPhotoError(`Upload failed: ${error.message}`);
      } else {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        update({ photoUrls: [...(profile.photoUrls || []), publicUrl].slice(0, maxPhotos) });
      }
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (idx: number) => {
    if (!profile) return;
    update({ photoUrls: (profile.photoUrls || []).filter((_, i) => i !== idx) });
  };

  const makeCover = (idx: number) => {
    if (!profile) return;
    const urls = [...(profile.photoUrls || [])];
    const [moved] = urls.splice(idx, 1);
    urls.unshift(moved);
    update({ photoUrls: urls });
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
    <>
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
            <button
              onClick={() => setShowCardPreview(true)}
              className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition hover:opacity-80"
              style={{
                borderColor: "var(--rose-accent)",
                color: "var(--rose-accent)",
                background: "color-mix(in oklab, var(--rose-accent) 8%, transparent)",
              }}
            >
              <span>👁</span> Preview my card
            </button>
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
                FocusTribe {plan}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* ── Photo grid ───────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Profile photos
              </label>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {uploading ? "⏳ Uploading…" : `${(profile.photoUrls || []).length}/${maxPhotos} · first is cover`}
              </span>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => handlePickFile(e.target.files)}
            />

            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: maxPhotos }).map((_, idx) => {
                const url = (profile.photoUrls || [])[idx];
                return (
                  <div key={`photo-${idx}`} className="relative aspect-[3/4]">
                    <div
                      onClick={() => { if (!url && !uploading) fileInputRef.current?.click(); }}
                      className="block w-full h-full rounded-xl border overflow-hidden transition-all"
                      style={{
                        borderColor: url ? "transparent" : "var(--hairline)",
                        background: url ? "transparent" : "var(--bg-card)",
                        cursor: url ? "default" : uploading ? "wait" : "pointer",
                        borderStyle: url ? "solid" : "dashed",
                      }}
                    >
                      {url ? (
                        <img src={url} alt={`Profile ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ color: "var(--text-muted)" }}>
                          <span className="text-2xl font-light">+</span>
                          <span className="text-[10px]">{uploading ? "Uploading…" : "Add photo"}</span>
                        </div>
                      )}
                    </div>
                    {url && (
                      <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1">
                        {idx === 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(15,23,42,0.75)", color: "#fff" }}>Cover</span>
                        ) : (
                          <button type="button" onClick={() => makeCover(idx)} className="text-[10px] px-2 py-0.5 rounded-full transition hover:opacity-80" style={{ background: "rgba(15,23,42,0.75)", color: "#fff" }}>Make cover</button>
                        )}
                        <button type="button" onClick={() => removePhoto(idx)} className="text-[10px] px-2 py-0.5 rounded-full transition hover:opacity-80" style={{ background: "rgba(239,68,68,0.8)", color: "#fff" }}>✕</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {photoError && <p className="text-xs mt-2" style={{ color: "#F97316" }}>{photoError}</p>}
          </div>

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
      
      {showCardPreview && profile && (
        <ProfileCardPreview
          onClose={() => setShowCardPreview(false)}
          name={profile.name}
          age={profile.age}
          college={profile.college}
          city={profile.city}
          gender={profile.gender || "any"}
          bio={profile.bio || ""}
          photoUrls={profile.photoUrls || []}
          examFocus={profile.examFocus?.[0] || ""}
          careerGoal={profile.careerGoal || ""}
          intent={profile.intent ? [profile.intent] : []}
          studyFormats={profile.studyFormats || []}
          interests={profile.interests || []}
          lookingFor={profile.lookingForPrompt || ""}
          availability={profile.availability || ""}
        />
      )}

      {/* Image crop modal */}
      {cropImageUrl && (
        <ImageCropModal
          imageUrl={cropImageUrl}
          onConfirm={uploadCroppedPhoto}
          onCancel={() => {
            URL.revokeObjectURL(cropImageUrl);
            setCropImageUrl(null);
          }}
        />
      )}
    </div>
    </>
  );
}
