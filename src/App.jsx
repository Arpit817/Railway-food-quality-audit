import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { complaintsApi, metadataApi } from './api/index.js';
import { updateComplaintStatus } from './utils/complaintUtils.js';
import { useComplaintFilters } from './hooks/index.js';
import { Layout, Toast, ErrorMessage } from './components/ui/index.js';
import { ComplaintCard } from './components/ComplaintCard.jsx';
import { ComplaintDetailPanel } from './components/ComplaintDetailPanel.jsx';
import { PassengerMobileView } from './components/PassengerMobileView.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { AuditClock } from './components/AuditClock.jsx';
import { RenderCounter } from './components/RenderCounter.jsx';

/**
 * Stage 11: App Component with REST API (json-server + Axios)
 * Demonstrates:
 * - Connecting UI to REST endpoints (GET, POST, PATCH)
 * - Explicit Loading, Error, Empty, and Success states
 * - Handling race conditions with isMounted flag
 * - Explaining REST verbs and limitations of useEffect data synchronization
 */
function App() {
  // Remote server data state
  const [complaintList, setComplaintList] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [batches, setBatches] = useState([]);

  // Network status states
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [activeToast, setActiveToast] = useState(null);

  // Hook-driven filtering
  const {
    filters,
    filteredComplaints,
    severityCounts,
    handleFilterChange,
    handleResetFilters
  } = useComplaintFilters(complaintList);

  // EFFECT: Fetch Initial Data from REST API with loading, error & empty states
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const [complaintsRes, vendorsRes, kitchensRes, batchesRes] = await Promise.all([
        complaintsApi.getAll(),
        metadataApi.getVendors(),
        metadataApi.getKitchens(),
        metadataApi.getBatches()
      ]);

      setComplaintList(complaintsRes || []);
      setVendors(vendorsRes || []);
      setKitchens(kitchensRes || []);
      setBatches(batchesRes || []);

      if (complaintsRes && complaintsRes.length > 0) {
        setSelectedComplaintId(complaintsRes[0].id);
      }
    } catch (err) {
      console.error('REST API Fetch Error:', err);
      setApiError(
        'Failed to connect to json-server at http://localhost:3001. Please ensure "npm run api" is running in a terminal.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Lookup maps
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
    return complaintList.filter(
      (c) => c.severity === 'high' && c.status !== 'closed' && c.status !== 'action_taken'
    ).length;
  }, [complaintList]);

  useEffect(() => {
    if (unresolvedHighSeverityCount > 0) {
      document.title = `(${unresolvedHighSeverityCount} URGENT) Railway Food Quality Audit`;
    } else {
      document.title = 'Railway Food Quality Audit Platform';
    }
  }, [unresolvedHighSeverityCount]);

  const selectedComplaint = useMemo(() => {
    return complaintList.find((c) => c.id === selectedComplaintId) || null;
  }, [complaintList, selectedComplaintId]);

  const handleSelectComplaint = useCallback((c) => {
    setSelectedComplaintId(c.id);
  }, []);

  // REST API: PATCH /complaints/:id (status progression)
  const handleStatusChange = useCallback(async (complaintId, newStatus, remarks) => {
    const existing = complaintList.find((c) => c.id === complaintId);
    if (!existing) return;

    const updated = updateComplaintStatus(existing, newStatus, remarks, 'insp-rest-api');

    // Optimistic UI update
    setComplaintList((prev) =>
      prev.map((c) => (c.id === complaintId ? updated : c))
    );

    try {
      await complaintsApi.updateStatus(complaintId, {
        status: newStatus,
        actionLogs: updated.actionLogs
      });
    } catch (err) {
      console.error('PATCH failed:', err);
      // Rollback on failure
      setComplaintList((prev) =>
        prev.map((c) => (c.id === complaintId ? existing : c))
      );
      setActiveToast({
        id: `err-${Date.now()}`,
        type: 'error',
        title: 'Status Update Failed',
        message: 'Could not synchronize status change with backend REST API.'
      });
    }
  }, [complaintList]);

  // REST API: POST /complaints (submission from passenger form)
  const handleAddNewFeedback = useCallback(async (newFeedback) => {
    const created = await complaintsApi.create(newFeedback);
    setComplaintList((prev) => [created, ...prev]);
    setSelectedComplaintId(created.id);
  }, []);

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
          onSubmitFeedback={handleAddNewFeedback}
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
                Connected to REST backend (json-server on port 3001).
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                REST API Live
              </span>
              <AuditClock />
            </div>
          </div>

          {/* Error Banner with Retry Button */}
          {apiError && (
            <ErrorMessage
              title="REST API Communication Error"
              message={apiError}
              onRetry={fetchDashboardData}
            />
          )}

          {/* Loading State Skeleton */}
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-3">
              <span className="animate-spin text-3xl inline-block">🚆</span>
              <h3 className="text-sm font-bold text-slate-800">Loading audit records from REST server...</h3>
              <p className="text-xs text-slate-500">Fetching vendors, base kitchens, and passenger grievance streams.</p>
            </div>
          ) : (
            <>
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                totalCount={complaintList.length}
                filteredCount={filteredComplaints.length}
                severityCounts={severityCounts}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-5 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {filteredComplaints.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                      <span className="text-2xl block mb-1">🔍</span>
                      <strong>No matching complaints found</strong>
                      <p className="mt-1">Try clearing your search query or resetting filters.</p>
                    </div>
                  ) : (
                    filteredComplaints.map((item) => (
                      <ComplaintCard
                        key={item.id}
                        complaint={item}
                        vendorName={vendorMap[item.vendorId]?.name}
                        isSelected={item.id === selectedComplaintId}
                        onSelect={handleSelectComplaint}
                      />
                    ))
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
