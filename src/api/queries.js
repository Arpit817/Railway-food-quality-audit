import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintsApi, metadataApi } from './complaintsApi.js';
import { updateComplaintStatus } from '../utils/complaintUtils.js';

/**
 * Standard Query Keys Factory
 * Ensures consistent cache key indexing across queries and mutations
 */
export const queryKeys = {
  complaints: {
    all: ['complaints'],
    list: (filters) => ['complaints', 'list', filters],
    detail: (id) => ['complaints', 'detail', id]
  },
  metadata: {
    all: ['metadata'],
    vendors: ['metadata', 'vendors'],
    kitchens: ['metadata', 'kitchens'],
    batches: ['metadata', 'batches'],
    token: (token) => ['metadata', 'token', token]
  }
};

/**
 * Hook to fetch complaints with caching, background revalidation & 30s polling
 * Demonstrates:
 * - Filter-aware query keys: ['complaints', 'list', filters]
 * - refetchInterval: 30 seconds background sync
 * - Eliminates manual useEffect fetching!
 */
export function useComplaintsQuery(filters = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.complaints.list(filters),
    queryFn: () => complaintsApi.getAll(filters),
    refetchInterval: options.refetchInterval !== undefined ? options.refetchInterval : 30000,
    select: (data) => data || []
  });
}

/**
 * Hook to fetch master domain metadata (vendors, kitchens, batches)
 */
export function useMetadataQuery() {
  const vendorsQuery = useQuery({
    queryKey: queryKeys.metadata.vendors,
    queryFn: metadataApi.getVendors,
    staleTime: Infinity // Static reference data rarely changes
  });

  const kitchensQuery = useQuery({
    queryKey: queryKeys.metadata.kitchens,
    queryFn: metadataApi.getKitchens,
    staleTime: Infinity
  });

  const batchesQuery = useQuery({
    queryKey: queryKeys.metadata.batches,
    queryFn: metadataApi.getBatches,
    staleTime: 1000 * 60 * 15
  });

  return {
    vendors: vendorsQuery.data || [],
    kitchens: kitchensQuery.data || [],
    batches: batchesQuery.data || [],
    isLoading: vendorsQuery.isLoading || kitchensQuery.isLoading || batchesQuery.isLoading,
    isError: vendorsQuery.isError || kitchensQuery.isError || batchesQuery.isError,
    error: vendorsQuery.error || kitchensQuery.error || batchesQuery.error
  };
}

/**
 * Hook to resolve and verify QR packaging token
 */
export function useTokenResolutionQuery(token) {
  return useQuery({
    queryKey: queryKeys.metadata.token(token),
    queryFn: () => metadataApi.resolveToken(token),
    enabled: Boolean(token && token.trim().length > 0),
    retry: false
  });
}

/**
 * Hook for Passenger Feedback Submission (POST /complaints)
 * Demonstrates:
 * - useMutation
 * - Invalidation of cached complaint lists
 */
export function useCreateComplaintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newComplaint) => complaintsApi.create(newComplaint),
    onSuccess: () => {
      // Invalidate all complaint queries so dashboard syncs immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all });
    }
  });
}

/**
 * Hook for Inspector Status Progression (PATCH /complaints/:id)
 * Demonstrates:
 * - OPTIMISTIC UPDATES: UI immediately updates before server responds
 * - onError: Automatic rollback to previous snapshot on network failure
 * - onSettled: Query invalidation to guarantee server consistency
 */
export function useUpdateComplaintStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, remarks, userId }) => {
      return complaintsApi.updateStatus(id, {
        status,
        remarks,
        userId
      });
    },

    // OPTIMISTIC UPDATE LIFECYCLE
    onMutate: async ({ id, status, remarks, userId }) => {
      // 1. Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.complaints.all });

      // 2. Snapshot previous cache value
      const previousComplaints = queryClient.getQueryData(queryKeys.complaints.list({}));

      // 3. Optimistically update local cache immediately
      if (previousComplaints) {
        queryClient.setQueryData(queryKeys.complaints.list({}), (old = []) =>
          old.map((c) => {
            if (c.id === id) {
              return updateComplaintStatus(c, status, remarks, userId || 'insp-rq-optimistic');
            }
            return c;
          })
        );
      }

      // Return context with snapshot for rollback
      return { previousComplaints };
    },

    // If mutation fails, rollback to snapshot!
    onError: (err, variables, context) => {
      if (context?.previousComplaints) {
        queryClient.setQueryData(queryKeys.complaints.list({}), context.previousComplaints);
      }
    },

    // Always refetch after error or success to guarantee exact server state
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all });
    }
  });
}
