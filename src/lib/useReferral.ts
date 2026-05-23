// ─── useReferral ────────────────────────────────────────────────────
// Manages referral codes: fetch/generate the user's code and apply
// incoming referral codes from the URL (?ref=CODE).
//
// Usage:
//   const { code, shareUrl, applyCode } = useReferral();

import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

const BASE_URL = "https://focustribe.in";

export type ReferralStats = {
  totalReferrals: number;
  rewardedReferrals: number;
  bonusDaysEarned: number;
};

export function useReferral() {
  const [code, setCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    rewardedReferrals: 0,
    bonusDaysEarned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchOrCreateCode = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Call the DB function to get or create a code
      const { data, error: fnError } = await (supabase.rpc as any)(
        "get_or_create_referral_code",
        { p_user_id: user.id }
      );

      if (fnError) throw fnError;

      const userCode = data as string;
      setCode(userCode);
      setShareUrl(`${BASE_URL}/?ref=${userCode}`);

      // Fetch referral stats
      const { data: referrals, error: statsError } = await (supabase
        .from("referrals") as any)
        .select("reward_granted")
        .eq("referrer_id", user.id);

      if (!statsError && referrals) {
        const rewarded = referrals.filter((r: any) => r.reward_granted).length;
        setStats({
          totalReferrals: referrals.length,
          rewardedReferrals: rewarded,
          bonusDaysEarned: rewarded * 3,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load referral code");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrCreateCode();
  }, [fetchOrCreateCode]);

  const copyLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const shareOnTwitter = useCallback(() => {
    if (!shareUrl) return;
    const text = encodeURIComponent(
      `I've been using FocusTribe to find serious study partners — it's like Tinder but for your academic goals 🎯\n\nJoin free (+ 3 days Pro): ${shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }, [shareUrl]);

  const shareOnWhatsApp = useCallback(() => {
    if (!shareUrl) return;
    const text = encodeURIComponent(
      `Hey! Try FocusTribe — it matches you with study partners for JEE/NEET/UPSC.\nSign up free + get 3 days Pro: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, [shareUrl]);

  return {
    code,
    shareUrl,
    stats,
    loading,
    error,
    copied,
    copyLink,
    shareOnTwitter,
    shareOnWhatsApp,
    refresh: fetchOrCreateCode,
  };
}

// ─── Apply referral code from URL ────────────────────────────────────
// Call this in your auth callback after a user signs up.
export async function applyReferralFromUrl(): Promise<boolean> {
  if (!isSupabaseConfigured() || typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (!ref) {
    // Also check sessionStorage (set before redirect to OAuth)
    const stored = sessionStorage.getItem("sd_ref_code");
    if (!stored) return false;
    return applyCode(stored);
  }

  // Store in sessionStorage in case OAuth redirect wipes the URL
  sessionStorage.setItem("sd_ref_code", ref);
  return applyCode(ref);
}

async function applyCode(code: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await (supabase.rpc as any)("apply_referral_code", {
      p_referred_id: user.id,
      p_code: code.toUpperCase(),
    });

    if (error) {
      console.warn("Failed to apply referral:", error);
      return false;
    }

    if (data) {
      // Clear from storage after successful application
      sessionStorage.removeItem("sd_ref_code");
    }

    return !!data;
  } catch (err) {
    console.warn("Referral apply error:", err);
    return false;
  }
}

// ─── Capture ?ref= param before OAuth redirect ───────────────────────
// Call this before navigating to the OAuth provider.
export function captureRefParam() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    sessionStorage.setItem("sd_ref_code", ref);
  }
}
