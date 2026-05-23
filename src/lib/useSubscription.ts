import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

export type SubscriptionPlan = "free" | "pro" | "campus" | "weekly";
export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";

export type SubscriptionData = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  inReverseTrial: boolean;
  trialDaysLeft: number;
  isPro: boolean;
  loading: boolean;
};

export function useSubscription(): SubscriptionData {
  const [data, setData] = useState<SubscriptionData>({
    plan: "free",
    status: "trial",
    inReverseTrial: true,
    trialDaysLeft: 1,
    isPro: false,
    loading: true,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !isSupabaseConfigured()) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    const fetchSubscription = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setData((prev) => ({ ...prev, loading: false }));
          return;
        }

        // Query the real subscriptions table
        const { data: sub, error } = await (supabase.from("subscriptions") as any)
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error || !sub) {
          // No subscription record — user is on free tier (no trial created yet)
          setData({
            plan: "free",
            status: "expired",
            inReverseTrial: false,
            trialDaysLeft: 0,
            isPro: false,
            loading: false,
          });
          return;
        }

        const now = new Date();
        const trialEnd = sub.trial_end ? new Date(sub.trial_end) : null;
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;

        // Determine trial status
        const isInTrial = sub.status === "trial" && trialEnd && trialEnd > now;
        const daysLeft = isInTrial
          ? Math.max(0, Math.ceil((trialEnd!.getTime() - now.getTime()) / (1000 * 3600 * 24)))
          : 0;

        // Check for local demo override (only active when VITE_DEMO_MODE=true)
        const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
        const isDemoPro =
          isDemoMode &&
          typeof window !== "undefined" &&
          localStorage.getItem(`demo_pro_${user.id}`) === "true";
        const demoPlan =
          isDemoPro && typeof window !== "undefined"
            ? (localStorage.getItem(`demo_plan_${user.id}`) as SubscriptionPlan) || sub.plan
            : sub.plan;

        // Determine if user has Pro access
        const hasPro =
          isDemoPro ||
          // Active paid subscription
          (sub.status === "active" && sub.plan !== "free" && (!periodEnd || periodEnd > now)) ||
          // In reverse trial (gets Pro features free)
          isInTrial;

        setData({
          plan: isDemoPro ? demoPlan : (sub.plan as SubscriptionPlan),
          status: isDemoPro ? "active" : (sub.status as SubscriptionStatus),
          inReverseTrial: isDemoPro ? false : (isInTrial ?? false),
          trialDaysLeft: isDemoPro ? 0 : daysLeft,
          isPro: hasPro ?? false,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
        setData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchSubscription();
  }, []);

  return data;
}
