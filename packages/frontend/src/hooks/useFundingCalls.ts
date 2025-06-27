import { useEffect, useState, useCallback } from "react";
import { supabase, handleSupabaseError } from "../services/supabase";
import type { Database, Json } from "../types/database";

// Type alias for funding call from our database schema
export type FundingCall = Database["public"]["Tables"]["funding_calls"]["Row"];

// Type for the details JSONB field structure (what we expect to store in there)
// Keep it simple for TypeScript compatibility - we'll use type assertions when needed
type FundingCallDetails = {
  is_relevant?: boolean;
  relevance_reason?: string;
  funding_amount?: string;
  duration?: string;
  categories?: string[];
  target_groups?: string[];
  legacy_id?: string;
  source?: string;
  [key: string]: Json | undefined;
};

// Hook state interface
interface UseFundingCallsReturn {
  fundingCalls: NormalizedFundingCall[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  usingMockData: boolean; // Helper to know if we're using mock data
}

// Normalized interface for UI consumption - always the same structure regardless of data source
export interface NormalizedFundingCall extends FundingCall {
  // Helper getters for UI - always returns the right value regardless of source
  // Fixed: Use undefined instead of null to match common JS/React patterns
  readonly relevanceInfo: {
    isRelevant: boolean;
    reason?: string;
    score?: number; // Changed from number | null to number | undefined
  };
  readonly fundingAmount?: string; // Changed from string | null to string | undefined
  readonly duration?: string; // Changed from string | null to string | undefined
  readonly displayDeadline?: string; // Changed from string | null to string | undefined
}

// Legacy mock data format (from colleague's scraper)
interface LegacyFundingCall {
  _id: string;
  url: string;
  NameDerFoerderung: string | null;
  ist_geeignet: boolean;
  Antragsfrist: string | null;
  Foerdersumme: string | null;
  Laufzeit: string | null;
  Beschreibung: string;
  Begründung: string;
  scraped_at: string;
}

/**
 * Transform legacy mock data format to our current database schema
 * Converts colleague's original scraper format to our database structure
 */
function transformLegacyData(legacyData: LegacyFundingCall[]): FundingCall[] {
  return legacyData.map((item, index) => ({
    id: index + 1, // Generate sequential IDs for mock data
    source_url: item.url,
    title: item.NameDerFoerderung || "Unbenannte Förderung",
    description: item.Beschreibung,
    deadline: item.Antragsfrist,
    created_at: item.scraped_at,
    updated_at: item.scraped_at,
    relevance_score: item.ist_geeignet ? 0.8 : 0.2, // Mock relevance score
    details: {
      // Store additional data in JSONB details field
      funding_amount: item.Foerdersumme,
      duration: item.Laufzeit,
      is_relevant: item.ist_geeignet,
      relevance_reason: item.Begründung,
      legacy_id: item._id,
      source: "foerdermittel-wissenswert.de",
      categories: ["mock-data"],
      target_groups: ["gemeinnützige Einrichtungen"],
    } as Json, // Cast to Json to satisfy Supabase type constraints
  }));
}

/**
 * Custom hook to fetch and manage funding calls from Supabase or mock data
 * Handles the new simplified schema with JSONB data field
 * Can switch between real DB and mock data via VITE_USE_MOCK_DATA environment variable
 * Supports legacy mock data format transformation for development
 *
 * @returns Object containing funding calls data, loading state, error state, refetch function, and mock data indicator
 */
export function useFundingCalls(): UseFundingCallsReturn {
  const [fundingCalls, setFundingCalls] = useState<NormalizedFundingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we should use mock data (defaults to false if env var not set)
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";

  /**
   * Normalize funding calls to provide consistent interface for UI
   * Handles different data sources (DB vs mock) transparently
   */
  const normalizeFundingCalls = useCallback(
    (data: FundingCall[]): NormalizedFundingCall[] => {
      return data.map((call) => {
        const details = call.details as FundingCallDetails | null;

        // Create normalized object with getters
        const normalized: NormalizedFundingCall = {
          ...call,
          get relevanceInfo() {
            const isRelevant =
              (call.relevance_score !== null && call.relevance_score > 0.5) ||
              details?.is_relevant ||
              false;
            return {
              isRelevant,
              reason: details?.relevance_reason || undefined, // Convert null to undefined
              score: call.relevance_score ?? undefined, // Convert null to undefined using nullish coalescing
            };
          },
          get fundingAmount() {
            // Convert null to undefined for consistent API
            return details?.funding_amount ?? undefined;
          },
          get duration() {
            // Convert null to undefined for consistent API
            return details?.duration ?? undefined;
          },
          get displayDeadline() {
            // Prefer top-level deadline, fallback to details, convert null to undefined
            return call.deadline ?? undefined;
          },
        };

        return normalized;
      });
    },
    [] // No dependencies needed - this function is pure
  );

  /**
   * Sort funding calls by relevance and update time
   * Applies consistent sorting logic for both mock and real data
   */
  const sortFundingCalls = useCallback(
    (data: NormalizedFundingCall[]): NormalizedFundingCall[] => {
      return data.sort((a, b) => {
        // Use normalized relevance info
        const aRelevant = a.relevanceInfo.isRelevant;
        const bRelevant = b.relevanceInfo.isRelevant;

        // Relevante Ausschreibungen zuerst
        if (aRelevant && !bRelevant) return -1;
        if (!aRelevant && bRelevant) return 1;

        // Bei gleicher Relevanz nach Update-Zeit sortieren (neueste zuerst)
        // Handle null values safely
        const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;

        return bTime - aTime;
      });
    },
    [] // No dependencies needed - this function is pure
  );

  /**
   * Fetch mock data from JSON file in public directory
   * Useful for development and testing without database dependency
   */
  const fetchMockData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading mock funding calls data...");

      // Load JSON file from public directory
      const response = await fetch("/mock-funding-calls.json");
      if (!response.ok) {
        throw new Error(
          `Failed to load mock data: ${response.status} ${response.statusText}`
        );
      }

      const rawData = await response.json();

      if (!Array.isArray(rawData)) {
        throw new Error("Mock data must be an array of funding calls");
      }

      // Check if this is legacy format (has _id field) or new format
      const isLegacyFormat = rawData.length > 0 && rawData[0]._id !== undefined;

      let mockData: FundingCall[];
      if (isLegacyFormat) {
        console.log(
          `Transforming ${rawData.length} legacy format funding calls...`
        );
        mockData = transformLegacyData(rawData as LegacyFundingCall[]);
      } else {
        mockData = rawData as FundingCall[];
      }

      console.log(
        `Loaded ${mockData.length} mock funding calls${
          isLegacyFormat ? " (transformed from legacy format)" : ""
        }`
      );

      // Normalize and sort the data consistently
      const normalizedData = normalizeFundingCalls(mockData);
      const sortedData = sortFundingCalls(normalizedData);
      setFundingCalls(sortedData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error loading mock data";
      setError(errorMessage);
      console.error("Error loading mock data:", err);
    } finally {
      setLoading(false);
    }
  }, [normalizeFundingCalls, sortFundingCalls]); // Fixed: Added missing dependencies

  /**
   * Fetch funding calls from Supabase database
   * Production data source with real-time updates
   */
  const fetchFundingCalls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching funding calls from Supabase...");

      const { data, error: supabaseError } = await supabase
        .from("funding_calls")
        .select("*")
        // Order by updated_at as fallback, will be re-sorted by relevance
        .order("updated_at", { ascending: false });

      if (supabaseError) throw supabaseError;

      console.log(`Fetched ${data?.length || 0} funding calls from database`);

      // Normalize and sort the data consistently
      const normalizedData = normalizeFundingCalls(data || []);
      const sortedData = sortFundingCalls(normalizedData);
      setFundingCalls(sortedData);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error("Error fetching funding calls:", err);
    } finally {
      setLoading(false);
    }
  }, [normalizeFundingCalls, sortFundingCalls]); // Fixed: Added missing dependencies

  // Choose which fetch function to use based on environment
  const fetchFunction = useMockData ? fetchMockData : fetchFundingCalls;

  // Initial fetch on mount
  useEffect(() => {
    fetchFunction();
  }, [fetchFunction]);

  // Log which data source we're using (helpful for debugging)
  useEffect(() => {
    if (useMockData) {
      console.log(
        "🔧 Using mock data for funding calls (VITE_USE_MOCK_DATA=true)"
      );
    } else {
      console.log("🗄️ Using Supabase database for funding calls");
    }
  }, [useMockData]);

  return {
    fundingCalls,
    loading,
    error,
    refetch: fetchFunction,
    usingMockData: useMockData,
  };
}
