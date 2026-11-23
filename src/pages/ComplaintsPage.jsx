import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  useComplaintsQuery,
  useMetadataQuery,
  useUpdateComplaintStatusMutation
} from '../api/index.js';
import { FilterBar } from '../components/FilterBar.jsx';
import { ComplaintCard } from '../components/ComplaintCard.jsx';
import { ComplaintDetailPanel } from '../components/ComplaintDetailPanel.jsx';
import { RenderCounter } from '../components/RenderCounter.jsx';

const PAGE_SIZE = 6;

/**
 * ComplaintsPage (/dashboard/complaints)
 * Demonstrates:
 * - Query parameters synchronization using `useSearchParams` hook (?status=&category=)
 * - Deep linking to specific complaints
 */
export function ComplaintsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Read URL query parameters
  const statusParam = searchParams.get('status') || '';
  const categoryParam = searchParams.get('category') || '';
  const severityParam = searchParams.get('severity') || 'ALL';
  const searchParam = searchParams.get('search') || '';

  const { data: complaints = [], isLoading } = useComplaintsQuery();
  const { vendors, kitchens, batches } = useMetadataQuery();
  const updateStatusMutation = useUpdateComplaintStatusMutation();

  const filters = useMemo(() => ({
    search: searchParam,
    status: statusParam,
    category: categoryParam,
    severity: severityParam
  }), [searchParam, statusParam, categoryParam, severityParam]);

  const handleFilterChange = (field, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === 'ALL') {
      nextParams.delete(field);
    } else {
      nextParams.set(field, value);
    }
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  };

  const vendorMap = useMemo(() => vendors.reduce((acc, v) => ({ ...acc, [v.id]: v }), {}), [vendors]);
  const kitchenMap = useMemo(() => kitchens.reduce((acc, k) => ({ ...acc, [k.id]: k }), {}), [kitchens]);
  const batchMap = useMemo(() => batches.reduce((acc, b) => ({ ...acc, [b.id]: b }), {}), [batches]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matchesRef = item.referenceNo.toLowerCase().includes(q);
        const matchesToken = item.token.toLowerCase().includes(q);
        const matchesComment = item.comment.toLowerCase().includes(q);
        const matchesPnr = item.pnr ? item.pnr.toLowerCase().includes(q) : false;
        if (!matchesRef && !matchesToken && !matchesComment && !matchesPnr) return false;
      }
      if (filters.status && item.status !== filters.status) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.severity !== 'ALL' && item.severity !== filters.severity.toLowerCase()) return false;
      return true;
    });
  }, [complaints, filters]);

  const severityCounts = useMemo(() => ({
    high: complaints.filter((c) => c.severity === 'high').length,
    medium: complaints.filter((c) => c.severity === 'medium').length,
    low: complaints.filter((c) => c.severity === 'low').length
  }), [complaints]);

  useEffect(() => {
    if (!selectedComplaintId && filteredComplaints.length > 0) {
      setSelectedComplaintId(filteredComplaints[0].id);
    }
  }, [filteredComplaints, selectedComplaintId]);

  const totalPages = Math.ceil(filteredComplaints.length / PAGE_SIZE) || 1;
  const paginatedComplaints = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredComplaints.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredComplaints, currentPage]);

  const selectedComplaint = useMemo(() => {
    return complaints.find((c) => c.id === selectedComplaintId) || null;
  }, [complaints, selectedComplaintId]);

  const handleStatusChange = useCallback((complaintId, newStatus, remarks) => {
    updateStatusMutation.mutate({
      id: complaintId,
      status: newStatus,
      remarks,
      userId: 'insp-router-active'
    });
  }, [updateStatusMutation]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Complaints Ledger (Query Param Synced)</h2>
          <p className="text-xs text-slate-500">
            Shareable URL filter state synced with React Router <code>useSearchParams</code>.
          </p>
        </div>
        <RenderCounter componentName="ComplaintsPage" />
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalCount={complaints.length}
        filteredCount={filteredComplaints.length}
        severityCounts={severityCounts}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <span>Page {currentPage} of {totalPages}</span>
            <span>Total {filteredComplaints.length} Records</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              Loading complaints...
            </div>
          ) : paginatedComplaints.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
              No matching records for these query parameters.
            </div>
          ) : (
            paginatedComplaints.map((item) => (
              <ComplaintCard
                key={item.id}
                complaint={item}
                vendorName={vendorMap[item.vendorId]?.name}
                isSelected={item.id === selectedComplaintId}
                onSelect={(c) => setSelectedComplaintId(c.id)}
              />
            ))
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                &larr; Prev
              </button>
              <span className="font-semibold text-slate-600">Page {currentPage} / {totalPages}</span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 sticky top-4">
          <ComplaintDetailPanel
            complaint={selectedComplaint}
            vendor={selectedComplaint ? vendorMap[selectedComplaint.vendorId] : null}
            kitchen={selectedComplaint ? kitchenMap[selectedComplaint.kitchenId] : null}
            batch={selectedComplaint ? batchMap[selectedComplaint.batchId] : null}
            onClose={() => setSelectedComplaintId(null)}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}

export default ComplaintsPage;
