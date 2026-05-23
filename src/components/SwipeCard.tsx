import { useMemo, useState, useRef, useEffect } from "react";
import { Heart, X, Star, Flame, Clock } from "lucide-react";
import { INTENTS, ACADEMIC_FOCUS } from "@/lib/constants";
import { ReportButton } from "./ReportButton";
import { getModeConfig, type MatchMode } from "@/lib/matchModes";
import type { Profile } from "@/lib/profiles";

type Props = {
  profile: Profile;
  compatibility: number;
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
  /** Spark — rendered as floating overlay on card bottom-right */
  onSpark?: () => void;
  sparkRemaining?: number;
  mode?: MatchMode;
};

export function SwipeCard({
  profile,
  compatibility,
  onLike,
  onPass,
  onSuperLike,
  onSpark,
  sparkRemaining = 0,
  mode = "study-date",
}: Props) {
  const modeConfig = getModeConfig(mode);
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

  const intentObj = INTENTS.find((i) => i.value === profile.intent);
  const examLabels = profile.examFocus.map(
    (e) => ACADEMIC_FOCUS.find((a) => a.value === e)?.label || e,
  );

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
  const accentColor = modeConfig.color;

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Card */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="rounded-[2rem] overflow-hidden cursor-grab active:cursor-grabbing select-none border"
        style={{
          transform: `translateX(${dragX}px) translateY(${animatingOut === "up" ? -window.innerHeight : 0}px) rotate(${rotation}deg)`,
          opacity: animatingOut ? 0 : opacity,
          transition: isDragging
            ? "none"
            : "transform 280ms cubic-bezier(0.175, 0.885, 0.32, 1.2), opacity 280ms ease",
          touchAction: "none",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 30px 100px rgba(0,0,0,0.6)",
        }}
      >
        {/* Photo area */}
        <div ref={photoAreaRef} className="relative" style={{ background: profile.avatarColor }}>
          <div className="relative h-[330px] sm:h-[390px] lg:h-[42vh] lg:max-h-[410px] lg:min-h-[340px]">
            {activePhoto ? (
              <>
                <img
                  src={activePhoto}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center 32%",
                    filter: "blur(18px)",
                    opacity: 0.45,
                  }}
                  draggable={false}
                />
                <img
                  src={activePhoto}
                  alt={`${profile.name} photo ${photoIndex + 1}`}
                  className="absolute inset-0 w-full h-full"
                  style={{ objectFit: "contain", objectPosition: "center center" }}
                  draggable={false}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                  No photo
                </span>
              </div>
            )}

            {/* Top gradient for chips */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(11,17,32,0.54) 0%, rgba(11,17,32,0.06) 38%, rgba(11,17,32,0.92) 100%)",
              }}
            />

            {/* Photo progress */}
            {photos.length > 1 && (
              <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
                {photos.map((_, idx) => (
                  <div
                    key={`dot-${idx}`}
                    className="h-1 flex-1 rounded-full"
                    style={{
                      background:
                        idx === photoIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.25)",
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
                  background: `color-mix(in oklab, ${modeConfig.color} 22%, rgba(0,0,0,0.45))`,
                  color: "#fff",
                  border: `1px solid color-mix(in oklab, ${modeConfig.color} 35%, transparent)`,
                  boxShadow: `0 0 12px ${modeConfig.colorGlow}`,
                  backdropFilter: "blur(10px)",
                }}
              >
                ✨ {compatibility}%
              </span>
              <div className="flex items-center gap-2">
                {profile.isMock && (
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.16)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    Sample profile
                  </span>
                )}
                {profile.isVerified && (
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    18+ verified
                  </span>
                )}
                <ReportButton userId={profile.id} userName={profile.name} context="swipe_card" />
              </div>
            </div>

            {/* Bottom info overlay */}
            <div className="absolute inset-x-5 bottom-5 z-20">
              <h2
                className="font-display font-extrabold text-3xl leading-tight"
                style={{ color: "#fff" }}
              >
                {profile.name}, {profile.age}
              </h2>
              <div
                className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                <span className="flex items-center gap-1">🎓 {profile.college}</span>
                <span className="flex items-center gap-1">📍 {profile.city}</span>
                <span className="flex items-center gap-1">🕐 {profile.availability}</span>
              </div>

              {/* Intent/Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {intentObj && (
                  <span
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      color: "#fff",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {intentObj.label}
                  </span>
                )}
                {examLabels.slice(0, 2).map((e) => (
                  <span
                    key={e}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      color: "#fff",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {e}
                  </span>
                ))}
                {profile.careerGoal && (
                  <span
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      color: "#fff",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {profile.careerGoal}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details panel */}
        <div
          className="px-5 pt-4 pb-5"
          style={{
            background: "var(--bg-card)",
            borderTop: "1px solid var(--hairline)",
          }}
        >
          <p className="text-[15px] leading-6" style={{ color: "var(--text-secondary)" }}>
            {profile.bio}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.studyFormats.slice(0, 3).map((f) => (
              <span
                key={f}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}
              >
                {f}
              </span>
            ))}
            {profile.interests.slice(0, 3).map((i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}
              >
                {i}
              </span>
            ))}
          </div>

          {profile.lookingForPrompt && (
            <div
              className="mt-4 p-3.5 rounded-2xl border"
              style={{ background: "var(--bg-card-2)", borderColor: "var(--hairline)" }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-mono tracking-widest uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  In their words
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
          <div
            className="absolute top-1/3 left-6 px-6 py-3 rounded-xl font-extrabold text-2xl border-4 -rotate-12"
            style={{
              borderColor: likeColor,
              color: likeColor,
              opacity: Math.min(1, (dragX - 50) / 100),
            }}
          >
            LIKE
          </div>
        )}
        {dragX < -50 && (
          <div
            className="absolute top-1/3 right-6 px-6 py-3 rounded-xl font-extrabold text-2xl border-4 rotate-12"
            style={{
              borderColor: passColor,
              color: passColor,
              opacity: Math.min(1, (Math.abs(dragX) - 50) / 100),
            }}
          >
            NOPE
          </div>
        )}
      </div>

      {onSpark !== undefined && (
        <div className="absolute bottom-[108px] right-4 z-30">
          <button
            onClick={onSpark}
            className="flex flex-col items-center gap-1 transition-all duration-200 hover:scale-110 active:scale-90"
            title={sparkRemaining > 0 ? "Send a Spark ⚡" : "No Sparks left this month"}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center relative"
              style={{
                background: sparkRemaining > 0
                  ? "linear-gradient(135deg, #FFC107, #FF8F00)"
                  : "rgba(30,40,60,0.85)",
                boxShadow: sparkRemaining > 0
                  ? "0 0 0 5px rgba(255,193,7,0.12), 0 6px 20px rgba(255,193,7,0.45)"
                  : "0 2px 10px rgba(0,0,0,0.4)",
                border: sparkRemaining === 0 ? "1.5px solid rgba(255,255,255,0.1)" : "none",
                backdropFilter: "blur(8px)",
              }}
            >
              {sparkRemaining > 0 && (
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "rgba(255,193,7,0.25)", animationDuration: "2.5s" }}
                />
              )}
              <span className="text-lg relative z-10" style={{ filter: sparkRemaining === 0 ? "grayscale(1) opacity(0.5)" : "none" }}>⚡</span>
            </div>
            {/* Count pill */}
            <div
              className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{
                background: sparkRemaining > 0 ? "rgba(255,193,7,0.9)" : "rgba(255,255,255,0.12)",
                color: sparkRemaining > 0 ? "#0B1120" : "rgba(255,255,255,0.4)",
              }}
            >
              {sparkRemaining} left
            </div>
          </button>
        </div>
      )}

      {/* ─── 3 ACTION BUTTONS ─────────────────────────────────────────────
         Pass  |  Superlike  |  Like
         Sizing: Pass=52px  Super=48px  Heart=76px (hero CTA)
         Heart is raised -10px to create focal depth (visual hierarchy)
      ──────────────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-center gap-6 mt-5 px-4 pb-3" style={{ minHeight: 104 }}>

        {/* ✗ Pass */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => handleAction("left", onPass)}
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 relative group"
            style={{
              background: "linear-gradient(145deg, #1c2537, #141e30)",
              border: "1.5px solid rgba(244,63,94,0.22)",
              boxShadow: "0 4px 18px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-rose-500/8 opacity-0 group-hover:opacity-100 transition-opacity" />
            <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" style={{ color: "#F43F5E" }} strokeWidth={2.5} />
          </button>
          <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "rgba(244,63,94,0.55)" }}>Pass</span>
        </div>

        {/* ❤️ Like — Hero CTA */}
        <div className="flex flex-col items-center gap-1.5 -translate-y-2.5">
          <button
            onClick={() => handleAction("right", onLike)}
            className="w-[76px] h-[76px] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 relative group"
            style={{
              background: modeConfig.gradient,
              boxShadow: `0 0 0 8px ${modeConfig.colorSoft}, 0 10px 36px ${modeConfig.colorGlow}`,
            }}
          >
            <div className="absolute inset-0 rounded-full bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Heart className="w-[34px] h-[34px] text-white drop-shadow transition-transform group-hover:scale-110 duration-200" fill="currentColor" />
          </button>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: modeConfig.color }}>{modeConfig.actions.like}</span>
        </div>

        {/* ★ Superlike */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => handleAction("up", onSuperLike)}
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 relative group"
            style={{
              background: "linear-gradient(145deg, #1c2537, #141e30)",
              border: "1.5px solid rgba(251,191,36,0.28)",
              boxShadow: "0 4px 18px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-amber-400/8 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Star className="w-5 h-5 transition-all group-hover:fill-amber-400 duration-200" style={{ color: "#FBBF24" }} strokeWidth={2} />
          </button>
          <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "rgba(251,191,36,0.55)" }}>Super</span>
        </div>

      </div>
    </div>
  );
}
