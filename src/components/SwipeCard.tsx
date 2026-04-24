import { useCallback, useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/profiles";
import { compatibilityScore, getMyProfile } from "@/lib/profiles";
import { Heart, X, Star, MapPin, BookOpen, GraduationCap, Clock, Flame, Users } from "lucide-react";

type SwipeCardProps = {
  profile: Profile;
  onSwipeRight: (profile: Profile) => void;
  onSwipeLeft: (profile: Profile) => void;
  onSuperLike: (profile: Profile) => void;
  isTop: boolean;
  stackIndex: number;
};

export function SwipeCard({ profile, onSwipeRight, onSwipeLeft, onSuperLike, isTop, stackIndex }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [exiting, setExiting] = useState<"left" | "right" | "up" | null>(null);
  const [expanded, setExpanded] = useState(false);

  const me = getMyProfile();
  const compat = me ? compatibilityScore(me, profile) : Math.floor(Math.random() * 30 + 60);

  const SWIPE_THRESHOLD = 100;
  const SWIPE_UP_THRESHOLD = 80;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isTop || exiting) return;
    setDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [isTop, exiting]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  }, [dragging, startPos]);

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);

    if (pos.x > SWIPE_THRESHOLD) {
      setExiting("right");
      setTimeout(() => onSwipeRight(profile), 300);
    } else if (pos.x < -SWIPE_THRESHOLD) {
      setExiting("left");
      setTimeout(() => onSwipeLeft(profile), 300);
    } else if (pos.y < -SWIPE_UP_THRESHOLD) {
      setExiting("up");
      setTimeout(() => onSuperLike(profile), 300);
    } else {
      setPos({ x: 0, y: 0 });
    }
  }, [dragging, pos, onSwipeRight, onSwipeLeft, onSuperLike, profile]);

  // Button actions
  const handleLike = () => {
    if (exiting) return;
    setExiting("right");
    setTimeout(() => onSwipeRight(profile), 300);
  };
  const handleNope = () => {
    if (exiting) return;
    setExiting("left");
    setTimeout(() => onSwipeLeft(profile), 300);
  };
  const handleSuperLike = () => {
    if (exiting) return;
    setExiting("up");
    setTimeout(() => onSuperLike(profile), 300);
  };

  const rotation = dragging ? pos.x * 0.1 : 0;
  const likeOpacity = Math.min(1, Math.max(0, pos.x / SWIPE_THRESHOLD));
  const nopeOpacity = Math.min(1, Math.max(0, -pos.x / SWIPE_THRESHOLD));
  const superOpacity = Math.min(1, Math.max(0, -pos.y / SWIPE_UP_THRESHOLD));

  const cardStyle: React.CSSProperties = {
    zIndex: 10 - stackIndex,
    transform: exiting === "right"
      ? "translateX(150%) rotate(30deg)"
      : exiting === "left"
      ? "translateX(-150%) rotate(-30deg)"
      : exiting === "up"
      ? "translateY(-150%) scale(0.9)"
      : isTop
      ? `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg) scale(1)`
      : `scale(${1 - stackIndex * 0.05}) translateY(${stackIndex * 12}px)`,
    opacity: exiting ? 0 : 1,
    transition: dragging ? "none" : "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    pointerEvents: isTop ? "auto" : "none",
  };

  return (
    <div
      ref={cardRef}
      className={`swipe-card ${dragging ? "swiping" : ""}`}
      style={cardStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Swipe indicators */}
      <div className="swipe-card-overlay like" style={{ opacity: likeOpacity }}>
        STUDY DATE 💚
      </div>
      <div className="swipe-card-overlay nope" style={{ opacity: nopeOpacity }}>
        PASS ✕
      </div>
      <div className="swipe-card-overlay super-like" style={{ opacity: superOpacity }}>
        SUPER LIKE ⭐
      </div>

      {/* Card content */}
      <div className="h-full flex flex-col">
        {/* Profile avatar area */}
        <div
          className="relative flex-shrink-0 flex items-center justify-center"
          style={{
            height: expanded ? "35%" : "55%",
            background: `linear-gradient(135deg, ${profile.avatarColor}, color-mix(in oklab, ${profile.avatarColor} 60%, #0B1120))`,
            transition: "height 0.3s ease",
          }}
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          <div className="text-7xl select-none" style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.3))" }}>
            {profile.avatarEmoji}
          </div>

          {/* Online indicator */}
          {profile.isOnline && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              <span className="text-xs font-medium text-white">Online</span>
            </div>
          )}

          {/* Compatibility badge */}
          <div className="absolute top-4 right-4 compat-badge">
            {compat}% match
          </div>

          {/* Group preference */}
          {profile.groupPref !== "any" && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#E2CC7E" }}>
              <Users className="h-3 w-3" />
              {profile.groupPref === "1v1" ? "1-on-1" : "Group"}
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="flex-1 p-5 flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold text-xl">{profile.name}</h3>
            <span className="text-[color:var(--text-secondary)] font-medium">{profile.age}</span>
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-sm text-[color:var(--text-secondary)]">
            <GraduationCap className="h-3.5 w-3.5" style={{ color: "var(--gold)" }} />
            <span>{profile.college}</span>
            <span className="text-[color:var(--text-muted)]">· {profile.year}</span>
          </div>

          {/* Exam focus tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.examFocus.map(e => (
              <span key={e} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: "color-mix(in oklab, var(--gold) 12%, var(--surface-2))",
                  color: "var(--gold-soft)",
                  border: "1px solid color-mix(in oklab, var(--gold) 20%, transparent)",
                }}>
                {e}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "color-mix(in oklab, #F472B6 12%, var(--surface-2))",
                color: "#F9A8D4",
                border: "1px solid color-mix(in oklab, #F472B6 20%, transparent)",
              }}>
              {profile.lookingFor}
            </span>
          </div>

          {/* Bio */}
          <p className="mt-3 text-sm text-[color:var(--text-secondary)] leading-relaxed">
            {profile.bio}
          </p>

          {expanded && (
            <div className="mt-3 space-y-3 animate-slide-up">
              {/* Interests */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] mb-1.5">Interests</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map(i => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-xs border border-[color:var(--hairline)] text-[color:var(--text-secondary)]">
                      {i}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-[color:var(--text-muted)]">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {profile.hoursStudied}h studied</span>
                <span className="flex items-center gap-1"><Flame className="h-3 w-3" style={{ color: "#F97316" }} /> {profile.streak} day streak</span>
              </div>

              {/* Study style */}
              <div className="flex items-center gap-2 text-xs">
                <BookOpen className="h-3 w-3" style={{ color: "var(--gold)" }} />
                <span className="text-[color:var(--text-secondary)]">
                  Study style: <span className="text-[color:var(--text-primary)] font-medium capitalize">{profile.studyStyle}</span>
                </span>
              </div>
            </div>
          )}

          {!expanded && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
              className="mt-2 text-xs text-[color:var(--gold)] hover:underline self-start"
            >
              Show more ↓
            </button>
          )}
        </div>
      </div>

      {/* Action buttons (only show on top card) */}
      {isTop && !dragging && (
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-4"
          style={{ background: "linear-gradient(transparent, rgba(11,17,32,0.95))" }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleNope(); }}
            className="h-14 w-14 rounded-full flex items-center justify-center transition hover:scale-110"
            style={{
              background: "color-mix(in oklab, var(--crimson) 15%, var(--surface-2))",
              border: "2px solid color-mix(in oklab, var(--crimson) 40%, transparent)",
            }}
          >
            <X className="h-6 w-6" style={{ color: "var(--crimson)" }} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleSuperLike(); }}
            className="h-11 w-11 rounded-full flex items-center justify-center transition hover:scale-110"
            style={{
              background: "color-mix(in oklab, #60A5FA 15%, var(--surface-2))",
              border: "2px solid color-mix(in oklab, #60A5FA 40%, transparent)",
            }}
          >
            <Star className="h-5 w-5" style={{ color: "#60A5FA" }} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className="h-14 w-14 rounded-full flex items-center justify-center transition hover:scale-110"
            style={{
              background: "color-mix(in oklab, var(--emerald-live) 15%, var(--surface-2))",
              border: "2px solid color-mix(in oklab, var(--emerald-live) 40%, transparent)",
            }}
          >
            <Heart className="h-6 w-6" style={{ color: "var(--emerald-live)" }} />
          </button>
        </div>
      )}
    </div>
  );
}
