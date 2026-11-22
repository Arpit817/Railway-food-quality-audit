import React, { useState } from 'react';
import { COMPLAINTS, VENDORS, KITCHENS, BATCHES } from './utils/mockData.js';
import { updateComplaintStatus } from './utils/complaintUtils.js';
import { Layout } from './components/ui/index.js';
import { ComplaintCard } from './components/ComplaintCard.jsx';
import { ComplaintDetailPanel } from './components/ComplaintDetailPanel.jsx';
import { PassengerMobileView } from './components/PassengerMobileView.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { RenderCounter } from './components/RenderCounter.jsx';

/**
 * Stage 5: App Component
 * Demonstrates:
 * - useState & Event Handling (multi-field controlled filtering, status progression)
 * - State batching and functional state updates: setComplaintList(prev => ...)
 * - Derived State: dynamically computing filteredComplaints, severityCounts, and total stats
 * - Performance / Render auditing with RenderCounter (useRef)
 */
function App() {
  // Main domain state
  const [complaintList, setComplaintList] = useState(COMPLAINTS);
  const [selectedComplaintId, setSelectedComplaintId] = useState(COMPLAINTS[0]?.id || null);
  const [activeView, setActiveView] = useState('dashboard');

  // Multi-field controlled filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    severity: 'ALL'
  });

  // Fast relational lookup maps
  const vendorMap = VENDORS.reduce((acc, v) => ({ ...acc, [v.id]: v }), {});
  const kitchenMap = KITCHENS.reduce((acc, k) => ({ ...acc, [k.id]: k }), {});
  const batchMap = BATCHES.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});

  // DERIVED STATE 1: Derived severity counts (calculated on the fly from current state)
  const severityCounts = {
    high: complaintList.filter((c) => c.severity === 'high').length,
    medium: complaintList.filter((c) => c.severity === 'medium').length,
    low: complaintList.filter((c) => c.severity === 'low').length
  };

  // DERIVED STATE 2: Filtered complaint list
  const filteredComplaints = complaintList.filter((item) => {
    // 1. Text Search (PNR, Token, Reference No, Comment)
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

    // 2. Status Filter
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // 3. Category Filter
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    // 4. Severity Filter
    if (filters.severity !== 'ALL' && item.severity !== filters.severity.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Selected complaint object
  const selectedComplaint = complaintList.find((c) => c.id === selectedComplaintId) || null;

  // Filter change handler (updates single filter field immutably)
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      category: '',
      severity: 'ALL'
    });
  };

  /**
   * Status change handler demonstrating:
   * - Functional state update pattern: setComplaintList(prev => ...)
   * - Prevents stale state bugs and enables automatic state batching
   * - Uses Stage 1 immutable utility `updateComplaintStatus`
   */
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

  // Adds a new complaint from mobile passenger simulation
  const handleAddNewFeedback = (newFeedback) => {
    // Functional update prepending new complaint to the top
    setComplaintList((prev) => [newFeedback, ...prev]);
    setSelectedComplaintId(newFeedback.id);
  };

  return (
    <Layout
      userRole="Inspector (Northern Zone)"
      activeView={activeView}
      onViewChange={(view) => setActiveView(view)}
    >
      {/* 1. Mobile Passenger Portal */}
      {activeView === 'passenger' && (
        <PassengerMobileView
          sampleComplaint={selectedComplaint || complaintList[0]}
          onSubmitFeedback={handleAddNewFeedback}
          onBackToDashboard={() => setActiveView('dashboard')}
        />
      )}

      {/* 2. Inspector Dashboard */}
      {activeView === 'dashboard' && (
        <div className="space-y-4">
          {/* Header & Dev Render Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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

          {/* Master-Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Complaint Cards */}
            <div className="lg:col-span-5 space-y-3 max-h-[72vh] overflow-y-auto pr-1">
              {filteredComplaints.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                  <span className="text-2xl block mb-1">🔍</span>
                  <strong>No matching complaints found</strong>
                  <p className="mt-1">Try clearing your search query or resetting filters.</p>
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
