import { useEffect, useState, useCallback } from "react";
import { supabase } from "../services/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing authentication state
 * Handles login, logout, and session persistence via Supabase Auth
 */
export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true, // Start with loading=true to check existing session
    error: null,
  });

  /**
   * Handle authentication state changes
   * Called when user logs in/out or session expires
   */
  const handleAuthStateChange = useCallback((session: Session | null) => {
    setAuthState((prev) => ({
      ...prev,
      user: session?.user ?? null,
      session,
      loading: false,
    }));
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Session will be set automatically via the auth state change listener
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login fehlgeschlagen";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error; // Re-throw so components can handle it if needed
    }
  }, []);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // Session will be cleared automatically via the auth state change listener
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout fehlgeschlagen";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      console.error("Sign out error:", error);
    }
  }, []);

  /**
   * Clear any auth errors
   */
  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  // Set up auth state listener on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange(session);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      handleAuthStateChange(session);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [handleAuthStateChange]);

  return {
    ...authState,
    signIn,
    signOut,
    clearError,
  };
}
