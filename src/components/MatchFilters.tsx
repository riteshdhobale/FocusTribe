import { useState } from "react";
import type { MatchPreferences, GroupPref } from "@/lib/profiles";
import { COLLEGES } from "@/lib/profiles";
import { categories } from "@/lib/categories";
import { SlidersHorizontal, X, Users, GraduationCap, Target, Zap, Check } from "lucide-react";

type Props = {
  open: boolean;
  prefs: MatchPreferences;
  onClose: () => void;
  onApply: (prefs: MatchPreferences) => void;
};

export function MatchFilters({ open, prefs, onClose, onApply }: Props) {
  const [local, setLocal] = useState<MatchPreferences>({ ...prefs });

  if (!open) return null;

  const update = <K extends keyof MatchPreferences>(key: K, val: MatchPreferences[K]) => {
    setLocal(prev => ({ ...prev, [key]: val }));
  };

  const toggleExam = (slug: string) => {
    update("examFocus",
      local.examFocus.includes(slug)
        ? local.examFocus.filter(s => s !== slug)
        : [...local.examFocus, slug]
    );
  };

  const toggleCollege = (c: string) => {
    update("colleges",
      local.colleges.includes(c)
        ? local.colleges.filter(s => s !== c)
        : [...local.colleges, c]
    );
  };

  const apply = () => {
    onApply(local);
    onClose();
  };

  const reset = () => {
    setLocal({
      ageMin: 16, ageMax: 35,
      genderPref: "any",
      examFocus: [],
      colleges: [],
      groupPref: "any",
      onlineOnly: false,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end"
      style={{ background: "rgba(11,17,32,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm h-full overflow-y-auto animate-slide-up"
        style={{ background: "var(--surface)", borderLeft: "1px solid var(--hairline)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between border-b border-[color:var(--hairline)]"
          style={{ background: "var(--surface)" }}>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" style={{ color: "#F472B6" }} />
            <h3 className="font-display font-bold text-lg">Filters</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="text-xs text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition">
              Reset
            </button>
            <button onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-[color:var(--surface-2)] transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Age Range */}
          <div>
            <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-3 block">
              Age Range: {local.ageMin} – {local.ageMax}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={14}
                max={35}
                value={local.ageMin}
                onChange={e => update("ageMin", Math.min(Number(e.target.value), local.ageMax - 1))}
                className="flex-1 accent-[#F472B6]"
              />
              <input
                type="range"
                min={14}
                max={35}
                value={local.ageMax}
                onChange={e => update("ageMax", Math.max(Number(e.target.value), local.ageMin + 1))}
                className="flex-1 accent-[#F472B6]"
              />
            </div>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Show Me
            </label>
            <div className="flex gap-2">
              {(["any", "male", "female"] as const).map(g => (
                <button
                  key={g}
                  onClick={() => update("genderPref", g)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition ${
                    local.genderPref === g
                      ? "bg-rose-gradient text-[#0B1120]"
                      : "bg-[color:var(--surface-2)] border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                  }`}
                >
                  {g === "any" ? "Everyone" : g === "male" ? "Boys Only" : "Girls Only"}
                </button>
              ))}
            </div>
          </div>

          {/* Group Size */}
          <div>
            <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Study Date Type
            </label>
            <div className="flex gap-2">
              {([
                { val: "any" as GroupPref, label: "Any" },
                { val: "1v1" as GroupPref, label: "1-on-1" },
                { val: "small-group" as GroupPref, label: "Group (3-4)" },
              ]).map(g => (
                <button
                  key={g.val}
                  onClick={() => update("groupPref", g.val)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition ${
                    local.groupPref === g.val
                      ? "bg-gold-gradient text-[#0B1120]"
                      : "bg-[color:var(--surface-2)] border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Online Only */}
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> Online Now Only
            </label>
            <button
              onClick={() => update("onlineOnly", !local.onlineOnly)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                local.onlineOnly ? "bg-[var(--emerald-live)]" : "bg-[color:var(--surface-2)]"
              }`}
            >
              <div
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: local.onlineOnly ? "translateX(26px)" : "translateX(2px)" }}
              />
            </button>
          </div>

          {/* Exam Focus */}
          <div>
            <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Target className="h-3 w-3" /> Exam / Career Focus
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c.slug}
                  onClick={() => toggleExam(c.slug)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    local.examFocus.includes(c.slug)
                      ? "text-[#0B1120]"
                      : "bg-[color:var(--surface-2)] border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                  }`}
                  style={local.examFocus.includes(c.slug) ? {
                    background: "linear-gradient(135deg, #F472B6, #E879A8)",
                  } : undefined}
                >
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                  {local.examFocus.includes(c.slug) && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Colleges */}
          <div>
            <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-3 flex items-center gap-1.5">
              <GraduationCap className="h-3 w-3" /> Colleges
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {COLLEGES.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCollege(c)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition ${
                    local.colleges.includes(c)
                      ? "bg-[color:var(--surface-2)] text-[color:var(--text-primary)]"
                      : "text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-2)]"
                  }`}
                >
                  <div
                    className="h-4 w-4 rounded border flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: local.colleges.includes(c) ? "#F472B6" : "var(--hairline)",
                      background: local.colleges.includes(c) ? "#F472B6" : "transparent",
                    }}
                  >
                    {local.colleges.includes(c) && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Apply button */}
        <div className="sticky bottom-0 p-5 border-t border-[color:var(--hairline)]" style={{ background: "var(--surface)" }}>
          <button
            onClick={apply}
            className="w-full btn-pill bg-rose-gradient text-white py-3 font-semibold transition hover:opacity-95"
            style={{ boxShadow: "var(--shadow-rose)" }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
