import { useState, useRef } from "react";
import { Heart, X, Star, MessageCircle } from "lucide-react";
import { INTENTS, ACADEMIC_FOCUS } from "@/lib/constants";
import { ReportButton } from "./ReportButton";
import type { Profile } from "@/lib/profiles";

type Props = {
  profile: Profile;
  compatibility: number;
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  onComment: () => void;
};

export function SwipeCard({ profile, compatibility, onLike, onPass, onSuperLike, onComment }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const intentObj = INTENTS.find(i => i.value === profile.intent);
  const examLabels = profile.examFocus.map(e => ACADEMIC_FOCUS.find(a => a.value === e)?.label || e);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX.current;
    setDragX(dx);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX > 120) onLike();
    else if (dragX < -120) onPass();
    else setDragX(0);
  };

  const rotation = dragX * 0.05;
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 400);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Card */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing transition-transform select-none"
        style={{
          transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
          opacity,
          transition: isDragging ? "none" : "all 0.3s ease",
          touchAction: "none",
        }}
      >
        {/* Gradient header */}
        <div className="relative pt-8 pb-24 px-6" style={{ background: profile.avatarColor }}>
          {/* Match badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(0,0,0,0.35)", color: "#fff", backdropFilter: "blur(8px)" }}>
              ✨ {compatibility}% MATCH
            </span>
            {profile.isVerified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "rgba(0,0,0,0.3)", color: "#fff", backdropFilter: "blur(8px)" }}>
                18+ verified vibe
              </span>
            )}
            <ReportButton userId={profile.id} userName={profile.name} context="swipe_card" />
          </div>

          {/* Intent + exam tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {intentObj && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: "rgba(0,0,0,0.3)", color: "#fff", backdropFilter: "blur(4px)" }}>
                {intentObj.label}
              </span>
            )}
            {examLabels.map(e => (
              <span key={e} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: "rgba(0,0,0,0.3)", color: "#fff", backdropFilter: "blur(4px)" }}>
                {e}
              </span>
            ))}
            {profile.careerGoal && (
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: "rgba(0,0,0,0.3)", color: "#fff", backdropFilter: "blur(4px)" }}>
                {profile.careerGoal}
              </span>
            )}
          </div>

          {/* Like indicator on heart */}
          <button onClick={onLike} className="absolute right-6 bottom-20 w-10 h-10 rounded-full flex items-center justify-center transition hover:scale-110"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <Heart className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pt-5 pb-6" style={{ background: "var(--bg-card)" }}>
          {/* Name + meta */}
          <h2 className="font-display font-extrabold text-2xl" style={{ color: "var(--text-primary)" }}>
            {profile.name}, {profile.age}
          </h2>
          <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">🎓 {profile.college}</span>
            <span className="flex items-center gap-1">📍 {profile.city}</span>
            <span className="flex items-center gap-1">🕐 {profile.availability}</span>
          </div>

          {/* Bio */}
          <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {profile.bio}
          </p>

          {/* Study format + interest tags */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {profile.studyFormats.slice(0, 3).map(f => (
              <span key={f} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}>
                {f}
              </span>
            ))}
            {profile.interests.slice(0, 3).map(i => (
              <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}>
                {i}
              </span>
            ))}
          </div>

          {/* Looking For prompt */}
          {profile.lookingForPrompt && (
            <div className="mt-4 p-3 rounded-xl" style={{ background: "var(--bg-main)" }}>
              <span className="text-[10px] font-mono tracking-widest uppercase block mb-1" style={{ color: "var(--text-muted)" }}>
                Looking For
              </span>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                {profile.lookingForPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Swipe indicators */}
        {dragX > 50 && (
          <div className="absolute top-1/3 left-6 px-6 py-3 rounded-xl font-extrabold text-2xl border-4 -rotate-12"
            style={{ borderColor: "#10B981", color: "#10B981", opacity: Math.min(1, (dragX - 50) / 100) }}>
            LIKE
          </div>
        )}
        {dragX < -50 && (
          <div className="absolute top-1/3 right-6 px-6 py-3 rounded-xl font-extrabold text-2xl border-4 rotate-12"
            style={{ borderColor: "#EF4444", color: "#EF4444", opacity: Math.min(1, (Math.abs(dragX) - 50) / 100) }}>
            NOPE
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={onPass}
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 transition hover:scale-110 active:scale-95"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}>
          <X className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
        </button>
        <button onClick={onLike}
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 transition hover:scale-110 active:scale-95"
          style={{ borderColor: "#F472B6", background: "rgba(244,114,182,0.1)" }}>
          <Heart className="w-6 h-6" style={{ color: "#F472B6" }} />
        </button>
        <button onClick={onSuperLike}
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 transition hover:scale-110 active:scale-95"
          style={{ borderColor: "#FF6B9E", background: "rgba(201,165,78,0.1)" }}>
          <Star className="w-6 h-6" style={{ color: "#FF6B9E" }} />
        </button>
        <button onClick={onComment}
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 transition hover:scale-110 active:scale-95"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}>
          <MessageCircle className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>
    </div>
  );
}
