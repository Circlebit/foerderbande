import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

// Environment variables (loaded from .env via Vite)
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "http://localhost:8000";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client instance
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      // Auto-refresh tokens
      autoRefreshToken: true,
      // Persist session in localStorage
      persistSession: true,
      // Optional: detect session from URL fragment (for email confirmations, etc.)
      detectSessionInUrl: true,
    },
    // Global settings for all requests
    global: {
      headers: {
        "X-Client-Info": "fomo-frontend",
      },
    },
  }
);

// Type-safe Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Helper function to check if Supabase client is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Helper function to handle Supabase errors consistently
 */
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}
