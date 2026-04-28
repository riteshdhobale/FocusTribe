import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

export type SubscriptionPlan = "free" | "pro" | "campus";

export function useSubscription() {
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [inReverseTrial, setInReverseTrial] = useState(true); 
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const mockTrialStart = new Date();
        mockTrialStart.setDate(mockTrialStart.getDate() - 2);

        const daysPassed = Math.floor((new Date().getTime() - mockTrialStart.getTime()) / (1000 * 3600 * 24));
        const daysLeft = Math.max(0, 7 - daysPassed);

        setTrialDaysLeft(daysLeft);
        
        if (daysLeft > 0) {
          setInReverseTrial(true);
          setPlan("pro");
        } else {
          setInReverseTrial(false);
          setPlan("free");
        }

      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return { plan, inReverseTrial, trialDaysLeft, loading };
}
