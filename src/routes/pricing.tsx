import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Check, Sparkles, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="relative min-h-screen bg-[color:var(--background)]">
      <Navbar />

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="mesh-bg" />
        <div className="grain" />

        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-tight mb-6">
            Ditch Tinder.<br />
            <span style={{ color: "#FF6B9E" }}>Find someone sensible.</span>
          </h1>
          <p className="text-lg text-[color:var(--text-secondary)] max-w-2xl mx-auto mb-16">
            You're paying ₹850/mo on Tinder to swipe on people with no direction. For less than that, find someone who makes you smarter, sharper, and more consistent.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {/* Free */}
            <div className="surface-card p-8 rounded-[24px] border border-[color:var(--hairline)] flex flex-col">
              <h3 className="font-bold text-xl mb-2 text-[color:var(--text-primary)]">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-display font-extrabold">₹0</span>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-8">
                Basic matching to get you started. Includes 3 free Study Dates daily.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> 15 swipes per day
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> 1 Super Like daily
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> 3 Study Date rooms daily
                </li>
              </ul>
              <button className="w-full py-3.5 rounded-xl text-sm font-semibold border border-[color:var(--hairline)] hover:bg-[color:var(--surface-2)] transition">
                Current Plan
              </button>
            </div>

            {/* Pro - Highlighted */}
            <div className="relative surface-card p-8 rounded-[24px] border-2 flex flex-col" style={{ borderColor: "#FF6B9E", boxShadow: "0 8px 30px rgba(255,107,158,0.15)" }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF6B9E] text-[color:var(--background)] px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5" /> MOST POPULAR
              </div>
              <h3 className="font-bold text-xl mb-2 text-[color:var(--text-primary)] flex items-center gap-2">
                Pro <Sparkles className="w-4 h-4" style={{ color: "#FF6B9E" }} />
              </h3>
              <div className="mb-4 flex items-end gap-2">
                <span className="text-4xl font-display font-extrabold">₹149</span>
                <span className="text-[color:var(--text-muted)] mb-1">/mo</span>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-8">
                Less than a coffee. Unlimited swiping, see who liked you, and more.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-primary)] font-medium">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Unlimited Swipes
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-primary)] font-medium">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> See who liked you
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-primary)] font-medium">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Unlimited Study Rooms
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Streak Shield (save streaks)
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> 5 Super Likes daily
                </li>
              </ul>
              <button 
                className="w-full py-3.5 rounded-xl text-sm font-bold shadow-lg transition hover:opacity-90"
                style={{ background: "#FF6B9E", color: "#0B1120" }}>
                Upgrade to Pro
              </button>
            </div>

            {/* Campus */}
            <div className="surface-card p-8 rounded-[24px] border border-[color:var(--hairline)] flex flex-col">
              <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded bg-[color:var(--surface-2)] text-[color:var(--text-muted)] border border-[color:var(--hairline)]">
                BEST VALUE
              </div>
              <h3 className="font-bold text-xl mb-2 text-[color:var(--text-primary)] flex items-center gap-2">
                Campus <GraduationCap className="w-5 h-5" style={{ color: "#FF6B9E" }} />
              </h3>
              <div className="mb-4 flex items-end gap-2">
                <span className="text-4xl font-display font-extrabold">₹99</span>
                <span className="text-[color:var(--text-muted)] mb-1">/mo</span>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-8">
                Billed at ₹1,188/year. Exclusive pricing for verified college students (.edu email required).
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> All Pro Features included
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Verified Campus Badge
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Priority Matching
                </li>
              </ul>
              <button className="w-full py-3.5 rounded-xl text-sm font-semibold border border-[color:var(--hairline)] transition" style={{ color: "#FF6B9E", borderColor: "rgba(255,107,158,0.3)", background: "rgba(255,107,158,0.05)" }}>
                Verify & Save
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
