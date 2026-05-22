// ─── Supabase Edge Function: Create Stripe Checkout Session ────────
// POST /functions/v1/create-stripe-session
// Body: { plan, region, customerEmail, customerName, successUrl, cancelUrl }
//
// ⚠️  CURRENTLY UNUSED — Dodo Payments handles international users instead.
//     Kept for potential future use. To re-enable:
//       1. Set STRIPE_SECRET_KEY in Supabase secrets
//       2. Deploy: supabase functions deploy create-stripe-session
//       3. Route international users to this function in usePayment.ts
//
// Deploy: supabase functions deploy create-stripe-session
// Set secrets:
//   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

/*
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type PlanId = "pro" | "campus" | "weekly";
type PricingRegion = "india" | "usa" | "uk" | "eu" | "sea" | "mena" | "anz" | "row";

// ─── Pricing per region (mirrors geoPrice.ts — server-side source of truth)
const REGION_PLANS: Record<
  PricingRegion,
  Record<PlanId, { amount: number; currency: string; period: string }>
> = {
  india: {
    weekly: { amount: 5900, currency: "INR", period: "weekly" },
    pro: { amount: 19900, currency: "INR", period: "monthly" },
    campus: { amount: 149900, currency: "INR", period: "yearly" },
  },
  usa: {
    weekly: { amount: 299, currency: "USD", period: "weekly" },
    pro: { amount: 999, currency: "USD", period: "monthly" },
    campus: { amount: 7999, currency: "USD", period: "yearly" },
  },
  uk: {
    weekly: { amount: 249, currency: "GBP", period: "weekly" },
    pro: { amount: 799, currency: "GBP", period: "monthly" },
    campus: { amount: 5999, currency: "GBP", period: "yearly" },
  },
  eu: {
    weekly: { amount: 299, currency: "EUR", period: "weekly" },
    pro: { amount: 999, currency: "EUR", period: "monthly" },
    campus: { amount: 7999, currency: "EUR", period: "yearly" },
  },
  sea: {
    weekly: { amount: 199, currency: "USD", period: "weekly" },
    pro: { amount: 599, currency: "USD", period: "monthly" },
    campus: { amount: 4999, currency: "USD", period: "yearly" },
  },
  mena: {
    weekly: { amount: 249, currency: "USD", period: "weekly" },
    pro: { amount: 799, currency: "USD", period: "monthly" },
    campus: { amount: 5999, currency: "USD", period: "yearly" },
  },
  anz: {
    weekly: { amount: 349, currency: "USD", period: "weekly" },
    pro: { amount: 1299, currency: "USD", period: "monthly" },
    campus: { amount: 9999, currency: "USD", period: "yearly" },
  },
  row: {
    weekly: { amount: 299, currency: "USD", period: "weekly" },
    pro: { amount: 999, currency: "USD", period: "monthly" },
    campus: { amount: 7999, currency: "USD", period: "yearly" },
  },
};

// Plan display names
const PLAN_LABELS: Record<PlanId, { name: string; description: string }> = {
  pro: { name: "StudyDate Pro — Monthly", description: "Unlimited swipes, study rooms & streaks" },
  campus: { name: "StudyDate Campus — Annual", description: "Annual plan for verified students" },
  weekly: { name: "StudyDate Weekly Pass", description: "7-day full Pro access, no auto-renew" },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Authenticate the user
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

    // Parse request
    const {
      plan,
      region: clientRegion,
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
    } = await req.json();

    const region: PricingRegion =
      clientRegion && REGION_PLANS[clientRegion as PricingRegion]
        ? (clientRegion as PricingRegion)
        : "row";
    const planConfig = REGION_PLANS[region][plan as PlanId];
    if (!planConfig) {
      return new Response(JSON.stringify({ error: `Invalid plan: ${plan}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has an active subscription
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active"])
      .single();

    if (existingSub && existingSub.plan !== "free") {
      return new Response(
        JSON.stringify({
          error: "You already have an active subscription. Manage it from your profile.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const planLabel = PLAN_LABELS[plan as PlanId];

    // ─── Create Stripe Checkout Session via REST API ───────────
    // Docs: https://stripe.com/docs/api/checkout/sessions/create
    const stripeParams = new URLSearchParams();
    stripeParams.append("mode", "payment");
    stripeParams.append("line_items[0][price_data][currency]", planConfig.currency.toLowerCase());
    stripeParams.append("line_items[0][price_data][unit_amount]", String(planConfig.amount));
    stripeParams.append("line_items[0][price_data][product_data][name]", planLabel.name);
    stripeParams.append("line_items[0][price_data][product_data][description]", planLabel.description);
    stripeParams.append("line_items[0][quantity]", "1");
    stripeParams.append("customer_email", customerEmail || user.email || "");
    stripeParams.append("success_url", successUrl || "https://studydate.in/pricing?payment=success");
    stripeParams.append("cancel_url", cancelUrl || "https://studydate.in/pricing?payment=cancelled");
    stripeParams.append("metadata[user_id]", user.id);
    stripeParams.append("metadata[plan]", plan);
    stripeParams.append("metadata[region]", region);
    stripeParams.append("metadata[user_email]", user.email || "");
    stripeParams.append("payment_intent_data[metadata][user_id]", user.id);
    stripeParams.append("payment_intent_data[metadata][plan]", plan);
    stripeParams.append("payment_intent_data[metadata][region]", region);
    // Set statement descriptor so user sees "STUDYDATE" on their bank statement
    stripeParams.append("payment_intent_data[statement_descriptor]", "STUDYDATE PRO");

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${STRIPE_SECRET_KEY}:`)}`,
      },
      body: stripeParams.toString(),
    });

    if (!stripeRes.ok) {
      const errBody = await stripeRes.text();
      console.error("Stripe session creation failed:", errBody);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const stripeSession = await stripeRes.json();

    // Log order in payments table as pending
    await supabase.from("payments").insert({
      user_id: user.id,
      amount_cents: planConfig.amount,
      currency: planConfig.currency,
      payment_provider: "stripe",
      provider_order_id: stripeSession.id,
      status: "pending",
      plan: plan,
      metadata: {
        stripe_session_id: stripeSession.id,
        region,
        checkout_url: stripeSession.url,
      },
    });

    return new Response(
      JSON.stringify({
        checkoutUrl: stripeSession.url,
        sessionId: stripeSession.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
*/
