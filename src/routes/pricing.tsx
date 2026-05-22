import { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { usePayment } from "@/hooks/usePayment";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";
import { type PlanId } from "@/lib/razorpay";
import {
  getRegionPricing,
  formatPrice,
  formatMrp,
  discountPercent,
  getPaymentProvider,
} from "@/lib/geoPrice";
import { toast } from "sonner";
import {
  Check,
  Sparkles,
  GraduationCap,
  Zap,
  Flame,
  Tv,
  Music,
  Target,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — StudyDate" },
      {
        name: "description",
        content:
          "StudyDate Pro: Unlimited study rooms, streaks, and matching. Half the price of the competition.",
      },
    ],
  }),
});

function PricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    checkout,
    loading: paymentLoading,
    error: paymentError,
    success: paymentSuccess,
    clearError,
    clearSuccess,
    isConfigured,
  } = usePayment();
  const { plan: currentPlan, isPro, inReverseTrial, trialDaysLeft } = useSubscription();

  // Detect pricing region & payment provider
  const pricing = useMemo(() => getRegionPricing(), []);
  const sym = pricing.currencySymbol;
  const provider = useMemo(() => getPaymentProvider(), []);

  const handleUpgrade = async (planId: PlanId) => {
    console.log("[Pricing] handleUpgrade called:", { planId, isAuthenticated, isConfigured, provider });

    if (!isAuthenticated) {
      toast.error("Please sign in first to upgrade your plan.");
      navigate({ to: "/discover" });
      return;
    }

    toast.loading("Opening checkout...", { id: "payment-loading" });

    try {
      const result = await checkout(planId);
      toast.dismiss("payment-loading");
      console.log("[Pricing] checkout result:", result);

      if (result.success) {
        toast.success("Payment successful! Welcome to StudyDate Pro 🎉");
        setTimeout(() => window.location.reload(), 2000);
      } else if (result.error && result.error !== "Payment cancelled") {
        toast.error(result.error || "Payment failed. Please try again.");
      }
    } catch (err: any) {
      toast.dismiss("payment-loading");
      console.error("[Pricing] checkout error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    }
  };

  // Entertainment comparison (geo-aware)
  const comparisons =
    pricing.region === "india"
      ? [
          {
            app: "Dating Apps",
            price: "₹500+",
            icon: (
              <div className="flex justify-center items-center gap-2 -ml-2">
                <img
                  src="https://cdn.simpleicons.org/tinder/FE3C72"
                  alt="Tinder"
                  className="w-7 h-7 drop-shadow-md"
                />
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 drop-shadow-md"
                  fill="#FFC629"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0zm5.176 17.525a.863.863 0 0 1-.863.863H7.688a.863.863 0 0 1-.863-.863v-1.638a.863.863 0 0 1 .863-.863h8.625a.863.863 0 0 1 .863.863v1.638zm1.962-4.088a.863.863 0 0 1-.863.863H5.725a.863.863 0 0 1-.863-.863v-1.638a.863.863 0 0 1 .863-.863h12.55a.863.863 0 0 1 .863.863v1.638zm-2.887-4.088a.863.863 0 0 1-.863.863H8.612a.863.863 0 0 1-.863-.863V7.71a.863.863 0 0 1 .863-.863h6.775a.863.863 0 0 1 .863.863v1.639z" />
                </svg>
              </div>
            ),
            note: "Swipes that go nowhere",
            per: "/mo",
            type: "waste" as const,
          },
          {
            app: "Netflix",
            price: "₹199",
            icon: (
              <img
                src="https://cdn.simpleicons.org/netflix/E50914"
                alt="Netflix"
                className="w-9 h-9 mx-auto drop-shadow-md"
              />
            ),
            note: "Hours lost to autoplay",
            per: "/mo",
            type: "waste" as const,
          },
          {
            app: "Spotify",
            price: "₹139",
            icon: (
              <img
                src="https://cdn.simpleicons.org/spotify/1DB954"
                alt="Spotify"
                className="w-9 h-9 mx-auto drop-shadow-md"
              />
            ),
            note: "Background noise",
            per: "/mo",
            type: "waste" as const,
          },
          {
            app: "StudyDate Pro",
            price: formatPrice(pricing.plans.pro.amount, sym),
            icon: (
              <Target
                className="w-10 h-10 mx-auto"
                style={{ color: "#FF6B9E", filter: "drop-shadow(0 0 8px rgba(255,107,158,0.5))" }}
              />
            ),
            note: "Builds your actual future",
            per: "/mo",
            highlight: true,
            type: "growth" as const,
          },
        ]
      : [
          {
            app: "Dating Apps",
            price: "$25+",
            icon: (
              <div className="flex justify-center items-center gap-2 -ml-2">
                <img
                  src="https://cdn.simpleicons.org/tinder/FE3C72"
                  alt="Tinder"
                  className="w-7 h-7 drop-shadow-md"
                />
                <svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 drop-shadow-md"
                  fill="#FFC629"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0zm5.176 17.525a.863.863 0 0 1-.863.863H7.688a.863.863 0 0 1-.863-.863v-1.638a.863.863 0 0 1 .863-.863h8.625a.863.863 0 0 1 .863.863v1.638zm1.962-4.088a.863.863 0 0 1-.863.863H5.725a.863.863 0 0 1-.863-.863v-1.638a.863.863 0 0 1 .863-.863h12.55a.863.863 0 0 1 .863.863v1.638zm-2.887-4.088a.863.863 0 0 1-.863.863H8.612a.863.863 0 0 1-.863-.863V7.71a.863.863 0 0 1 .863-.863h6.775a.863.863 0 0 1 .863.863v1.639z" />
                </svg>
              </div>
            ),
            note: "Swipes that go nowhere",
            per: "/mo",
            type: "waste" as const,
          },
          {
            app: "Netflix",
            price: "$15.49",
            icon: (
              <img
                src="https://cdn.simpleicons.org/netflix/E50914"
                alt="Netflix"
                className="w-9 h-9 mx-auto drop-shadow-md"
              />
            ),
            note: "Hours lost to autoplay",
            per: "/mo",
            type: "waste" as const,
          },
          {
            app: "Spotify",
            price: "$11.99",
            icon: (
              <img
                src="https://cdn.simpleicons.org/spotify/1DB954"
                alt="Spotify"
                className="w-9 h-9 mx-auto drop-shadow-md"
              />
            ),
            note: "Background noise",
            per: "/mo",
            type: "waste" as const,
          },
          {
            app: "StudyDate Pro",
            price: formatPrice(pricing.plans.pro.amount, sym),
            icon: (
              <Target
                className="w-10 h-10 mx-auto"
                style={{ color: "#FF6B9E", filter: "drop-shadow(0 0 8px rgba(255,107,158,0.5))" }}
              />
            ),
            note: "Builds your actual future",
            per: "/mo",
            highlight: true,
            type: "growth" as const,
          },
        ];

  const proDiscount = discountPercent(pricing.plans.pro.mrp, pricing.plans.pro.amount);
  const campusDiscount = discountPercent(pricing.plans.campus.mrp, pricing.plans.campus.amount);
  const weeklyDiscount = discountPercent(pricing.plans.weekly.mrp, pricing.plans.weekly.amount);

  return (
    <div className="relative min-h-screen bg-[color:var(--background)]">
      <Navbar />

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="mesh-bg" />
        <div className="grain" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Trial banner */}
          {inReverseTrial && trialDaysLeft > 0 && (
            <div
              className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm animate-fade-up"
              style={{
                borderColor: "rgba(255,107,158,0.4)",
                background: "rgba(255,107,158,0.08)",
                color: "#FF6B9E",
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                You're on a <strong>free Pro trial</strong> — {trialDaysLeft} days left. Upgrade to
                keep your streak!
              </span>
            </div>
          )}

          {/* Payment feedback */}
          {paymentSuccess && (
            <div
              className="mb-8 inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm animate-fade-up"
              style={{
                borderColor: "rgba(16,185,129,0.4)",
                background: "rgba(16,185,129,0.08)",
                color: "#10B981",
              }}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                <strong>Payment successful!</strong> Welcome to StudyDate Pro. Your subscription is
                now active.
              </span>
            </div>
          )}

          {paymentError && paymentError !== "Payment cancelled" && (
            <div
              className="mb-8 inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm animate-fade-up cursor-pointer"
              onClick={clearError}
              style={{
                borderColor: "rgba(239,68,68,0.4)",
                background: "rgba(239,68,68,0.08)",
                color: "#EF4444",
              }}
            >
              <AlertCircle className="w-5 h-5" />
              <span>
                {paymentError} <span className="underline opacity-60 ml-1">Dismiss</span>
              </span>
            </div>
          )}

          <h1 className="font-display font-extrabold text-4xl md:text-5xl md:text-[3.5rem] tracking-tight leading-tight mb-6">
            Stop paying for small talk.
            <br />
            <span className="text-rose-gradient">Start matching with ambition.</span>
          </h1>
          <p className="text-lg text-[color:var(--text-secondary)] max-w-2xl mx-auto mb-12">
            {pricing.region === "india"
              ? "You're paying ₹500+/mo on dating apps to swipe on people with no direction. For less than that, find someone who makes you smarter, sharper, and more consistent."
              : "You're paying $25+/mo on dating apps to swipe on people with no direction. For a fraction of that, find someone who makes you smarter, sharper, and more consistent."}
          </p>

          {/* Psychological price comparison (Anchoring effect) */}
          <div
            className="mb-20 surface-card p-8 md:p-10 rounded-[32px] relative overflow-hidden"
            style={{ borderColor: "rgba(255,107,158,0.15)" }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B9E] rounded-full filter blur-[100px] opacity-[0.15] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full filter blur-[100px] opacity-10 pointer-events-none"></div>

            <div className="relative z-10">
              <p
                className="text-[10px] font-mono tracking-widest uppercase text-center mb-2"
                style={{ color: "var(--rose-accent)" }}
              >
                Put it in perspective
              </p>
              <h2
                className="text-2xl md:text-3xl font-display font-bold text-center mb-8"
                style={{ color: "var(--text-primary)" }}
              >
                You already pay to <span style={{ opacity: 0.6 }}>consume</span>.
                <br className="hidden md:block" /> What if you paid the same to{" "}
                <span className="text-rose-gradient">actually grow</span>?
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {comparisons.map((item) => (
                  <div
                    key={item.app}
                    className="p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 flex flex-col h-full"
                    style={{
                      borderColor: item.highlight ? "rgba(255,107,158,0.5)" : "var(--hairline)",
                      background: item.highlight ? "rgba(255,107,158,0.08)" : "rgba(15,23,42,0.4)",
                      boxShadow: item.highlight ? "0 0 40px rgba(255,107,158,0.15)" : "none",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="mb-4 transition-transform group-hover:scale-110">
                      {item.icon}
                    </div>
                    <div
                      className={`text-2xl font-display font-extrabold ${item.highlight ? "text-rose-gradient" : ""}`}
                    >
                      {item.price}
                      <span className="text-xs font-normal text-[color:var(--text-muted)]">
                        {item.per}
                      </span>
                    </div>
                    <div
                      className="text-sm font-bold mt-2 mb-3"
                      style={{ color: item.highlight ? "#FF6B9E" : "var(--text-primary)" }}
                    >
                      {item.app}
                    </div>

                    <div
                      className="mt-auto pt-3 border-t"
                      style={{
                        borderColor: item.highlight ? "rgba(255,107,158,0.2)" : "var(--hairline)",
                      }}
                    >
                      <div
                        className={`text-xs font-semibold leading-snug ${item.type === "waste" ? "text-red-400/80" : "text-[#FF6B9E]"}`}
                      >
                        {item.note}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p
                className="text-center text-sm md:text-base mt-10 max-w-2xl mx-auto leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Three of these drain your time.{" "}
                <span className="font-semibold" style={{ color: "#FF6B9E" }}>
                  One gives it back.
                </span>
                <br />
                <span
                  className="text-xs md:text-sm mt-3 block px-4 py-3 rounded-xl border border-[color:var(--hairline)] bg-[color:var(--surface-2)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  💡 Think of it as your{" "}
                  <span className="font-semibold text-rose-gradient">virtual co-working space</span>
                  . Join focused sprints from your desk, your hostel, or your café. Real
                  accountability with people who get it.
                </span>
              </p>
            </div>
          </div>

          {/* Founding Member Banner */}
          <div
            className="mb-10 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border animate-fade-up"
            style={{
              borderColor: "rgba(255,107,158,0.3)",
              background:
                "linear-gradient(135deg, rgba(255,107,158,0.06) 0%, rgba(124,58,237,0.06) 100%)",
            }}
          >
            <Clock className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} />
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              <strong className="text-rose-gradient">Founding Member Price</strong> — Lock in
              today's price forever. Prices increase to {formatMrp(pricing.plans.pro.mrp, sym)}/mo
              for new members in 2027.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {/* Free */}
            <div className="surface-card p-8 rounded-[24px] border border-[color:var(--hairline)] flex flex-col">
              <h3 className="font-bold text-xl mb-2 text-[color:var(--text-primary)]">Free</h3>
              <div className="mb-4">
                <span className="text-4xl font-display font-extrabold">{sym}0</span>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-8">
                3 hours of study time every day, forever free. No credit card needed.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> 3 hours daily
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> All exam
                  categories
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Pomodoro timer
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Task tracker
                </li>
              </ul>
              <button
                disabled={currentPlan === "free" && !isPro}
                className="w-full py-3.5 rounded-xl text-sm font-semibold border border-[color:var(--hairline)] hover:bg-[color:var(--surface-2)] transition disabled:opacity-50"
              >
                {currentPlan === "free" && !isPro ? "Current Plan" : "Downgrade"}
              </button>
            </div>

            {/* Pro - Highlighted */}
            <div
              className="relative surface-card p-8 rounded-[24px] border-2 flex flex-col"
              style={{ borderColor: "#FF6B9E", boxShadow: "0 8px 30px rgba(255,107,158,0.15)" }}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF6B9E] text-[color:var(--background)] px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3.5 h-3.5" /> MOST POPULAR
              </div>
              <h3 className="font-bold text-xl mb-2 text-[color:var(--text-primary)] flex items-center gap-2">
                Pro <Sparkles className="w-4 h-4" style={{ color: "#FF6B9E" }} />
              </h3>
              <div className="mb-1 flex items-end gap-2">
                <span
                  className="text-lg line-through opacity-40"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatMrp(pricing.plans.pro.mrp, sym)}
                </span>
              </div>
              <div className="mb-2 flex items-end gap-2">
                <span className="text-4xl font-display font-extrabold">
                  {formatPrice(pricing.plans.pro.amount, sym)}
                </span>
                <span className="text-[color:var(--text-muted)] mb-1">/mo</span>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,107,158,0.15)", color: "#FF6B9E" }}
                >
                  {proDiscount}% OFF
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {pricing.plans.pro.perDay}
                </span>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-8">
                Less than a coffee. Unlimited swiping, see who liked you, and more.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-primary)] font-medium">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Unlimited
                  Swipes
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-primary)] font-medium">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> See who liked
                  you
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-primary)] font-medium">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Unlimited
                  Study Rooms
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Streak Shield
                  (save streaks)
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> 5 Super Likes
                  daily
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <span className="w-5 h-5 shrink-0 text-base leading-none">⚡</span>
                  <span><strong>3 Sparks / month</strong> — priority highlighted likes</span>
                </li>
              </ul>
              <button
                onClick={() => handleUpgrade("pro")}
                disabled={paymentLoading || (isPro && currentPlan === "pro")}
                className="w-full py-3.5 rounded-xl text-sm font-bold shadow-lg transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "#FF6B9E", color: "#0B1120" }}
                id="upgrade-pro-btn"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : isPro && currentPlan === "pro" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Current Plan
                  </>
                ) : (
                  "Upgrade to Pro"
                )}
              </button>
            </div>

            {/* Campus */}
            <div className="surface-card p-8 rounded-[24px] border border-[color:var(--hairline)] flex flex-col relative">
              <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded bg-[color:var(--surface-2)] text-[color:var(--text-muted)] border border-[color:var(--hairline)]">
                BEST VALUE
              </div>
              <h3 className="font-bold text-xl mb-2 text-[color:var(--text-primary)] flex items-center gap-2">
                Campus <GraduationCap className="w-5 h-5" style={{ color: "#FF6B9E" }} />
              </h3>
              <div className="mb-1 flex items-end gap-2">
                <span
                  className="text-lg line-through opacity-40"
                  style={{ color: "var(--text-muted)" }}
                >
                  {formatMrp(pricing.plans.campus.mrp, sym)}/yr
                </span>
              </div>
              <div className="mb-2 flex items-end gap-2">
                <span className="text-4xl font-display font-extrabold">
                  {pricing.plans.campus.perMonth}
                </span>
                <span className="text-[color:var(--text-muted)] mb-1">/mo</span>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,107,158,0.15)", color: "#FF6B9E" }}
                >
                  {campusDiscount}% OFF
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Billed {formatPrice(pricing.plans.campus.amount, sym)}/yr
                </span>
              </div>
              <p className="text-sm text-[color:var(--text-secondary)] mb-8">
                Annual plan for verified college students. Requires .edu / .ac.in email.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> All Pro
                  Features included
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Verified
                  Campus Badge
                </li>
                <li className="flex items-start gap-3 text-sm text-[color:var(--text-secondary)]">
                  <Check className="w-5 h-5 shrink-0" style={{ color: "#FF6B9E" }} /> Priority
                  Matching
                </li>
              </ul>
              <button
                onClick={() => handleUpgrade("campus")}
                disabled={paymentLoading || (isPro && currentPlan === "campus")}
                className="w-full py-3.5 rounded-xl text-sm font-semibold border border-[color:var(--hairline)] transition flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  color: "#FF6B9E",
                  borderColor: "rgba(255,107,158,0.3)",
                  background: "rgba(255,107,158,0.05)",
                }}
                id="upgrade-campus-btn"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : isPro && currentPlan === "campus" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Current Plan
                  </>
                ) : (
                  "Verify & Save"
                )}
              </button>
            </div>
          </div>

          {/* Weekly Pass */}
          <button
            onClick={() => handleUpgrade("weekly")}
            disabled={paymentLoading}
            className="mt-6 w-full rounded-2xl px-6 py-5 flex flex-wrap items-center justify-center gap-3 text-sm transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--rose-accent) 12%, var(--surface)), var(--surface))",
              border: "1px solid color-mix(in oklab, var(--rose-accent) 35%, transparent)",
            }}
            id="upgrade-weekly-btn"
          >
            <Zap className="h-4 w-4" style={{ color: "#FF6B9E" }} />
            <span className="font-semibold">
              Not sure yet? Try a week for {formatPrice(pricing.plans.weekly.amount, sym)}.
            </span>
            <span className="text-[color:var(--text-secondary)]">
              Full Pro access. No auto-renewal. Cancel by doing nothing.
            </span>
          </button>

          {/* Trust badges */}
          <div
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" style={{ color: "#10B981" }} />
              <span>{provider === "razorpay" ? "Razorpay Secure Payment" : "Dodo Secure Payment"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: "#10B981" }} />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#FF6B9E" }} />
              <span>Founding member price locked forever</span>
            </div>
          </div>

          {/* ── Gift a Subscription ── */}
          <div
            className="mt-16 rounded-[28px] border p-8 md:p-10 text-center relative overflow-hidden"
            style={{
              borderColor: "rgba(255,107,158,0.25)",
              background: "linear-gradient(135deg, rgba(255,107,158,0.06) 0%, rgba(124,58,237,0.06) 100%)",
            }}
          >
            <div className="absolute -top-16 right-0 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,107,158,0.15), transparent 70%)", filter: "blur(30px)" }} />
            <div className="relative">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="font-display font-extrabold text-2xl md:text-3xl mb-3">
                Gift StudyDate Pro
              </h3>
              <p className="text-[color:var(--text-secondary)] max-w-xl mx-auto mb-6 text-sm md:text-base">
                {pricing.region === "india"
                  ? "Got a sibling grinding for JEE, NEET, or UPSC? Gift them a Pro subscription. They study unlimited — you feel proud."
                  : "Know someone preparing for GRE, GMAT, MCAT, boards, or finals? Gift them Pro in their region's price. Practical support beats another generic gift."}
              </p>
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border cursor-pointer transition hover:opacity-90"
                style={{
                  background: "rgba(255,107,158,0.1)",
                  borderColor: "rgba(255,107,158,0.3)",
                  color: "#FF6B9E",
                }}
                onClick={() => window.open("mailto:support@studydate.in?subject=Gift%20a%20Subscription", "_blank")}
              >
                <Sparkles className="w-4 h-4" />
                Email us to gift a subscription
              </div>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="mt-16">
            <h3 className="font-display font-extrabold text-2xl text-center mb-8">
              Frequently asked questions
            </h3>
            <div className="space-y-3 text-left max-w-3xl mx-auto">
              {[
                {
                  q: "Is StudyDate free to start?",
                  a: "Yes — you get a 7-day free Pro trial when you sign up. No credit card required. After the trial, you can stay on the free plan (3 hours/day) or upgrade to Pro for unlimited access.",
                },
                {
                  q: "What payment methods do you support?",
                  a: pricing.region === "india"
                    ? "We accept UPI, credit/debit cards, net banking, and wallets through Razorpay — India's most trusted payment gateway."
                    : "For international users: credit/debit cards (Visa, Mastercard, Amex), Apple Pay, and Google Pay via Dodo Payments — a secure global payment platform.",
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Absolutely. No lock-in, no hidden fees. Cancel from your profile settings. Your Pro access continues until the end of the billing period.",
                },
                {
                  q: "Why is the price different based on my country?",
                  a: `We use geo-based pricing to make StudyDate affordable everywhere. Your current region sees ${formatPrice(pricing.plans.pro.amount, sym)}/mo for Pro. You get the same product — priced for your market's purchasing power.`,
                },
                {
                  q: "Is my data safe?",
                  a: "Yes. All data is stored on Supabase (Postgres) with row-level security. Your profile is only visible to matched users. We never sell data to third parties. See our Privacy Policy for full details.",
                },
                {
                  q: "Can I use StudyDate outside India?",
                  a: "100%. StudyDate works globally. International users see globally relevant rooms and exam filters such as GRE, GMAT, MCAT, IELTS, TOEFL, finals, and research. Price automatically adapts to your region.",
                },
                {
                  q: "How is StudyDate different from a Discord server?",
                  a: "Discord is a chat platform. StudyDate is built for focused studying — swipe-based partner matching by exam type, built-in Pomodoro timers in every room, session goals, streak tracking, and a distraction-free environment. It's an accountability system, not a social network.",
                },
              ].map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border p-5 cursor-pointer transition hover:border-[rgba(255,107,158,0.25)]"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--hairline)" }}
                >
                  <summary className="flex items-center justify-between list-none gap-4">
                    <span className="font-semibold text-sm md:text-base" style={{ color: "var(--text-primary)" }}>
                      {faq.q}
                    </span>
                    <span
                      className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-sm group-open:rotate-45 transition-transform duration-200"
                      style={{ borderColor: "rgba(255,107,158,0.3)", color: "#FF6B9E" }}
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
