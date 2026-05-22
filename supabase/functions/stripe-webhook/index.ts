// ─── Supabase Edge Function: Stripe Webhook ───────────────────────
// POST /functions/v1/stripe-webhook
// Receives webhook events from Stripe.
//
// ⚠️  CURRENTLY UNUSED — Dodo Payments handles international webhooks instead.
//     Kept for potential future use. To re-enable:
//       1. Set STRIPE_WEBHOOK_SECRET in Supabase secrets
//       2. Deploy: supabase functions deploy stripe-webhook
//       3. Configure in Stripe Dashboard → Developers → Webhooks:
//            URL: https://YOUR_SUPABASE_URL/functions/v1/stripe-webhook
//            Events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed
//
// Deploy: supabase functions deploy stripe-webhook
// Set secrets:
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

/*
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Stripe Webhook Signature Verification ─────────────────────────
// Verifies the Stripe-Signature header using HMAC-SHA256.
// Stripe signature format: t=timestamp,v1=signature
async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  if (!secret || !signatureHeader) return false;

  try {
    // Parse the Stripe signature header
    const elements = signatureHeader.split(",");
    const timestampEl = elements.find((e) => e.startsWith("t="));
    const signatureEl = elements.find((e) => e.startsWith("v1="));

    if (!timestampEl || !signatureEl) return false;

    const timestamp = timestampEl.replace("t=", "");
    const expectedSig = signatureEl.replace("v1=", "");

    // Check timestamp tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) {
      console.error("Webhook timestamp too old");
      return false;
    }

    // Compute expected signature: HMAC-SHA256(secret, timestamp + "." + payload)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signedPayload = `${timestamp}.${payload}`;
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
    const hashArray = Array.from(new Uint8Array(sig));
    const computedSig = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return computedSig === expectedSig;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.text();

    // Verify Stripe webhook signature
    if (STRIPE_WEBHOOK_SECRET) {
      const signature = req.headers.get("stripe-signature") || "";
      const isValid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
      if (!isValid) {
        console.error("Stripe webhook signature verification failed");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const event = JSON.parse(body);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`[Stripe Webhook] Event: ${event.type}`, event.data?.object?.id);

    // ─── Handle checkout.session.completed ──────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan || "pro";
      const paymentIntentId = session.payment_intent;

      if (!userId) {
        console.error("No user_id in session metadata:", session.metadata);
        return new Response(JSON.stringify({ received: true, warning: "No user_id" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Only activate if payment was successful
      if (session.payment_status === "paid") {
        // Update payment record
        await supabase
          .from("payments")
          .update({
            status: "captured",
            provider_payment_id: paymentIntentId || session.id,
            metadata: {
              stripe_session: session,
              verified_at: new Date().toISOString(),
            },
          })
          .eq("provider_order_id", session.id)
          .eq("user_id", userId);

        // Activate subscription
        const planPeriod = PLAN_PERIODS[plan] || { days: 30 };
        const now = new Date();
        const periodEnd = new Date(now.getTime() + planPeriod.days * 24 * 60 * 60 * 1000);

        const { error: subError } = await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            plan: plan,
            status: "active",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            payment_provider: "stripe",
            payment_subscription_id: paymentIntentId || session.id,
            updated_at: now.toISOString(),
          },
          {
            onConflict: "user_id",
          },
        );

        if (subError) {
          console.error("Failed to update subscription:", subError);
          return new Response(
            JSON.stringify({ error: "Subscription update failed" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        // Update profile is_pro flag
        await supabase
          .from("profiles")
          .update({ is_pro: true, updated_at: now.toISOString() })
          .eq("id", userId);

        console.log(
          `✅ Stripe payment verified & subscription activated: user=${userId}, plan=${plan}, session=${session.id}`,
        );
      }
    }

    // ─── Handle payment_intent.payment_failed ──────────────────
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata?.user_id;

      if (userId) {
        // Find and update the payment record
        await supabase
          .from("payments")
          .update({
            status: "failed",
            metadata: {
              stripe_error: paymentIntent.last_payment_error,
              failed_at: new Date().toISOString(),
            },
          })
          .eq("user_id", userId)
          .eq("payment_provider", "stripe")
          .eq("status", "pending");

        console.log(
          `❌ Stripe payment failed: user=${userId}, error=${paymentIntent.last_payment_error?.message}`,
        );
      }
    }

    // Always return 200 to acknowledge the webhook
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ received: true, error: "Processing error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
*/
