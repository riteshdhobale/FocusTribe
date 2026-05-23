import { Heart, Zap, Handshake, BookOpen } from "lucide-react";
import type { Profile } from "@/lib/profiles";
import { getModeConfig, type MatchMode } from "@/lib/matchModes";

type Props = {
  profile: Profile;
  onMessage: () => void;
  onKeep: () => void;
  mode?: MatchMode;
};

export function MatchCelebration({ profile, onMessage, onKeep, mode = "study-date" }: Props) {
  const modeConfig = getModeConfig(mode);

  const modeIcons = {
    "study-date": "🎯",
    "accountability-buddy": "🤝",
    "study-buddy": "📚",
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4"
      style={{
        background:
          `radial-gradient(ellipse at center, ${modeConfig.colorSoft.replace("0.12", "0.15")}, rgba(11,17,32,0.95) 70%)`,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${10 + Math.random() * 80}%`,
            bottom: `${10 + Math.random() * 30}%`,
            animation: `float-hearts ${2 + Math.random() * 2}s ease-out ${Math.random() * 1.5}s forwards`,
            opacity: 0.7,
          }}
        >
          {["✨", "⭐", "🔥", "💪", modeConfig.emoji][Math.floor(Math.random() * 5)]}
        </div>
      ))}

      <div className="text-center animate-celebrate max-w-sm">
        {/* Avatars connecting */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div
            className="h-24 w-24 rounded-full flex items-center justify-center text-5xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${modeConfig.color}, color-mix(in oklab, ${modeConfig.color} 60%, #0B1120))`,
              boxShadow: `0 0 0 4px ${modeConfig.colorGlow}`,
            }}
          >
            {modeIcons[mode]}
          </div>
          <div className="animate-celebrate" style={{ animationDelay: "0.3s" }}>
            <Zap
              className="h-10 w-10 pulse-heart"
              style={{ color: modeConfig.color, fill: modeConfig.color }}
            />
          </div>
          <div
            className="h-24 w-24 rounded-full flex items-center justify-center text-5xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${profile.avatarColor}, color-mix(in oklab, ${profile.avatarColor} 60%, #0B1120))`,
              boxShadow: `0 0 0 4px color-mix(in oklab, ${profile.avatarColor} 40%, transparent)`,
            }}
          >
            {profile.avatarEmoji}
          </div>
        </div>

        <h2
          className="font-display font-extrabold text-3xl mb-2"
          style={{ animationDelay: "0.2s" }}
        >
          <span
            style={{
              background: modeConfig.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {modeConfig.celebrationTitle(profile.name)}
          </span>
        </h2>

        <p className="text-[color:var(--text-secondary)] mb-2">
          {modeConfig.celebrationSubtitle}
        </p>

        <p className="text-sm text-[color:var(--text-muted)] mb-8">
          {profile.college} · {profile.examFocus.join(", ")}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onMessage}
            className="btn-pill text-white px-8 py-3.5 font-semibold inline-flex items-center justify-center gap-2 transition hover:opacity-95"
            style={{
              background: modeConfig.gradient,
              boxShadow: `0 10px 40px -12px ${modeConfig.colorGlow}`,
            }}
          >
            Send a message 💬
          </button>
          <button
            onClick={onKeep}
            className="btn-pill border border-[color:var(--hairline)] px-8 py-3.5 font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition"
          >
            Keep swiping
          </button>
        </div>
      </div>
    </div>
  );
}
