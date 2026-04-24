const palette = [
  "linear-gradient(135deg,#F472B6,#C026D3)",
  "linear-gradient(135deg,#60A5FA,#2563EB)",
  "linear-gradient(135deg,#34D399,#059669)",
  "linear-gradient(135deg,#F59E0B,#D97706)",
  "linear-gradient(135deg,#A78BFA,#7C3AED)",
  "linear-gradient(135deg,#F87171,#DC2626)",
  "linear-gradient(135deg,#22D3EE,#0891B2)",
];

const initials = ["AR", "MK", "SP", "RV", "JT", "NK", "IS"];

export function Avatars({ count = 5, size = 36 }: { count?: number; size?: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-full ring-2 flex items-center justify-center text-[11px] font-semibold text-white"
          style={{
            width: size,
            height: size,
            background: palette[i % palette.length],
            marginLeft: i === 0 ? 0 : -10,
            zIndex: count - i,
            // ring uses background to blend with surface
            // @ts-ignore
            "--tw-ring-color": "var(--surface)",
            boxShadow: "0 0 0 2px var(--surface)",
          }}
        >
          {initials[i % initials.length]}
        </div>
      ))}
    </div>
  );
}
