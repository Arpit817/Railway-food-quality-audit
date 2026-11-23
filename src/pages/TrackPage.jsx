import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComplaintsQuery } from '../api/index.js';
import { Card, Button, Badge, StarRating } from '../components/ui/index.js';

/**
 * Public Complaint Tracking Page (/track and /track/:referenceNo)
 * Allows passengers to monitor real-time audit resolution progress
 */
export function TrackPage() {
  const { referenceNo: paramRef } = useParams();
  const navigate = useNavigate();

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

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="text-center space-y-1">
        <span className="text-3xl" role="img" aria-label="track">🔎</span>
        <h1 className="text-xl font-bold text-slate-900">Track Food Grievance Status</h1>
        <p className="text-xs text-slate-500">
          Enter your 16-character tracking reference number printed upon QR submission
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          value={searchRef}
          onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
          placeholder="e.g. RAIL-2026-K7M91A"
          className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-railway-500 uppercase"
        />
        <Button type="submit" variant="primary" size="sm">
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
          <p className="text-red-600 font-semibold mb-1">No complaint found with Reference "{paramRef || searchRef}"</p>
          <p>Please double check the reference code provided on your submission screen.</p>
        </Card>
      )}

      {matchedComplaint && (
        <Card className="border-railway-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-sm text-slate-900">{matchedComplaint.referenceNo}</span>
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
              <div className="flex items-center justify-between text-xs font-semibold py-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
                {['new', 'under_review', 'inspector_assigned', 'action_taken', 'closed'].map((step, idx) => {
                  const currentIdx = ['new', 'under_review', 'inspector_assigned', 'action_taken', 'closed'].indexOf(matchedComplaint.status);
                  const isDone = idx <= currentIdx;
                  return (
                    <div key={step} className="flex items-center gap-1">
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
    </div>
  );
}

export default TrackPage;
