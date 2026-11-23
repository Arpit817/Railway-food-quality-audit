import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { COMPLAINTS, VENDORS, KITCHENS, BATCHES } from './utils/mockData.js';
import { generateBulkComplaints } from './utils/dataGenerator.js';
import { updateComplaintStatus } from './utils/complaintUtils.js';
import { useComplaintFilters } from './hooks/index.js';
import { Layout, Toast } from './components/ui/index.js';
import { ComplaintCard } from './components/ComplaintCard.jsx';
import { ComplaintDetailPanel } from './components/ComplaintDetailPanel.jsx';
import { PassengerMobileView } from './components/PassengerMobileView.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { AuditClock } from './components/AuditClock.jsx';
import { RenderCounter } from './components/RenderCounter.jsx';

/**
 * Stage 8 + 9: App Component Refactored with Custom Hooks
 * Demonstrates:
 * - Replacement of manual filtering logic with custom `useComplaintFilters` hook
 * - Integration of PassengerFeedbackForm with client-side canvas photo downscaling
 * - Uncontrolled component integration and accessibility features
 */
function App() {
  const [useBulkData, setUseBulkData] = useState(false);

  const initialComplaints = useMemo(() => {
    return useBulkData ? generateBulkComplaints(500) : COMPLAINTS;
  }, [useBulkData]);

  const [complaintList, setComplaintList] = useState(initialComplaints);

  useEffect(() => {
    setComplaintList(initialComplaints);
    setSelectedComplaintId(initialComplaints[0]?.id || null);
  }, [initialComplaints]);

  const [selectedComplaintId, setSelectedComplaintId] = useState(COMPLAINTS[0]?.id || null);
  const [activeView, setActiveView] = useState('dashboard');
  const [activeToast, setActiveToast] = useState(null);

  // REFACTORED: Extracted all filtering & derived statistics into custom hook!
  const {
    filters,
    filteredComplaints,
    severityCounts,
    handleFilterChange,
    handleResetFilters
  } = useComplaintFilters(complaintList);

  const vendorMap = useMemo(() => {
    return VENDORS.reduce((acc, v) => ({ ...acc, [v.id]: v }), {});
  }, []);

  const kitchenMap = useMemo(() => {
    return KITCHENS.reduce((acc, k) => ({ ...acc, [k.id]: k }), {});
  }, []);

  const batchMap = useMemo(() => {
    return BATCHES.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});
  }, []);

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

  const handleStatusChange = useCallback((complaintId, newStatus, remarks) => {
    setComplaintList((prevList) =>
      prevList.map((complaint) => {
        if (complaint.id === complaintId) {
          return updateComplaintStatus(complaint, newStatus, remarks, 'insp-delhi-01');
        }
        return complaint;
      })
    );
  }, []);

  const handleAddNewFeedback = useCallback((newFeedback) => {
    setComplaintList((prev) => [newFeedback, ...prev]);
    setSelectedComplaintId(newFeedback.id);
  }, []);

  // Simulated background grievance interval
  useEffect(() => {
    const timer = setInterval(() => {
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newRef = `RAIL-2026-${randomSuffix}`;

      const newComplaint = {
        id: `cmp-live-${Date.now()}`,
        referenceNo: newRef,
        token: `LIVE${randomSuffix}`,
        batchId: 'bat-901',
        vendorId: 'ven-001',
        kitchenId: 'kit-101',
        rating: 1,
        category: 'foreign_object',
        comment: 'Foreign metal shard reported in rice packet.',
        severity: 'high',
        status: 'new',
        createdAt: new Date().toISOString(),
        images: [],
        actionLogs: [
          {
            id: `log-${Date.now()}`,
            action: 'CREATED',
            remarks: 'Simulated grievance via authorized packaging QR',
            timestamp: new Date().toISOString(),
            userId: 'live-system'
          }
        ]
      };

      setComplaintList((prev) => [newComplaint, ...prev]);

      setActiveToast({
        id: newComplaint.id,
        type: 'alert',
        title: 'New High Severity Complaint Registered!',
        message: '"Foreign metal shard reported in rice packet."',
        meta: `Ref: ${newRef} • Train: 12424 • Category: FOREIGN OBJECT`
      });
    }, 20000);

    return () => clearInterval(timer);
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
          sampleComplaint={selectedComplaint || complaintList[0]}
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
                Refactored with custom hooks (useComplaintFilters, useOnlineStatus, useToggle).
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => setUseBulkData(!useBulkData)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  useBulkData
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <span>⚡ Load:</span>
                <strong>{useBulkData ? '500+ Complaints' : '20 Complaints'}</strong>
              </button>

              <AuditClock />
            </div>
          </div>

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
