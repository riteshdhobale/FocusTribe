import {
  LOCATION_MODES,
  INTENTS,
  CAREER_GOALS,
  getAcademicFocusForMarket,
  type LocationMode,
} from "@/lib/constants";
import { detectRegion } from "@/lib/geoPrice";
import { getMyProfile, type MatchPreferences, type Profile } from "@/lib/profiles";
import { useState, useEffect } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Sliders, RotateCcw, MapPin, Zap } from "lucide-react";

type Props = {
  prefs: MatchPreferences;
  onChange: (prefs: MatchPreferences) => void;
};

function FilterSection({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-sm">{icon}</span>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  emoji,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  emoji?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150 hover:scale-105 active:scale-95"
      style={{
        background: active
          ? "linear-gradient(135deg, #FF6B9E, #FF8FB5)"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "transparent" : "rgba(255,255,255,0.08)"}`,
        color: active ? "#0B1120" : "var(--text-secondary)",
        boxShadow: active ? "0 2px 12px rgba(255,107,158,0.3)" : "none",
      }}
    >
      {emoji && <span className="mr-1">{emoji}</span>}
      {label}
    </button>
  );
}

export function MatchFilters({ prefs, onChange }: Props) {
  const [me, setMe] = useState<Profile | null>(null);
  useEffect(() => { getMyProfile().then(setMe); }, []);
  const market = detectRegion() === "india" ? "india" : "global";
  const academicFocusOptions = getAcademicFocusForMarket(market);

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

  const setLocationMode = (mode: LocationMode) => {
    onChange({ ...prefs, locationMode: mode, cities: [] });
  };

  const activeCount =
    (prefs.ageRange ? 1 : 0) +
    prefs.examFocus.length +
    prefs.intent.length +
    prefs.careerGoals.length;

  const clearAll = () =>
    onChange({ ...prefs, ageRange: null, examFocus: [], intent: [], careerGoals: [] });

  return (
    <div className="space-y-3">

      {/* ── Header card ─────────────────────────────────────────── */}
      <div
        className="p-4 rounded-2xl relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,107,158,0.12) 0%, rgba(15,23,42,0.7) 100%)",
          border: "1px solid rgba(255,107,158,0.2)",
        }}
      >
        {/* Ambient glow */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#FF6B9E] blur-[40px] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,158,0.25), rgba(255,107,158,0.08))",
              border: "1px solid rgba(255,107,158,0.3)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <span className="text-xl">🔍</span>
          </div>
          <div>
            <h3
              className="font-display font-bold text-base leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Discover
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: "#FF6B9E" }}>
              Find people aligned with your ambition
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter panel ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(20,28,48,0.9) 0%, rgba(12,18,35,0.95) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-3.5 w-3.5" style={{ color: "#FF6B9E" }} />
            <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
              Filters
            </span>
            {activeCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#FF6B9E", color: "#0B1120" }}
              >
                {activeCount}
              </span>
            )}
          </div>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-[10px] font-semibold transition hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        <div className="p-4 space-y-5">

          {/* ── Location ── */}
          <FilterSection label="Location" icon="📍">
            <div
              className="flex p-1 rounded-xl gap-1"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {LOCATION_MODES.map((m) => {
                const isActive = prefs.locationMode === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setLocationMode(m.value)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #FF6B9E, #FF3B5C)"
                        : "transparent",
                      color: isActive ? "#fff" : "var(--text-muted)",
                      boxShadow: isActive ? "0 2px 10px rgba(255,107,158,0.35)" : "none",
                    }}
                  >
                    {m.emoji} {m.label}
                  </button>
                );
              })}
            </div>
            {me?.city && prefs.locationMode === "my-city" && (
              <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                <MapPin className="h-2.5 w-2.5" />
                Showing people in {me.city}
              </p>
            )}
          </FilterSection>

          {/* ── Age Range ── */}
          <FilterSection label="Age Range" icon="🎂">
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: prefs.ageRange ? "rgba(255,107,158,0.15)" : "rgba(255,255,255,0.05)",
                  color: prefs.ageRange ? "#FF6B9E" : "var(--text-muted)",
                  border: `1px solid ${prefs.ageRange ? "rgba(255,107,158,0.3)" : "transparent"}`,
                }}
              >
                {prefs.ageRange
                  ? `${prefs.ageRange.min} – ${prefs.ageRange.max === 40 ? "40+" : prefs.ageRange.max}`
                  : "Any age"}
              </span>
            </div>
            <div className="px-1 pt-1 pb-3">
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[prefs.ageRange?.min || 18, prefs.ageRange?.max || 40]}
                min={18}
                max={40}
                step={1}
                onValueChange={([min, max]) => onChange({ ...prefs, ageRange: { min, max } })}
              >
                <Slider.Track
                  className="relative grow rounded-full h-1.5"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <Slider.Range
                    className="absolute rounded-full h-full"
                    style={{ background: "linear-gradient(90deg, #FF6B9E, #FF8FB5)" }}
                  />
                </Slider.Track>
                {[0, 1].map((i) => (
                  <Slider.Thumb
                    key={i}
                    className="block w-4 h-4 rounded-full focus:outline-none transition-transform hover:scale-125"
                    style={{
                      background: "#fff",
                      boxShadow: "0 0 0 3px rgba(255,107,158,0.4), 0 2px 6px rgba(0,0,0,0.3)",
                    }}
                  />
                ))}
              </Slider.Root>
            </div>
          </FilterSection>

          {/* ── Looking For ── */}
          <FilterSection label="Looking for" icon="✨">
            <div className="flex flex-wrap gap-1.5">
              {INTENTS.map((i) => (
                <FilterChip
                  key={i.value}
                  label={i.label}
                  emoji={i.emoji}
                  active={prefs.intent.includes(i.value)}
                  onClick={() => toggleIntent(i.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* ── Academic Focus ── */}
          <FilterSection label="Academic Focus" icon="📚">
            <div className="flex flex-wrap gap-1.5">
              {academicFocusOptions.slice(0, 12).map((f) => (
                <FilterChip
                  key={f.value}
                  label={f.label}
                  active={prefs.examFocus.includes(f.value)}
                  onClick={() => toggleExamFocus(f.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* ── Career Ambition ── */}
          <FilterSection label="Career Ambition" icon="🚀">
            <div className="flex flex-wrap gap-1.5">
              {CAREER_GOALS.slice(0, 10).map((g) => (
                <FilterChip
                  key={g}
                  label={g}
                  active={prefs.careerGoals.includes(g)}
                  onClick={() => toggleCareerGoal(g)}
                />
              ))}
            </div>
          </FilterSection>

        </div>

        {/* Bottom CTA — only when filters active */}
        {activeCount > 0 && (
          <div className="px-4 pb-4 pt-1">
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-xs"
              style={{
                background: "rgba(255,107,158,0.06)",
                border: "1px solid rgba(255,107,158,0.12)",
              }}
            >
              <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: "#FF6B9E" }} />
              <span style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "#FF6B9E", fontWeight: 600 }}>{activeCount} filter{activeCount > 1 ? "s" : ""} active</span>
                {" "}— showing tailored results
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
