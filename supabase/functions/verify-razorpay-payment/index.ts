// ─── Supabase Edge Function: Verify Razorpay Payment ───────────────
// POST /functions/v1/verify-razorpay-payment
// Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan }
//
// Verifies the HMAC signature, captures the payment, and activates the subscription.
// Deploy: supabase functions deploy verify-razorpay-payment

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Plan → subscription period mapping
const PLAN_PERIODS: Record<string, { days: number }> = {
  pro: { days: 30 },
  campus: { days: 365 },
  weekly: { days: 7 },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// HMAC-SHA256 verification using Web Crypto API (Deno-compatible)
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const data = encoder.encode(`${orderId}|${paymentId}`);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const expectedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return expectedSignature === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse body
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !plan) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Verify HMAC signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );
    if (!isValid) {
      console.error("Signature verification failed for order:", razorpay_order_id);
      return new Response(JSON.stringify({ error: "Payment signature verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Update payment record to "captured"
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "captured",
        provider_payment_id: razorpay_payment_id,
        metadata: {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          verified_at: new Date().toISOString(),
        },
      })
      .eq("provider_order_id", razorpay_order_id)
      .eq("user_id", user.id);

    if (paymentUpdateError) {
      console.error("Failed to update payment:", paymentUpdateError);
    }

    // Step 3: Activate subscription
    const planPeriod = PLAN_PERIODS[plan] || { days: 30 };
    const now = new Date();
    const periodEnd = new Date(now.getTime() + planPeriod.days * 24 * 60 * 60 * 1000);

    const { error: subError } = await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan: plan,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        payment_provider: "razorpay",
        payment_subscription_id: razorpay_payment_id,
        updated_at: now.toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    if (subError) {
      console.error("Failed to update subscription:", subError);
      return new Response(
        JSON.stringify({
          error: "Payment captured but subscription update failed. Contact support.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 4: Update profile is_pro flag
    await supabase
      .from("profiles")
      .update({ is_pro: true, updated_at: now.toISOString() })
      .eq("id", user.id);

    console.log(
      `✅ Payment verified & subscription activated: user=${user.id}, plan=${plan}, payment=${razorpay_payment_id}`,
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
