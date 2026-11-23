import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useComplaintsQuery } from '../api/index.js';
import { Card, Button, Badge, StarRating } from '../components/ui/index.js';
import { useUIStore } from '../store/uiStore.js';

/**
 * Public Complaint Tracking Page (/track and /track/:referenceNo)
 * Allows passengers to monitor real-time audit resolution progress
 */
export function TrackPage() {
  const { referenceNo: paramRef } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Track Grievance Status — RailFood Audit';
  }, []);

  const [searchRef, setSearchRef] = useState(paramRef || '');
  const { data: complaints = [], isLoading } = useComplaintsQuery();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchRef.trim()) {
      navigate(`/track/${searchRef.trim().toUpperCase()}`);
    }
  };

  const matchedComplaint = complaints.find(
    (c) => c.referenceNo.toUpperCase() === (paramRef || searchRef).trim().toUpperCase()
  );

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="bg-railway-900 text-white px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white font-bold text-sm">
            <span>🚆</span> RailFood Audit
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <Link to="/login" className="text-railway-200 hover:text-white">
              Staff Login
            </Link>
            <Link to="/f/Xk9PqA72mZ" className="text-railway-200 hover:text-white">
              Submit Grievance
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl w-full mx-auto py-8 px-4 space-y-6 flex-1">
        <div className="text-center space-y-1">
          <span className="text-3xl block" role="img" aria-label="track">🔎</span>
          <h1 className="text-xl font-bold text-slate-900">Track Food Grievance Status</h1>
          <p className="text-xs text-slate-500">
            Enter your 16-character tracking reference number printed upon QR submission
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
            placeholder="e.g. RAIL-2026-K7M91A"
            className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-railway-500 uppercase min-h-[44px]"
          />
          <Button type="submit" variant="primary" size="sm" className="min-h-[44px] px-5 font-semibold cursor-pointer">
            Track Status
          </Button>
        </form>

        {isLoading && (
          <div className="text-center p-6 text-xs text-slate-500">
            <span className="animate-spin inline-block mr-2">⏳</span> Querying railway audit ledger...
          </div>
        )}

        {!isLoading && (paramRef || searchRef) && !matchedComplaint && (
          <Card className="p-6 text-center text-xs text-slate-500 bg-white">
            <p className="text-red-600 font-semibold mb-1">
              No complaint found with Reference "{paramRef || searchRef}"
            </p>
            <p className="text-slate-500">
              Please double check the reference code provided on your submission screen or check your SMS confirmation.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
              <span>Need help? Contact Rail Madad at</span>
              <a href="tel:139" className="text-railway-700 font-bold hover:underline">
                📞 139
              </a>
            </div>
          </Card>
        )}

        {matchedComplaint && (
          <Card className="border-railway-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div>
                <button
                  type="button"
                  onClick={() => handleCopyRef(matchedComplaint.referenceNo)}
                  className="font-mono font-bold text-sm text-slate-900 hover:text-railway-700 flex items-center gap-1.5 cursor-pointer text-left"
                  title="Click to copy reference number"
                >
                  <span>{matchedComplaint.referenceNo}</span>
                  <span className="text-xs text-slate-400">📋</span>
                </button>
                <p className="text-xs text-slate-500">Logged: {new Date(matchedComplaint.createdAt).toLocaleString()}</p>
              </div>
              <Badge variant={matchedComplaint.severity}>{matchedComplaint.severity}</Badge>
            </div>

            <div className="p-5 space-y-4">
              {/* Status Stepper Progression */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Official Lifecycle Progress:
                </span>
                <div className="flex items-center justify-between text-xs font-semibold py-2 px-3 bg-slate-50 rounded-lg border border-slate-200 overflow-x-auto">
                  {['new', 'under_review', 'inspector_assigned', 'action_taken', 'closed'].map((step, idx) => {
                    const currentIdx = ['new', 'under_review', 'inspector_assigned', 'action_taken', 'closed'].indexOf(matchedComplaint.status);
                    const isDone = idx <= currentIdx;
                    return (
                      <div key={step} className="flex items-center gap-1 flex-shrink-0">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${isDone ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 text-slate-500'}`}>
                          {isDone ? '✓' : idx + 1}
                        </span>
                        <span className={`capitalize text-[11px] hidden sm:inline ${isDone ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                          {step.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <strong className="capitalize text-slate-800">{matchedComplaint.category.replace(/_/g, ' ')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rating Given:</span>
                  <StarRating rating={matchedComplaint.rating} size="sm" />
                </div>
                <p className="text-slate-700 pt-2 border-t border-slate-200 mt-2">
                  "{matchedComplaint.comment}"
                </p>
              </div>

              {/* Audit History Timeline */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Action Log History:
                </span>
                <div className="space-y-2 border-l-2 border-railway-300 pl-3">
                  {matchedComplaint.actionLogs?.map((log) => (
                    <div key={log.id} className="text-xs">
                      <div className="flex justify-between text-slate-900 font-semibold">
                        <span>{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-slate-400 font-normal">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{log.remarks}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p>RailFood Audit &copy; {new Date().getFullYear()} • 24x7 Rail Madad Toll Free: <a href="tel:139" className="text-railway-700 font-bold hover:underline">139</a></p>
      </footer>
    </div>
  );
}

export default TrackPage;
