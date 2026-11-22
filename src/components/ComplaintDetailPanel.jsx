import React, { useState } from 'react';
import { Card, Button, Badge, StarRating } from './ui/index.js';
import { RenderCounter } from './RenderCounter.jsx';

/**
 * ComplaintDetailPanel wrapped in React.memo
 * Only re-renders when the selected complaint changes or status updates!
 */
export const ComplaintDetailPanel = React.memo(function ComplaintDetailPanel({
  complaint,
  vendor,
  kitchen,
  batch,
  onClose,
  onStatusChange
}) {
  const [remarks, setRemarks] = useState('');
  const [actionError, setActionError] = useState('');

  if (!complaint) {
    return (
      <Card className="h-full flex items-center justify-center p-8 text-center text-slate-500 bg-white">
        <div>
          <span className="text-3xl block mb-2" role="img" aria-label="select">👈</span>
          <h3 className="font-bold text-slate-800 text-sm">No Complaint Selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Choose an audit record from the filtered inbox on the left to inspect batch details and process inspector actions.
          </p>
        </div>
      </Card>
    );
  }

  const {
    referenceNo,
    token,
    category,
    rating,
    comment,
    severity,
    status,
    createdAt,
    pnr,
    seat,
    images = [],
    actionLogs = []
  } = complaint;

  const handleAction = (nextStatus, defaultRemarks) => {
    const finalRemarks = remarks.trim() || defaultRemarks;
    if (!finalRemarks) {
      setActionError('Please provide inspector remarks for this status transition.');
      return;
    }

    setActionError('');
    onStatusChange(complaint.id, nextStatus, finalRemarks);
    setRemarks('');
  };

  return (
    <Card className="h-full flex flex-col shadow-sm">
      <Card.Header className="bg-slate-50/90 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-mono">
              {referenceNo}
            </h2>
            <Badge variant={severity}>{severity}</Badge>
            <RenderCounter componentName="DetailPanel" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered on {new Date(createdAt).toLocaleString()}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} aria-label="Close detail panel">
            Close
          </Button>
        )}
      </Card.Header>

      <Card.Body className="space-y-4 sm:space-y-5 overflow-y-auto max-h-[58vh]">
        {/* Traceability Grid */}
        <section className="bg-railway-50/70 border border-railway-200/80 rounded-xl p-3.5 text-xs">
          <h3 className="font-bold text-railway-900 mb-2 flex items-center gap-1.5">
            <span role="img" aria-label="package">📦</span> Authorized Packaging Traceability
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-slate-700">
            <div>
              <span className="text-slate-500">QR Token:</span>{' '}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-railway-300 font-bold text-railway-800">
                {token}
              </code>
            </div>
            <div>
              <span className="text-slate-500">Train No:</span>{' '}
              <strong className="text-slate-900">{batch?.trainNumber || '12424'}</strong>
            </div>
            <div>
              <span className="text-slate-500">Catering Vendor:</span>{' '}
              <span className="font-medium text-slate-900">{vendor?.name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500">Base Kitchen:</span>{' '}
              <span className="font-medium text-slate-900">{kitchen?.location || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500">Food Item:</span>{' '}
              <span className="font-medium text-slate-900">{batch?.itemType || 'Standard Thali'}</span>
            </div>
            <div>
              <span className="text-slate-500">Passenger Seat:</span>{' '}
              <span className="font-medium text-slate-900">{seat || 'Coach B2-19'} {pnr ? `(PNR: ${pnr})` : ''}</span>
            </div>
          </div>
        </section>

        {/* Complaint Statement */}
        <section>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 capitalize">
              {category.replace(/_/g, ' ')}
            </span>
            <StarRating rating={rating} size="sm" />
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/70">
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
              "{comment}"
            </p>
          </div>
        </section>

        {/* Photos */}
        {images.length > 0 && (
          <section>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Photographic Evidence ({images.length})
            </h4>
            <div className="flex gap-2 flex-wrap">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden border border-slate-200 w-28 h-20 bg-slate-100">
                  <img src={imgUrl} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Controlled Remarks Input Box for Inspector */}
        {status !== 'closed' && (
          <section className="bg-amber-50/50 p-3 rounded-lg border border-amber-200/70 space-y-2">
            <label htmlFor="inspector-remarks" className="block text-xs font-bold text-amber-900">
              Inspector Resolution Remarks / Action Notes:
            </label>
            <input
              id="inspector-remarks"
              type="text"
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (actionError) setActionError('');
              }}
              placeholder="e.g. Dispatched officer to pantry car, sample collected for lab test..."
              className="w-full text-xs p-2 rounded border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {actionError && (
              <p className="text-[11px] text-red-600 font-semibold">{actionError}</p>
            )}
          </section>
        )}

        {/* Action Logs */}
        <section>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Audit Trail ({actionLogs.length})
          </h4>
          <div className="space-y-2 border-l-2 border-railway-200 pl-3">
            {actionLogs.map((log) => (
              <div key={log.id} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 capitalize">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">{log.remarks}</p>
                <span className="text-[10px] text-slate-400">Recorded by: {log.userId}</span>
              </div>
            ))}
          </div>
        </section>
      </Card.Body>

      {/* Action Footer with State Machine Transitions */}
      <Card.Footer className="bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
        {status === 'new' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleAction('under_review', 'Inspector began review and verified packaging token')}
          >
            Mark Under Review
          </Button>
        )}
        {status === 'under_review' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleAction('inspector_assigned', 'Field safety inspector assigned to coach inspection')}
          >
            Assign Inspector
          </Button>
        )}
        {status === 'inspector_assigned' && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleAction('action_taken', 'Vendor served penalty notice under Railway Catering Clause 8')}
          >
            Record Action Taken
          </Button>
        )}
        {status === 'action_taken' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAction('closed', 'Resolution verified and complaint closed')}
          >
            Close Complaint
          </Button>
        )}
        {status === 'closed' && (
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Complaint Closed
          </span>
        )}
      </Card.Footer>
    </Card>
  );
});

export default ComplaintDetailPanel;
