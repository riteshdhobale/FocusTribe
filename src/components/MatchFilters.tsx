import {
  LOCATION_MODES,
  ACADEMIC_FOCUS,
  INTENTS,
  CAREER_GOALS,
  type LocationMode,
} from "@/lib/constants";
import { getMyProfile, type MatchPreferences, type Profile } from "@/lib/profiles";
import { useState, useEffect } from "react";
import * as Slider from "@radix-ui/react-slider";

type Props = {
  prefs: MatchPreferences;
  onChange: (prefs: MatchPreferences) => void;
};

export function MatchFilters({ prefs, onChange }: Props) {
  const [me, setMe] = useState<Profile | null>(null);
  useEffect(() => {
    getMyProfile().then(setMe);
  }, []);

  const toggleExamFocus = (focus: string) => {
    const examFocus = prefs.examFocus.includes(focus)
      ? prefs.examFocus.filter((f) => f !== focus)
      : [...prefs.examFocus, focus];
    onChange({ ...prefs, examFocus });
  };

  const toggleIntent = (intent: string) => {
    const newIntents = prefs.intent.includes(intent)
      ? prefs.intent.filter((i) => i !== intent)
      : [...prefs.intent, intent];
    onChange({ ...prefs, intent: newIntents });
  };

  const toggleCareerGoal = (goal: string) => {
    const newGoals = prefs.careerGoals.includes(goal)
      ? prefs.careerGoals.filter((g) => g !== goal)
      : [...prefs.careerGoals, goal];
    onChange({ ...prefs, careerGoals: newGoals });
  };

  const setAgeRange = (min: number, max: number) => {
    if (prefs.ageRange && prefs.ageRange.min === min && prefs.ageRange.max === max) {
      onChange({ ...prefs, ageRange: null });
    } else {
      onChange({ ...prefs, ageRange: { min, max } });
    }
  };

  const setLocationMode = (mode: LocationMode) => {
    onChange({ ...prefs, locationMode: mode, cities: [] });
  };

  const hasActiveFilters =
    prefs.ageRange ||
    prefs.examFocus.length > 0 ||
    prefs.intent.length > 0 ||
    prefs.careerGoals.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="p-5 rounded-[1.5rem] border relative overflow-hidden"
        style={{
          borderColor: "rgba(255,107,158,0.15)",
          background: "linear-gradient(180deg, rgba(30,41,59,0.3) 0%, rgba(15,23,42,0.6) 100%)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B9E] rounded-full filter blur-[60px] opacity-10 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner"
            style={{ background: "rgba(255,107,158,0.1)", borderColor: "rgba(255,107,158,0.2)" }}
          >
            <span className="text-2xl">🔍</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              Discover
            </h3>
            <p className="text-[11px] font-medium" style={{ color: "var(--rose-accent)" }}>
              Swipe people aligned with your ambition.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="p-5 rounded-[1.5rem] border space-y-6 relative overflow-hidden"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          background: "rgba(15,23,42,0.4)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center justify-between">
          <h4
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--text-primary)" }}
          >
            Filters
          </h4>
          {hasActiveFilters && (
            <button
              onClick={() =>
                onChange({ ...prefs, ageRange: null, examFocus: [], intent: [], careerGoals: [] })
              }
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border transition-colors hover:bg-white/5"
              style={{ color: "var(--rose-accent)", borderColor: "rgba(255,107,158,0.3)" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Location: City / Global toggle ── */}
        <div>
          <span
            className="text-[10px] font-mono tracking-widest uppercase block mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Location
          </span>
          <div className="flex gap-2">
            {LOCATION_MODES.map((m) => {
              const isActive = prefs.locationMode === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setLocationMode(m.value)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition"
                  style={{
                    background: isActive ? "var(--rose-accent)" : "transparent",
                    borderColor: isActive ? "var(--rose-accent)" : "var(--hairline)",
                    color: isActive ? "#0B1120" : "var(--text-secondary)",
                  }}
                >
                  {m.emoji} {m.label}
                </button>
              );
            })}
          </div>
          {me?.city && prefs.locationMode === "my-city" && (
            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
              📍 Showing people in {me.city}
            </p>
          )}
        </div>

        {/* ── Age ranges ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[10px] font-mono tracking-widest uppercase block"
              style={{ color: "var(--text-muted)" }}
            >
              Age Range
            </span>
            <span className="text-[10px] font-semibold" style={{ color: "var(--rose-accent)" }}>
              {prefs.ageRange
                ? `${prefs.ageRange.min} - ${prefs.ageRange.max === 40 ? "40+" : prefs.ageRange.max}`
                : "Any"}
            </span>
          </div>
          <div className="px-2 pt-2 pb-4">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[prefs.ageRange?.min || 18, prefs.ageRange?.max || 40]}
              min={18}
              max={40}
              step={1}
              onValueChange={([min, max]) => setAgeRange(min, max)}
            >
              <Slider.Track
                className="bg-gray-800 relative grow rounded-full h-1.5"
                style={{ background: "var(--hairline)" }}
              >
                <Slider.Range
                  className="absolute rounded-full h-full"
                  style={{ background: "var(--rose-accent)" }}
                />
              </Slider.Track>
              <Slider.Thumb
                className="block w-4 h-4 rounded-full shadow transition-transform hover:scale-110 focus:outline-none focus:ring-2"
                style={
                  {
                    background: "#fff",
                    borderColor: "var(--hairline)",
                    borderWidth: 1,
                    "--tw-ring-color": "var(--rose-accent)",
                  } as React.CSSProperties
                }
              />
              <Slider.Thumb
                className="block w-4 h-4 rounded-full shadow transition-transform hover:scale-110 focus:outline-none focus:ring-2"
                style={
                  {
                    background: "#fff",
                    borderColor: "var(--hairline)",
                    borderWidth: 1,
                    "--tw-ring-color": "var(--rose-accent)",
                  } as React.CSSProperties
                }
              />
            </Slider.Root>
          </div>
        </div>

        {/* ── Intent ── */}
        <div>
          <span
            className="text-[10px] font-mono tracking-widest uppercase block mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            What are you looking for?
          </span>
          <div className="flex flex-wrap gap-1.5">
            {INTENTS.map((i) => {
              const isActive = prefs.intent.includes(i.value);
              return (
                <button
                  key={i.value}
                  onClick={() => toggleIntent(i.value)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition"
                  style={{
                    background: isActive ? "var(--rose-accent)" : "transparent",
                    borderColor: isActive ? "var(--rose-accent)" : "rgba(255,255,255,0.1)",
                    color: isActive ? "#0B1120" : "var(--text-secondary)",
                  }}
                >
                  {i.emoji} {i.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Academic Focus ── */}
        <div>
          <span
            className="text-[10px] font-mono tracking-widest uppercase block mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Academic Focus
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ACADEMIC_FOCUS.slice(0, 10).map((f) => {
              const isActive = prefs.examFocus.includes(f.value);
              return (
                <button
                  key={f.value}
                  onClick={() => toggleExamFocus(f.value)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition"
                  style={{
                    background: isActive ? "var(--rose-accent)" : "transparent",
                    borderColor: isActive ? "var(--rose-accent)" : "rgba(255,255,255,0.1)",
                    color: isActive ? "#0B1120" : "var(--text-secondary)",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Career Goals ── */}
        <div>
          <span
            className="text-[10px] font-mono tracking-widest uppercase block mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Career Ambition
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CAREER_GOALS.slice(0, 10).map((g) => {
              const isActive = prefs.careerGoals.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleCareerGoal(g)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition"
                  style={{
                    background: isActive ? "var(--rose-accent)" : "transparent",
                    borderColor: isActive ? "var(--rose-accent)" : "rgba(255,255,255,0.1)",
                    color: isActive ? "#0B1120" : "var(--text-secondary)",
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
