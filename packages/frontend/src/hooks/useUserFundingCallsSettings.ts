import { useCallback, useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "./useAuth";
import type { Json } from "../types/database";

// Type for the settings JSONB field structure
interface FundingCallUserSettings {
  favorite?: boolean | null;
  notes?: string | null;
  priority?: "low" | "medium" | "high" | null;
  reminder_date?: string | null;
  [key: string]: Json; // Allow additional custom fields but type-safe
}

interface UseUserFundingCallSettingsReturn {
  // Favorite-specific methods
  toggleFavorite: (fundingCallId: number) => Promise<void>;
  isFavorite: (fundingCallId: number) => boolean;

  // General settings methods
  updateSettings: (
    fundingCallId: number,
    settings: Partial<FundingCallUserSettings>
  ) => Promise<void>;
  getSettings: (fundingCallId: number) => FundingCallUserSettings | null;

  // State
  loading: boolean;
  error: string | null;

  // Data
  userSettings: Map<number, FundingCallUserSettings>;
}

/**
 * Custom hook for managing user-specific funding call settings
 * Handles favorites, notes, priorities, and other user preferences
 *
 * Uses Supabase upsert to create or update settings in user_funding_calls table
 * All operations are user-scoped via RLS policies
 */
export function useUserFundingCallSettings(): UseUserFundingCallSettingsReturn {
  const { user } = useAuth();
  const [userSettings, setUserSettings] = useState<
    Map<number, FundingCallUserSettings>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all user settings from database
   * Called on mount and when user changes
   */
  const loadUserSettings = useCallback(async () => {
    if (!user?.id) {
      setUserSettings(new Map());
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("user_funding_calls")
        .select("funding_call_id, settings")
        .eq("user_id", user.id);

      if (supabaseError) throw supabaseError;

      // Convert array to Map for efficient lookups
      const settingsMap = new Map<number, FundingCallUserSettings>();
      data?.forEach((row) => {
        settingsMap.set(
          row.funding_call_id,
          (row.settings as FundingCallUserSettings) || {}
        );
      });

      setUserSettings(settingsMap);
      console.log(`Loaded ${settingsMap.size} user funding call settings`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load user settings";
      setError(errorMessage);
      console.error("Error loading user settings:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Update settings for a specific funding call
   * Uses upsert to create or update the record
   */
  const updateSettings = useCallback(
    async (
      fundingCallId: number,
      newSettings: Partial<FundingCallUserSettings>
    ) => {
      if (!user?.id) {
        throw new Error("User must be logged in to update settings");
      }

      try {
        setError(null);

        // Get current settings and merge with new ones
        const currentSettings = userSettings.get(fundingCallId) || {};
        const mergedSettings = { ...currentSettings, ...newSettings };

        // Upsert to database
        const { error: supabaseError } = await supabase
          .from("user_funding_calls")
          .upsert(
            {
              user_id: user.id,
              funding_call_id: fundingCallId,
              settings: mergedSettings,
            },
            {
              onConflict: "user_id,funding_call_id", // Handle unique constraint
            }
          );

        if (supabaseError) throw supabaseError;

        // Update local state optimistically
        setUserSettings((prev) => {
          const newMap = new Map(prev);
          newMap.set(fundingCallId, mergedSettings);
          return newMap;
        });

        console.log(
          `Updated settings for funding call ${fundingCallId}:`,
          mergedSettings
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update settings";
        setError(errorMessage);
        console.error("Error updating settings:", err);
        throw err; // Re-throw so UI can handle it
      }
    },
    [user?.id, userSettings]
  );

  /**
   * Toggle favorite status for a funding call
   * Convenience method that updates the favorite field
   */
  const toggleFavorite = useCallback(
    async (fundingCallId: number) => {
      const currentSettings = userSettings.get(fundingCallId) || {};
      const newFavoriteStatus = !currentSettings.favorite;

      await updateSettings(fundingCallId, { favorite: newFavoriteStatus });
    },
    [updateSettings, userSettings]
  );

  /**
   * Check if a funding call is marked as favorite
   * Returns false if no settings exist for this funding call
   */
  const isFavorite = useCallback(
    (fundingCallId: number): boolean => {
      return userSettings.get(fundingCallId)?.favorite === true;
    },
    [userSettings]
  );

  /**
   * Get all settings for a specific funding call
   * Returns null if no settings exist
   */
  const getSettings = useCallback(
    (fundingCallId: number): FundingCallUserSettings | null => {
      return userSettings.get(fundingCallId) || null;
    },
    [userSettings]
  );

  // Load settings when component mounts or user changes
  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  return {
    // Favorite-specific methods
    toggleFavorite,
    isFavorite,

    // General settings methods
    updateSettings,
    getSettings,

    // State
    loading,
    error,

    // Data
    userSettings,
  };
}
