import { useState, useCallback, useEffect } from "react";

// Available pages in the app
export type PageType = "funding-calls" | "settings";

// Shared state outside React components (singleton pattern)
let currentPageState: PageType = "funding-calls";
const listeners = new Set<(page: PageType) => void>();

// Helper functions for shared state management
const notifyListeners = (page: PageType) => {
  listeners.forEach((listener) => listener(page));
};

const setGlobalPage = (page: PageType) => {
  currentPageState = page;
  notifyListeners(page);

  // Update URL for better UX
  const path = page === "funding-calls" ? "/" : `/${page}`;
  window.history.pushState({}, "", path);

  console.log(`Navigating to: ${page}`); // Debug log
};

interface UseNavigationReturn {
  currentPage: PageType;
  navigateTo: (page: PageType) => void;
}

/**
 * Simple navigation hook with shared state
 * Uses singleton pattern to sync state across all hook instances
 */
export function useNavigation(): UseNavigationReturn {
  const [currentPage, setCurrentPage] = useState<PageType>(currentPageState);

  // Subscribe to global state changes
  useEffect(() => {
    const listener = (page: PageType) => {
      setCurrentPage(page);
    };

    listeners.add(listener);

    // Cleanup: remove listener when component unmounts
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const navigateTo = useCallback((page: PageType) => {
    setGlobalPage(page);
  }, []);

  return {
    currentPage,
    navigateTo,
  };
}
