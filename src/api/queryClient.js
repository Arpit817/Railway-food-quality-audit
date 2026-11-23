import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack QueryClient Configuration
 * Demonstrates:
 * - staleTime (5 minutes): Data remains fresh in cache without background refetching
 * - gcTime (10 minutes): Inactive cache garbage collection threshold
 * - refetchOnWindowFocus: Automatically syncs data when the inspector returns to the tab
 * - retry: Automatic retry on network drops
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,    // 10 minutes
      refetchOnWindowFocus: true,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
    },
    mutations: {
      retry: 1
    }
  }
});
