import { useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { generateStudyContract, type StudyContract } from "./ai";
import { toast } from "sonner";

type UseStudyContractOptions = {
  roomId: string;
  userId: string | undefined;
  userName: string;
};

export function useStudyContract({ roomId, userId, userName }: UseStudyContractOptions) {
  const [contract, setContract] = useState<StudyContract | null>(null);
  const [generating, setGenerating] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Persistence keys so refreshing doesn't lose the contract
  const localKey = `ft_contract_${roomId}`;

  // 1. Load from localStorage initially
  useEffect(() => {
    if (typeof window === "undefined" || !roomId) return;
    const cached = localStorage.getItem(localKey);
    if (cached) {
      try {
        setContract(JSON.parse(cached));
      } catch {}
    }
  }, [roomId, localKey]);

  // 2. Set up realtime broadcast channel
  useEffect(() => {
    if (!isSupabaseConfigured() || !roomId) return;

    const channelName = `room-contract:${roomId}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "contract-created" }, ({ payload }) => {
        const received = payload.contract as StudyContract;
        setContract(received);
        localStorage.setItem(localKey, JSON.stringify(received));
        toast.info(`${payload.senderName} generated a new AI Study Contract! 📜`);
      })
      .on("broadcast", { event: "contract-toggle-milestone" }, ({ payload }) => {
        const { id, done, senderName } = payload;
        setContract((prev) => {
          if (!prev) return null;
          const updatedMilestones = prev.milestones.map((m) =>
            m.id === id ? { ...m, done } : m
          );
          const next = { ...prev, milestones: updatedMilestones };
          localStorage.setItem(localKey, JSON.stringify(next));
          
          if (done) {
            toast.success(`Milestone completed by ${senderName}! 🎉`);
          }
          
          return next;
        });
      })
      .on("broadcast", { event: "contract-reset" }, ({ payload }) => {
        setContract(null);
        localStorage.removeItem(localKey);
        toast.info(`${payload.senderName} reset the AI Study Contract.`);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, localKey]);

  // 3. Generate a new contract using AI / Fallback and share with partner
  const generateAndShareContract = async (
    myGoal: string,
    partnerGoal: string,
    durationMinutes: number,
    mode: "silent" | "collaborative" | "quizzing"
  ) => {
    setGenerating(true);
    try {
      const newContract = await generateStudyContract(
        myGoal,
        partnerGoal,
        durationMinutes,
        mode
      );
      
      setContract(newContract);
      localStorage.setItem(localKey, JSON.stringify(newContract));

      // Broadcast to partner
      if (channelRef.current && isSupabaseConfigured()) {
        channelRef.current.send({
          type: "broadcast",
          event: "contract-created",
          payload: {
            contract: newContract,
            senderName: userName,
          },
        });
      }
      toast.success("AI Study Contract generated! Let's get to work. ⚡");
    } catch (err) {
      console.error("Failed to generate contract:", err);
      toast.error("Failed to generate AI Contract. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  // 4. Toggle a milestone locally and broadcast change
  const toggleMilestone = (id: string) => {
    setContract((prev) => {
      if (!prev) return null;
      let newDone = false;
      const updatedMilestones = prev.milestones.map((m) => {
        if (m.id === id) {
          newDone = !m.done;
          return { ...m, done: newDone };
        }
        return m;
      });
      const next = { ...prev, milestones: updatedMilestones };
      localStorage.setItem(localKey, JSON.stringify(next));

      // Broadcast toggle
      if (channelRef.current && isSupabaseConfigured()) {
        channelRef.current.send({
          type: "broadcast",
          event: "contract-toggle-milestone",
          payload: {
            id,
            done: newDone,
            senderName: userName,
          },
        });
      }

      if (newDone) {
        toast.success("Milestone completed! Keep going. 🎉");
      }

      return next;
    });
  };

  // 5. Reset contract locally and broadcast reset
  const resetContract = () => {
    setContract(null);
    localStorage.removeItem(localKey);

    if (channelRef.current && isSupabaseConfigured()) {
      channelRef.current.send({
        type: "broadcast",
        event: "contract-reset",
        payload: {
          senderName: userName,
        },
      });
    }
    toast.success("AI Study Contract has been reset.");
  };

  return {
    contract,
    generating,
    generateAndShareContract,
    toggleMilestone,
    resetContract,
  };
}
