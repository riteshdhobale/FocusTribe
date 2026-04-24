import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Gender, StudyStyle, GroupPref, Profile } from "@/lib/profiles";
import { saveMyProfile, savePreferences } from "@/lib/profiles";
import { categories } from "@/lib/categories";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Heart, Sparkles, User, BookOpen, Users } from "lucide-react";

type Props = {
  onComplete: () => void;
};

const STEPS = ["basics", "college", "focus", "style", "bio"] as const;
type Step = typeof STEPS[number];

export function ProfileSetup({ onComplete }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("basics");
  const [name, setName] = useState("");
  const [age, setAge] = useState(20);
  const [gender, setGender] = useState<Gender>("male");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("2nd Year");
  const [examFocus, setExamFocus] = useState<string[]>([]);
  const [studyStyle, setStudyStyle] = useState<StudyStyle>("visual");
  const [bio, setBio] = useState("");
  const [lookingFor, setLookingFor] = useState("Study Partner");
  const [groupPref, setGroupPref] = useState<GroupPref>("any");
  const [genderPref, setGenderPref] = useState<"male" | "female" | "any">("any");

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
    else finish();
  };

  const prev = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const canProceed = () => {
    switch (step) {
      case "basics": return name.trim().length >= 2;
      case "college": return college.trim().length >= 2;
      case "focus": return examFocus.length > 0;
      case "style": return true;
      case "bio": return bio.trim().length >= 10;
    }
  };

  const toggleExam = (slug: string) => {
    setExamFocus(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const avatarColors = [
    "hsl(340, 82%, 52%)", "hsl(262, 83%, 58%)", "hsl(199, 89%, 48%)",
    "hsl(142, 71%, 45%)", "hsl(45, 93%, 47%)", "hsl(16, 85%, 57%)",
  ];
  const avatarEmojis = ["📚", "🎯", "💡", "🔬", "⚡", "🧠", "🎓", "💻"];

  const finish = () => {
    const profile: Profile = {
      id: `my-${Date.now()}`,
      name: name.trim(),
      age,
      gender,
      college: college.trim(),
      year,
      examFocus,
      bio: bio.trim(),
      studyStyle,
      lookingFor,
      interests: [],
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      avatarEmoji: avatarEmojis[Math.floor(Math.random() * avatarEmojis.length)],
      isOnline: true,
      hoursStudied: 0,
      streak: 0,
      groupPref,
      genderPref,
    };

    saveMyProfile(profile);
    // Also set ft_name for backward compat with study rooms
    localStorage.setItem("ft_name", name.trim());

    // Save default preferences matching their gender pref
    savePreferences({
      ageMin: 16,
      ageMax: 35,
      genderPref,
      examFocus: [],
      colleges: [],
      groupPref,
      onlineOnly: false,
    });

    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "color-mix(in oklab, #0B1120 80%, transparent)", backdropFilter: "blur(16px)" }}
    >
      <div className="w-full max-w-lg animate-scale-in">
        {/* Progress bar */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 h-1 rounded-full bg-[color:var(--surface-2)] overflow-hidden">
            <div
              className="h-full bg-rose-gradient transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-[color:var(--text-muted)] tabular-nums">
            {stepIndex + 1}/{STEPS.length}
          </span>
        </div>

        <div className="surface-card-static p-8" style={{ borderColor: "color-mix(in oklab, #F472B6 25%, transparent)" }}>
          {/* Step: Basics */}
          {step === "basics" && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5" style={{ color: "#F472B6" }} />
                <h3 className="font-display font-bold text-xl">Let's get started</h3>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-6">
                Tell us about yourself to find the perfect study partner.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1.5 block">Your Name</label>
                  <input
                    autoFocus
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[color:var(--surface-2)] border border-[color:var(--hairline)] rounded-xl px-4 py-3 outline-none transition focus:border-[#F472B6]"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1.5 block">Age</label>
                    <input
                      type="number"
                      min={14}
                      max={40}
                      value={age}
                      onChange={e => setAge(Number(e.target.value))}
                      className="w-full bg-[color:var(--surface-2)] border border-[color:var(--hairline)] rounded-xl px-4 py-3 outline-none transition focus:border-[#F472B6]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1.5 block">Gender</label>
                    <div className="flex gap-2">
                      {(["male", "female", "non-binary"] as Gender[]).map(g => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={`flex-1 py-3 rounded-xl text-xs font-semibold capitalize transition ${
                            gender === g
                              ? "bg-rose-gradient text-[#0B1120]"
                              : "bg-[color:var(--surface-2)] border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                          }`}
                        >
                          {g === "non-binary" ? "NB" : g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gender preference */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1.5 block">
                    Show me study partners who are
                  </label>
                  <div className="flex gap-2">
                    {(["any", "male", "female"] as const).map(g => (
                      <button
                        key={g}
                        onClick={() => setGenderPref(g)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold capitalize transition ${
                          genderPref === g
                            ? "bg-gold-gradient text-[#0B1120]"
                            : "bg-[color:var(--surface-2)] border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                        }`}
                      >
                        {g === "any" ? "Everyone" : g === "male" ? "Boys" : "Girls"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: College */}
          {step === "college" && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5" style={{ color: "#F472B6" }} />
                <h3 className="font-display font-bold text-xl">Where do you study?</h3>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-6">
                Students from the same college get a compatibility boost!
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1.5 block">College / Institute</label>
                  <input
                    autoFocus
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                    placeholder="e.g., IIT Delhi, AIIMS, Christ University"
                    className="w-full bg-[color:var(--surface-2)] border border-[color:var(--hairline)] rounded-xl px-4 py-3 outline-none transition focus:border-[#F472B6]"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1.5 block">Year</label>
                  <div className="flex flex-wrap gap-2">
                    {["1st Year", "2nd Year", "3rd Year", "Final Year", "Graduated", "Dropper"].map(y => (
                      <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          year === y
                            ? "bg-gold-gradient text-[#0B1120]"
                            : "bg-[color:var(--surface-2)] border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Focus */}
          {step === "focus" && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5" style={{ color: "#F472B6" }} />
                <h3 className="font-display font-bold text-xl">What are you preparing for?</h3>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-6">
                Select all that apply. This helps match you with the right study partners.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {categories.map(c => (
                  <button
                    key={c.slug}
                    onClick={() => toggleExam(c.slug)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left transition ${
                      examFocus.includes(c.slug)
                        ? "border-2"
                        : "border border-[color:var(--hairline)] bg-[color:var(--surface-2)]"
                    }`}
                    style={examFocus.includes(c.slug) ? {
                      borderColor: "#F472B6",
                      background: "color-mix(in oklab, #F472B6 8%, var(--surface-2))",
                    } : undefined}
                  >
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <div className="text-sm font-semibold">{c.name}</div>
                    </div>
                    {examFocus.includes(c.slug) && (
                      <Check className="h-4 w-4 ml-auto" style={{ color: "#F472B6" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Style */}
          {step === "style" && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5" style={{ color: "#F472B6" }} />
                <h3 className="font-display font-bold text-xl">How do you study?</h3>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-6">
                Your study style helps us match you with compatible partners.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { val: "visual" as StudyStyle, icon: "👀", label: "Visual", desc: "Diagrams & videos" },
                    { val: "audio" as StudyStyle, icon: "🎧", label: "Audio", desc: "Discussions & lectures" },
                    { val: "reading" as StudyStyle, icon: "📖", label: "Reading", desc: "Books & notes" },
                    { val: "hands-on" as StudyStyle, icon: "🛠️", label: "Hands-on", desc: "Practice & problems" },
                  ]).map(s => (
                    <button
                      key={s.val}
                      onClick={() => setStudyStyle(s.val)}
                      className={`p-4 rounded-xl text-left transition ${
                        studyStyle === s.val
                          ? "border-2"
                          : "border border-[color:var(--hairline)] bg-[color:var(--surface-2)]"
                      }`}
                      style={studyStyle === s.val ? {
                        borderColor: "#F472B6",
                        background: "color-mix(in oklab, #F472B6 8%, var(--surface-2))",
                      } : undefined}
                    >
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <div className="text-sm font-bold">{s.label}</div>
                      <div className="text-[10px] text-[color:var(--text-muted)]">{s.desc}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1.5 block">
                    <Users className="h-3 w-3 inline mr-1" />
                    Study Date Preference
                  </label>
                  <div className="flex gap-2">
                    {([
                      { val: "1v1" as GroupPref, label: "1-on-1" },
                      { val: "small-group" as GroupPref, label: "Group (3-4)" },
                      { val: "any" as GroupPref, label: "Any" },
                    ]).map(g => (
                      <button
                        key={g.val}
                        onClick={() => setGroupPref(g.val)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition ${
                          groupPref === g.val
                            ? "bg-rose-gradient text-[#0B1120]"
                            : "bg-[color:var(--surface-2)] border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1.5 block">Looking For</label>
                  <div className="flex flex-wrap gap-2">
                    {["Study Partner", "Accountability Buddy", "Group Study"].map(l => (
                      <button
                        key={l}
                        onClick={() => setLookingFor(l)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          lookingFor === l
                            ? "bg-gold-gradient text-[#0B1120]"
                            : "bg-[color:var(--surface-2)] border border-[color:var(--hairline)] text-[color:var(--text-secondary)]"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Bio */}
          {step === "bio" && (
            <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5" style={{ color: "#F472B6" }} />
                <h3 className="font-display font-bold text-xl">Show your personality</h3>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-6">
                Write a bio that makes people want to study with you!
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1.5 block">Your Bio</label>
                  <textarea
                    autoFocus
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="e.g., NEET aspirant grinding 10 hrs/day. Looking for someone to discuss anatomy with over chai ☕"
                    rows={4}
                    maxLength={200}
                    className="w-full bg-[color:var(--surface-2)] border border-[color:var(--hairline)] rounded-xl px-4 py-3 outline-none transition focus:border-[#F472B6] resize-none"
                  />
                  <div className="text-right text-xs text-[color:var(--text-muted)] mt-1">
                    {bio.length}/200
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-between">
            {stepIndex > 0 ? (
              <button
                onClick={prev}
                className="flex items-center gap-2 text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}

            <button
              onClick={next}
              disabled={!canProceed()}
              className="btn-pill bg-rose-gradient text-white px-6 py-3 font-semibold inline-flex items-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ boxShadow: canProceed() ? "var(--shadow-rose)" : "none" }}
            >
              {step === "bio" ? (
                <>
                  Find Study Dates <Heart className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
