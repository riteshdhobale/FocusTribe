// ─── Razorpay Payment Integration ──────────────────────────────────
// Client-side utility for Razorpay Checkout.
// Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

import { supabase, isSupabaseConfigured } from "./supabase";

// ─── Config ────────────────────────────────────────────────────────
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";

export type PlanId = "pro" | "campus" | "weekly";

export const PLAN_CONFIG: Record<PlanId, { name: string; amount: number; period: string; description: string }> = {
  pro:    { name: "Pro",    amount: 14900, period: "monthly", description: "Unlimited swipes, study rooms & streaks" },
  campus: { name: "Campus", amount: 118800, period: "yearly",  description: "Annual plan for verified students" },
  weekly: { name: "Weekly", amount: 2900,  period: "weekly",  description: "7-day full Pro access, no auto-renew" },
};

// ─── Load Razorpay SDK ─────────────────────────────────────────────
let razorpayLoaded = false;

export function loadRazorpayScript(): Promise<void> {
  if (razorpayLoaded || typeof window === "undefined") return Promise.resolve();
  if ((window as any).Razorpay) { razorpayLoaded = true; return Promise.resolve(); }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { razorpayLoaded = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}

export function isRazorpayConfigured(): boolean {
  return !!RAZORPAY_KEY_ID && RAZORPAY_KEY_ID !== "YOUR_RAZORPAY_KEY_ID";
}

// ─── Create Order (via Supabase Edge Function) ─────────────────────
async function createOrder(planId: PlanId): Promise<{ orderId: string; amount: number; currency: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-razorpay-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ plan: planId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create order" }));
    throw new Error(err.error || "Failed to create order");
  }

  return res.json();
}

// ─── Verify Payment (via Supabase Edge Function) ───────────────────
async function verifyPayment(data: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  plan: PlanId;
}): Promise<{ success: boolean }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-razorpay-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Verification failed" }));
    throw new Error(err.error || "Payment verification failed");
  }

  return res.json();
}

// ─── Open Checkout ─────────────────────────────────────────────────
export type CheckoutResult = {
  success: boolean;
  paymentId?: string;
  error?: string;
};

export async function openCheckout(
  planId: PlanId,
  userEmail: string,
  userName?: string,
): Promise<CheckoutResult> {
  // Pre-flight checks
  if (!isRazorpayConfigured()) {
    return { success: false, error: "Razorpay is not configured. Add VITE_RAZORPAY_KEY_ID to your .env file." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured. Payments require a backend." };
  }

  await loadRazorpayScript();
  const RazorpayClass = (window as any).Razorpay;
  if (!RazorpayClass) {
    return { success: false, error: "Razorpay SDK failed to load. Check your internet connection." };
  }

  const plan = PLAN_CONFIG[planId];
  if (!plan) {
    return { success: false, error: `Invalid plan: ${planId}` };
  }

  // Step 1: Create order on server
  let orderData: { orderId: string; amount: number; currency: string };
  try {
    orderData = await createOrder(planId);
  } catch (err: any) {
    return { success: false, error: err.message || "Could not create order" };
  }

  // Step 2: Open Razorpay Checkout modal
  return new Promise((resolve) => {
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "StudyDate",
      description: plan.description,
      order_id: orderData.orderId,
      prefill: {
        email: userEmail,
        name: userName || userEmail.split("@")[0],
      },
      theme: {
        color: "#FF6B9E",
        backdrop_color: "rgba(11, 17, 32, 0.85)",
      },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          resolve({ success: false, error: "Payment cancelled" });
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        // Step 3: Verify payment on server
        try {
          await verifyPayment({
            ...response,
            plan: planId,
          });
          resolve({ success: true, paymentId: response.razorpay_payment_id });
        } catch (err: any) {
          resolve({ success: false, error: err.message || "Payment verification failed" });
        }
      },
    };

    const rzp = new RazorpayClass(options);
    rzp.on("payment.failed", (response: any) => {
      resolve({
        success: false,
        error: response.error?.description || "Payment failed. Please try again.",
      });
    });
    rzp.open();
  });
}
