import React, { useState } from 'react';
import { COMPLAINTS, VENDORS, KITCHENS, BATCHES } from './utils/mockData.js';
import { updateComplaintStatus } from './utils/complaintUtils.js';
import { Layout } from './components/ui/index.js';
import { ComplaintCard } from './components/ComplaintCard.jsx';
import { ComplaintDetailPanel } from './components/ComplaintDetailPanel.jsx';
import { PassengerMobileView } from './components/PassengerMobileView.jsx';

/**
 * Stage 4: App Component
 * Demonstrates:
 * - Tailwind design system integration (custom colors, responsive breakpoints: sm, md, lg)
 * - Accessible UI (semantic HTML tags, focus rings, ARIA landmarks)
 * - Dual responsive workspace (Desktop Inspector Dashboard vs Mobile Passenger Portal)
 */
function App() {
  const [complaintList, setComplaintList] = useState(COMPLAINTS);
  const [selectedComplaintId, setSelectedComplaintId] = useState(COMPLAINTS[0]?.id || null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'passenger' | 'analytics'

  const vendorMap = VENDORS.reduce((acc, v) => ({ ...acc, [v.id]: v }), {});
  const kitchenMap = KITCHENS.reduce((acc, k) => ({ ...acc, [k.id]: k }), {});
  const batchMap = BATCHES.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});

  const selectedComplaint = complaintList.find((c) => c.id === selectedComplaintId) || null;

  const filteredComplaints = filterSeverity === 'ALL'
    ? complaintList
    : complaintList.filter((c) => c.severity === filterSeverity.toLowerCase());

  const handleStatusChange = (complaintId, newStatus, remarks) => {
    setComplaintList((prevList) =>
      prevList.map((complaint) => {
        if (complaint.id === complaintId) {
          return updateComplaintStatus(complaint, newStatus, remarks, 'insp-active');
        }
        return complaint;
      })
    );
  };

  return (
    <Layout
      userRole="Inspector (Northern Zone)"
      activeView={activeView}
      onViewChange={(view) => setActiveView(view)}
    >
      {/* 1. Mobile Passenger View */}
      {activeView === 'passenger' && (
        <PassengerMobileView
          sampleComplaint={selectedComplaint || COMPLAINTS[0]}
          onBackToDashboard={() => setActiveView('dashboard')}
        />
      )}

      {/* 2. Inspector Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="space-y-5">
          {/* Dashboard Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                Northern Zone Quality Audit Inbox
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review passenger grievances, inspect batch traceability, and assign inspector actions.
              </p>
            </div>

            {/* Severity Filter Pills */}
            <div
              role="radiogroup"
              aria-label="Filter complaints by severity"
              className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto"
            >
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
                const isActive = filterSeverity === sev;
                return (
                  <button
                    key={sev}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-railway-600 ${
                      isActive
                        ? 'bg-white text-railway-800 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Master-Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Complaint Cards */}
            <div className="lg:col-span-5 space-y-3 max-h-[75vh] sm:max-h-[82vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                <span>Showing {filteredComplaints.length} Records</span>
                <span className="text-[11px] font-normal text-slate-400">Live feed</span>
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No complaints match the selected severity criteria.
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

      {/* 3. Analytics View Placeholder */}
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
