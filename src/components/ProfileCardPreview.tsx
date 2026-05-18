// ─── ProfileCardPreview ────────────────────────────────────────────
// Shows a read-only version of exactly how the user's profile card
// will look on the discover tab — identical layout to SwipeCard.

import { useState } from "react";
import { X } from "lucide-react";
import { INTENTS, ACADEMIC_FOCUS } from "@/lib/constants";

type Props = {
  onClose: () => void;
  name: string;
  age: number | string;
  college: string;
  city: string;
  gender: string;
  bio: string;
  photoUrls: string[];
  examFocus: string;
  careerGoal: string;
  intent: string[];
  studyFormats: string[];
  interests: string[];
  lookingFor: string;
  availability: string;
};

export function ProfileCardPreview({
  onClose,
  name,
  age,
  college,
  city,
  gender,
  bio,
  photoUrls,
  examFocus,
  careerGoal,
  intent,
  studyFormats,
  interests,
  lookingFor,
  availability,
}: Props) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = photoUrls.filter(Boolean);
  const activePhoto = photos[photoIndex] ?? photos[0];

  const intentLabels = intent
    .map((v) => INTENTS.find((i) => i.value === v)?.label)
    .filter(Boolean) as string[];

  const examLabel =
    ACADEMIC_FOCUS.find((a) => a.value === examFocus)?.label || examFocus;

  const displayName = name || "Your Name";
  const displayAge = Number(age) || 21;

  const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (photos.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const goNext = e.clientX - rect.left >= rect.width / 2;
    setPhotoIndex((idx) => {
      const next = goNext ? idx + 1 : idx - 1;
      if (next < 0) return photos.length - 1;
      if (next >= photos.length) return 0;
      return next;
    });
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,17,32,0.88)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      {/* Card container */}
      <div
        className="relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-80"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
        >
          <X className="w-4 h-4" />
          Close preview
        </button>

        {/* Label */}
        <p
          className="text-center text-xs font-mono tracking-widest uppercase mb-3"
          style={{ color: "var(--rose-accent)" }}
        >
          👁 This is how you appear on discover
        </p>

        {/* The actual card — mirrors SwipeCard layout exactly */}
        <div
          className="rounded-[2rem] overflow-hidden border"
          style={{ borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}
        >
          {/* Photo area */}
          <div
            className="relative"
            style={{
              background: `hsl(${Math.abs(displayName.charCodeAt(0) * 37) % 360}, 60%, 35%)`,
            }}
          >
            <div
              className="relative h-[330px] sm:h-[390px] lg:h-[42vh] lg:max-h-[410px] lg:min-h-[340px] cursor-pointer select-none"
              onClick={handlePhotoClick}
            >
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
                    alt="Your profile photo"
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable={false}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-6xl block mb-2">
                      {["📚", "🎯", "💡", "🧠", "⚡"][displayName.charCodeAt(0) % 5]}
                    </span>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                      Add photos to see them here
                    </span>
                  </div>
                </div>
              )}

              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(11,17,32,0.54) 0%, rgba(11,17,32,0.06) 38%, rgba(11,17,32,0.92) 100%)",
                }}
              />

              {/* Photo progress dots */}
              {photos.length > 1 && (
                <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
                  {photos.map((_, idx) => (
                    <div
                      key={idx}
                      className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background:
                          idx === photoIndex
                            ? "rgba(255,255,255,0.95)"
                            : "rgba(255,255,255,0.25)",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Top chips */}
              <div className="absolute top-8 left-5 right-5 z-20 flex items-center justify-between gap-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide"
                  style={{
                    background: "color-mix(in oklab, var(--rose-accent) 22%, rgba(0,0,0,0.45))",
                    color: "#fff",
                    border: "1px solid color-mix(in oklab, var(--rose-accent) 35%, transparent)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  ✨ Your card
                </span>
              </div>

              {/* Bottom name + info overlay */}
              <div className="absolute inset-x-5 bottom-5 z-20">
                <h2
                  className="font-display font-extrabold text-3xl leading-tight"
                  style={{ color: "#fff" }}
                >
                  {displayName}, {displayAge}
                </h2>
                <div
                  className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {college && <span className="flex items-center gap-1">🎓 {college}</span>}
                  {city && <span className="flex items-center gap-1">📍 {city}</span>}
                  {availability && <span className="flex items-center gap-1">🕐 {availability}</span>}
                </div>

                {/* Intent / exam chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {intentLabels.slice(0, 1).map((label) => (
                    <span
                      key={label}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        color: "#fff",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                  {examLabel && (
                    <span
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        color: "#fff",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {examLabel}
                    </span>
                  )}
                  {careerGoal && (
                    <span
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                      style={{
                        background: "rgba(0,0,0,0.35)",
                        color: "#fff",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {careerGoal}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details panel */}
          <div
            className="px-5 pt-4 pb-5"
            style={{ background: "var(--bg-card)", borderTop: "1px solid var(--hairline)" }}
          >
            {bio ? (
              <p className="text-[15px] leading-6" style={{ color: "var(--text-secondary)" }}>
                {bio}
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
                Your bio will appear here...
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mt-3">
              {studyFormats.slice(0, 3).map((f) => (
                <span
                  key={f}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                  style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}
                >
                  {f}
                </span>
              ))}
              {interests.slice(0, 3).map((i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                  style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)" }}
                >
                  {i}
                </span>
              ))}
            </div>

            {lookingFor && (
              <div
                className="mt-4 p-4 rounded-2xl border"
                style={{ background: "var(--bg-card-2)", borderColor: "var(--hairline)" }}
              >
                <span
                  className="text-[10px] font-mono tracking-widest uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  In their words
                </span>
                <p className="text-sm mt-1" style={{ color: "var(--text-primary)" }}>
                  {lookingFor}
                </p>
              </div>
            )}

            {/* Tap hint */}
            {photos.length > 1 && (
              <p className="text-[10px] text-center mt-4" style={{ color: "var(--text-muted)" }}>
                Tap left / right on the photo to browse your photos
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
