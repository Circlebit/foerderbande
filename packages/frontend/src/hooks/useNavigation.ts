import { useState, useCallback, useEffect } from "react";

// Available pages in the app
export type PageType = "funding-calls" | "settings" | "sources";

// Global state - shared across all hook instances
let globalCurrentPage: PageType = "funding-calls";
const listeners = new Set<(page: PageType) => void>();

/**
 * Simple navigation hook with global state
 * Much simpler than Context for small apps
 */
export function useNavigation() {
  const [currentPage, setCurrentPage] = useState(globalCurrentPage);

  const navigateTo = useCallback((page: PageType) => {
    globalCurrentPage = page;

    // Update URL for better UX
    const path = page === "funding-calls" ? "/" : `/${page}`;
    window.history.pushState({}, "", path);

    // Notify all listeners (all hook instances)
    listeners.forEach((listener) => listener(page));

    console.log(`Navigating to: ${page}`); // Debug log
  }, []);

  // Subscribe to navigation changes on mount
  const updateCurrentPage = useCallback((page: PageType) => {
    setCurrentPage(page);
  }, []);

  // Register listener on mount, cleanup on unmount
  useEffect(() => {
    listeners.add(updateCurrentPage);
    return () => {
      listeners.delete(updateCurrentPage);
    };
  }, [updateCurrentPage]);

  return {
    currentPage,
    navigateTo,
  };
}
