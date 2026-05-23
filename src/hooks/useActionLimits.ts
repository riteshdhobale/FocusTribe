import { useState, useEffect } from "react";
import { getTodaySwipeCounts, getMonthlyPromptCount } from "@/lib/profiles";
import { useSubscription } from "@/lib/useSubscription";

// ─── Swipe Limits by Plan ───────────────────────────────────────────────────
//
// Free:   3 right swipes/day, unlimited left swipes, 0 superlikes
// Pro:    15 right swipes/day, 1 superlike/day, "see who liked you"
// Annual: Unlimited swipes, 3 superlikes/day, priority queue
//
// Research basis: Hinge found 8 likes/day = highest paid conversion rate.
// For a study platform (more intentional users), 3 free creates the right
// scarcity without frustrating legitimate users. 15 pro is generous enough
// to feel "unlimited" in practice for most use cases.
//
export const SWIPE_LIMITS = {
  free:   { right: 3,         superlike: 0, sparks: 1,  left: Infinity, prompts: Infinity },
  pro:    { right: 15,        superlike: 1, sparks: 3,  left: Infinity, prompts: Infinity },
  annual: { right: Infinity,  superlike: 3, sparks: 5,  left: Infinity, prompts: Infinity },
} as const;

// ─── What is a Spark? ──────────────────────────────────────────────────────
// Spark = Hinge's Rose for FocusTribe. A highlighted like that:
//   1. Requires a message (can't send silently)
//   2. Goes to the TOP of the receiver's "Likes You" queue with a ⚡ badge
//   3. Severely limited (1 free / 3 pro per MONTH) — creates scarcity + intentionality
//   4. Converts at 3x the rate of regular likes (Hinge data)
// ──────────────────────────────────────────────────────────────────────────


// Legacy exports for backwards compatibility
export const MAX_RIGHT_SWIPES = SWIPE_LIMITS.free.right;
export const MAX_LEFT_SWIPES = 999;
export const MAX_MONTHLY_PROMPTS = SWIPE_LIMITS.free.prompts;

// Monthly key for Spark tracking (resets 1st of each month)
function thisMonthKey() {
  const now = new Date();
  return `spark_month_${now.getFullYear()}_${now.getMonth()}`;
}

function getSparksUsedThisMonth(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(thisMonthKey()) || "0", 10);
}

export function incrementSparksUsed() {
  if (typeof window === "undefined") return;
  const key = thisMonthKey();
  const current = parseInt(localStorage.getItem(key) || "0", 10);
  localStorage.setItem(key, String(current + 1));
}


export function useActionLimits() {
  const [rightSwipes, setRightSwipes] = useState(0);
  const [leftSwipes, setLeftSwipes] = useState(0);
  const [superlikes, setSuperlikes] = useState(0);
  const [sparksUsed, setSparksUsed] = useState(0);
  const [monthlyPrompts, setMonthlyPrompts] = useState(0);
  const { plan } = useSubscription();

  const tier = plan === "pro" ? "pro" : plan === "annual" ? "annual" : "free";
  const limits = SWIPE_LIMITS[tier];

  const refreshLimits = () => {
    const { right, left, superlike } = getTodaySwipeCounts();
    setRightSwipes(right);
    setLeftSwipes(left);
    setSuperlikes(superlike ?? 0);
    setSparksUsed(getSparksUsedThisMonth());
    setMonthlyPrompts(getMonthlyPromptCount());
  };

  useEffect(() => {
    refreshLimits();
  }, []);

  const rightRemaining = limits.right === Infinity
    ? Infinity
    : Math.max(0, limits.right - rightSwipes);

  const superlikeRemaining = limits.superlike === Infinity
    ? Infinity
    : Math.max(0, limits.superlike - superlikes);

  const sparkRemaining = Math.max(0, limits.sparks - sparksUsed);

  return {
    rightSwipes,
    leftSwipes,
    superlikes,
    sparksUsed,
    monthlyPrompts,
    tier,
    limits,
    rightRemaining,
    superlikeRemaining,
    sparkRemaining,
    canRightSwipe: rightRemaining > 0,
    canSuperLike: superlikeRemaining > 0,
    canSendSpark: sparkRemaining > 0,
    canLeftSwipe: true,
    canSendPrompt: true, // prompts are unlimited — they use a right swipe quota
    canSeeWhoLikedYou: tier === "pro" || tier === "annual",
    refreshLimits,
  };
}

