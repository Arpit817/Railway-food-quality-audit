import React, { useState, useEffect } from 'react';
import { COMPLAINTS, VENDORS, KITCHENS, BATCHES } from './utils/mockData.js';
import { updateComplaintStatus } from './utils/complaintUtils.js';
import { Layout, Toast } from './components/ui/index.js';
import { ComplaintCard } from './components/ComplaintCard.jsx';
import { ComplaintDetailPanel } from './components/ComplaintDetailPanel.jsx';
import { PassengerMobileView } from './components/PassengerMobileView.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { RenderCounter } from './components/RenderCounter.jsx';

const LOCAL_STORAGE_FILTER_KEY = 'railfood_dashboard_filters';

/**
 * Stage 6: App Component
 * Demonstrates:
 * - useEffect 1: Document title synchronization based on unresolved high-severity complaints
 * - useEffect 2: Real-time "Last Updated" clock with setInterval and clearInterval cleanup
 * - useEffect 3: Filter persistence with localStorage (load on mount, save on change)
 * - useEffect 4: Simulated incoming live complaint every 20s with interval cleanup and high-severity toast alert
 * - Pitfalls: Showing correct vs wrong dependency arrays and why cleanup is mandatory
 */
function App() {
  const [complaintList, setComplaintList] = useState(COMPLAINTS);
  const [selectedComplaintId, setSelectedComplaintId] = useState(COMPLAINTS[0]?.id || null);
  const [activeView, setActiveView] = useState('dashboard');
  const [activeToast, setActiveToast] = useState(null);

  // Clock state for dashboard live audit feed
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date());

  // Filter state initialized from localStorage if available
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_FILTER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
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

  // Fast relational lookup maps
  const vendorMap = VENDORS.reduce((acc, v) => ({ ...acc, [v.id]: v }), {});
  const kitchenMap = KITCHENS.reduce((acc, k) => ({ ...acc, [k.id]: k }), {});
  const batchMap = BATCHES.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});

  // Unresolved high severity count (status not closed or action_taken)
  const unresolvedHighSeverityCount = complaintList.filter(
    (c) => c.severity === 'high' && c.status !== 'closed' && c.status !== 'action_taken'
  ).length;

  // EFFECT 1: Synchronize document.title with unresolved high severity count
  // Correct Dependency Array: [unresolvedHighSeverityCount]
  // Pitfall avoided: If empty [], title would never update as complaints are resolved!
  useEffect(() => {
    if (unresolvedHighSeverityCount > 0) {
      document.title = `(${unresolvedHighSeverityCount} URGENT) Railway Food Quality Audit`;
    } else {
      document.title = 'Railway Food Quality Audit Platform';
    }

    // Cleanup: Reset title if component unmounts
    return () => {
      document.title = 'Railway Food Quality Audit Platform';
    };
  }, [unresolvedHighSeverityCount]);

  // EFFECT 2: Live Clock ticker updating every second with clearInterval cleanup
  // Demonstrates: mandatory cleanup function to avoid runaway memory leaks
  useEffect(() => {
    const timerId = setInterval(() => {
      setLastUpdatedTime(new Date());
    }, 1000);

    // CLEANUP: Prevents orphan interval continuing in the background
    return () => {
      clearInterval(timerId);
    };
  }, []);

  // EFFECT 3: Persist filter changes to localStorage
  // Demonstrates: side effect execution whenever 'filters' dependency changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_FILTER_KEY, JSON.stringify(filters));
    } catch (e) {
      console.warn('Unable to persist filters to localStorage', e);
    }
  }, [filters]);

  // EFFECT 4: Simulated incoming live passenger complaint every 20 seconds
  // Demonstrates: setInterval with state update, toast trigger, and cleanup
  useEffect(() => {
    const sampleIncoming = [
      {
        category: 'hygiene_issue',
        comment: 'Found oil leaking through carton seal onto coach berth table.',
        rating: 2,
        severity: 'high',
        vendorId: 'ven-001',
        kitchenId: 'kit-101',
        batchId: 'bat-901'
      },
      {
        category: 'foreign_object',
        comment: 'Small metal twist-tie piece found inside dal packet.',
        rating: 1,
        severity: 'high',
        vendorId: 'ven-002',
        kitchenId: 'kit-103',
        batchId: 'bat-904'
      },
      {
        category: 'stale_spoiled_food',
        comment: 'Paneer subzi smells pungent and spoiled.',
        rating: 1,
        severity: 'high',
        vendorId: 'ven-001',
        kitchenId: 'kit-102',
        batchId: 'bat-903'
      }
    ];

    let counter = 0;
    const intervalId = setInterval(() => {
      const template = sampleIncoming[counter % sampleIncoming.length];
      counter += 1;

      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newRef = `RAIL-2026-${randomSuffix}`;

      const newComplaint = {
        id: `cmp-live-${Date.now()}`,
        referenceNo: newRef,
        token: `LIVE${randomSuffix}`,
        batchId: template.batchId,
        vendorId: template.vendorId,
        kitchenId: template.kitchenId,
        rating: template.rating,
        category: template.category,
        comment: template.comment,
        severity: template.severity,
        status: 'new',
        createdAt: new Date().toISOString(),
        images: [],
        actionLogs: [
          {
            id: `log-${Date.now()}`,
            action: 'CREATED',
            remarks: 'Simulated real-time passenger grievance received via QR portal',
            timestamp: new Date().toISOString(),
            userId: 'live-system-simulation'
          }
        ]
      };

      // Functional state update
      setComplaintList((prev) => [newComplaint, ...prev]);

      // Trigger High Severity Alert Toast
      setActiveToast({
        id: newComplaint.id,
        type: 'alert',
        title: 'New High Severity Complaint Registered!',
        message: `"${template.comment.substring(0, 75)}..."`,
        meta: `Ref: ${newRef} • Train: 12424 • Category: ${template.category.replace(/_/g, ' ').toUpperCase()}`
      });
    }, 20000); // every 20 seconds

    // CLEANUP: clear interval when dashboard unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Run on mount

  // Derived severity counts
  const severityCounts = {
    high: complaintList.filter((c) => c.severity === 'high').length,
    medium: complaintList.filter((c) => c.severity === 'medium').length,
    low: complaintList.filter((c) => c.severity === 'low').length
  };

  // Filtered complaint list
  const filteredComplaints = complaintList.filter((item) => {
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

  const selectedComplaint = complaintList.find((c) => c.id === selectedComplaintId) || null;

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      search: '',
      status: '',
      category: '',
      severity: 'ALL'
    };
    setFilters(defaultFilters);
    try {
      localStorage.removeItem(LOCAL_STORAGE_FILTER_KEY);
    } catch (e) {}
  };

  const handleStatusChange = (complaintId, newStatus, remarks) => {
    setComplaintList((prevList) =>
      prevList.map((complaint) => {
        if (complaint.id === complaintId) {
          return updateComplaintStatus(complaint, newStatus, remarks, 'insp-delhi-01');
        }
        return complaint;
      })
    );
  };

  const handleAddNewFeedback = (newFeedback) => {
    setComplaintList((prev) => [newFeedback, ...prev]);
    setSelectedComplaintId(newFeedback.id);
  };

  return (
    <Layout
      userRole="Inspector (Northern Zone)"
      activeView={activeView}
      onViewChange={(view) => setActiveView(view)}
    >
      {/* Toast Alert Banner for Live Incoming Grievances */}
      <Toast toast={activeToast} onClose={() => setActiveToast(null)} />

      {/* 1. Mobile Passenger View */}
      {activeView === 'passenger' && (
        <PassengerMobileView
          sampleComplaint={selectedComplaint || complaintList[0]}
          onSubmitFeedback={handleAddNewFeedback}
          onBackToDashboard={() => setActiveView('dashboard')}
        />
      )}

      {/* 2. Inspector Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="space-y-4">
          {/* Dashboard Header Bar + Live Clock */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  Railway Food Quality Audit Inbox
                </h2>
                <RenderCounter componentName="AppInbox" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time grievance workflow: New &rarr; Under Review &rarr; Inspector Assigned &rarr; Action Taken &rarr; Closed
              </p>
            </div>

            {/* Live Audit Feed Indicator with ticking clock */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-medium">Audit Clock:</span>
              <time className="font-mono font-bold text-slate-800" dateTime={lastUpdatedTime.toISOString()}>
                {lastUpdatedTime.toLocaleTimeString()}
              </time>
              <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">Live 20s Polling</span>
            </div>
          </div>

          {/* Filter Bar with Debounced Search */}
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalCount={complaintList.length}
            filteredCount={filteredComplaints.length}
            severityCounts={severityCounts}
          />

          {/* Master-Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Complaint Cards */}
            <div className="lg:col-span-5 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {filteredComplaints.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                  <span className="text-2xl block mb-1">🔍</span>
                  <strong>No matching complaints found</strong>
                  <p className="mt-1">Try clearing your debounced search or resetting filters.</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 text-xs text-railway-700 font-semibold underline cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                filteredComplaints.map((item) => (
                  <ComplaintCard
                    key={item.id}
                    complaint={item}
                    vendorName={vendorMap[item.vendorId]?.name}
                    isSelected={item.id === selectedComplaintId}
                    onSelect={(c) => setSelectedComplaintId(c.id)}
                  />
                ))
              )}
            </div>

            {/* Right Column: Detail & Action Panel */}
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

      {/* 3. Analytics Hub */}
      {activeView === 'analytics' && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
          <span className="text-3xl block" role="img" aria-label="chart">📊</span>
          <h3 className="text-base font-bold text-slate-800">Quality Analytics Hub</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Interactive charts, vendor violation rate tracking, and kitchen safety heatmaps will be introduced in future stages.
          </p>
        </div>
      )}
    </Layout>
  );
}

export default App;
