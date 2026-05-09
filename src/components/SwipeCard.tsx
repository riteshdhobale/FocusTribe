import { useMemo, useState, useRef, useEffect } from "react";
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
  const photoAreaRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState<"left" | "right" | "up" | null>(null);

  const photos = useMemo(() => (profile.photoUrls || []).filter(Boolean), [profile.photoUrls]);
  const activePhoto = photos[photoIndex] ?? photos[0];

  useEffect(() => {
    setPhotoIndex(0);
    setDragX(0);
    setAnimatingOut(null);
  }, [profile.id]);

  const intentObj = INTENTS.find(i => i.value === profile.intent);
  const examLabels = profile.examFocus.map(e => ACADEMIC_FOCUS.find(a => a.value === e)?.label || e);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startX.current;
    setDragX(dx);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    // Tap-to-advance photos (Tinder-style) when it wasn't a swipe.
    const totalDx = e.clientX - startX.current;
    const totalDy = e.clientY - startY.current;
    const isTap = Math.abs(totalDx) < 10 && Math.abs(totalDy) < 10;
    const photoRect = photoAreaRef.current?.getBoundingClientRect();
    const isInPhoto = !!photoRect && e.clientY >= photoRect.top && e.clientY <= photoRect.bottom;
    if (isTap && isInPhoto && photos.length > 1 && photoRect) {
      const localX = e.clientX - photoRect.left;
      const goNext = localX >= photoRect.width / 2;
      setPhotoIndex((idx) => {
        const next = goNext ? idx + 1 : idx - 1;
        if (next < 0) return photos.length - 1;
        if (next >= photos.length) return 0;
        return next;
      });
      setDragX(0);
      return;
    }

    if (dragX > 120) handleAction("right", onLike);
    else if (dragX < -120) handleAction("left", onPass);
    else setDragX(0);
  };

  const handleAction = (direction: "left" | "right" | "up", callback: () => void) => {
    if (animatingOut) return;
    setAnimatingOut(direction);
    setIsDragging(false);
    
    // Animate out
    if (direction === "left") setDragX(-window.innerWidth);
    else if (direction === "right") setDragX(window.innerWidth);
    else setDragX(0); // 'up' is handled via translateY if we wanted, but dragX=0 is fine for now
    
    setTimeout(() => {
      callback();
    }, 280);
  };

  const rotation = dragX * 0.05;
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 400);

  const likeColor = "var(--emerald-live)";
  const passColor = "var(--crimson)";
  const accentColor = "var(--rose-accent)";

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Card */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="rounded-[2rem] overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(${dragX}px) translateY(${animatingOut === 'up' ? -window.innerHeight : 0}px) rotate(${rotation}deg)`,
          opacity: animatingOut ? 0 : opacity,
          transition: isDragging ? "none" : "transform 280ms cubic-bezier(0.175, 0.885, 0.32, 1.2), opacity 280ms ease",
          touchAction: "none",
          boxShadow: "0 30px 100px rgba(0,0,0,0.6)",
        }}
      >
        {/* Photo area */}
        <div ref={photoAreaRef} className="relative" style={{ background: profile.avatarColor }}>
          <div className="relative h-[340px] sm:h-[400px]">
            {activePhoto ? (
              <img
                src={activePhoto}
                alt={`${profile.name} photo ${photoIndex + 1}`}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: "cover", objectPosition: "50% 22%" }}
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>No photo</span>
              </div>
            )}

            {/* Top gradient for chips */}
            <div className="absolute inset-0" style={{
              background: "linear-gradient(180deg, rgba(11,17,32,0.78) 0%, rgba(11,17,32,0.15) 40%, rgba(11,17,32,0.92) 100%)",
            }} />

            {/* Photo progress */}
            {photos.length > 1 && (
              <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
                {photos.map((_, idx) => (
                  <div
                    key={`dot-${idx}`}
                    className="h-1 flex-1 rounded-full"
                    style={{
                      background: idx === photoIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Top chips row */}
            <div className="absolute top-8 left-5 right-5 z-20 flex items-center justify-between gap-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide"
                style={{
                  background: "color-mix(in oklab, var(--rose-accent) 22%, rgba(0,0,0,0.45))",
                  color: "#fff",
                  border: "1px solid color-mix(in oklab, var(--rose-accent) 35%, transparent)",
                  boxShadow: "var(--shadow-rose-soft)",
                  backdropFilter: "blur(10px)",
                }}
              >
                ✨ {compatibility}%
              </span>
              <div className="flex items-center gap-2">
                {profile.isMock && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.16)",
                      backdropFilter: "blur(10px)",
                    }}>
                    Sample profile
                  </span>
                )}
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(0,0,0,0.35)", color: "#fff", backdropFilter: "blur(10px)" }}>
                    18+ verified
                  </span>
                )}
                <ReportButton userId={profile.id} userName={profile.name} context="swipe_card" />
              </div>
            </div>

            {/* Bottom info overlay */}
            <div className="absolute inset-x-5 bottom-5 z-20">
              <h2 className="font-display font-extrabold text-3xl leading-tight" style={{ color: "#fff" }}>
                {profile.name}, {profile.age}
              </h2>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
                <span className="flex items-center gap-1">🎓 {profile.college}</span>
                <span className="flex items-center gap-1">📍 {profile.city}</span>
                <span className="flex items-center gap-1">🕐 {profile.availability}</span>
              </div>

              {/* Intent/Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {intentObj && (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: "rgba(0,0,0,0.35)", color: "#fff", backdropFilter: "blur(8px)" }}>
                    {intentObj.label}
                  </span>
                )}
                {examLabels.slice(0, 2).map(e => (
                  <span key={e} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: "rgba(0,0,0,0.35)", color: "#fff", backdropFilter: "blur(8px)" }}>
                    {e}
                  </span>
                ))}
                {profile.careerGoal && (
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                    style={{ background: "rgba(0,0,0,0.35)", color: "#fff", backdropFilter: "blur(8px)" }}>
                    {profile.careerGoal}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details panel */}
        <div
          className="px-6 pt-5 pb-6"
          style={{
            background: "var(--bg-card)",
            borderTop: "1px solid var(--hairline)",
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {profile.bio}
          </p>

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

          {profile.lookingForPrompt && (
            <div
              className="mt-4 p-4 rounded-2xl border"
              style={{ background: "var(--bg-card-2)", borderColor: "var(--hairline)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  Looking for
                </span>
                {photos.length > 1 && (
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Tap photo to see more
                  </span>
                )}
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--text-primary)" }}>
                {profile.lookingForPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Swipe indicators */}
        {dragX > 50 && (
          <div className="absolute top-1/3 left-6 px-6 py-3 rounded-xl font-extrabold text-2xl border-4 -rotate-12"
            style={{ borderColor: likeColor, color: likeColor, opacity: Math.min(1, (dragX - 50) / 100) }}>
            LIKE
          </div>
        )}
        {dragX < -50 && (
          <div className="absolute top-1/3 right-6 px-6 py-3 rounded-xl font-extrabold text-2xl border-4 rotate-12"
            style={{ borderColor: passColor, color: passColor, opacity: Math.min(1, (Math.abs(dragX) - 50) / 100) }}>
            NOPE
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 mt-6 sm:mt-8">
        <button onClick={() => handleAction("left", onPass)}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 group relative overflow-hidden border shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
          style={{ background: "#1E293B", borderColor: "#334155" }}>
          <div className="absolute inset-0 bg-rose-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <X className="w-6 h-6 transition-transform group-hover:rotate-90" style={{ color: "#F43F5E" }} strokeWidth={3} />
        </button>
        
        <button onClick={() => handleAction("up", onSuperLike)}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 group relative overflow-hidden border shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
          style={{ background: "#1E293B", borderColor: "#334155" }}>
          <div className="absolute inset-0 bg-amber-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <Star className="w-5 h-5 transition-transform group-hover:scale-110" style={{ color: "#FBBF24" }} strokeWidth={2.5} />
        </button>

        <button onClick={() => handleAction("right", onLike)}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 group relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FF6B9E 0%, #FF3B5C 100%)",
            boxShadow: "0 10px 30px rgba(255,107,158,0.4)",
          }}>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <Heart className="w-8 h-8 text-white drop-shadow-sm transition-transform group-hover:scale-110" fill="currentColor" />
        </button>
        
        <button onClick={onComment}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 group relative overflow-hidden border shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
          style={{ background: "#1E293B", borderColor: "#334155" }}>
          <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <MessageCircle className="w-5 h-5 transition-transform group-hover:-rotate-12" style={{ color: "#60A5FA" }} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
