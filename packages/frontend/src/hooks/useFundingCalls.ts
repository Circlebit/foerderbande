import { useEffect, useState, useCallback } from "react";
import { supabase, handleSupabaseError } from "../services/supabase";
import type { Database } from "../types/database";

// Type alias for funding call from our database schema
export type FundingCall = Database["public"]["Tables"]["funding_calls"]["Row"];

// Hook state interface
interface UseFundingCallsReturn {
  fundingCalls: FundingCall[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage funding calls from Supabase
 *
 * @returns Object containing funding calls data, loading state, error state, and refetch function
 */
export function useFundingCalls(): UseFundingCallsReturn {
  const [fundingCalls, setFundingCalls] = useState<FundingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch funding calls from Supabase
  const fetchFundingCalls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("funding_calls")
        .select("*")
        .order("relevance_score", { ascending: false });

      if (supabaseError) throw supabaseError;

      setFundingCalls(data || []);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error("Error fetching funding calls:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchFundingCalls();
  }, [fetchFundingCalls]);

  return {
    fundingCalls,
    loading,
    error,
    refetch: fetchFundingCalls,
  };
}
