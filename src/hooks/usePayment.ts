// ─── usePayment Hook ──────────────────────────────────────────────
// Dual-gateway payment hook: routes to Razorpay (South Asia) or
// Dodo Payments (international) based on the user's detected region.
//
// The old Razorpay-only international flow is commented out below
// (search: "OLD_RAZORPAY_INTERNATIONAL") for easy restoration.

import { useState, useCallback, useMemo } from "react";
import { analytics } from "@/lib/analytics";
import {
  openCheckout as openRazorpayCheckout,
  isRazorpayConfigured,
  type PlanId,
  type CheckoutResult,
} from "@/lib/razorpay";
import {
  openDodoCheckout,
  isDodoConfigured,
  type DodoCheckoutResult,
} from "@/lib/dodo";
import {
  detectRegion,
  getPaymentProvider,
  type PaymentProvider,
} from "@/lib/geoPrice";
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

  // Detect payment provider once (based on user's timezone/region)
  const provider: PaymentProvider = useMemo(() => getPaymentProvider(), []);

  const checkout = useCallback(
    async (planId: PlanId): Promise<CheckoutResult> => {
      // Reset state
      setState({ loading: true, error: null, success: false, paymentId: null });

      // Track payment start
      analytics.paymentStarted(planId, provider);

      // Auth guard
      if (!isAuthenticated || !user?.email) {
        const err = "Please sign in first to upgrade your plan.";
        setState({ loading: false, error: err, success: false, paymentId: null });
        return { success: false, error: err };
      }

      // ─── Provider routing ──────────────────────────────────────
      // South Asia (IN/PK/BD/NP/LK) → Razorpay
      // All other regions → Dodo Payments
      if (provider === "razorpay") {
        // ─── RAZORPAY PATH (South Asia) ─────────────────────────
        if (!isRazorpayConfigured()) {
          const err = "Payments are not configured yet. Please contact support.";
          setState({ loading: false, error: err, success: false, paymentId: null });
          return { success: false, error: err };
        }

        try {
          const result = await openRazorpayCheckout(
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
            analytics.paymentCompleted(planId, "razorpay");
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
      } else {
        // ─── DODO PAYMENTS PATH (International / Global) ─────────
        if (!isDodoConfigured()) {
          const err = "International payments are not configured yet. Please contact support.";
          setState({ loading: false, error: err, success: false, paymentId: null });
          return { success: false, error: err };
        }

        try {
          const result: DodoCheckoutResult = await openDodoCheckout(
            planId,
            user.email,
            user.user_metadata?.full_name || user.email.split("@")[0],
          );

          if (result.success) {
            // DEMO OVERRIDE
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
            analytics.paymentCompleted(planId, "dodo");
          } else {
            setState({
              loading: false,
              error: result.error || null,
              success: false,
              paymentId: null,
            });
          }

          return { success: result.success, paymentId: result.paymentId, error: result.error };
        } catch (err: any) {
          const errorMsg = err.message || "Something went wrong with the payment";
          setState({ loading: false, error: errorMsg, success: false, paymentId: null });
          return { success: false, error: errorMsg };
        }
      }
    },
    [isAuthenticated, user, provider],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearSuccess = useCallback(() => {
    setState((prev) => ({ ...prev, success: false, paymentId: null }));
  }, []);

  return {
    ...state,
    checkout,
    clearError,
    clearSuccess,
    provider,
    isConfigured:
      provider === "razorpay" ? isRazorpayConfigured() : isDodoConfigured(),
  };
}

// =====================================================================
// OLD_RAZORPAY_INTERNATIONAL — Previous Razorpay-only hook (all regions)
// Commented out for restoration if needed. To restore:
//   1. Uncomment this block
//   2. Comment out or remove the dual-gateway version above
//   3. Export usePayment from this block instead
// =====================================================================
//
// import { useState, useCallback } from "react";
// import {
//   openCheckout,
//   isRazorpayConfigured,
//   type PlanId,
//   type CheckoutResult,
// } from "@/lib/razorpay";
// import { useAuth } from "@/lib/useAuth";
//
// export type PaymentState = {
//   loading: boolean;
//   error: string | null;
//   success: boolean;
//   paymentId: string | null;
// };
//
// export function usePayment() {
//   const { user, isAuthenticated } = useAuth();
//   const [state, setState] = useState<PaymentState>({
//     loading: false,
//     error: null,
//     success: false,
//     paymentId: null,
//   });
//
//   const checkout = useCallback(
//     async (planId: PlanId): Promise<CheckoutResult> => {
//       // Reset state
//       setState({ loading: true, error: null, success: false, paymentId: null });
//
//       // Auth guard
//       if (!isAuthenticated || !user?.email) {
//         const err = "Please sign in first to upgrade your plan.";
//         setState({ loading: false, error: err, success: false, paymentId: null });
//         return { success: false, error: err };
//       }
//
//       // Config guard
//       if (!isRazorpayConfigured()) {
//         const err = "Payments are not configured yet. Please contact support.";
//         setState({ loading: false, error: err, success: false, paymentId: null });
//         return { success: false, error: err };
//       }
//
//       try {
//         const result = await openCheckout(
//           planId,
//           user.email,
//           user.user_metadata?.full_name || user.email.split("@")[0],
//         );
//
//         if (result.success) {
//           if (import.meta.env.VITE_DEMO_MODE === "true" && user) {
//             localStorage.setItem(`demo_pro_${user.id}`, "true");
//             localStorage.setItem(`demo_plan_${user.id}`, planId);
//           }
//
//           setState({
//             loading: false,
//             error: null,
//             success: true,
//             paymentId: result.paymentId || null,
//           });
//         } else {
//           setState({
//             loading: false,
//             error: result.error || null,
//             success: false,
//             paymentId: null,
//           });
//         }
//
//         return result;
//       } catch (err: any) {
//         const errorMsg = err.message || "Something went wrong with the payment";
//         setState({ loading: false, error: errorMsg, success: false, paymentId: null });
//         return { success: false, error: errorMsg };
//       }
//     },
//     [isAuthenticated, user],
//   );
//
//   const clearError = useCallback(() => {
//     setState((prev) => ({ ...prev, error: null }));
//   }, []);
//
//   const clearSuccess = useCallback(() => {
//     setState((prev) => ({ ...prev, success: false, paymentId: null }));
//   }, []);
//
//   return {
//     ...state,
//     checkout,
//     clearError,
//     clearSuccess,
//     isConfigured: isRazorpayConfigured(),
//   };
// }
