import React, { useState, useRef } from 'react';
import { Card, Button, FormField, TextInput, TextArea, FileInput, StarRating } from './ui/index.js';
import { useOnlineStatus, useToggle } from '../hooks/index.js';
import { COMPLAINT_CATEGORIES, calculateSeverity, generateReferenceNumber } from '../utils/complaintUtils.js';

/**
 * Stage 9: PassengerFeedbackForm (inside Mobile View)
 * Demonstrates:
 * - Controlled components for all primary fields (rating, category, comment, PNR, phone)
 * - ONE UNCONTROLLED COMPONENT using useRef (coach/seat note field) as required by syllabus Unit IV
 * - Custom hooks integration: useOnlineStatus (shows offline warning banner), useToggle (for anonymous mode)
 * - 1-3 photo upload with camera trigger and client-side canvas resize
 * - Conditional Form Fields: Foreign object specific details, contact follow-up phone
 * - Form Accessibility: aria-describedby, labels, auto-focusing on first invalid field
 * - Submission workflow with reference tracking screen
 */
export function PassengerMobileView({ sampleComplaint, onSubmitFeedback, onBackToDashboard }) {
  // Custom hook: detect train network connectivity
  const isOnline = useOnlineStatus();

  // Custom hook: toggle anonymous mode
  const [isAnonymous, toggleAnonymous] = useToggle(false);

  // Controlled Form State
  const [rating, setRating] = useState(1);
  const [category, setCategory] = useState('hygiene_issue');
  const [comment, setComment] = useState('');
  const [foreignObjectDetail, setForeignObjectDetail] = useState('');
  const [pnr, setPnr] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState([]);

  // Form errors state
  const [errors, setErrors] = useState({});
  const [submittedRef, setSubmittedRef] = useState(null);

  // UNCONTROLLED COMPONENT REF: Required by syllabus Unit IV
  // Demonstrates accessing DOM values via ref instead of controlled state
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

  // Client-side validation before submission
  const validateForm = () => {
    const newErrors = {};

    if (!comment.trim()) {
      newErrors.comment = 'Please describe the problem with the meal.';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'Description must be at least 10 characters long.';
    }

    if (category === 'foreign_object' && !foreignObjectDetail.trim()) {
      newErrors.foreignObject = 'Please specify the foreign object (e.g. wire, plastic shard).';
    }

    if (pnr && !/^\d{10}$/.test(pnr.trim())) {
      newErrors.pnr = 'Indian Railway PNR must be exactly 10 digits.';
    }

    if (!isAnonymous && phone && !/^[6-9]\d{9}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    setErrors(newErrors);

    // Auto-focus first invalid field for accessibility
    if (newErrors.comment && commentInputRef.current) {
      commentInputRef.current.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Read value from uncontrolled component ref
    const seatValue = seatRef.current?.value || 'Unspecified Berth';

    const refNo = generateReferenceNumber();

    const fullComment = category === 'foreign_object'
      ? `${comment} [Item Found: ${foreignObjectDetail}]`
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
      {/* Offline Banner using useOnlineStatus hook */}
      {!isOnline && (
        <div
          role="status"
          className="mb-3 bg-red-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2 animate-bounce shadow-md"
        >
          <span>📶</span>
          <span>
            <strong>No Internet Connection:</strong> Travelling through a remote tunnel? Reconnecting...
          </span>
        </div>
      )}

      {/* Top Banner Navigation */}
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
        {/* Mobile Scanned Header */}
        <div className="bg-railway-700 text-white p-4 text-center">
          <span className="text-2xl mb-1 block" role="img" aria-label="train">🚆</span>
          <h2 className="text-base font-bold">Authorized Packaging Scanned</h2>
          <p className="text-xs text-railway-100 mt-0.5">IRCTC Quality Feedback Portal</p>
          <div className="mt-2 inline-block bg-white/10 px-2.5 py-1 rounded-full font-mono text-xs">
            Token: <strong>{sampleComplaint?.token || 'Xk9PqA72mZ'}</strong>
          </div>
        </div>

        {/* Pre-filled Traceability Context */}
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

        {/* Form Body */}
        <div className="p-4 space-y-4">
          {submittedRef ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h3 className="text-base font-bold text-slate-800">Complaint Registered!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Your report has been logged with <strong>{derivedSeverity.toUpperCase()}</strong> severity. Safety inspectors for Northern Zone have been notified.
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
              {/* 1. Star Rating Input */}
              <FormField label="Meal Quality Rating" required>
                <div className="flex justify-center py-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive={true}
                    onChange={(r) => setRating(r)}
                  />
                </div>
              </FormField>

              {/* 2. Category Radio Group */}
              <FormField label="Complaint Category" required>
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
                        onClick={() => setCategory(catKey)}
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

              {/* Conditional Field: Foreign Object Specification */}
              {category === 'foreign_object' && (
                <FormField
                  label="Identify Contaminant"
                  htmlFor="foreign-object-detail"
                  required
                  error={errors.foreignObject}
                  helperText="Describe what was found in the food container"
                >
                  <TextInput
                    id="foreign-object-detail"
                    value={foreignObjectDetail}
                    onChange={(e) => setForeignObjectDetail(e.target.value)}
                    placeholder="e.g. Iron staple wire, insect, glass chip..."
                    error={errors.foreignObject}
                  />
                </FormField>
              )}

              {/* 3. Description with character counter */}
              <FormField
                label="Describe the Issue"
                htmlFor="passenger-comment"
                required
                error={errors.comment}
              >
                <div ref={commentInputRef} tabIndex={-1}>
                  <TextArea
                    id="passenger-comment"
                    rows={3}
                    maxLength={500}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide details about food hygiene, temperature, taste or quantity..."
                    error={errors.comment}
                  />
                </div>
              </FormField>

              {/* 4. 1-3 Photographic Evidence with Camera & Canvas Resize */}
              <FormField
                label="Photographic Proof (1 to 3 Photos)"
                helperText="Camera photos are automatically downscaled client-side for rapid transmission."
              >
                <FileInput
                  images={images}
                  onImagesChange={setImages}
                  maxImages={3}
                />
              </FormField>

              {/* 5. Optional Travel Details (PNR & UNCONTROLLED Seat Ref) */}
              <div className="grid grid-cols-2 gap-2">
                <FormField label="PNR (Optional)" htmlFor="pnr-input" error={errors.pnr}>
                  <TextInput
                    id="pnr-input"
                    type="text"
                    maxLength={10}
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value)}
                    placeholder="10-digit PNR"
                    error={errors.pnr}
                  />
                </FormField>

                {/* UNCONTROLLED COMPONENT EXAMPLE using useRef */}
                <FormField
                  label="Coach / Seat (Uncontrolled)"
                  htmlFor="seat-uncontrolled-input"
                  helperText="Ref-based uncontrolled input"
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

              {/* 6. Anonymous Toggle & Conditional Phone Field */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={toggleAnonymous}
                    className="rounded text-railway-600 focus:ring-railway-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    File anonymously (hide my contact details)
                  </span>
                </label>

                {!isAnonymous && (
                  <FormField
                    label="Mobile Number (For SMS Tracking)"
                    htmlFor="phone-input"
                    error={errors.phone}
                    helperText="We send SMS updates as the inspector reviews your complaint."
                  >
                    <TextInput
                      id="phone-input"
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      error={errors.phone}
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
                Submit Quality Audit Grievance
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

export default PassengerMobileView;
