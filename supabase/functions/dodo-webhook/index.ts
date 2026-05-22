// ─── Supabase Edge Function: Dodo Payments Webhook ─────────────────
// POST /functions/v1/dodo-webhook
// Receives webhook events from Dodo Payments.
//
// Configure in Dodo dashboard → Developer → Webhooks:
//   URL: https://YOUR_SUPABASE_URL/functions/v1/dodo-webhook
//
// Deploy: supabase functions deploy dodo-webhook
// Set secrets:
//   supabase secrets set DODO_WEBHOOK_SECRET=your_webhook_secret

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const DODO_WEBHOOK_SECRET = Deno.env.get("DODO_WEBHOOK_SECRET") || "";
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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, dodo-signature, webhook-id, webhook-timestamp, webhook-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Webhook Signature Verification ────────────────────────────────
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!secret || !signature) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const hashArray = Array.from(new Uint8Array(sig));
    const expectedSig = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Compare — Dodo may send the signature in various formats
    return (
      expectedSig === signature ||
      expectedSig === signature.replace("v1,", "") ||
      `v1,${expectedSig}` === signature
    );
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const event = JSON.parse(body);

    // Verify webhook signature if secret is configured
    if (DODO_WEBHOOK_SECRET) {
      const signature =
        req.headers.get("dodo-signature") ||
        req.headers.get("webhook-signature") ||
        "";
      const isValid = await verifyWebhookSignature(body, signature, DODO_WEBHOOK_SECRET);
      if (!isValid) {
        console.error("Webhook signature verification failed");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Extract event type — Dodo uses various formats
    const eventType =
      event.type ||
      event.event_type ||
      event.event ||
      "";

    console.log(`[Dodo Webhook] Event: ${eventType}`, JSON.stringify(event).slice(0, 500));

    // ─── Handle payment success ────────────────────────────────
    if (
      eventType === "payment.succeeded" ||
      eventType === "payment.completed" ||
      eventType === "checkout.completed" ||
      eventType === "payment_intent.succeeded"
    ) {
      const paymentData = event.data || event;
      const paymentId =
        paymentData.payment_id ||
        paymentData.id ||
        paymentData.payment_intent_id ||
        "";

      const metadata =
        paymentData.metadata || {};

      const userId = metadata.user_id;
      const plan = metadata.plan || "pro";

      if (!userId) {
        console.error("No user_id in webhook metadata:", metadata);
        // Still return 200 to prevent Dodo from retrying
        return new Response(JSON.stringify({ received: true, warning: "No user_id" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update payment record
      const { error: paymentUpdateError } = await supabase
        .from("payments")
        .update({
          status: "captured",
          provider_payment_id: paymentId,
          metadata: {
            dodo_event: event,
            verified_at: new Date().toISOString(),
          },
        })
        .eq("user_id", userId)
        .eq("payment_provider", "dodo")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (paymentUpdateError) {
        console.error("Failed to update payment:", paymentUpdateError);
      }

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
          payment_provider: "dodo",
          payment_subscription_id: paymentId,
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
        `✅ Dodo payment verified & subscription activated: user=${userId}, plan=${plan}, payment=${paymentId}`,
      );
    }

    // ─── Handle payment failure ────────────────────────────────
    if (
      eventType === "payment.failed" ||
      eventType === "checkout.failed"
    ) {
      const paymentData = event.data || event;
      const metadata = paymentData.metadata || {};
      const userId = metadata.user_id;

      if (userId) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            metadata: { dodo_event: event, failed_at: new Date().toISOString() },
          })
          .eq("user_id", userId)
          .eq("payment_provider", "dodo")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1);

        console.log(`❌ Dodo payment failed: user=${userId}`);
      }
    }

    // Always return 200 to acknowledge the webhook
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    // Return 200 even on error to prevent retries for malformed events
    return new Response(JSON.stringify({ received: true, error: "Processing error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
