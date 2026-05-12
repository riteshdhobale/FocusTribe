// ─── Supabase Edge Function: Create Razorpay Order ─────────────────
// POST /functions/v1/create-razorpay-order
// Body: { plan: "pro" | "campus" | "weekly" }
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

const PLANS: Record<string, { amount: number; currency: string; period: string }> = {
  pro: { amount: 14900, currency: "INR", period: "monthly" },
  campus: { amount: 118800, currency: "INR", period: "yearly" },
  weekly: { amount: 2900, currency: "INR", period: "weekly" },
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
    const { plan, amount: clientAmount, currency: clientCurrency } = await req.json();
    const planConfig = PLANS[plan];
    if (!planConfig) {
      return new Response(JSON.stringify({ error: `Invalid plan: ${plan}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use client-specified amount/currency for geo-pricing, fallback to server defaults
    const orderAmount =
      clientAmount && typeof clientAmount === "number" && clientAmount > 0
        ? clientAmount
        : planConfig.amount;
    const orderCurrency =
      clientCurrency && typeof clientCurrency === "string" ? clientCurrency : planConfig.currency;

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
      metadata: { razorpay_order: order },
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
