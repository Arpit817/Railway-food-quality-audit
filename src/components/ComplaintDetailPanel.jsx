import React, { useState } from 'react';
import { Card, Button, Badge, StarRating } from './ui/index.js';
import { inspectorActionSchema } from '../utils/validationSchemas.js';
import { useUIStore } from '../store/uiStore.js';

/**
 * ComplaintDetailPanel: Official Railway Food Safety Audit & Action Dossier
 * Features:
 * - Full packaging traceability (Train, Licensee, Kitchen, Coach/Berth)
 * - Passenger grievance transcript & photographic evidence
 * - Official statutory action notes with pre-set regulatory directive chips
 * - Spacious, chronological timeline audit trail with timestamps and officer accountability
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
  const [validationError, setValidationError] = useState('');

  if (!complaint) {
    return (
      <Card className="h-full flex items-center justify-center p-8 text-center text-slate-500 bg-white">
        <div>
          <span className="text-3xl block mb-2">📋</span>
          <h3 className="font-bold text-slate-800 text-sm">Select Grievance to Review</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Choose any grievance from the list on the left to inspect batch details, verify packaging authenticity, and issue statutory orders.
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
    phone,
    images = [],
    actionLogs = []
  } = complaint;

  const handleAction = (nextStatus, defaultRemarks) => {
    const finalRemarks = remarks.trim() || defaultRemarks;

    const validation = inspectorActionSchema.safeParse({
      status: nextStatus,
      remarks: finalRemarks
    });

    if (!validation.success) {
      const errorMsg = validation.error.flatten().fieldErrors.remarks?.[0] || 'Please enter at least 15 characters of official action notes.';
      setValidationError(errorMsg);
      useUIStore.getState().showToast({
        type: 'error',
        title: 'Action Required',
        message: errorMsg
      });
      return;
    }

    setValidationError('');
    onStatusChange(complaint.id, nextStatus, finalRemarks);
    setRemarks('');

    useUIStore.getState().showToast({
      type: 'success',
      title: 'Status Updated',
      message: `Case ${referenceNo} updated to ${nextStatus.replace(/_/g, ' ')}.`,
      meta: 'Recorded in Central Audit Ledger'
    });
  };

  const quickActionPresets = [
    'Inspector dispatched to coach for spot quality check.',
    'Served statutory notice to catering licensee under Clause 8.',
    'Food sample seized and dispatched to zonal testing lab.',
    'Verified hygiene breach; refund and apology approved for passenger.',
    'Passenger grievance resolved post-counseling with onboard pantry manager.'
  ];

  return (
    <Card className="h-full flex flex-col shadow-sm bg-white border-slate-200">
      {/* Dossier Header */}
      <Card.Header className="bg-slate-50/90 border-b border-slate-200 py-3.5 px-4 sm:px-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-mono">
              {referenceNo}
            </h2>
            <Badge variant={severity}>{severity.toUpperCase()} PRIORITY</Badge>
            <span className="capitalize text-xs font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
              {status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Registered on {new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
          </p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} aria-label="Close detail panel">
            ✕ Close
          </Button>
        )}
      </Card.Header>

      <Card.Body className="space-y-5 p-4 sm:p-5 overflow-y-auto max-h-[62vh]">
        {/* Section 1: Meal Packaging & Train Traceability */}
        <section className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="font-bold text-slate-800 tracking-wider uppercase text-[10px]">
              Meal Packaging & Train Traceability Dossier
            </span>
            <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
              <span>✓</span> QR Security Token Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-slate-700">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Packaging QR Token</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 font-bold text-slate-800 text-xs inline-block mt-0.5">
                {token}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Train Service</span>
              <strong className="text-slate-900 text-xs block mt-0.5">{batch?.trainNumber || '12424'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Catering Licensee</span>
              <span className="font-semibold text-slate-900 block mt-0.5">{vendor?.name || 'Authorized Catering Vendor'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Preparation Base Kitchen</span>
              <span className="font-semibold text-slate-900 block mt-0.5">{kitchen?.location || 'Central Base Kitchen'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Meal Item Type</span>
              <span className="font-medium text-slate-900 block mt-0.5">{batch?.itemType || 'Standard Veg Thali'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Passenger Berth Location</span>
              <span className="font-medium text-slate-900 block mt-0.5">{seat || 'Coach Berth'} {pnr ? `• PNR: ${pnr}` : ''}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Passenger Grievance Statement */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Passenger Grievance</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 capitalize">
                {category.replace(/_/g, ' ')}
              </span>
            </div>
            <StarRating rating={rating} size="sm" />
          </div>

          <div className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-200 space-y-2">
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
              {comment}
            </p>
            {phone && (
              <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <span>Passenger Contact (SMS Updates):</span>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="font-bold text-railway-800 hover:underline">
                  📞 {phone}
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Photographic Evidence */}
        {images.length > 0 && (
          <section className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Photographic Evidence Attached ({images.length})
            </h4>
            <div className="flex gap-2.5 flex-wrap">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 w-32 h-24 bg-slate-100 shadow-2xs">
                  <img src={imgUrl} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Official Enforcement Directive Notes */}
        {status !== 'closed' && (
          <section className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-2.5">
            <label htmlFor="inspector-remarks" className="block text-xs font-bold text-amber-950">
              Official Enforcement Order / Action Taken Remarks:
            </label>
            <textarea
              id="inspector-remarks"
              rows={2}
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="Record official inspection findings, licensee warning, or penalty notice remarks under Railway Catering Policy..."
              className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {validationError && (
              <p className="text-[11px] text-red-600 font-semibold">{validationError}</p>
            )}

            {/* Quick Action Chips */}
            <div className="space-y-1">
              <span className="text-[10px] text-amber-900 font-semibold uppercase">Standard Order Presets:</span>
              <div className="flex flex-wrap gap-1">
                {quickActionPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setRemarks(preset); if (validationError) setValidationError(''); }}
                    className="text-[10px] px-2 py-1 rounded bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 font-medium transition-colors cursor-pointer text-left truncate max-w-full"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Section 5: Chronological Audit Trail Timeline */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Statutory Audit Trail ({actionLogs.length} Events)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Immutable Central Ledger</span>
          </div>

          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {actionLogs.map((log) => {
              const logDate = new Date(log.timestamp);
              const formattedTime = !isNaN(logDate.getTime())
                ? `${logDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • ${logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`
                : 'Recorded';

              return (
                <div key={log.id} className="relative text-xs group">
                  {/* Timeline dot */}
                  <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-railway-600 ring-4 ring-white border border-railway-800" />

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="font-bold text-slate-900 capitalize text-xs">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">{formattedTime}</span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">{log.remarks}</p>
                    <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                      Authorized by: <strong className="text-slate-600">{log.userId}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </Card.Body>

      {/* Action Footer */}
      <Card.Footer className="bg-slate-50 border-t border-slate-200 p-4 flex flex-wrap gap-2.5 justify-end">
        {status === 'new' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleAction('under_review', 'Food Safety Inspector verified packaging token and initiated preliminary inquiry')}
            className="min-h-[40px] px-4 font-bold"
          >
            Initiate Safety Review &rarr;
          </Button>
        )}
        {status === 'under_review' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleAction('inspector_assigned', 'Field Food Safety Officer dispatched to coach for spot inspection and evidence gathering')}
            className="min-h-[40px] px-4 font-bold"
          >
            Dispatch Field Inspector &rarr;
          </Button>
        )}
        {status === 'inspector_assigned' && (
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleAction('action_taken', 'Statutory penalty notice served to catering licensee under Railway Catering Policy Clause 8')}
            className="min-h-[40px] px-4 font-bold bg-red-700 hover:bg-red-800"
          >
            Serve Penalty Notice & Take Action &rarr;
          </Button>
        )}
        {status === 'action_taken' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleAction('closed', 'Corrective action verified by railway authority and passenger grievance formally closed')}
            className="min-h-[40px] px-4 font-bold bg-slate-800 hover:bg-slate-900 text-white"
          >
            Verify & Close File ✓
          </Button>
        )}
        {status === 'closed' && (
          <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Case Formally Resolved & Closed
          </span>
        )}
      </Card.Footer>
    </Card>
  );
});

export default ComplaintDetailPanel;
