// ─── Supabase Edge Function: Create Dodo Checkout Session ──────────
// POST /functions/v1/create-dodo-session
// Body: { plan, region, amount, currency, productId, customerEmail, customerName }
//
// Creates a Dodo Payments checkout session for international users.
// Deploy: supabase functions deploy create-dodo-session
// Set secrets:
//   supabase secrets set DODO_API_KEY=your_dodo_api_key
//   supabase secrets set DODO_WEBHOOK_SECRET=your_webhook_secret

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const DODO_API_KEY = Deno.env.get("DODO_API_KEY")!;
const DODO_API_URL = Deno.env.get("DODO_API_URL") || "https://api.dodopayments.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type PlanId = "pro" | "campus" | "weekly";
type PricingRegion = "india" | "usa" | "uk" | "eu" | "sea" | "mena" | "anz" | "row";

// Plan display names (for checkout metadata)
const PLAN_LABELS: Record<PlanId, { name: string; period: string; description: string }> = {
  pro: { name: "StudyDate Pro", period: "monthly", description: "Unlimited swipes, study rooms & streaks" },
  campus: { name: "StudyDate Campus", period: "yearly", description: "Annual plan for verified students" },
  weekly: { name: "StudyDate Weekly", period: "weekly", description: "7-day full Pro access, no auto-renew" },
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
      region,
      amount,
      currency,
      productId,
      customerEmail,
      customerName,
    } = await req.json();

    if (!plan || !PLAN_LABELS[plan as PlanId]) {
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

    // Create Dodo Payments checkout session via their API
    const dodoRes = await fetch(`${DODO_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DODO_API_KEY}`,
      },
      body: JSON.stringify({
        payment_link: true,
        ...(productId ? { product_id: productId } : {}),
        billing: {
          currency: (currency || "USD").toUpperCase(),
          // Dodo expects amount in smallest unit (cents)
          total_amount: amount,
        },
        customer: {
          email: customerEmail || user.email,
          name: customerName || user.email?.split("@")[0],
        },
        metadata: {
          user_id: user.id,
          plan: plan,
          region: region || "row",
          user_email: user.email,
          description: planLabel.description,
        },
      }),
    });

    if (!dodoRes.ok) {
      const errBody = await dodoRes.text();
      console.error("Dodo session creation failed:", errBody);
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const dodoData = await dodoRes.json();

    // Extract checkout URL from Dodo response
    const checkoutUrl =
      dodoData.payment_link ||
      dodoData.checkout_url ||
      dodoData.url ||
      dodoData.data?.payment_link ||
      dodoData.data?.checkout_url;

    const sessionId =
      dodoData.payment_id ||
      dodoData.id ||
      dodoData.session_id ||
      dodoData.data?.payment_id ||
      `dodo_${Date.now()}`;

    if (!checkoutUrl) {
      console.error("No checkout URL in Dodo response:", JSON.stringify(dodoData));
      return new Response(
        JSON.stringify({ error: "Failed to get checkout URL" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Log order in payments table as pending
    await supabase.from("payments").insert({
      user_id: user.id,
      amount_cents: amount,
      currency: (currency || "USD").toUpperCase(),
      payment_provider: "dodo",
      provider_order_id: sessionId,
      status: "pending",
      plan: plan,
      metadata: {
        dodo_response: dodoData,
        region: region || "row",
        checkout_url: checkoutUrl,
      },
    });

    return new Response(
      JSON.stringify({
        checkoutUrl,
        sessionId,
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
