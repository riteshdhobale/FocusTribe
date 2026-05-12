import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Shield, Lock, Heart } from "lucide-react";

export const Route = createFileRoute("/safety")({
  component: SafetyPage,
  head: () => ({ meta: [{ title: "Safety & Trust — StudyDate" }] }),
});

function SafetyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-16 pb-24">
        <div className="text-center mb-16">
          <span
            className="inline-block text-xs font-mono tracking-widest uppercase px-4 py-1.5 rounded-full border mb-6"
            style={{ borderColor: "var(--hairline)", color: "var(--text-muted)" }}
          >
            Safety and Trust
          </span>
          <h1
            className="font-display font-extrabold text-4xl md:text-5xl mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Built for serious people,
            <br />
            not chaos
          </h1>
          <p className="text-base max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
            StudyDate is designed to help ambitious students connect safely, study effectively, and
            build meaningful relationships around shared goals.
          </p>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div
            className="p-6 rounded-2xl border"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "rgba(201,165,78,0.15)" }}
            >
              <Shield className="w-5 h-5" style={{ color: "var(--rose-accent)" }} />
            </div>
            <h3 className="font-semibold text-base mb-2" style={{ color: "var(--text-primary)" }}>
              18+ and respectful
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Dating flows are adult-only with clear conduct expectations and profile controls. Zero
              tolerance for harassment.
            </p>
          </div>

          <div
            className="p-6 rounded-2xl border"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "rgba(201,165,78,0.15)" }}
            >
              <Lock className="w-5 h-5" style={{ color: "var(--rose-accent)" }} />
            </div>
            <h3 className="font-semibold text-base mb-2" style={{ color: "var(--text-primary)" }}>
              Academic authenticity
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Profiles emphasize college, goals, and ambition so conversations start with trust and
              context. Verify with your .edu email.
            </p>
          </div>

          <div
            className="p-6 rounded-2xl border"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "rgba(201,165,78,0.15)" }}
            >
              <Heart className="w-5 h-5" style={{ color: "var(--rose-accent)" }} />
            </div>
            <h3 className="font-semibold text-base mb-2" style={{ color: "var(--text-primary)" }}>
              Intent-forward matching
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Users declare whether they want study partners, accountability buddies, friends-first
              chemistry, or meaningful dating.
            </p>
          </div>
        </div>

        {/* How we protect you */}
        <div className="space-y-8">
          <h2
            className="font-display font-bold text-2xl text-center mb-8"
            style={{ color: "var(--text-primary)" }}
          >
            How we protect you
          </h2>

          {[
            {
              title: "No contact exchange until goals are met",
              desc: "Phone numbers, social handles, and emails are blocked in chat until both users complete shared study goals together. Contacts are earned, not exchanged.",
              icon: "🔒",
            },
            {
              title: "Text-only chat — no mic, no calls",
              desc: "In-app chat is text-only by design. Voice and video are only available inside study date rooms where sessions are timed and tracked.",
              icon: "💬",
            },
            {
              title: "Student email verification",
              desc: "Verify your .edu or .ac.in email to earn the 🎓 Campus badge. Verified profiles are trusted more and matched with higher priority.",
              icon: "🎓",
            },
            {
              title: "Report and block instantly",
              desc: "Every profile and message has a report button. Reported users are reviewed within 24 hours. Blocked users can never contact you again.",
              icon: "🚫",
            },
            {
              title: "Camera-on accountability",
              desc: "Study date rooms default to camera-on, microphone-muted. This creates a library-like atmosphere of focused, silent study.",
              icon: "📸",
            },
            {
              title: "No AI-generated photos",
              desc: "We require real photos of real people. AI-generated, filtered, or group photos are flagged and removed during review.",
              icon: "🤖",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-4 p-5 rounded-2xl border"
              style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="text-center mt-16 p-8 rounded-3xl border"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-card)" }}
        >
          <h3
            className="font-display font-bold text-xl mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Ready to find your study date?
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            It's free, it's safe, and it's built for people like you.
          </p>
          <a
            href="/discover"
            className="inline-block px-8 py-3.5 rounded-xl text-sm font-semibold"
            style={{ background: "var(--rose-accent)", color: "#0B1120" }}
          >
            Start matching →
          </a>
        </div>
      </div>
    </div>
  );
}
