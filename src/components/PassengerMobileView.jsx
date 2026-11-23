import React, { useState, useRef } from 'react';
import { Card, Button, FormField, TextInput, TextArea, FileInput, StarRating } from './ui/index.js';
import { useOnlineStatus, useToggle } from '../hooks/index.js';
import { COMPLAINT_CATEGORIES, calculateSeverity, generateReferenceNumber } from '../utils/complaintUtils.js';
import { feedbackSchema } from '../utils/validationSchemas.js';

/**
 * PassengerMobileView with Zod Validation
 * Demonstrates:
 * - Integration of Zod schema via `safeParse`
 * - Mapping Zod field errors to React component error state
 * - Validate on blur and validate on submit workflows
 * - Multi-field conditional refinements (detailed comments for high severity, foreign object specifics)
 */
export function PassengerMobileView({ sampleComplaint, onSubmitFeedback, onBackToDashboard }) {
  const isOnline = useOnlineStatus();
  const [isAnonymous, toggleAnonymous] = useToggle(false);

  // Form State
  const [rating, setRating] = useState(1);
  const [category, setCategory] = useState('hygiene_issue');
  const [comment, setComment] = useState('');
  const [foreignObjectDetail, setForeignObjectDetail] = useState('');
  const [pnr, setPnr] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState([]);

  // Zod-driven field error map: { comment: "...", pnr: "...", phone: "..." }
  const [fieldErrors, setFieldErrors] = useState({});
  const [submittedRef, setSubmittedRef] = useState(null);

  // Uncontrolled component ref for seat
  const seatRef = useRef(null);
  const commentInputRef = useRef(null);

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

  /**
   * Validates single field on blur using Zod shape
   */
  const handleBlurField = (field, value) => {
    // Construct full data object to allow multi-field superRefine
    const currentData = {
      rating,
      category,
      comment,
      foreignObjectDetail,
      pnr: pnr || undefined,
      phone: phone || undefined,
      isAnonymous,
      seat: seatRef.current?.value || 'Coach B2-19',
      images,
      [field]: value
    };

    const result = feedbackSchema.safeParse(currentData);
    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      setFieldErrors((prev) => ({
        ...prev,
        [field]: flattened[field] ? flattened[field][0] : undefined
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  /**
   * Validates full form on submit using Zod safeParse
   */
  const handleSubmit = (e) => {
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

    // ZOD SAFE PARSE VALIDATION
    const validationResult = feedbackSchema.safeParse(formData);

    if (!validationResult.success) {
      // Extract flattened error map: { [field]: [error1, error2] }
      const errors = validationResult.error.flatten().fieldErrors;
      const formattedErrors = {};
      Object.keys(errors).forEach((key) => {
        formattedErrors[key] = errors[key][0];
      });
      setFieldErrors(formattedErrors);

      // Auto-focus first invalid input for accessibility
      if (formattedErrors.comment && commentInputRef.current) {
        commentInputRef.current.focus();
      }
      return;
    }

    // Validation passed cleanly
    setFieldErrors({});
    const refNo = generateReferenceNumber();

    const fullComment = category === 'foreign_object'
      ? `${comment} [Contaminant: ${foreignObjectDetail}]`
      : comment;

    const newFeedback = {
      id: `cmp-${Date.now()}`,
      referenceNo: refNo,
      token: sampleComplaint?.token || 'Xk9PqA72mZ',
      batchId: sampleComplaint?.batchId || 'bat-901',
      vendorId: sampleComplaint?.vendorId || 'ven-001',
      kitchenId: sampleComplaint?.kitchenId || 'kit-101',
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

    if (onSubmitFeedback) {
      onSubmitFeedback(newFeedback);
    }
    setSubmittedRef(refNo);
  };

  return (
    <div className="max-w-md mx-auto py-2 sm:py-4 px-2">
      {!isOnline && (
        <div
          role="status"
          className="mb-3 bg-red-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-md animate-bounce"
        >
          <span>📶</span>
          <span>
            <strong>No Internet Connection:</strong> Operating in offline train mode.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 bg-slate-200/80 px-3 py-2 rounded-lg text-xs">
        <span className="font-semibold text-slate-700">📱 Mobile Passenger Simulation</span>
        <button
          onClick={onBackToDashboard}
          className="text-railway-700 font-semibold underline hover:text-railway-800 cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>

      <Card className="border-railway-200 shadow-md">
        <div className="bg-railway-700 text-white p-4 text-center">
          <span className="text-2xl mb-1 block" role="img" aria-label="train">🚆</span>
          <h2 className="text-base font-bold">Authorized Packaging Scanned</h2>
          <p className="text-xs text-railway-100 mt-0.5">IRCTC Quality Feedback Portal</p>
          <div className="mt-2 inline-block bg-white/10 px-2.5 py-1 rounded-full font-mono text-xs">
            Token: <strong>{sampleComplaint?.token || 'Xk9PqA72mZ'}</strong>
          </div>
        </div>

        <div className="bg-railway-50 px-4 py-3 border-b border-railway-100 text-xs space-y-1">
          <div className="flex justify-between text-slate-600">
            <span>Train No:</span> <strong className="text-slate-900">12424 (Rajdhani)</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Vendor:</span> <strong className="text-slate-900">Express Caterers Pvt Ltd</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Kitchen:</span> <strong className="text-slate-900">New Delhi Base Kitchen</strong>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {submittedRef ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h3 className="text-base font-bold text-slate-800">Complaint Registered!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Validated and registered with <strong>{derivedSeverity.toUpperCase()}</strong> severity. Safety teams have been alerted.
              </p>
              <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono font-bold text-slate-800 border border-slate-200">
                Tracking Ref: {submittedRef}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setSubmittedRef(null);
                  setComment('');
                  setImages([]);
                }}
              >
                Submit Another Complaint
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Star Rating Input */}
              <FormField label="Meal Quality Rating" required error={fieldErrors.rating}>
                <div className="flex justify-center py-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive={true}
                    onChange={(r) => {
                      setRating(r);
                      if (fieldErrors.rating) setFieldErrors((p) => ({ ...p, rating: undefined }));
                    }}
                  />
                </div>
              </FormField>

              {/* Category Radio Group */}
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
                        onClick={() => {
                          setCategory(catKey);
                          if (fieldErrors.category) setFieldErrors((p) => ({ ...p, category: undefined }));
                        }}
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

              {/* Conditional Field: Foreign Object Contaminant */}
              {category === 'foreign_object' && (
                <FormField
                  label="Identify Contaminant"
                  htmlFor="foreign-object-detail"
                  required
                  error={fieldErrors.foreignObjectDetail}
                  helperText="Specify object found (Zod requires min 3 characters)"
                >
                  <TextInput
                    id="foreign-object-detail"
                    value={foreignObjectDetail}
                    onChange={(e) => {
                      setForeignObjectDetail(e.target.value);
                      if (fieldErrors.foreignObjectDetail) {
                        setFieldErrors((p) => ({ ...p, foreignObjectDetail: undefined }));
                      }
                    }}
                    onBlur={(e) => handleBlurField('foreignObjectDetail', e.target.value)}
                    placeholder="e.g. Staple pin, insect, glass shard, pebble..."
                    error={fieldErrors.foreignObjectDetail}
                  />
                </FormField>
              )}

              {/* Description with Character Counter */}
              <FormField
                label="Describe the Issue"
                htmlFor="passenger-comment"
                required
                error={fieldErrors.comment}
                helperText={
                  category === 'foreign_object' || category === 'hygiene_issue' || rating === 1
                    ? 'High-severity safety issues require at least 20 characters.'
                    : 'Minimum 10 characters required.'
                }
              >
                <div ref={commentInputRef} tabIndex={-1}>
                  <TextArea
                    id="passenger-comment"
                    rows={3}
                    maxLength={500}
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (fieldErrors.comment) setFieldErrors((p) => ({ ...p, comment: undefined }));
                    }}
                    onBlur={(e) => handleBlurField('comment', e.target.value)}
                    placeholder="Detail the issue with food hygiene, foreign elements, taste or portion..."
                    error={fieldErrors.comment}
                  />
                </div>
              </FormField>

              {/* 1-3 Photos */}
              <FormField
                label="Photographic Evidence (1 to 3 Photos)"
                error={fieldErrors.images}
                helperText="Camera photos are resized client-side via Canvas to <50KB."
              >
                <FileInput
                  images={images}
                  onImagesChange={setImages}
                  maxImages={3}
                />
              </FormField>

              {/* PNR & Uncontrolled Seat */}
              <div className="grid grid-cols-2 gap-2">
                <FormField label="PNR (Optional)" htmlFor="pnr-input" error={fieldErrors.pnr}>
                  <TextInput
                    id="pnr-input"
                    type="text"
                    maxLength={10}
                    value={pnr}
                    onChange={(e) => {
                      setPnr(e.target.value);
                      if (fieldErrors.pnr) setFieldErrors((p) => ({ ...p, pnr: undefined }));
                    }}
                    onBlur={(e) => handleBlurField('pnr', e.target.value)}
                    placeholder="10-digit PNR"
                    error={fieldErrors.pnr}
                  />
                </FormField>

                <FormField
                  label="Coach / Seat (Uncontrolled)"
                  htmlFor="seat-uncontrolled-input"
                  error={fieldErrors.seat}
                >
                  <input
                    ref={seatRef}
                    id="seat-uncontrolled-input"
                    type="text"
                    defaultValue="Coach B3 - Berth 42"
                    placeholder="e.g. B2-19"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-railway-500"
                  />
                </FormField>
              </div>

              {/* Anonymous Toggle & Mobile Number */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={toggleAnonymous}
                    className="rounded text-railway-600 focus:ring-railway-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    File anonymously (hide personal details)
                  </span>
                </label>

                {!isAnonymous && (
                  <FormField
                    label="Mobile Number (For SMS Tracking)"
                    htmlFor="phone-input"
                    required
                    error={fieldErrors.phone}
                    helperText="Required for SMS resolution notifications."
                  >
                    <TextInput
                      id="phone-input"
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
                      }}
                      onBlur={(e) => handleBlurField('phone', e.target.value)}
                      placeholder="10-digit mobile (starting with 6-9)"
                      error={fieldErrors.phone}
                    />
                  </FormField>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full h-11 text-sm font-semibold"
              >
                Submit Validated Grievance
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

export default PassengerMobileView;
