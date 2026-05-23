// ─── Analytics (PostHog) ───────────────────────────────────────────
// Thin wrapper around PostHog for event tracking.
// Falls back to console.log if PostHog isn't loaded.
//
// Usage:
//   import { track, identify } from "@/lib/analytics";
//   track("swipe_right", { profile_id: "..." });
//   identify(userId, { plan: "pro", exam: "NEET" });

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

// ─── PostHog loader ────────────────────────────────────────────────
let posthogLoaded = false;

export function loadPostHog(): void {
  if (posthogLoaded || typeof window === "undefined" || !POSTHOG_KEY) return;

  try {
    // PostHog snippet (minimal inline loader)
    const script = document.createElement("script");
    script.async = true;
    script.src = `${POSTHOG_HOST}/static/array.js`;
    script.onload = () => {
      const ph = (window as any).posthog;
      if (ph && typeof ph.init === "function") {
        ph.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          person_profiles: "identified_only",
          capture_pageview: true,
          capture_pageleave: true,
          autocapture: false, // We'll track specific events manually
        });
        posthogLoaded = true;
      }
    };
    document.head.appendChild(script);
  } catch (err) {
    console.warn("[Analytics] Failed to load PostHog:", err);
  }
}

// ─── Public API ────────────────────────────────────────────────────

function getPostHog(): any {
  if (typeof window === "undefined") return null;
  return (window as any).posthog || null;
}

/**
 * Track a custom event.
 * No-ops silently if PostHog isn't loaded.
 */
export function track(event: string, properties?: Record<string, unknown>): void {
  const ph = getPostHog();
  if (ph?.capture) {
    ph.capture(event, properties);
  } else if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, properties);
  }
}

/**
 * Identify a user (call after login/signup).
 */
export function identify(
  userId: string,
  traits?: Record<string, unknown>,
): void {
  const ph = getPostHog();
  if (ph?.identify) {
    ph.identify(userId, traits);
  } else if (import.meta.env.DEV) {
    console.log(`[Analytics] identify: ${userId}`, traits);
  }
}

/**
 * Reset identity (call on logout).
 */
export function resetIdentity(): void {
  const ph = getPostHog();
  if (ph?.reset) {
    ph.reset();
  }
}

// ─── Predefined event helpers ──────────────────────────────────────

export const analytics = {
  signup: (method: "email" | "google") =>
    track("signup", { method }),

  login: (method: "email" | "google") =>
    track("login", { method }),

  profileCreated: (exam: string, city: string) =>
    track("profile_created", { exam, city }),

  swipe: (action: "like" | "pass" | "super", targetId: string) =>
    track(`swipe_${action}`, { target_id: targetId }),

  matchCreated: (partnerId: string, compatibility: number) =>
    track("match_created", { partner_id: partnerId, compatibility }),

  messageSent: (matchId: string) =>
    track("message_sent", { match_id: matchId }),

  sessionStarted: (roomType: "category" | "matched", category?: string) =>
    track("session_started", { room_type: roomType, category }),

  paymentStarted: (plan: string, provider: string) =>
    track("payment_started", { plan, provider }),

  paymentCompleted: (plan: string, provider: string) =>
    track("payment_completed", { plan, provider }),

  referralShared: (method: "copy" | "whatsapp" | "twitter") =>
    track("referral_shared", { method }),
};
