import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

const FILTER_STORAGE_KEY = 'railfood_dashboard_filters';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  category: '',
  severity: 'ALL'
};

/**
 * Custom hook encapsulating dashboard filtering logic and derived statistics
 * Demonstrates:
 * - Composing multiple hooks (`useLocalStorage`, `useMemo`, `useCallback`)
 * - Clean separation of business filter concerns from UI rendering
 */
export function useComplaintFilters(complaintList = []) {
  const [filters, setFilters] = useLocalStorage(FILTER_STORAGE_KEY, DEFAULT_FILTERS);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  }, [setFilters]);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, [setFilters]);

  // Derived severity breakdown counts
  const severityCounts = useMemo(() => {
    return {
      high: complaintList.filter((c) => c.severity === 'high').length,
      medium: complaintList.filter((c) => c.severity === 'medium').length,
      low: complaintList.filter((c) => c.severity === 'low').length
    };
  }, [complaintList]);

  // Filtered dataset
  const filteredComplaints = useMemo(() => {
    return complaintList.filter((item) => {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesRef = item.referenceNo.toLowerCase().includes(q);
        const matchesToken = item.token.toLowerCase().includes(q);
        const matchesComment = item.comment.toLowerCase().includes(q);
        const matchesPnr = item.pnr ? item.pnr.toLowerCase().includes(q) : false;
        if (!matchesRef && !matchesToken && !matchesComment && !matchesPnr) {
          return false;
        }
      }

      if (filters.status && item.status !== filters.status) {
        return false;
      }

      if (filters.category && item.category !== filters.category) {
        return false;
      }

      if (filters.severity !== 'ALL' && item.severity !== filters.severity.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [complaintList, filters]);

  return {
    filters,
    filteredComplaints,
    severityCounts,
    handleFilterChange,
    handleResetFilters
  };
}

export default useComplaintFilters;
