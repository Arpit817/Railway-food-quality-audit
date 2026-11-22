import React from 'react';
import { Card, Badge, StarRating, Button, EmptyState } from './ui/index.js';
import { cn } from '../utils/cn.js';

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
        description="Select any complaint from the inbox to inspect packaging QR tokens, kitchen details, photo evidence, and audit logs."
        icon={
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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
    <Card className="h-full flex flex-col shadow-sm">
      <Card.Header className="bg-slate-50/90 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-mono">
              {referenceNo}
            </h2>
            <Badge variant={severity}>{severity}</Badge>
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

      <Card.Body className="space-y-4 sm:space-y-5 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
        {/* Traceability Card Grid */}
        <section
          aria-labelledby="traceability-heading"
          className="bg-railway-50/70 border border-railway-200/80 rounded-xl p-3.5 text-xs"
        >
          <h3 id="traceability-heading" className="font-bold text-railway-900 mb-2.5 flex items-center gap-1.5">
            <span role="img" aria-label="packaging">📦</span> Authorized Packaging Traceability
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
              <span className="text-slate-500">Seat / PNR:</span>{' '}
              <span className="font-medium text-slate-900">{seat || 'Coach B2-19'} {pnr ? `(PNR: ${pnr})` : ''}</span>
            </div>
          </div>
        </section>

        {/* Passenger Feedback Content */}
        <section aria-label="Passenger Feedback">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-800 capitalize">
              {category.replace(/_/g, ' ')}
            </span>
            <StarRating rating={rating} size="md" />
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70">
            <p className="text-sm text-slate-800 leading-relaxed">
              "{comment}"
            </p>
          </div>
        </section>

        {/* Photographic Evidence */}
        {images.length > 0 && (
          <section aria-label="Photographic Evidence">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Photographic Proof ({images.length})
            </h4>
            <div className="flex gap-3 flex-wrap">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="rounded-lg overflow-hidden border border-slate-200 w-32 h-24 bg-slate-100 shadow-2xs group relative"
                >
                  <img
                    src={imgUrl}
                    alt={`Evidence proof for complaint ${referenceNo}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Audit Trail Action Logs */}
        <section aria-label="Action Logs">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Audit Trail ({actionLogs.length})
          </h4>
          <div className="space-y-2 border-l-2 border-railway-200 pl-3.5">
            {actionLogs.map((log) => (
              <div key={log.id} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 capitalize">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <time className="text-slate-400 text-[11px]" dateTime={log.timestamp}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </div>
                <p className="text-slate-600 mt-0.5">{log.remarks}</p>
                <span className="text-[10px] text-slate-400">Officer: {log.userId}</span>
              </div>
            ))}
          </div>
        </section>
      </Card.Body>

      {/* Action Footer */}
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
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Complaint Closed
          </span>
        )}
      </Card.Footer>
    </Card>
  );
}

export default ComplaintDetailPanel;
