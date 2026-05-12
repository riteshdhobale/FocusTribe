import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

type BanStatus = {
  isBanned: boolean;
  reason: string | null;
  banType: "warning" | "temporary" | "permanent" | "ip_ban" | null;
  expiresAt: string | null;
  loading: boolean;
};

/**
 * Check if the currently authenticated user is banned.
 * Returns ban status and reason. Used at app root to gate access.
 */
export function useBanCheck(): BanStatus {
  const [status, setStatus] = useState<BanStatus>({
    isBanned: false,
    reason: null,
    banType: null,
    expiresAt: null,
    loading: true,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !isSupabaseConfigured()) {
      setStatus((prev) => ({ ...prev, loading: false }));
      return;
    }

    const checkBan = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setStatus((prev) => ({ ...prev, loading: false }));
          return;
        }

        // Check active bans (not warnings, only actual bans)
        const { data: bans } = await (supabase.from("bans") as any)
          .select("ban_type, reason, expires_at")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .in("ban_type", ["temporary", "permanent", "ip_ban"])
          .order("created_at", { ascending: false })
          .limit(1);

        if (bans && bans.length > 0) {
          const ban = bans[0] as { ban_type: string; reason: string; expires_at: string | null };
          // Check if temporary ban has expired (client-side display only).
          // SECURITY: We NEVER deactivate bans from the client.
          // Expired bans should be cleaned up by a Supabase cron job or Edge Function.
          if (ban.expires_at && new Date(ban.expires_at) < new Date()) {
            // Ban expired — treat as not banned for UX, but don't modify the DB
            setStatus({
              isBanned: false,
              reason: null,
              banType: null,
              expiresAt: null,
              loading: false,
            });
          } else {
            setStatus({
              isBanned: true,
              reason: ban.reason,
              banType: ban.ban_type as BanStatus["banType"],
              expiresAt: ban.expires_at,
              loading: false,
            });
          }
        } else {
          setStatus({
            isBanned: false,
            reason: null,
            banType: null,
            expiresAt: null,
            loading: false,
          });
        }
      } catch {
        // If bans table doesn't exist yet, don't block user
        setStatus((prev) => ({ ...prev, loading: false }));
      }
    };

    checkBan();
  }, []);

  return status;
}
