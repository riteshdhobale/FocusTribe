import { useState, useEffect } from "react";
import { getStartersForMatch, getBestNextMove, type Starter } from "@/lib/starters";

type Props = {
  matchExamFocus?: string[];
};

export function ConversationStarters({ matchExamFocus }: Props) {
  const [starters, setStarters] = useState<Starter[]>([]);
  const [bestMove, setBestMove] = useState({ title: "", body: "" });

  useEffect(() => {
    setStarters(getStartersForMatch(matchExamFocus));
    setBestMove(getBestNextMove());
  }, [matchExamFocus]);

  const refresh = () => {
    setStarters(getStartersForMatch(matchExamFocus));
    setBestMove(getBestNextMove());
  };

  return (
    <div className="space-y-6">
      {/* Starters section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-mono tracking-widest uppercase block mb-1" style={{ color: "var(--rose-accent)" }}>
              Conversation Starters
            </span>
            <h3 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>
              Openers that feel smart, not cringe
            </h3>
          </div>
          <button onClick={refresh} className="text-xs font-medium px-3 py-1.5 rounded-lg border transition hover:opacity-80"
            style={{ borderColor: "var(--hairline)", color: "var(--text-muted)" }}>
            Refresh ↻
          </button>
        </div>

        <div className="space-y-2.5">
          {starters.map((s, i) => (
            <button key={i}
              className="w-full text-left p-4 rounded-xl border text-sm leading-relaxed transition hover:border-[color:var(--rose-accent)]"
              style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)", background: "var(--bg-card)" }}
              onClick={() => navigator.clipboard?.writeText(s.text)}>
              {s.text}
            </button>
          ))}
        </div>
      </div>

      {/* Best next move */}
      <div className="p-5 rounded-2xl border" style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}>
        <span className="text-[10px] font-mono tracking-widest uppercase block mb-2" style={{ color: "var(--text-muted)" }}>
          Best Next Move
        </span>
        <h4 className="font-semibold text-base mb-2" style={{ color: "var(--text-primary)" }}>
          {bestMove.title}
        </h4>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {bestMove.body}
        </p>
      </div>
    </div>
  );
}
