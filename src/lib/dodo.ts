// ─── Dodo Payments Integration ─────────────────────────────────────
// Client-side utility for Dodo Payments Checkout (for international users).
// Used when the user's region is NOT in the Razorpay zone (India/PK/BD/NP/LK).
//
// Flow:
//   1. Client calls Supabase Edge Function → creates Dodo checkout session
//   2. Edge Function returns checkoutUrl
//   3. Client opens Dodo overlay checkout using dodopayments-checkout SDK
//
// Docs: https://docs.dodopayments.com

import { DodoPayments } from "dodopayments-checkout";
import { supabase, isSupabaseConfigured } from "./supabase";
import { getRegionPricing, detectRegion, type PricingRegion } from "./geoPrice";

// ─── Config ────────────────────────────────────────────────────────
const DODO_MODE = (import.meta.env.VITE_DODO_PAYMENTS_MODE as "test" | "live") || "test";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";

export type PlanId = "pro" | "campus" | "weekly";

export type DodoCheckoutResult = {
  success: boolean;
  paymentId?: string;
  error?: string;
};

// ─── Dodo product IDs ──────────────────────────────────────────────
// These map your plans to Dodo product IDs created in the Dodo dashboard.
// Set via environment variables or replace with actual IDs.
const DODO_PRODUCT_IDS: Record<PlanId, string> = {
  weekly: import.meta.env.VITE_DODO_PRODUCT_WEEKLY || "",
  pro: import.meta.env.VITE_DODO_PRODUCT_PRO || "",
  campus: import.meta.env.VITE_DODO_PRODUCT_CAMPUS || "",
};

// ─── SDK Initialization ────────────────────────────────────────────
let dodoInitialized = false;
let dodoResolvePayment: ((result: DodoCheckoutResult) => void) | null = null;

function initDodo(): void {
  if (dodoInitialized || typeof window === "undefined") return;

  DodoPayments.Initialize({
    mode: DODO_MODE,
    displayType: "overlay",
    onEvent: (event: any) => {
      console.log("[Dodo] Checkout event:", event);

      // Handle checkout completion
      if (event?.type === "checkout.completed" || event?.type === "payment.succeeded") {
        if (dodoResolvePayment) {
          dodoResolvePayment({
            success: true,
            paymentId: event?.data?.payment_id || event?.data?.id || "dodo_payment",
          });
          dodoResolvePayment = null;
        }
      }

      // Handle checkout failure
      if (event?.type === "checkout.failed" || event?.type === "payment.failed") {
        if (dodoResolvePayment) {
          dodoResolvePayment({
            success: false,
            error: event?.data?.error || "Payment failed. Please try again.",
          });
          dodoResolvePayment = null;
        }
      }

      // Handle checkout dismissal/cancellation
      if (event?.type === "checkout.dismissed" || event?.type === "checkout.cancelled") {
        if (dodoResolvePayment) {
          dodoResolvePayment({ success: false, error: "Payment cancelled" });
          dodoResolvePayment = null;
        }
      }
    },
  });

  dodoInitialized = true;
}

// ─── Configuration check ───────────────────────────────────────────
export function isDodoConfigured(): boolean {
  return !!DODO_MODE && !!SUPABASE_URL;
}

// ─── Create Dodo Checkout Session (via Supabase Edge Function) ─────
async function createDodoSession(
  planId: PlanId,
  userEmail: string,
  userName?: string,
): Promise<{ checkoutUrl: string; sessionId: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const region = detectRegion();
  const pricing = getRegionPricing(region);
  const plan = pricing.plans[planId];

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-dodo-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      plan: planId,
      region,
      amount: plan.amount,
      currency: pricing.currency,
      productId: DODO_PRODUCT_IDS[planId],
      customerEmail: userEmail,
      customerName: userName || userEmail.split("@")[0],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create checkout session" }));
    throw new Error(err.error || "Failed to create checkout session");
  }

  return res.json();
}

// ─── Open Dodo Checkout ────────────────────────────────────────────
export async function openDodoCheckout(
  planId: PlanId,
  userEmail: string,
  userName?: string,
): Promise<DodoCheckoutResult> {
  // Pre-flight checks
  if (!isDodoConfigured()) {
    return {
      success: false,
      error: "Dodo Payments is not configured. Add VITE_DODO_PAYMENTS_MODE to your .env file.",
    };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured. Payments require a backend." };
  }

  // Initialize Dodo SDK
  initDodo();

  // Step 1: Create checkout session on server
  let sessionData: { checkoutUrl: string; sessionId: string };
  try {
    sessionData = await createDodoSession(planId, userEmail, userName);
  } catch (err: any) {
    return { success: false, error: err.message || "Could not create checkout session" };
  }

  // Step 2: Open Dodo Checkout overlay
  return new Promise((resolve) => {
    dodoResolvePayment = resolve;

    try {
      DodoPayments.Checkout.open({
        checkoutUrl: sessionData.checkoutUrl,
      });
    } catch (err: any) {
      dodoResolvePayment = null;
      resolve({
        success: false,
        error: err.message || "Failed to open checkout. Please try again.",
      });
    }

    // Safety timeout — if no event fires within 10 minutes, resolve as cancelled
    setTimeout(() => {
      if (dodoResolvePayment === resolve) {
        dodoResolvePayment = null;
        resolve({ success: false, error: "Payment cancelled" });
      }
    }, 10 * 60 * 1000);
  });
}
