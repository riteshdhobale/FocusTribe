// ─── Auth Hook ────────────────────────────────────────────────────
// React hook for Supabase authentication state management.
// Provides: user, session, loading, signIn, signUp, signOut, signInWithGoogle

import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import { identify, resetIdentity, analytics } from "./analytics";
import type { User, Session } from "@supabase/supabase-js";

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Skip on server
    if (typeof window === "undefined") {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    if (!isSupabaseConfigured()) {
      setState({ user: null, session: null, loading: false, error: null });
      return;
    }

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        setState({
          user: data?.session?.user ?? null,
          session: data?.session ?? null,
          loading: false,
          error: error?.message ?? null,
        });
      })
      .catch(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        session,
        loading: false,
      }));

      // Identify user in analytics
      if (session?.user) {
        identify(session.user.id, {
          email: session.user.email,
          name: session.user.user_metadata?.full_name,
        });
      }
    });

    return () => data?.subscription?.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/discover`,
        data: {
          full_name: displayName || email.split("@")[0],
        },
      },
    });
    setState((prev) => ({
      ...prev,
      user: data.user,
      session: data.session,
      loading: false,
      error: error?.message ?? null,
    }));
    if (data.user) analytics.signup("email");
    return { data, error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setState((prev) => ({
      ...prev,
      user: data.user,
      session: data.session,
      loading: false,
      error: error?.message ?? null,
    }));
    if (data.user) analytics.login("email");
    return { data, error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
    }
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const { error } = await supabase.auth.signOut();
    resetIdentity();
    setState({
      user: null,
      session: null,
      loading: false,
      error: error?.message ?? null,
    });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile`,
    });
    return { error };
  }, []);

  return {
    ...state,
    isAuthenticated: !!state.user,
    isSupabaseMode: isSupabaseConfigured(),
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
}
