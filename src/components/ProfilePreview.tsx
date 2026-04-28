import { INTENTS, ACADEMIC_FOCUS } from "@/lib/constants";

type Props = {
  name: string;
  age: number;
  college: string;
  city: string;
  examFocus: string;
  careerGoal: string;
  intent: string;
  studyFormats: string[];
  interests: string[];
};

export function ProfilePreview({ name, age, college, city, examFocus, careerGoal, intent, studyFormats, interests }: Props) {
  const intentLabels = intent.split(",").map(iVal => INTENTS.find(i => i.value === iVal)?.label).filter(Boolean);
  const examLabel = ACADEMIC_FOCUS.find(a => a.value === examFocus)?.label || examFocus;

  const tags = [
    ...intentLabels,
    examLabel,
    careerGoal,
    ...studyFormats.slice(0, 2),
    ...interests.slice(0, 2),
  ].filter(Boolean);

  return (
    <div className="p-4 rounded-xl border" style={{ borderColor: "var(--hairline)", background: "var(--bg-main)" }}>
      <span className="text-[10px] font-mono tracking-widest uppercase mb-2 block" style={{ color: "var(--text-muted)" }}>
        Profile Preview
      </span>

      <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
        {name || "Your Name"}, {age}
      </h3>

      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
        {college || "College"} · {city || "City"}{examLabel ? ` · ${examLabel}` : ""}{careerGoal ? ` · ${careerGoal}` : ""}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
              style={{ borderColor: "var(--hairline)", color: "var(--text-secondary)", background: "transparent" }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
