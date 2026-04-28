const items = [
  "NEET UG", "JEE Advanced", "UPSC CSE", "CAT 2025", "GATE CSE",
  "CA Inter", "CLAT", "GMAT", "SSC CGL", "FMGE", "NEET PG", "Bank PO", "DSA Daily",
];

export function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="marquee-mask overflow-hidden">
      <div className="marquee py-6">
        {row.map((t, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-[color:var(--text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-gradient" />
            <span className="font-display font-semibold tracking-wide">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
