import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useComplaintsQuery,
  useMetadataQuery,
  useUpdateComplaintStatusMutation
} from './api/index.js';
import { useComplaintFilters } from './hooks/index.js';
import { Layout, Toast, ErrorMessage } from './components/ui/index.js';
import { ComplaintCard } from './components/ComplaintCard.jsx';
import { ComplaintDetailPanel } from './components/ComplaintDetailPanel.jsx';
import { PassengerMobileView } from './components/PassengerMobileView.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { AuditClock } from './components/AuditClock.jsx';
import { RenderCounter } from './components/RenderCounter.jsx';

const PAGE_SIZE = 6;

/**
 * Stage 12: App Component with TanStack React Query Migration
 * Demonstrates:
 * - Replacement of manual useEffect fetching with `useComplaintsQuery` and `useMetadataQuery`
 * - Automatic background cache sync every 30s (`refetchInterval: 30000`)
 * - Optimistic status transitions with rollback via `useUpdateComplaintStatusMutation`
 * - Filter-aware query keys and inbox pagination
 * - Theoretical comparison of Client State vs Server State
 */
function App() {
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [activeToast, setActiveToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. REACT QUERY: Server state hooks
  const {
    data: complaints = [],
    isLoading: isComplaintsLoading,
    isError: isComplaintsError,
    error: complaintsError,
    refetch: refetchComplaints,
    isFetching: isComplaintsFetching
  } = useComplaintsQuery();

  const {
    vendors,
    kitchens,
    batches,
    isLoading: isMetadataLoading,
    isError: isMetadataError,
    error: metadataError
  } = useMetadataQuery();

  // 2. REACT QUERY: Optimistic mutation hook
  const updateStatusMutation = useUpdateComplaintStatusMutation();

  // Auto-select first complaint on initial load
  useEffect(() => {
    if (!selectedComplaintId && complaints.length > 0) {
      setSelectedComplaintId(complaints[0].id);
    }
  }, [complaints, selectedComplaintId]);

  // Client-side filtering via custom hook
  const {
    filters,
    filteredComplaints,
    severityCounts,
    handleFilterChange,
    handleResetFilters
  } = useComplaintFilters(complaints);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Inbox pagination calculations
  const totalPages = Math.ceil(filteredComplaints.length / PAGE_SIZE) || 1;
  const paginatedComplaints = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredComplaints.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredComplaints, currentPage]);

  // Lookup maps memoized
  const vendorMap = useMemo(() => {
    return vendors.reduce((acc, v) => ({ ...acc, [v.id]: v }), {});
  }, [vendors]);

  const kitchenMap = useMemo(() => {
    return kitchens.reduce((acc, k) => ({ ...acc, [k.id]: k }), {});
  }, [kitchens]);

  const batchMap = useMemo(() => {
    return batches.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});
  }, [batches]);

  const unresolvedHighSeverityCount = useMemo(() => {
    return complaints.filter(
      (c) => c.severity === 'high' && c.status !== 'closed' && c.status !== 'action_taken'
    ).length;
  }, [complaints]);

  useEffect(() => {
    if (unresolvedHighSeverityCount > 0) {
      document.title = `(${unresolvedHighSeverityCount} URGENT) Railway Food Quality Audit`;
    } else {
      document.title = 'Railway Food Quality Audit Platform';
    }
  }, [unresolvedHighSeverityCount]);

  const selectedComplaint = useMemo(() => {
    return complaints.find((c) => c.id === selectedComplaintId) || null;
  }, [complaints, selectedComplaintId]);

  const handleSelectComplaint = useCallback((c) => {
    setSelectedComplaintId(c.id);
  }, []);

  // React Query Optimistic Status Transition Handler
  const handleStatusChange = useCallback((complaintId, newStatus, remarks) => {
    updateStatusMutation.mutate({
      id: complaintId,
      status: newStatus,
      remarks,
      userId: 'insp-rq-active'
    });
  }, [updateStatusMutation]);

  const isLoading = isComplaintsLoading || isMetadataLoading;
  const isError = isComplaintsError || isMetadataError;
  const errorMessage = complaintsError?.message || metadataError?.message;

  return (
    <Layout
      userRole="Inspector (Northern Zone)"
      activeView={activeView}
      onViewChange={(view) => setActiveView(view)}
    >
      <Toast toast={activeToast} onClose={() => setActiveToast(null)} />

      {activeView === 'passenger' && (
        <PassengerMobileView
          initialToken="Xk9PqA72mZ"
          onBackToDashboard={() => setActiveView('dashboard')}
        />
      )}

      {activeView === 'dashboard' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  Railway Food Quality Audit Inbox
                </h2>
                <RenderCounter componentName="AppInbox" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Powered by TanStack React Query (Auto-sync 30s • Optimistic updates • Server state cache).
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
              {/* React Query Live Status Pill */}
              <div className="flex items-center gap-1.5 bg-blue-50 text-railway-800 border border-blue-200 text-xs px-2.5 py-1 rounded-md font-medium">
                <span className={`w-2 h-2 rounded-full ${isComplaintsFetching ? 'bg-amber-500 animate-spin' : 'bg-emerald-500'}`} />
                <span>{isComplaintsFetching ? 'Syncing...' : 'React Query Cached'}</span>
              </div>
              <AuditClock />
            </div>
          </div>

          {/* Network Error Banner with React Query refetch */}
          {isError && (
            <ErrorMessage
              title="React Query Server Sync Error"
              message={errorMessage || 'Failed to communicate with json-server REST backend.'}
              onRetry={refetchComplaints}
            />
          )}

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
              <span className="animate-spin text-3xl inline-block">⏳</span>
              <h3 className="text-sm font-bold text-slate-800">Hydrating server cache with React Query...</h3>
              <p className="text-xs text-slate-500">Query keys: <code>['complaints']</code> and <code>['metadata']</code></p>
            </div>
          ) : (
            <>
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                totalCount={complaints.length}
                filteredCount={filteredComplaints.length}
                severityCounts={severityCounts}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Column: Complaint Cards with Pagination */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                    <span>Showing Page {currentPage} of {totalPages}</span>
                    <span>Total {filteredComplaints.length} Complaints</span>
                  </div>

                  {paginatedComplaints.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                      <span className="text-2xl block mb-1">🔍</span>
                      <strong>No matching complaints found</strong>
                      <p className="mt-1">Try clearing your filters or changing search terms.</p>
                    </div>
                  ) : (
                    paginatedComplaints.map((item) => (
                      <ComplaintCard
                        key={item.id}
                        complaint={item}
                        vendorName={vendorMap[item.vendorId]?.name}
                        isSelected={item.id === selectedComplaintId}
                        onSelect={handleSelectComplaint}
                      />
                    ))
                  )}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
                      >
                        &larr; Previous
                      </button>
                      <span className="text-slate-600 font-semibold font-mono">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium cursor-pointer"
                      >
                        Next &rarr;
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Detail Panel */}
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
            </>
          )}
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
          <span className="text-3xl block" role="img" aria-label="chart">📊</span>
          <h3 className="text-base font-bold text-slate-800">Quality Analytics Hub</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Aggregated vendor quality scorecards, category distribution, and hygiene violation alerts will be activated in upcoming stages.
          </p>
        </div>
      )}
    </Layout>
  );
}

export default App;
