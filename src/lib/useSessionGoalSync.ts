/**
 * useSessionGoalSync
 *
 * Uses Supabase Realtime Broadcast (zero DB writes, pure pub/sub) to sync
 * each user's session goal to their study partner in the same room.
 *
 * Channel: `room-goals:{roomId}`
 * Event:   `goal`
 * Payload: { userId: string; displayName: string; goal: string }
 *
 * Works even on the free Supabase tier — Broadcast doesn't count against
 * database row limits.
 */

import { useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type PartnerGoal = {
  userId: string;
  displayName: string;
  goal: string;
};

type UseSessionGoalSyncOptions = {
  roomId: string;
  userId: string | undefined;
  displayName: string;
  myGoal: string | null; // null = gate not yet committed
};

export function useSessionGoalSync({
  roomId,
  userId,
  displayName,
  myGoal,
}: UseSessionGoalSyncOptions) {
  const [partnerGoal, setPartnerGoal] = useState<PartnerGoal | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const broadcastedGoal = useRef<string | null>(null);

  useEffect(() => {
    // Silently no-op if Supabase isn't configured (localhost without .env)
    if (!isSupabaseConfigured() || !roomId || !userId) return;

    const channelName = `room-goals:${roomId}`;

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "goal" }, ({ payload }) => {
        const p = payload as PartnerGoal;
        // Ignore messages from ourselves (self: false should handle it, but double-check)
        if (p.userId === userId) return;
        setPartnerGoal(p);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && myGoal && myGoal !== broadcastedGoal.current) {
          // Broadcast our goal as soon as the channel is ready
          channel.send({
            type: "broadcast",
            event: "goal",
            payload: { userId: userId!, displayName, goal: myGoal } satisfies PartnerGoal,
          });
          broadcastedGoal.current = myGoal;
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ Only recreate the channel when roomId changes, not on every goal update

  // Re-broadcast whenever myGoal changes (user updates it mid-session in future)
  useEffect(() => {
    if (!myGoal || !channelRef.current || myGoal === broadcastedGoal.current) return;
    if (!isSupabaseConfigured()) return;

    channelRef.current.send({
      type: "broadcast",
      event: "goal",
      payload: { userId: userId!, displayName, goal: myGoal } satisfies PartnerGoal,
    });
    broadcastedGoal.current = myGoal;
  }, [myGoal, userId, displayName]);

  return { partnerGoal };
}
