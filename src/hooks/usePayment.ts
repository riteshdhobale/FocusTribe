// ─── usePayment Hook ──────────────────────────────────────────────
// Wraps Razorpay checkout in a React-friendly hook with state management.

import { useState, useCallback } from "react";
import { openCheckout, isRazorpayConfigured, type PlanId, type CheckoutResult } from "@/lib/razorpay";
import { useAuth } from "@/lib/useAuth";

export type PaymentState = {
  loading: boolean;
  error: string | null;
  success: boolean;
  paymentId: string | null;
};

export function usePayment() {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
    success: false,
    paymentId: null,
  });

  const checkout = useCallback(async (planId: PlanId): Promise<CheckoutResult> => {
    // Reset state
    setState({ loading: true, error: null, success: false, paymentId: null });

    // Auth guard
    if (!isAuthenticated || !user?.email) {
      const err = "Please sign in first to upgrade your plan.";
      setState({ loading: false, error: err, success: false, paymentId: null });
      return { success: false, error: err };
    }

    // Config guard
    if (!isRazorpayConfigured()) {
      const err = "Payments are not configured yet. Please contact support.";
      setState({ loading: false, error: err, success: false, paymentId: null });
      return { success: false, error: err };
    }

    try {
      const result = await openCheckout(
        planId,
        user.email,
        user.user_metadata?.full_name || user.email.split("@")[0],
      );

      if (result.success) {
        // DEMO OVERRIDE: Give instant Pro access when Edge Functions aren't deployed yet
        // Only active when VITE_DEMO_MODE=true — harmless in production
        if (import.meta.env.VITE_DEMO_MODE === "true" && user) {
          localStorage.setItem(`demo_pro_${user.id}`, "true");
          localStorage.setItem(`demo_plan_${user.id}`, planId);
        }

        setState({
          loading: false,
          error: null,
          success: true,
          paymentId: result.paymentId || null,
        });
      } else {
        setState({
          loading: false,
          error: result.error || null,
          success: false,
          paymentId: null,
        });
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || "Something went wrong with the payment";
      setState({ loading: false, error: errorMsg, success: false, paymentId: null });
      return { success: false, error: errorMsg };
    }
  }, [isAuthenticated, user]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearSuccess = useCallback(() => {
    setState(prev => ({ ...prev, success: false, paymentId: null }));
  }, []);

  return {
    ...state,
    checkout,
    clearError,
    clearSuccess,
    isConfigured: isRazorpayConfigured(),
  };
}
