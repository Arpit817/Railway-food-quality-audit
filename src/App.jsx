import React, { useState } from 'react';
import { COMPLAINTS, VENDORS, KITCHENS, BATCHES } from './utils/mockData.js';
import { updateComplaintStatus } from './utils/complaintUtils.js';
import { Layout, Button } from './components/ui/index.js';
import { ComplaintCard } from './components/ComplaintCard.jsx';
import { ComplaintDetailPanel } from './components/ComplaintDetailPanel.jsx';

/**
 * Stage 3: App Component
 * Demonstrates:
 * - Lifting state up: complaints list and selectedComplaintId held here in parent
 * - Passing event callbacks (onSelect, onStatusChange) down to children
 * - Reusable UI component composition (Layout, Card, Badge, StarRating, Button, EmptyState)
 * - Conditional rendering: split panel view when an item is selected
 */
function App() {
  // State lifted up to App parent component
  const [complaintList, setComplaintList] = useState(COMPLAINTS);
  const [selectedComplaintId, setSelectedComplaintId] = useState(COMPLAINTS[0]?.id || null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  // Lookup maps for fast relational dereferencing
  const vendorMap = VENDORS.reduce((acc, v) => ({ ...acc, [v.id]: v }), {});
  const kitchenMap = KITCHENS.reduce((acc, k) => ({ ...acc, [k.id]: k }), {});
  const batchMap = BATCHES.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});

  // Find currently selected complaint
  const selectedComplaint = complaintList.find((c) => c.id === selectedComplaintId) || null;

  // Filter complaints list
  const filteredComplaints = filterSeverity === 'ALL'
    ? complaintList
    : complaintList.filter((c) => c.severity === filterSeverity.toLowerCase());

  // Handler passed down to ComplaintDetailPanel (demonstrating lifting state up)
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
    <Layout userRole="Quality Inspector (Northern Zone)">
      <div className="space-y-6">
        {/* Header & Quick Filter Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Railway Food Quality Audit Inbox
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review passenger grievances, inspect batch traceability, and assign inspector actions.
            </p>
          </div>

          {/* Quick Severity Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Layout (Lifting State Up Demonstration) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Complaint Inbox Cards */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-3 max-h-[82vh] overflow-y-auto pr-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Showing {filteredComplaints.length} Complaints
            </div>

            {filteredComplaints.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
                No complaints matching this filter.
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
          <div className="lg:col-span-7 xl:col-span-7 sticky top-20">
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
    </Layout>
  );
}

export default App;
