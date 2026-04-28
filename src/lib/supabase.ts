// ─── Supabase Client ───────────────────────────────────────────────
// Replace these with your actual Supabase project credentials.
// Get them from: https://supabase.com/dashboard → Settings → API

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

if (SUPABASE_URL === "YOUR_SUPABASE_URL") {
  console.warn(
    "⚠️ Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.\n" +
    "Running in localStorage-only mode."
  );
}
const isServer = typeof window === "undefined";

// No-op storage for SSR (Supabase tries to access localStorage even with persistSession=false)
const memoryStorage: Record<string, string> = {};
const noopStorage = {
  getItem: (key: string) => memoryStorage[key] ?? null,
  setItem: (key: string, value: string) => { memoryStorage[key] = value; },
  removeItem: (key: string) => { delete memoryStorage[key]; },
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: !isServer,
    ...(isServer ? { storage: noopStorage } : {}),
  },
});

/**
 * Check if Supabase is properly configured.
 * When false, the app falls back to localStorage.
 */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";
}
