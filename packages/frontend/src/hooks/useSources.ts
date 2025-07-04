import { useEffect, useState, useCallback } from "react";
import { supabase, handleSupabaseError } from "../services/supabase";
import type { Database } from "../types/database";

// Type alias for source from our database schema
export type Source = Database["public"]["Tables"]["sources"]["Row"];
export type SourceInsert = Database["public"]["Tables"]["sources"]["Insert"];
export type SourceUpdate = Database["public"]["Tables"]["sources"]["Update"];

interface UseSourcesReturn {
  sources: Source[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createSource: (source: SourceInsert) => Promise<void>;
  updateSource: (id: number, updates: SourceUpdate) => Promise<void>;
  deleteSource: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<void>;
}

/**
 * Custom hook for managing crawling sources
 * Handles CRUD operations for the sources table
 */
export function useSources(): UseSourcesReturn {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all sources from database
   */
  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching sources from Supabase...");

      const { data, error: supabaseError } = await supabase
        .from("sources")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) throw supabaseError;

      console.log(`Fetched ${data?.length || 0} sources from database`);
      setSources(data || []);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error("Error fetching sources:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new source
   */
  const createSource = useCallback(async (source: SourceInsert) => {
    try {
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("sources")
        .insert(source)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Add to local state optimistically
      setSources((prev) => [data, ...prev]);
      console.log("Created new source:", data);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error("Error creating source:", err);
      throw err; // Re-throw so UI can handle it
    }
  }, []);

  /**
   * Update an existing source
   */
  const updateSource = useCallback(
    async (id: number, updates: SourceUpdate) => {
      try {
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("sources")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (supabaseError) throw supabaseError;

        // Update local state optimistically
        setSources((prev) =>
          prev.map((source) => (source.id === id ? data : source))
        );
        console.log("Updated source:", data);
      } catch (err) {
        const errorMessage = handleSupabaseError(err);
        setError(errorMessage);
        console.error("Error updating source:", err);
        throw err;
      }
    },
    []
  );

  /**
   * Delete a source
   */
  const deleteSource = useCallback(async (id: number) => {
    try {
      setError(null);

      const { error: supabaseError } = await supabase
        .from("sources")
        .delete()
        .eq("id", id);

      if (supabaseError) throw supabaseError;

      // Remove from local state optimistically
      setSources((prev) => prev.filter((source) => source.id !== id));
      console.log("Deleted source:", id);
    } catch (err) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      console.error("Error deleting source:", err);
      throw err;
    }
  }, []);

  /**
   * Toggle active status of a source
   * Convenience method for enabling/disabling sources
   */
  const toggleActive = useCallback(
    async (id: number) => {
      const source = sources.find((s) => s.id === id);
      if (!source) {
        throw new Error("Source not found");
      }

      await updateSource(id, { is_active: !source.is_active });
    },
    [sources, updateSource]
  );

  // Load sources on mount
  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  return {
    sources,
    loading,
    error,
    refetch: fetchSources,
    createSource,
    updateSource,
    deleteSource,
    toggleActive,
  };
}
