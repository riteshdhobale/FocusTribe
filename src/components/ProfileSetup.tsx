import { useState } from "react";
import { INTENTS, ACADEMIC_FOCUS, CAREER_GOALS, ALL_CITIES, AVAILABILITY, STUDY_FORMATS, INTERESTS, COLLEGES, isStudentEmail, type IntentValue } from "@/lib/constants";
import { saveMyProfile, savePreferences, type Profile, type Gender, type GroupPref } from "@/lib/profiles";
import { ProfilePreview } from "./ProfilePreview";
import * as Slider from "@radix-ui/react-slider";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Step = 1 | 2 | 3 | 4;

export function ProfileSetup({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const maxPhotos = 6;

  // Step 1
  const [name, setName] = useState("");
  const [age, setAge] = useState("21");
  const [city, setCity] = useState("");
  const [college, setCollege] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [genderPref, setGenderPref] = useState<"male" | "female" | "any">("any");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState("");
  const [photoError, setPhotoError] = useState("");

  // Step 2
  const [academicFocus, setAcademicFocus] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [availability, setAvailability] = useState("");
  const [ageRangePref, setAgeRangePref] = useState([18, 25]);

  // Step 3
  const [intents, setIntents] = useState<string[]>([]);
  const [studyFormats, setStudyFormats] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  // Step 4
  const [bio, setBio] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [groupPref, setGroupPref] = useState<GroupPref>("any");

  const addPhotoUrl = (rawUrl: string) => {
    const url = rawUrl.trim();
    if (!url) return;
    if (photoUrls.length >= maxPhotos) {
      setPhotoError(`You can add up to ${maxPhotos} photos.`);
      return;
    }
    if (photoUrls.includes(url)) {
      setPhotoError("That photo is already added.");
      return;
    }
    setPhotoUrls(prev => [...prev, url]);
    setPhotoInput("");
    setPhotoError("");
  };

  const handlePhotoFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = Math.max(0, maxPhotos - photoUrls.length);
    const selected = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setPhotoError(`Only ${remaining} more photo${remaining === 1 ? "" : "s"} can be added.`);
    }
    selected.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setPhotoUrls(prev => (prev.length < maxPhotos ? [...prev, result] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const makePrimary = (idx: number) => {
    setPhotoUrls(prev => [prev[idx], ...prev.filter((_, i) => i !== idx)]);
  };

  const toggleChip = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const titles: Record<Step, { title: string; subtitle: string; why: string }> = {
    1: {
      title: "Tell people who you are",
      subtitle: "StudyDate is for ambitious people who want chemistry with direction. Profiles are 18+ and built around trust, intent, and academic alignment.",
      why: "Better filters create better matches. The more honest you are about your ambition, style, and intent, the more likely you are to find a study date that actually works in real life."
    },
    2: {
      title: "Map your academic ambition",
      subtitle: "StudyDate is for ambitious people who want chemistry with direction. Profiles are 18+ and built around trust, intent, and academic alignment.",
      why: "Better filters create better matches. The more honest you are about your ambition, style, and intent, the more likely you are to find a study date that actually works in real life."
    },
    3: {
      title: "Choose your study-date vibe",
      subtitle: "StudyDate is for ambitious people who want chemistry with direction. Profiles are 18+ and built around trust, intent, and academic alignment.",
      why: "Better filters create better matches. The more honest you are about your ambition, style, and intent, the more likely you are to find a study date that actually works in real life."
    },
    4: {
      title: "Set your filters and go live",
      subtitle: "StudyDate is for ambitious people who want chemistry with direction. Profiles are 18+ and built around trust, intent, and academic alignment.",
      why: "Better filters create better matches. The more honest you are about your ambition, style, and intent, the more likely you are to find a study date that actually works in real life."
    },
  };

  const canContinue = (): boolean => {
    if (step === 1) return name.trim().length > 0 && city.length > 0 && college.length > 0 && photoUrls.length >= 2;
    if (step === 2) return academicFocus.length > 0 && careerGoal.length > 0;
    if (step === 3) return studyFormats.length > 0;
    if (step === 4) return bio.trim().length > 0;
    return false;
  };

  const handleFinish = () => {
    const profile: Profile = {
      id: "me_" + Date.now(),
      name: name.trim(),
      age: parseInt(age) || 21,
      gender,
      city,
      college,
      year: "Student",
      examFocus: academicFocus ? [academicFocus] : ["general"],
      careerGoal: careerGoal || "General",
      bio: bio.trim(),
      studyStyle: "visual",
      intent: intents.join(","),
      studyFormats,
      interests,
      availability: availability || "Flexible",
      lookingForPrompt: lookingFor.trim(),
      avatarColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      avatarEmoji: ["📚", "🎯", "💡", "🧠", "⚡"][Math.floor(Math.random() * 5)],
      isOnline: true,
      hoursStudied: 0,
      streak: 0,
      groupPref,
      genderPref,
      studentEmail: studentEmail.trim() || undefined,
      isVerified: emailVerified,
      isPro: false,
      photoUrls: photoUrls.slice(0, maxPhotos),
    };
    saveMyProfile(profile);

    savePreferences({
      ageRange: { min: ageRangePref[0], max: ageRangePref[1] },
      genderPref,
      examFocus: academicFocus ? [academicFocus] : [],
      colleges: [],
      cities: [],
      locationMode: "my-city",
      groupPref,
      onlineOnly: false,
      intent: intents,
      careerGoals: [],
    } as any);

    onComplete();
  };

  const { title, subtitle, why } = titles[step];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "var(--bg-main)" }}>
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel — Motivational */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border" style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "var(--rose-accent)" }}>Profile Setup</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{step} / 4</span>
            </div>

            {/* Progress bar */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="h-1 flex-1 rounded-full transition-all" style={{ background: s <= step ? "var(--rose-accent)" : "var(--hairline)" }} />
              ))}
            </div>

            <h1 className="font-display font-extrabold text-3xl mb-4" style={{ color: "var(--text-primary)" }}>{title}</h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
          </div>

          <div className="p-6 rounded-2xl border" style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}>
            <span className="text-xs font-mono tracking-widest uppercase mb-3 block" style={{ color: "var(--text-muted)" }}>Why this matters</span>
            <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--text-primary)" }}>Better filters create better matches</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{why}</p>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="p-6 rounded-2xl border" style={{ borderColor: "var(--gold-soft)", background: "var(--bg-card)" }}>
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>First name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)", "--tw-ring-color": "var(--rose-accent)" } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Age</label>
                  <input type="number" value={age} onChange={e => setAge(e.target.value)} min={18} max={40}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)", "--tw-ring-color": "var(--rose-accent)" } as React.CSSProperties} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>City</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)", "--tw-ring-color": "var(--rose-accent)" } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>College / University</label>
                  <input value={college} onChange={e => setCollege(e.target.value)} placeholder="Enter college name"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)", "--tw-ring-color": "var(--rose-accent)" } as React.CSSProperties} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Gender</label>
                <div className="flex gap-2">
                  {(["male", "female", "non-binary"] as const).map(g => (
                    <button key={g} onClick={() => setGender(g)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition border"
                      style={{
                        background: gender === g ? "var(--rose-accent)" : "transparent",
                        borderColor: gender === g ? "var(--rose-accent)" : "var(--hairline)",
                        color: gender === g ? "#0B1120" : "var(--text-secondary)",
                      }}>
                      {g === "male" ? "Male" : g === "female" ? "Female" : "Non-binary"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Show me</label>
                <div className="flex gap-2">
                  {(["any", "male", "female"] as const).map(g => (
                    <button key={g} onClick={() => setGenderPref(g)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition border"
                      style={{
                        background: genderPref === g ? "var(--rose-accent)" : "transparent",
                        borderColor: genderPref === g ? "var(--rose-accent)" : "var(--hairline)",
                        color: genderPref === g ? "#0B1120" : "var(--text-secondary)",
                      }}>
                      {g === "any" ? "Everyone" : g === "male" ? "Boys" : "Girls"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Profile photos</label>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Add at least 2 · first is cover</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: maxPhotos }).map((_, idx) => {
                    const url = photoUrls[idx];
                    return (
                      <div key={`photo-slot-${idx}`} className="relative aspect-[3/4] rounded-xl border overflow-hidden"
                        style={{ borderColor: "var(--hairline)", background: "var(--bg-main)" }}>
                        {url ? (
                          <img src={url} alt={`Profile ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                            + Add
                          </div>
                        )}

                        {url && (
                          <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
                            {idx === 0 ? (
                              <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(15,23,42,0.7)", color: "#fff" }}>
                                Cover
                              </span>
                            ) : (
                              <button type="button" onClick={() => makePrimary(idx)}
                                className="text-[10px] px-2 py-1 rounded-full"
                                style={{ background: "rgba(15,23,42,0.7)", color: "#fff" }}>
                                Make cover
                              </button>
                            )}
                            <button type="button" onClick={() => removePhoto(idx)}
                              className="text-[10px] px-2 py-1 rounded-full"
                              style={{ background: "rgba(239,68,68,0.8)", color: "#fff" }}>
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex gap-2">
                  <input type="url" value={photoInput} onChange={e => setPhotoInput(e.target.value)} placeholder="Paste image URL"
                    className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none"
                    style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)" }} />
                  <button type="button" onClick={() => addPhotoUrl(photoInput)}
                    className="px-4 rounded-xl text-sm font-semibold transition"
                    style={{ background: "var(--rose-accent)", color: "#0B1120" }}>
                    Add
                  </button>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Upload photos</label>
                  <input type="file" accept="image/*" multiple
                    onChange={e => handlePhotoFiles(e.target.files)}
                    className="mt-2 w-full text-xs"
                    style={{ color: "var(--text-muted)" }} />
                </div>

                {photoError && (
                  <p className="text-xs mt-2" style={{ color: "#F97316" }}>{photoError}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Academic focus</label>
                  <input value={academicFocus} onChange={e => setAcademicFocus(e.target.value)} placeholder="e.g. B.Tech Sem 4, JEE, etc."
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)", "--tw-ring-color": "var(--rose-accent)" } as React.CSSProperties} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Career goal</label>
                  <input value={careerGoal} onChange={e => setCareerGoal(e.target.value)} placeholder="e.g. Software Engineer, Doctor"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition focus:ring-2"
                    style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)", "--tw-ring-color": "var(--rose-accent)" } as React.CSSProperties} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Availability</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)" }}>
                  <option value="">Choose one</option>
                  {AVAILABILITY.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Age range preference</label>
                  <span className="text-sm font-semibold" style={{ color: "var(--rose-accent)" }}>
                    {ageRangePref[0]} - {ageRangePref[1] === 40 ? "40+" : ageRangePref[1]}
                  </span>
                </div>
                <div className="px-2 pt-2 pb-4">
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    value={ageRangePref}
                    min={18} max={40} step={1}
                    onValueChange={setAgeRangePref}
                  >
                    <Slider.Track className="bg-gray-800 relative grow rounded-full h-1.5" style={{ background: "var(--hairline)" }}>
                      <Slider.Range className="absolute rounded-full h-full" style={{ background: "var(--rose-accent)" }} />
                    </Slider.Track>
                    <Slider.Thumb className="block w-5 h-5 rounded-full shadow transition-transform hover:scale-110 focus:outline-none focus:ring-2" style={{ background: "#fff", borderColor: "var(--hairline)", borderWidth: 1, "--tw-ring-color": "var(--rose-accent)" } as React.CSSProperties} />
                    <Slider.Thumb className="block w-5 h-5 rounded-full shadow transition-transform hover:scale-110 focus:outline-none focus:ring-2" style={{ background: "#fff", borderColor: "var(--hairline)", borderWidth: 1, "--tw-ring-color": "var(--rose-accent)" } as React.CSSProperties} />
                  </Slider.Root>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>What do you want here?</label>
                <div className="flex flex-wrap gap-2">
                  {INTENTS.map(i => (
                    <button key={i.value} onClick={() => toggleChip(intents, i.value, setIntents)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition border"
                      style={{
                        background: intents.includes(i.value) ? "var(--rose-accent)" : "transparent",
                        borderColor: intents.includes(i.value) ? "var(--rose-accent)" : "var(--hairline)",
                        color: intents.includes(i.value) ? "#0B1120" : "var(--text-secondary)",
                      }}>
                      {i.emoji} {i.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>Preferred study formats</label>
                <div className="flex flex-wrap gap-2">
                  {STUDY_FORMATS.map(f => (
                    <button key={f} onClick={() => toggleChip(studyFormats, f, setStudyFormats)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition border"
                      style={{
                        background: studyFormats.includes(f) ? "var(--rose-accent)" : "transparent",
                        borderColor: studyFormats.includes(f) ? "var(--rose-accent)" : "var(--hairline)",
                        color: studyFormats.includes(f) ? "#0B1120" : "var(--text-secondary)",
                      }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>Interests and personality</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(i => (
                    <button key={i} onClick={() => toggleChip(interests, i, setInterests)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition border"
                      style={{
                        background: interests.includes(i) ? "var(--rose-accent)" : "transparent",
                        borderColor: interests.includes(i) ? "var(--rose-accent)" : "var(--hairline)",
                        color: interests.includes(i) ? "#0B1120" : "var(--text-secondary)",
                      }}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Short bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} maxLength={300}
                  placeholder="What kind of person are you hoping to meet and study with?"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none"
                  style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)" }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Looking for <span style={{ color: "var(--text-muted)" }}>(optional)</span></label>
                <input value={lookingFor} onChange={e => setLookingFor(e.target.value)} maxLength={150}
                  placeholder="e.g. Someone ambitious and consistent for the long game"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)" }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                  Student email <span style={{ color: "var(--text-muted)" }}>(optional · for 🎓 verification)</span>
                </label>
                <div className="flex gap-2">
                  <input value={studentEmail} onChange={e => { setStudentEmail(e.target.value); setShowOtp(false); setEmailVerified(false); }}
                    disabled={emailVerified}
                    placeholder="you@college.ac.in or you@university.edu"
                    className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none disabled:opacity-50"
                    style={{ background: "var(--bg-main)", borderColor: "var(--hairline)", color: "var(--text-primary)" }} />
                  {!emailVerified && isStudentEmail(studentEmail.trim()) && (
                    <button onClick={() => setShowOtp(true)} className="px-4 rounded-xl text-sm font-semibold transition"
                      style={{ background: "var(--rose-accent)", color: "#0B1120" }}>
                      Send Code
                    </button>
                  )}
                </div>

                {emailVerified && (
                  <p className="text-xs mt-2 font-medium" style={{ color: "#10B981" }}>
                    ✓ Email verified! You'll get the 🎓 Campus badge.
                  </p>
                )}

                {showOtp && !emailVerified && (
                  <div className="mt-4 p-4 rounded-xl border animate-in fade-in zoom-in-95 duration-200" style={{ background: "var(--bg-main)", borderColor: "var(--hairline)" }}>
                    <p className="text-xs mb-3 font-medium" style={{ color: "var(--text-secondary)" }}>
                      Enter the 6-digit code sent to your email. (Since we are in demo mode, type any 6 digits).
                    </p>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otpValue} onChange={val => {
                        setOtpValue(val);
                        if (val.length === 6) {
                          // Simulate OTP verification success
                          setEmailVerified(true);
                          setShowOtp(false);
                        }
                      }}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Study group size</label>
                <div className="flex gap-2">
                  {([["1v1", "1-on-1"], ["small-group", "Small group (3-4)"], ["any", "Any"]] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setGroupPref(val as GroupPref)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition border"
                      style={{
                        background: groupPref === val ? "var(--rose-accent)" : "transparent",
                        borderColor: groupPref === val ? "var(--rose-accent)" : "var(--hairline)",
                        color: groupPref === val ? "#0B1120" : "var(--text-secondary)",
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Preview */}
              <ProfilePreview
                name={name} age={parseInt(age) || 21} college={college}
                city={city} examFocus={academicFocus} careerGoal={careerGoal}
                intent={intents.join(",")} studyFormats={studyFormats} interests={interests}
                photoUrl={photoUrls[0]}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep((step - 1) as Step)}
                className="flex items-center gap-2 text-sm font-medium transition"
                style={{ color: "var(--text-secondary)" }}>
                ← Previous
              </button>
            ) : <div />}

            {step < 4 ? (
              <button onClick={() => canContinue() && setStep((step + 1) as Step)}
                disabled={!canContinue()}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition"
                style={{
                  background: canContinue() ? "var(--rose-accent)" : "var(--hairline)",
                  color: canContinue() ? "#0B1120" : "var(--text-muted)",
                  cursor: canContinue() ? "pointer" : "not-allowed",
                }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleFinish} disabled={!canContinue()}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition"
                style={{
                  background: canContinue() ? "var(--rose-accent)" : "var(--hairline)",
                  color: canContinue() ? "#0B1120" : "var(--text-muted)",
                  cursor: canContinue() ? "pointer" : "not-allowed",
                }}>
                Enter discover →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
