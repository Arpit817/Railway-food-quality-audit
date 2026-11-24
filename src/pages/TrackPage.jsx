import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComplaintsQuery, useMetadataQuery } from '../api/index.js';
import { Card, Button, Badge, StarRating } from '../components/ui/index.js';
import { useUIStore } from '../store/uiStore.js';
import { useRealtimeSync } from '../hooks/useRealtimeSync.js';

/**
 * Public Complaint Tracking Page (/track and /track/:referenceNo)
 * Features an Amazon/Flipkart-style order & milestone delivery tracker
 */
export function TrackPage() {
  const { referenceNo: paramRef } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Track Grievance Status — RailFood Audit';
  }, []);

  const [searchRef, setSearchRef] = useState(paramRef || '');
  useRealtimeSync();
  const { data: complaints = [], isLoading, refetch } = useComplaintsQuery({}, { refetchInterval: 2500 });
  const { batches = [], kitchens = [], vendors = [] } = useMetadataQuery();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchRef.trim()) {
      navigate(`/track/${searchRef.trim().toUpperCase()}`);
    }
  };

  const matchedComplaint = complaints.find(
    (c) => c.referenceNo.toUpperCase() === (paramRef || searchRef).trim().toUpperCase()
  );

  const matchedBatch = matchedComplaint
    ? batches.find((b) => b.id === matchedComplaint.batchId)
    : null;
  const matchedKitchen = matchedComplaint
    ? kitchens.find((k) => k.id === matchedComplaint.kitchenId)
    : null;
  const matchedVendor = matchedComplaint
    ? vendors.find((v) => v.id === matchedComplaint.vendorId)
    : null;

  const handleCopyRef = (refNo) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(refNo);
      useUIStore.getState().showToast({
        type: 'info',
        title: 'Reference Copied',
        message: `Reference "${refNo}" copied to clipboard.`
      });
    }
  };

  // Amazon/Flipkart Style Milestones Definition
  const LIFECYCLE_STEPS = [
    {
      key: 'new',
      label: '1. Grievance Registered',
      description: 'Submitted by passenger via QR scan; packaging token verified.',
      icon: '📝'
    },
    {
      key: 'under_review',
      label: '2. Under Zonal Desk Review',
      description: 'Central Quality Officer confirmed meal batch and base kitchen records.',
      icon: '🔍'
    },
    {
      key: 'inspector_assigned',
      label: '3. Field Inspector Assigned',
      description: 'Zonal Food Safety Officer dispatched to inspect coach and meal supply.',
      icon: '👮'
    },
    {
      key: 'action_taken',
      label: '4. Statutory Action Taken',
      description: 'Penalty notice served to caterer under Railway Catering Clause 8.',
      icon: '⚖️'
    },
    {
      key: 'closed',
      label: '5. Resolution Verified & Closed',
      description: 'Grievance redressal confirmed by Food Safety Authority.',
      icon: '✅'
    }
  ];

  const currentStepIndex = matchedComplaint
    ? LIFECYCLE_STEPS.findIndex((s) => s.key === matchedComplaint.status)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900">
      {/* Top Navigation */}
      <header className="bg-railway-900 text-white px-4 py-3 shadow-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-sm group">
            <span className="text-xl group-hover:scale-110 transition-transform">🚆</span>
            <div>
              <span className="block leading-tight">RailFood Audit</span>
              <span className="text-[10px] text-railway-300 font-normal">Public Grievance Tracker</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate('/');
              }}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-railway-800 hover:bg-railway-700 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-railway-700"
              title="Go Back"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(1)}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg bg-railway-800 hover:bg-railway-700 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-railway-700"
              title="Go Forward"
            >
              <span className="hidden sm:inline">Forward</span>
              <span>→</span>
            </button>
            <Link to="/" className="text-railway-200 hover:text-white px-2 py-1">
              Home
            </Link>
            <Link to="/login" className="px-2.5 py-1.5 rounded bg-railway-700 text-white font-semibold hover:bg-railway-600">
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto py-8 px-4 space-y-6 flex-1">
        {/* Page Title */}
        <div className="text-center space-y-1">
          <span className="text-3xl block" role="img" aria-label="track">🔎</span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Track Food Grievance Status</h1>
          <p className="text-xs text-slate-500">
            Real-time statutory investigation and penalty enforcement timeline
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
            placeholder="e.g. RAIL-2026-K7M91A"
            className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-railway-500 uppercase min-h-[44px]"
          />
          <Button type="submit" variant="primary" size="sm" className="min-h-[44px] px-5 font-bold cursor-pointer">
            Track Status
          </Button>
        </form>

        {isLoading && (
          <div className="text-center p-8 text-xs text-slate-500">
            <span className="animate-spin inline-block mr-2 text-xl">⏳</span> Querying railway audit ledger...
          </div>
        )}

        {!isLoading && (paramRef || searchRef) && !matchedComplaint && (
          <Card className="p-8 text-center text-xs text-slate-500 bg-white border-dashed">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl mb-3">
              ✕
            </div>
            <p className="text-red-700 font-bold text-sm mb-1">
              No complaint found with Reference "{paramRef || searchRef}"
            </p>
            <p className="text-slate-500 max-w-sm mx-auto">
              Please check the reference number printed on your submission receipt or SMS notification.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              Need immediate assistance? Call Rail Madad at{' '}
              <a href="tel:139" className="text-railway-700 font-bold hover:underline">
                📞 139
              </a>
            </div>
          </Card>
        )}

        {matchedComplaint && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Amazon-Style Summary Banner */}
            <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
                    Current Grievance Lifecycle Status
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold capitalize text-white flex items-center gap-2 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                    <span>Status: {matchedComplaint.status.replace(/_/g, ' ')}</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge variant={matchedComplaint.severity}>{matchedComplaint.severity.toUpperCase()} PRIORITY</Badge>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(matchedComplaint.referenceNo)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Click to copy tracking code"
                  >
                    <span>{matchedComplaint.referenceNo}</span>
                    <span className="text-[10px]">📋</span>
                  </button>
                </div>
              </div>

              {/* Train and Packaging Quick Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-800/80 text-xs">
                <div>
                  <span className="text-emerald-300 text-[10px] block">Train</span>
                  <strong className="text-white">{matchedBatch?.trainNumber || '12424 Rajdhani'}</strong>
                </div>
                <div>
                  <span className="text-emerald-300 text-[10px] block">Caterer</span>
                  <strong className="text-white truncate block">{matchedVendor?.name || 'Express Caterers'}</strong>
                </div>
                <div>
                  <span className="text-emerald-300 text-[10px] block">Seat / PNR</span>
                  <strong className="text-white">{matchedComplaint.seat || 'Coach B2-19'}</strong>
                </div>
                <div>
                  <span className="text-emerald-300 text-[10px] block">Logged Date</span>
                  <strong className="text-white">{new Date(matchedComplaint.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            {/* Amazon / Flipkart Visual Milestone Progress Stepper */}
            <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Official Statutory Resolution Tracker
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Updates (2.5s)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-slate-500">Step {currentStepIndex + 1} of 5</span>
                  <button
                    type="button"
                    onClick={() => {
                      refetch();
                      useUIStore.getState().showToast({
                        type: 'info',
                        title: 'Status Synchronized',
                        message: 'Latest grievance milestone status fetched from audit ledger.'
                      });
                    }}
                    className="text-[11px] font-bold text-railway-700 hover:text-railway-900 cursor-pointer flex items-center gap-1 px-2 py-1 rounded hover:bg-railway-50 transition-colors"
                    title="Force refresh now"
                  >
                    <span>🔄 Check Updates</span>
                  </button>
                </div>
              </div>

              {/* Vertical Milestone Tracker */}
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  // Find matching action log for this step
                  const matchingLog = matchedComplaint.actionLogs?.find((log) => {
                    if (step.key === 'new') return log.action === 'CREATED';
                    if (step.key === 'under_review') return log.remarks?.toLowerCase().includes('review');
                    if (step.key === 'inspector_assigned') return log.remarks?.toLowerCase().includes('inspector');
                    if (step.key === 'action_taken') return log.remarks?.toLowerCase().includes('clause') || log.remarks?.toLowerCase().includes('penal');
                    if (step.key === 'closed') return log.remarks?.toLowerCase().includes('closed');
                    return false;
                  });

                  return (
                    <div key={step.key} className="relative group">
                      {/* Milestone Bullet Circle */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                          isCurrent
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h4
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-emerald-900'
                                : isCompleted
                                ? 'text-slate-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </h4>

                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Active Stage
                            </span>
                          )}

                          {matchingLog && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              {new Date(matchingLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        <p className={`text-xs ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                          {step.description}
                        </p>

                        {/* Official Note Card if Action Log exists */}
                        {matchingLog && (
                          <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-700">Official Note:</span>
                              <span className="text-slate-400">By: {matchingLog.userId}</span>
                            </div>
                            <p className="text-slate-800 font-medium">"{matchingLog.remarks}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Passenger Statement & Evidence Card */}
            <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Passenger Statement & Photographic Record
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-200 text-slate-800 capitalize">
                    {matchedComplaint.category.replace(/_/g, ' ')}
                  </span>
                  <StarRating rating={matchedComplaint.rating} size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  "{matchedComplaint.comment}"
                </p>
              </div>

              {matchedComplaint.images?.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-600 block mb-2">
                    Attached Evidence ({matchedComplaint.images.length}):
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {matchedComplaint.images.map((img, i) => (
                      <div key={i} className="w-28 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                        <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p>RailFood Audit &copy; {new Date().getFullYear()} • 24x7 Rail Madad Toll Free: <a href="tel:139" className="text-railway-700 font-bold hover:underline">139</a></p>
      </footer>
    </div>
  );
}

export default TrackPage;
