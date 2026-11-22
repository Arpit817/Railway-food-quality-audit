import React from 'react';
import Card from './ui/Card.jsx';
import Badge from './ui/Badge.jsx';
import StarRating from './ui/StarRating.jsx';
import Button from './ui/Button.jsx';
import EmptyState from './ui/EmptyState.jsx';

/**
 * ComplaintDetailPanel component
 * Demonstrates:
 * - Conditional rendering: empty prompt vs full detail view
 * - Displaying nested traceability metadata (batch, kitchen, token)
 * - Rendering action logs (audit trail)
 * - Lifting state up: status change triggers callback passed from parent
 */
export function ComplaintDetailPanel({
  complaint,
  vendor,
  kitchen,
  batch,
  onClose,
  onStatusChange
}) {
  if (!complaint) {
    return (
      <EmptyState
        title="No Complaint Selected"
        description="Select a complaint card from the inbox on the left to view detailed traceability, passenger photos, and audit logs."
        icon={
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        }
      />
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

  return (
    <Card className="h-full flex flex-col">
      <Card.Header className="bg-slate-50 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 font-mono">{referenceNo}</h2>
            <Badge variant={severity}>{severity}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Reported on {new Date(createdAt).toLocaleString()}
          </p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </Card.Header>

      <Card.Body className="space-y-5 overflow-y-auto max-h-[75vh]">
        {/* Traceability Grid */}
        <section className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-xs">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
            <span>🏷️</span> Authorized Packaging Traceability
          </h3>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-slate-700">
            <div>
              <span className="text-slate-500">QR Token:</span> <code className="font-mono bg-white px-1 py-0.5 rounded border border-blue-200">{token}</code>
            </div>
            <div>
              <span className="text-slate-500">Train No:</span> <strong className="text-slate-900">{batch?.trainNumber || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-slate-500">Vendor:</span> {vendor?.name || 'N/A'}
            </div>
            <div>
              <span className="text-slate-500">Kitchen:</span> {kitchen?.location || 'N/A'}
            </div>
            <div>
              <span className="text-slate-500">Item:</span> {batch?.itemType || 'N/A'}
            </div>
            <div>
              <span className="text-slate-500">Seat / PNR:</span> {seat || 'Unspecified'} {pnr ? `(${pnr})` : ''}
            </div>
          </div>
        </section>

        {/* Complaint Details */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 capitalize">
              {category.replace(/_/g, ' ')}
            </span>
            <StarRating rating={rating} size="md" />
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-sm text-slate-800 leading-relaxed font-normal">
              "{comment}"
            </p>
          </div>
        </section>

        {/* Photos (if any) */}
        {images.length > 0 && (
          <section>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Attached Photographic Evidence ({images.length})
            </h4>
            <div className="flex gap-2 flex-wrap">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 w-28 h-20 bg-slate-100">
                  <img
                    src={imgUrl}
                    alt={`Complaint proof ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Logs / Audit Trail */}
        <section>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Action History ({actionLogs.length})
          </h4>
          <div className="space-y-2 border-l-2 border-slate-200 pl-3">
            {actionLogs.map((log) => (
              <div key={log.id} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 capitalize">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">{log.remarks}</p>
                <span className="text-[10px] text-slate-400">By: {log.userId}</span>
              </div>
            ))}
          </div>
        </section>
      </Card.Body>

      {/* Action Footer for Status Progression */}
      <Card.Footer className="bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
        {status === 'new' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onStatusChange && onStatusChange(complaint.id, 'under_review', 'Inspector began review')}
          >
            Mark Under Review
          </Button>
        )}
        {status === 'under_review' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onStatusChange && onStatusChange(complaint.id, 'inspector_assigned', 'Field safety inspector assigned')}
          >
            Assign Inspector
          </Button>
        )}
        {status === 'inspector_assigned' && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => onStatusChange && onStatusChange(complaint.id, 'action_taken', 'Vendor served penalty notice')}
          >
            Record Action Taken
          </Button>
        )}
        {status === 'action_taken' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onStatusChange && onStatusChange(complaint.id, 'closed', 'Case resolved and closed')}
          >
            Close Complaint
          </Button>
        )}
        {status === 'closed' && (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            ✓ Complaint Resolved & Closed
          </span>
        )}
      </Card.Footer>
    </Card>
  );
}

export default ComplaintDetailPanel;
