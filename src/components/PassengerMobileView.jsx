import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, FormField, TextInput, TextArea, FileInput, StarRating, ErrorMessage } from './ui/index.js';
import { useOnlineStatus, useToggle } from '../hooks/index.js';
import { COMPLAINT_CATEGORIES, calculateSeverity, generateReferenceNumber } from '../utils/complaintUtils.js';
import { feedbackSchema } from '../utils/validationSchemas.js';
import { useTokenResolutionQuery, useMetadataQuery, useCreateComplaintMutation } from '../api/index.js';
import { useUIStore } from '../store/uiStore.js';

export function PassengerMobileView({ initialToken = 'Xk9PqA72mZ', onBackToDashboard }) {
  useEffect(() => {
    document.title = 'Passenger Grievance Portal — RailFood Audit';
  }, []);

  const isOnline = useOnlineStatus();
  const [isAnonymous, toggleAnonymous] = useToggle(false);

  const [tokenInput, setTokenInput] = useState(initialToken);

  // 1. REACT QUERY: Fetch and cache token verification
  const {
    data: qrResults,
    isLoading: isTokenLoading,
    isError: isTokenError
  } = useTokenResolutionQuery(tokenInput);

  // 2. REACT QUERY: Fetch and cache master metadata
  const { vendors, kitchens, batches } = useMetadataQuery();

  // 3. REACT QUERY: Mutation for submitting new complaint
  const createComplaintMutation = useCreateComplaintMutation();

  // Form State
  const [rating, setRating] = useState(1);
  const [category, setCategory] = useState('hygiene_issue');
  const [comment, setComment] = useState('');
  const [foreignObjectDetail, setForeignObjectDetail] = useState('');
  const [pnr, setPnr] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({});
  const [submittedRef, setSubmittedRef] = useState(null);

  const seatRef = React.useRef(null);
  const commentInputRef = React.useRef(null);

  const categoryLabels = {
    hygiene_issue: { label: 'Hygiene Issue', icon: '🧼' },
    foreign_object: { label: 'Foreign Object', icon: '⚠️' },
    stale_spoiled_food: { label: 'Stale / Spoiled Food', icon: '🍛' },
    wrong_quantity: { label: 'Wrong Quantity / Portion', icon: '⚖️' },
    overcharging: { label: 'Overcharging', icon: '💵' },
    damaged_packaging: { label: 'Damaged Packaging', icon: '📦' },
    taste: { label: 'Taste / Cooking Quality', icon: '👅' },
    other: { label: 'Other Issue', icon: '❓' }
  };

  const derivedSeverity = calculateSeverity(category, rating);

  // Derive packaging info from React Query cached metadata
  const qrRecord = qrResults && qrResults.length > 0 ? qrResults[0] : null;
  const isTokenInvalid = !isTokenLoading && (!qrRecord || !qrRecord.batchId);

  const batch = qrRecord
    ? batches.find((b) => b.id === qrRecord.batchId) || { id: 'bat-901', trainNumber: '12424', itemType: 'Standard Veg Thali', kitchenId: 'kit-101' }
    : null;
  const kitchen = batch
    ? kitchens.find((k) => k.id === batch.kitchenId) || { id: 'kit-101', location: 'New Delhi Base Kitchen (NDLS)', vendorId: 'ven-001' }
    : null;
  const vendor = kitchen
    ? vendors.find((v) => v.id === kitchen.vendorId) || { id: 'ven-001', name: 'Express Caterers Pvt Ltd' }
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const seatValue = seatRef.current?.value || 'Coach B2-19';

    const formData = {
      rating,
      category,
      comment,
      foreignObjectDetail: foreignObjectDetail || undefined,
      pnr: pnr.trim() || undefined,
      phone: phone.trim() || undefined,
      isAnonymous,
      seat: seatValue,
      images
    };

    const validationResult = feedbackSchema.safeParse(formData);
    if (!validationResult.success) {
      const errMap = {};
      const errors = validationResult.error.flatten().fieldErrors;
      Object.keys(errors).forEach((k) => (errMap[k] = errors[k][0]));
      setFieldErrors(errMap);
      if (errMap.comment && commentInputRef.current) commentInputRef.current.focus();
      return;
    }

    setFieldErrors({});

    const refNo = generateReferenceNumber();
    const fullComment = category === 'foreign_object'
      ? `${comment} [Contaminant: ${foreignObjectDetail}]`
      : comment;

    const newFeedback = {
      referenceNo: refNo,
      token: qrRecord?.token || tokenInput,
      batchId: batch?.id || 'bat-901',
      vendorId: vendor?.id || 'ven-001',
      kitchenId: kitchen?.id || 'kit-101',
      rating,
      category,
      comment: fullComment,
      severity: derivedSeverity,
      status: 'new',
      pnr: pnr.trim() || undefined,
      seat: seatValue,
      phone: isAnonymous ? undefined : phone.trim(),
      images,
      createdAt: new Date().toISOString(),
      actionLogs: [
        {
          id: `log-${Date.now()}`,
          action: 'CREATED',
          remarks: `Grievance registered via authorized QR scan (${images.length} photos attached)`,
          timestamp: new Date().toISOString(),
          userId: isAnonymous ? 'anonymous-passenger' : `passenger-${pnr || 'public'}`
        }
      ]
    };

    try {
      await createComplaintMutation.mutateAsync(newFeedback);
      setSubmittedRef(refNo);
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto py-2 sm:py-4 px-2">
      {!isOnline && (
        <div role="status" className="mb-3 bg-red-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-md">
          <span>📶</span>
          <span><strong>No Internet Connection:</strong> Operating in offline train mode.</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 bg-slate-100 px-3 py-2 rounded-lg text-xs border border-slate-200">
        <Link to="/" className="text-railway-900 font-bold flex items-center gap-1.5 hover:underline">
          <span>🚆</span>
          <span>RailFood Audit Public Portal</span>
        </Link>
        <Link to="/track" className="text-slate-600 font-medium hover:text-railway-800">
          Track Status &rarr;
        </Link>
      </div>

      <Card className="border-railway-200 shadow-md">
        <div className="bg-railway-800 text-white p-4 text-center">
          <span className="text-2xl mb-1 block" role="img" aria-label="train">🚆</span>
          <h2 className="text-base font-bold">Authorized Packaging Scanned</h2>
          <p className="text-xs text-railway-200 mt-0.5">IRCTC Real-Time Quality Feedback</p>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full font-mono text-xs">
            <span className="text-railway-200">Packaging Token:</span>
            <span className="font-bold text-white tracking-wider">{tokenInput}</span>
          </div>
        </div>

        {isTokenLoading && (
          <div className="p-6 text-center text-xs text-slate-500">
            <span className="animate-spin inline-block mr-2">⏳</span>
            Verifying packaging token via React Query cache...
          </div>
        )}

        {(isTokenInvalid || isTokenError) && !isTokenLoading && (
          <div className="p-5">
            <ErrorMessage
              title="Invalid or Expired QR Token"
              message="This token does not correspond to authorized railway food packaging."
              onRetry={() => setTokenInput('Xk9PqA72mZ')}
            />
          </div>
        )}

        {qrRecord && !isTokenLoading && !isTokenInvalid && (
          <div className="bg-railway-50 px-4 py-3 border-b border-railway-100 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Train No:</span> <strong className="text-slate-900">{batch?.trainNumber || '12424'}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Vendor:</span> <strong className="text-slate-900">{vendor?.name || 'Express Caterers'}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Kitchen:</span> <strong className="text-slate-900">{kitchen?.location || 'New Delhi Base Kitchen'}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Meal Item:</span> <strong className="text-slate-900">{batch?.itemType || 'Standard Thali'}</strong>
            </div>
          </div>
        )}

        {qrRecord && !isTokenLoading && !isTokenInvalid && (
          <div className="p-4 space-y-4">
            {submittedRef ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="text-base font-bold text-slate-800">Complaint Registered!</h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Registered with <strong>{derivedSeverity.toUpperCase()}</strong> priority. Railway Food Safety Officers have been alerted.
                </p>
                <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono font-bold text-slate-800 border border-slate-200 flex items-center justify-between">
                  <span>Ref: {submittedRef}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator?.clipboard) {
                        navigator.clipboard.writeText(submittedRef);
                        useUIStore.getState().showToast({
                          type: 'success',
                          title: 'Copied',
                          message: `Reference ${submittedRef} copied to clipboard.`
                        });
                      }
                    }}
                    className="text-xs text-railway-700 hover:text-railway-900 underline font-sans font-semibold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Link to={`/track/${submittedRef}`}>
                    <Button variant="primary" size="sm" className="w-full min-h-[44px]">
                      Track Real-Time Status &rarr;
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full min-h-[44px]" onClick={() => { setSubmittedRef(null); setComment(''); setImages([]); }}>
                    Submit Another Grievance
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {createComplaintMutation.isError && (
                  <ErrorMessage
                    title="Submission Error"
                    message={createComplaintMutation.error?.message || 'Failed to submit grievance.'}
                  />
                )}

                <FormField label="Meal Quality Rating" required error={fieldErrors.rating}>
                  <div className="flex justify-center py-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                    <StarRating
                      rating={rating}
                      size="lg"
                      interactive={true}
                      onChange={(r) => { setRating(r); if (fieldErrors.rating) setFieldErrors((p) => ({ ...p, rating: undefined })); }}
                    />
                  </div>
                </FormField>

                <FormField label="Complaint Category" required error={fieldErrors.category}>
                  <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Complaint Category">
                    {COMPLAINT_CATEGORIES.map((catKey) => {
                      const item = categoryLabels[catKey] || { label: catKey, icon: '📌' };
                      const isSelected = category === catKey;

                      return (
                        <button
                          key={catKey}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => { setCategory(catKey); if (fieldErrors.category) setFieldErrors((p) => ({ ...p, category: undefined })); }}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all text-left min-h-[42px] cursor-pointer ${
                            isSelected
                              ? 'border-railway-600 bg-railway-50 text-railway-900 font-bold ring-1 ring-railway-500'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="text-sm">{item.icon}</span>
                          <span className="leading-tight text-[11px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </FormField>

                {category === 'foreign_object' && (
                  <FormField label="Identify Contaminant" htmlFor="foreign-object-detail" required error={fieldErrors.foreignObjectDetail} helperText="Specify foreign element found">
                    <TextInput
                      id="foreign-object-detail"
                      value={foreignObjectDetail}
                      onChange={(e) => setForeignObjectDetail(e.target.value)}
                      placeholder="e.g. Staple pin, insect, glass shard..."
                      error={fieldErrors.foreignObjectDetail}
                    />
                  </FormField>
                )}

                <FormField label="Describe the Issue" htmlFor="passenger-comment" required error={fieldErrors.comment}>
                  <div ref={commentInputRef} tabIndex={-1}>
                    <TextArea
                      id="passenger-comment"
                      rows={3}
                      maxLength={500}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Provide details about food hygiene, temperature, taste or quantity..."
                      error={fieldErrors.comment}
                    />
                  </div>
                </FormField>

                <FormField label="Photographic Evidence (1 to 3 Photos)" error={fieldErrors.images}>
                  <FileInput images={images} onImagesChange={setImages} maxImages={3} />
                </FormField>

                <div className="grid grid-cols-2 gap-2">
                  <FormField label="PNR (Optional)" htmlFor="pnr-input" error={fieldErrors.pnr}>
                    <TextInput id="pnr-input" type="text" maxLength={10} value={pnr} onChange={(e) => setPnr(e.target.value)} placeholder="10-digit PNR" error={fieldErrors.pnr} />
                  </FormField>

                  <FormField label="Coach / Seat" htmlFor="seat-uncontrolled-input" error={fieldErrors.seat}>
                    <input ref={seatRef} id="seat-uncontrolled-input" type="text" defaultValue="Coach B3 - Berth 42" className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-railway-500" />
                  </FormField>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={isAnonymous} onChange={toggleAnonymous} className="rounded text-railway-600 focus:ring-railway-500 w-4 h-4" />
                    <span className="text-xs font-semibold text-slate-700">File anonymously</span>
                  </label>

                  {!isAnonymous && (
                    <FormField label="Mobile Number" htmlFor="phone-input" required error={fieldErrors.phone} helperText="Required for SMS resolution updates">
                      <TextInput id="phone-input" type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" error={fieldErrors.phone} />
                    </FormField>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={createComplaintMutation.isPending}
                  loading={createComplaintMutation.isPending}
                  className="w-full h-11 text-sm font-semibold"
                >
                  {createComplaintMutation.isPending ? 'Submitting Grievance...' : 'Submit Validated Grievance'}
                </Button>
              </form>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default PassengerMobileView;
