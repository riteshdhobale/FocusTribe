// ─── Save Study Session ────────────────────────────────────────────
// Persists a completed study session to Supabase and updates the
// user's cumulative stats (hours_studied, streak).
//
// Called from JitsiMeet.tsx when a session ends (either manually or
// via the 60-minute auto-hangup for free users).

import { supabase, isSupabaseConfigured } from "./supabase";
import { track } from "./analytics";

export type SessionData = {
  matchId?: string; // UUID of the match (for 1-on-1 Study Session rooms)
  roomId?: string; // Room ID (for category rooms)
  durationMinutes: number; // Actual time spent
  pomodorosCompleted?: number;
  tasksCompleted?: number;
};

/**
 * Save a completed study session to the database and update user stats.
 * Fails silently if Supabase isn't configured (demo/local mode).
 */
export async function saveStudySession(data: SessionData): Promise<{
  streak: number;
  hoursStudied: number;
} | null> {
  if (!isSupabaseConfigured()) return null;
  if (data.durationMinutes < 1) return null; // Ignore sessions under 1 minute

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Step 1: Insert the study session record
    // Note: match_id is required by the DB schema. For non-matched sessions
    // (category rooms), we use the roomId or a placeholder.
    const { error: insertError } = await supabase
      .from("study_sessions")
      .insert({
        started_by: user.id,
        match_id: data.matchId || data.roomId || "unmatched",
        duration_minutes: Math.round(data.durationMinutes),
        pomodoros_completed: data.pomodorosCompleted ?? 0,
        tasks_completed: data.tasksCompleted ?? 0,
        ended_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("[saveStudySession] Insert failed:", insertError.message);
      // Don't return — still try to update stats
    }

    // Step 2: Update cumulative stats (streak + hours) using the DB function
    // The function may not be in the generated types yet — cast to allow it
    const { data: statsResult, error: statsError } = await (supabase.rpc as any)(
      "update_study_stats",
      {
        p_user_id: user.id,
        p_duration_minutes: Math.round(data.durationMinutes),
      }
    );

    if (statsError) {
      console.error("[saveStudySession] Stats update failed:", statsError.message);
      return null;
    }

    const row = Array.isArray(statsResult) ? statsResult[0] : statsResult;
    const newStreak = row?.new_streak ?? 0;
    const newHours = row?.new_hours ?? 0;

    // Step 3: Track analytics event
    track("session_ended", {
      duration_minutes: data.durationMinutes,
      pomodoros: data.pomodorosCompleted ?? 0,
      tasks_completed: data.tasksCompleted ?? 0,
      is_matched: !!data.matchId,
      new_streak: newStreak,
    });

    return {
      streak: newStreak,
      hoursStudied: Number(newHours),
    };
  } catch (err) {
    console.error("[saveStudySession] Unexpected error:", err);
    return null;
  }
}
