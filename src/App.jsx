import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { COMPLAINTS, VENDORS, KITCHENS, BATCHES } from './utils/mockData.js';
import { generateBulkComplaints } from './utils/dataGenerator.js';
import { updateComplaintStatus } from './utils/complaintUtils.js';
import { Layout, Toast } from './components/ui/index.js';
import { ComplaintCard } from './components/ComplaintCard.jsx';
import { ComplaintDetailPanel } from './components/ComplaintDetailPanel.jsx';
import { PassengerMobileView } from './components/PassengerMobileView.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { AuditClock } from './components/AuditClock.jsx';
import { RenderCounter } from './components/RenderCounter.jsx';

const LOCAL_STORAGE_FILTER_KEY = 'railfood_dashboard_filters';

/**
 * Stage 7: Performance Optimized App Component
 * Demonstrates:
 * - 500+ records bulk generator simulating production railway grievance loads
 * - React.memo on ComplaintCard and ComplaintDetailPanel to eliminate redundant renders
 * - useCallback on handleSelectComplaint, handleStatusChange, and handleFilterChange to maintain referential identity
 * - useMemo on expensive filter passes, severity metric reductions, and relational entity maps
 * - State localization: moving the ticking clock down to <AuditClock /> so App does NOT re-render every second!
 * - Note on when NOT to optimize (premature optimization trade-offs)
 */
function App() {
  // Main dataset: switchable between standard mock (20) and high-load stress test (500+)
  const [useBulkData, setUseBulkData] = useState(false);

  // Memoize bulk generation so it only runs when toggled
  const initialComplaints = useMemo(() => {
    return useBulkData ? generateBulkComplaints(500) : COMPLAINTS;
  }, [useBulkData]);

  const [complaintList, setComplaintList] = useState(initialComplaints);

  // Sync when toggling between 20 and 500 items
  useEffect(() => {
    setComplaintList(initialComplaints);
    setSelectedComplaintId(initialComplaints[0]?.id || null);
  }, [initialComplaints]);

  const [selectedComplaintId, setSelectedComplaintId] = useState(COMPLAINTS[0]?.id || null);
  const [activeView, setActiveView] = useState('dashboard');
  const [activeToast, setActiveToast] = useState(null);

  // Filters state with localStorage hydration
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_FILTER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to read filters from localStorage', e);
    }
    return {
      search: '',
      status: '',
      category: '',
      severity: 'ALL'
    };
  });

  // OPTIMIZATION 1: useMemo for Relational Lookup Maps
  // Prevents re-reducing vendors, kitchens, and batches on every render
  const vendorMap = useMemo(() => {
    return VENDORS.reduce((acc, v) => ({ ...acc, [v.id]: v }), {});
  }, []);

  const kitchenMap = useMemo(() => {
    return KITCHENS.reduce((acc, k) => ({ ...acc, [k.id]: k }), {});
  }, []);

  const batchMap = useMemo(() => {
    return BATCHES.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});
  }, []);

  // OPTIMIZATION 2: useMemo for Derived Severity Metrics
  // Only recalculates when complaintList changes
  const severityCounts = useMemo(() => {
    return {
      high: complaintList.filter((c) => c.severity === 'high').length,
      medium: complaintList.filter((c) => c.severity === 'medium').length,
      low: complaintList.filter((c) => c.severity === 'low').length
    };
  }, [complaintList]);

  // Unresolved high severity count for title sync
  const unresolvedHighSeverityCount = useMemo(() => {
    return complaintList.filter(
      (c) => c.severity === 'high' && c.status !== 'closed' && c.status !== 'action_taken'
    ).length;
  }, [complaintList]);

  // Document title sync
  useEffect(() => {
    if (unresolvedHighSeverityCount > 0) {
      document.title = `(${unresolvedHighSeverityCount} URGENT) Railway Food Quality Audit`;
    } else {
      document.title = 'Railway Food Quality Audit Platform';
    }
  }, [unresolvedHighSeverityCount]);

  // Persist filters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_FILTER_KEY, JSON.stringify(filters));
    } catch (e) {}
  }, [filters]);

  // OPTIMIZATION 3: useMemo for Heavy Filter Pass (especially crucial with 500+ items!)
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

  // Selected complaint memoized lookup
  const selectedComplaint = useMemo(() => {
    return complaintList.find((c) => c.id === selectedComplaintId) || null;
  }, [complaintList, selectedComplaintId]);

  // OPTIMIZATION 4: useCallback to stabilize event handler references
  // Prevents child components wrapped in React.memo (ComplaintCard, DetailPanel, FilterBar)
  // from re-rendering just because parent re-rendered!
  const handleSelectComplaint = useCallback((c) => {
    setSelectedComplaintId(c.id);
  }, []);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      category: '',
      severity: 'ALL'
    });
    try {
      localStorage.removeItem(LOCAL_STORAGE_FILTER_KEY);
    } catch (e) {}
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

  // Simulated live complaints every 20s
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
          {/* Header Bar with Performance Stress-Test Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  Railway Food Quality Audit Inbox
                </h2>
                <RenderCounter componentName="AppInbox" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stress-tested with memoized rendering and isolated side effects.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
              {/* Stress-Test Toggle Button (20 vs 500+ records) */}
              <button
                type="button"
                onClick={() => setUseBulkData(!useBulkData)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  useBulkData
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
                title="Toggle between standard 20 records and 500+ bulk stress-test"
              >
                <span>⚡ Load:</span>
                <strong>{useBulkData ? '500+ Complaints (Stress Test)' : '20 Complaints (Standard)'}</strong>
              </button>

              {/* Isolated Clock: ticks every second WITHOUT re-rendering App! */}
              <AuditClock />
            </div>
          </div>

          {/* Fully Controlled FilterBar */}
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalCount={complaintList.length}
            filteredCount={filteredComplaints.length}
            severityCounts={severityCounts}
          />

          {/* Master-Detail Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: List of Complaint Cards (Optimized with React.memo) */}
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

            {/* Right Column: Detail Panel (Wrapped in React.memo) */}
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
