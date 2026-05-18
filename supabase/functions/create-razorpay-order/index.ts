// ─── Supabase Edge Function: Create Razorpay Order ─────────────────
// POST /functions/v1/create-razorpay-order
// Body: { plan: "pro" | "campus" | "weekly", region?: "india" | "usa" | "uk" | "eu" | "sea" | "mena" | "anz" | "row" }
//
// Deploy: supabase functions deploy create-razorpay-order
// Set secrets:
//   supabase secrets set RAZORPAY_KEY_ID=rzp_live_xxx
//   supabase secrets set RAZORPAY_KEY_SECRET=xxx

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type PricingRegion = "india" | "usa" | "uk" | "eu" | "sea" | "mena" | "anz" | "row";
type PlanId = "pro" | "campus" | "weekly";

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
      expectedAmount,
      expectedCurrency,
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
    const amountMismatch =
      typeof expectedAmount === "number" && expectedAmount !== planConfig.amount;
    const currencyMismatch =
      typeof expectedCurrency === "string" && expectedCurrency !== planConfig.currency;
    if (amountMismatch || currencyMismatch) {
      return new Response(JSON.stringify({ error: "Pricing changed. Refresh and try again." }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderAmount = planConfig.amount;
    const orderCurrency = planConfig.currency;

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

    // Create Razorpay order
    const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: orderAmount,
        currency: orderCurrency,
        receipt: `sd_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          user_id: user.id,
          plan: plan,
          region,
          user_email: user.email,
        },
      }),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      console.error("Razorpay order creation failed:", errBody);
      return new Response(JSON.stringify({ error: "Failed to create payment order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = await orderRes.json();

    // Log order in payments table as pending
    await supabase.from("payments").insert({
      user_id: user.id,
      amount_cents: orderAmount,
      currency: orderCurrency,
      payment_provider: "razorpay",
      provider_order_id: order.id,
      status: "pending",
      plan: plan,
      metadata: { razorpay_order: order, region },
    });

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: orderAmount,
        currency: orderCurrency,
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
