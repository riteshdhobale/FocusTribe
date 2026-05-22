// ─── Stripe Payment Integration ────────────────────────────────────
// Client-side utility for Stripe Checkout (for international users).
// Used when the user's region is NOT in the Razorpay zone (India/PK/BD/NP/LK).
//
// ⚠️  CURRENTLY UNUSED — Dodo Payments is used for international users instead.
//     Kept here for potential future use. To re-enable, import openStripeCheckout
//     in usePayment.ts and route international users here.
//
// Flow (if re-enabled):
//   1. Client calls Supabase Edge Function → creates Stripe Checkout Session
//   2. Edge Function returns checkout URL
//   3. Client redirects to Stripe's hosted checkout page
//   4. After payment, Stripe redirects back to success/cancel URL
//   5. Stripe webhook confirms payment → activates subscription
//
// Docs: https://stripe.com/docs/payments/checkout

/*
import { supabase, isSupabaseConfigured } from "./supabase";
import { detectRegion, type PricingRegion } from "./geoPrice";

// ─── Config ────────────────────────────────────────────────────────
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";

export type PlanId = "pro" | "campus" | "weekly";

export type StripeCheckoutResult = {
  success: boolean;
  paymentId?: string;
  error?: string;
};

// ─── Configuration check ───────────────────────────────────────────
export function isStripeConfigured(): boolean {
  return !!STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY !== "YOUR_STRIPE_PUBLISHABLE_KEY";
}

// ─── Create Stripe Checkout Session (via Supabase Edge Function) ───
async function createStripeSession(
  planId: PlanId,
  userEmail: string,
  userName?: string,
): Promise<{ checkoutUrl: string; sessionId: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const region = detectRegion();

  // Build success/cancel URLs
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const successUrl = `${origin}/pricing?payment=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/pricing?payment=cancelled`;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-stripe-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      plan: planId,
      region,
      customerEmail: userEmail,
      customerName: userName || userEmail.split("@")[0],
      successUrl,
      cancelUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create checkout session" }));
    throw new Error(err.error || "Failed to create checkout session");
  }

  return res.json();
}

// ─── Open Stripe Checkout ──────────────────────────────────────────
export async function openStripeCheckout(
  planId: PlanId,
  userEmail: string,
  userName?: string,
): Promise<StripeCheckoutResult> {
  // Pre-flight checks
  if (!isStripeConfigured()) {
    return {
      success: false,
      error: "Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.",
    };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured. Payments require a backend." };
  }

  // Step 1: Create checkout session on server
  let sessionData: { checkoutUrl: string; sessionId: string };
  try {
    sessionData = await createStripeSession(planId, userEmail, userName);
  } catch (err: any) {
    return { success: false, error: err.message || "Could not create checkout session" };
  }

  // Step 2: Redirect to Stripe Checkout
  // Stripe uses a hosted checkout page — most secure and trusted by users
  if (sessionData.checkoutUrl) {
    window.location.href = sessionData.checkoutUrl;
    // Return a pending state — the actual result comes via webhook + redirect
    return { success: true, paymentId: sessionData.sessionId };
  }

  return { success: false, error: "No checkout URL received" };
}
*/
