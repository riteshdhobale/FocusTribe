import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { applyReferralFromUrl } from "@/lib/useReferral";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    // Supabase automatically handles the code exchange from the URL hash/query
    // We just need to wait for the session to be established
    const handleCallback = async () => {
      try {
        // Give Supabase a moment to process the OAuth tokens from the URL
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setStatus("error");
          setTimeout(() => navigate({ to: "/" }), 3000);
          return;
        }

        if (data.session) {
          // Apply any pending referral code (stored before OAuth redirect)
          await applyReferralFromUrl().catch(() => {/* silent fail */});
          // Session established — go to discover
          navigate({ to: "/discover" });
        } else {
          // No session yet — Supabase may still be processing
          // Listen for the auth state change
          const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
              if (session) {
                listener.subscription.unsubscribe();
                navigate({ to: "/discover" });
              }
            },
          );

          // Fallback: if nothing happens in 5s, go home
          setTimeout(() => {
            listener.subscription.unsubscribe();
            navigate({ to: "/" });
          }, 5000);
        }
      } catch {
        setStatus("error");
        setTimeout(() => navigate({ to: "/" }), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "var(--background)" }}
    >
      <div className="text-center">
        {status === "loading" ? (
          <>
            <div className="relative h-16 w-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-[color:var(--hairline)]" />
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: "#FF6B9E",
                  animation: "spin 1s linear infinite",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                ✨
              </div>
            </div>
            <p className="mt-4 font-display font-semibold text-lg">
              Signing you in…
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
              Just a second
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">⚠️</div>
            <p className="font-display font-semibold text-lg">
              Sign-in failed
            </p>
            <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
              Redirecting you back…
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
