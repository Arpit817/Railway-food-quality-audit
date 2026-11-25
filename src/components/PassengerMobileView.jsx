import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, FormField, TextInput, TextArea, FileInput, ErrorMessage } from './ui/index.js';
import { useOnlineStatus, useToggle } from '../hooks/index.js';
import { COMPLAINT_CATEGORIES, calculateSeverity, generateReferenceNumber } from '../utils/complaintUtils.js';
import { feedbackSchema } from '../utils/validationSchemas.js';
import { useTokenResolutionQuery, useMetadataQuery, useCreateComplaintMutation } from '../api/index.js';
import { feedbackApi } from '../api/complaintsApi.js';
import { useUIStore } from '../store/uiStore.js';

// ─── Star Rating Component (inline, touch-friendly) ──────────────────────────
function StarRatingInput({ value, onChange, label }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="space-y-1">
      {label && <p className="text-[11px] text-slate-600 font-semibold">{label}</p>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl transition-transform active:scale-110 cursor-pointer leading-none"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <span className={(hovered || value) >= star ? 'text-amber-400' : 'text-slate-300'}>★</span>
          </button>
        ))}
        <span className="ml-1.5 text-xs font-bold text-slate-700">
          {value ? ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'][value] : ''}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PassengerMobileView({ initialToken = '', onBackToDashboard }) {
  const isOnline = useOnlineStatus();
  const [isAnonymous, toggleAnonymous] = useToggle(false);

  const [tokenInput, setTokenInput] = useState(initialToken);
  const [manualCode, setManualCode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // After QR scan: 'choose' | 'feedback' | 'complaint' | 'feedbackDone' | 'complaintDone'
  const [activeFlow, setActiveFlow] = useState('choose');

  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const scanIntervalRef = React.useRef(null);
  const commentInputRef = React.useRef(null);
  const seatRef = React.useRef(null);

  useEffect(() => {
    document.title = 'Passenger Portal — RailFood Audit';
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ─── Camera Scanner ──────────────────────────────────────────────────────
  const startCameraScanner = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          if ('BarcodeDetector' in window) {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            scanIntervalRef.current = setInterval(async () => {
              if (videoRef.current && videoRef.current.readyState === 4) {
                try {
                  const codes = await detector.detect(videoRef.current);
                  if (codes.length > 0) {
                    const raw = codes[0].rawValue;
                    const match = raw.match(/\/f\/([a-zA-Z0-9]+)/);
                    const tok = match ? match[1] : raw;
                    stopCameraScanner();
                    setTokenInput(tok);
                    setActiveFlow('choose');
                  }
                } catch {}
              }
            }, 500);
          }
        }
      } else {
        setCameraError('Camera access not supported on this browser.');
      }
    } catch {
      setCameraError('Camera permission denied. Please upload a QR photo or enter the code manually.');
    }
  };

  const stopCameraScanner = () => {
    if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setIsCameraActive(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if ('BarcodeDetector' in window) {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        try {
          const barcodes = await detector.detect(img);
          if (barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            const match = raw.match(/\/f\/([a-zA-Z0-9]+)/);
            const tok = match ? match[1] : raw;
            setTokenInput(tok);
            setActiveFlow('choose');
            return;
          }
        } catch {}
        useUIStore.getState().showToast({ type: 'info', title: 'Photo Uploaded', message: 'Please confirm the packaging token to proceed.' });
      };
    } else {
      useUIStore.getState().showToast({ type: 'info', title: 'Photo Uploaded', message: 'Please enter the packaging token manually.' });
    }
  };

  // ─── React Query ─────────────────────────────────────────────────────────
  const { data: qrResults, isLoading: isTokenLoading, isError: isTokenError } = useTokenResolutionQuery(tokenInput);
  const { vendors, kitchens, batches } = useMetadataQuery();
  const createComplaintMutation = useCreateComplaintMutation();

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

  // ─── Complaint Form State ────────────────────────────────────────────────
  const [rating, setRating] = useState(1);
  const [category, setCategory] = useState('hygiene_issue');
  const [comment, setComment] = useState('');
  const [foreignObjectDetail, setForeignObjectDetail] = useState('');
  const [pnr, setPnr] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submittedRef, setSubmittedRef] = useState(null);

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

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    const seatValue = seatRef.current?.value || 'Coach B2-19';
    const formData = { rating, category, comment, foreignObjectDetail: foreignObjectDetail || undefined, pnr: pnr.trim() || undefined, phone: phone.trim() || undefined, isAnonymous, seat: seatValue, images };
    const validationResult = feedbackSchema.safeParse(formData);
    if (!validationResult.success) {
      const errMap = {};
      Object.keys(validationResult.error.flatten().fieldErrors).forEach((k) => (errMap[k] = validationResult.error.flatten().fieldErrors[k][0]));
      setFieldErrors(errMap);
      if (errMap.comment && commentInputRef.current) commentInputRef.current.focus();
      return;
    }
    setFieldErrors({});
    const refNo = generateReferenceNumber();
    const fullComment = [
      category === 'foreign_object' ? `${comment} [Contaminant: ${foreignObjectDetail}]` : comment,
      batch?.trainNumber ? `[Train: ${batch.trainNumber}]` : ''
    ].filter(Boolean).join(' ');

    const newComplaint = {
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
      await createComplaintMutation.mutateAsync(newComplaint);
      setSubmittedRef(refNo);
      setActiveFlow('complaintDone');
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  // ─── Feedback Form State ─────────────────────────────────────────────────
  const [fbOverall, setFbOverall] = useState(0);
  const [fbFoodQuality, setFbFoodQuality] = useState(0);
  const [fbQuantity, setFbQuantity] = useState(0);
  const [fbPackaging, setFbPackaging] = useState(0);
  const [fbTemperature, setFbTemperature] = useState(0);
  const [fbPositive, setFbPositive] = useState('');
  const [fbImprovement, setFbImprovement] = useState('');
  const [fbName, setFbName] = useState('');
  const [fbWouldOrder, setFbWouldOrder] = useState('');
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbError, setFbError] = useState('');

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!fbOverall) { setFbError('Please give an overall rating before submitting.'); return; }
    setFbError('');
    setFbSubmitting(true);
    try {
      const feedbackEntry = {
        token: qrRecord?.token || tokenInput,
        batchId: batch?.id,
        vendorId: vendor?.id,
        kitchenId: kitchen?.id,
        trainNumber: batch?.trainNumber,
        overallRating: fbOverall,
        foodQualityRating: fbFoodQuality || null,
        quantityRating: fbQuantity || null,
        packagingRating: fbPackaging || null,
        temperatureRating: fbTemperature || null,
        positiveComment: fbPositive.trim() || null,
        improvementComment: fbImprovement.trim() || null,
        passengerName: fbName.trim() || null,
        wouldOrderAgain: fbWouldOrder || null,
        createdAt: new Date().toISOString()
      };
      await feedbackApi.create(feedbackEntry);
      setActiveFlow('feedbackDone');
    } catch (err) {
      setFbError('Failed to submit feedback. Please try again.');
      console.error(err);
    } finally {
      setFbSubmitting(false);
    }
  };

  // ─── Shared: Batch Info Banner ───────────────────────────────────────────
  const BatchInfoBanner = () => (
    <div className="bg-railway-50 px-4 py-3 border-b border-railway-100 text-xs space-y-1">
      <div className="flex justify-between text-slate-600"><span>Train No:</span><strong className="text-slate-900">{batch?.trainNumber || '12424'}</strong></div>
      <div className="flex justify-between text-slate-600"><span>Vendor:</span><strong className="text-slate-900">{vendor?.name || 'Express Caterers'}</strong></div>
      <div className="flex justify-between text-slate-600"><span>Kitchen:</span><strong className="text-slate-900">{kitchen?.location || 'New Delhi Base Kitchen'}</strong></div>
      <div className="flex justify-between text-slate-600"><span>Meal Item:</span><strong className="text-slate-900">{batch?.itemType || 'Standard Thali'}</strong></div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto py-2 sm:py-4 px-2">
      {!isOnline && (
        <div role="status" className="mb-3 bg-red-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-md">
          <span>📶</span>
          <span><strong>No Internet Connection:</strong> Operating in offline train mode.</span>
        </div>
      )}

      {/* Top Nav */}
      <div className="flex items-center justify-between mb-4 bg-slate-100 px-3 py-2 rounded-xl text-xs border border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          {tokenInput && (
            <button type="button" onClick={() => { setTokenInput(''); setManualCode(''); setActiveFlow('choose'); setSubmittedRef(null); }} className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-300 cursor-pointer flex items-center gap-1 shadow-2xs text-xs" title="Go Back">
              <span>←</span><span>Back</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-railway-900 font-bold flex items-center gap-1 hover:underline"><span>🚆</span><span>Home</span></Link>
          <Link to="/track" className="text-railway-700 font-semibold hover:underline">Tracker &rarr;</Link>
        </div>
      </div>

      <Card className="border-railway-200 shadow-md">
        {/* ══════════ STATE 1: NO TOKEN ══════════ */}
        {!tokenInput ? (
          <div>
            <div className="bg-railway-800 text-white p-5 text-center">
              <span className="text-3xl mb-1 block" role="img" aria-label="camera">📷</span>
              <h2 className="text-base font-bold">Scan Meal Packaging QR Code</h2>
              <p className="text-xs text-railway-200 mt-0.5">IRCTC Real-Time Quality Portal</p>
            </div>

            {isCameraActive ? (
              <div className="bg-black p-4 text-center text-white space-y-3">
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Live QR Scanner Active
                  </span>
                  <button type="button" onClick={stopCameraScanner} className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white font-bold cursor-pointer">✕ Close</button>
                </div>
                <div className="relative rounded-xl overflow-hidden aspect-square max-w-xs mx-auto border-2 border-emerald-400 bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-6 border-2 border-dashed border-white/80 rounded-lg pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-white bg-black/60 px-2 py-0.5 rounded">Align meal QR sticker inside box</span>
                  </div>
                </div>
                {cameraError && <p className="text-xs text-amber-300">{cameraError}</p>}
                <Button variant="outline" size="sm" onClick={stopCameraScanner} className="w-full text-white border-white/30 hover:bg-white/10">Close Camera</Button>
              </div>
            ) : (
              <div className="p-5 text-center space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">Point your phone camera at the tamper-evident QR sticker on your meal container, or choose an option below:</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={startCameraScanner} className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer shadow-xs group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📷</span>
                    <strong className="text-xs text-emerald-950 font-bold">Start Camera Scanner</strong>
                    <span className="text-[10px] text-emerald-800">Scan QR seal with phone</span>
                  </button>
                  <label className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all flex flex-col items-center justify-center text-center gap-1 cursor-pointer shadow-xs group">
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                    <span className="text-2xl group-hover:scale-110 transition-transform">🖼️</span>
                    <strong className="text-xs text-slate-900 font-bold">Upload QR Photo</strong>
                    <span className="text-[10px] text-slate-500">Pick from gallery / snap</span>
                  </label>
                </div>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-bold uppercase">Or Enter 10-Digit Code</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (manualCode.trim()) { setTokenInput(manualCode.trim()); setActiveFlow('choose'); } }} className="space-y-2.5">
                  <TextInput id="packaging-code" value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="e.g. 10-character code" className="font-mono text-center font-bold text-sm tracking-widest min-h-[44px]" />
                  <Button type="submit" variant="primary" size="md" disabled={!manualCode.trim()} className="w-full min-h-[44px] font-bold cursor-pointer">Verify Packaging Code →</Button>
                </form>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  Need immediate help on train? Call Rail Madad at{' '}
                  <a href="tel:139" className="text-railway-700 font-bold hover:underline">📞 139</a>
                </div>
              </div>
            )}
          </div>

        ) : (
          /* ══════════ STATE 2: TOKEN SCANNED ══════════ */
          <div>
            <div className="bg-railway-800 text-white p-4 text-center">
              <span className="text-2xl mb-1 block" role="img" aria-label="verified">✅</span>
              <h2 className="text-base font-bold">Meal Packaging Verified</h2>
              <p className="text-xs text-railway-200 mt-0.5">IRCTC Real-Time Quality Portal</p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full font-mono text-xs">
                <span className="text-railway-200">Token:</span>
                <span className="font-bold text-white tracking-wider">{tokenInput}</span>
              </div>
            </div>

            {isTokenLoading && (
              <div className="p-6 text-center text-xs text-slate-500">
                <span className="animate-spin inline-block mr-2">⏳</span>Verifying packaging token via audit ledger...
              </div>
            )}

            {(isTokenInvalid || isTokenError) && !isTokenLoading && (
              <div className="p-5">
                <ErrorMessage title="Invalid or Expired QR Token" message="This token does not correspond to authorized railway food packaging." onRetry={() => { setTokenInput(''); setManualCode(''); setActiveFlow('choose'); }} />
              </div>
            )}

            {qrRecord && !isTokenLoading && !isTokenInvalid && (
              <>
                <BatchInfoBanner />

                {/* ── FLOW SELECTOR ── */}
                {activeFlow === 'choose' && (
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600 text-center font-semibold">What would you like to do?</p>
                    <button
                      type="button"
                      onClick={() => setActiveFlow('feedback')}
                      className="w-full p-4 rounded-xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 transition-all text-left flex items-start gap-3 cursor-pointer group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform mt-0.5">🌟</span>
                      <div>
                        <div className="font-bold text-amber-900 text-sm">Share Your Meal Experience</div>
                        <div className="text-xs text-amber-800 mt-0.5">Rate the food quality, quantity, packaging and more. Your feedback goes directly to the vendor.</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFlow('complaint')}
                      className="w-full p-4 rounded-xl border-2 border-red-300 bg-red-50 hover:bg-red-100 transition-all text-left flex items-start gap-3 cursor-pointer group"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform mt-0.5">⚠️</span>
                      <div>
                        <div className="font-bold text-red-900 text-sm">Report a Food Safety Issue</div>
                        <div className="text-xs text-red-800 mt-0.5">File a formal grievance with Railway Food Safety Officers. You will receive a tracking reference number.</div>
                      </div>
                    </button>
                    <div className="text-center text-[11px] text-slate-400 pt-1">
                      Need urgent help? Call Rail Madad <a href="tel:139" className="text-railway-700 font-bold">📞 139</a>
                    </div>
                  </div>
                )}

                {/* ── FEEDBACK FLOW ── */}
                {activeFlow === 'feedback' && (
                  <div className="p-4 space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <button type="button" onClick={() => setActiveFlow('choose')} className="text-slate-500 hover:text-slate-700 cursor-pointer text-xs flex items-center gap-1 font-semibold">← Back</button>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Rate Your Meal</h3>
                        <p className="text-[11px] text-slate-500">Your feedback helps improve IRCTC catering services</p>
                      </div>
                    </div>

                    <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                      {fbError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold">{fbError}</div>}

                      {/* Overall Rating — required */}
                      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                        <p className="text-xs font-bold text-amber-900">Overall Meal Experience <span className="text-red-500">*</span></p>
                        <StarRatingInput value={fbOverall} onChange={setFbOverall} />
                      </div>

                      {/* Dimension Ratings */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Rate Each Dimension (Optional)</p>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
                          <StarRatingInput value={fbFoodQuality} onChange={setFbFoodQuality} label="🍽️ Food Quality & Taste" />
                          <div className="border-t border-slate-100"></div>
                          <StarRatingInput value={fbQuantity} onChange={setFbQuantity} label="⚖️ Quantity & Portion Size" />
                          <div className="border-t border-slate-100"></div>
                          <StarRatingInput value={fbPackaging} onChange={setFbPackaging} label="📦 Packaging & Hygiene" />
                          <div className="border-t border-slate-100"></div>
                          <StarRatingInput value={fbTemperature} onChange={setFbTemperature} label="🌡️ Temperature (Hot/Cold as expected)" />
                        </div>
                      </div>

                      {/* Open Text */}
                      <FormField label="What did you enjoy? (Optional)" htmlFor="fb-positive">
                        <TextArea id="fb-positive" rows={2} maxLength={300} value={fbPositive} onChange={(e) => setFbPositive(e.target.value)} placeholder="e.g. The dal makhani was excellent and hot..." />
                      </FormField>

                      <FormField label="What could be improved? (Optional)" htmlFor="fb-improve">
                        <TextArea id="fb-improve" rows={2} maxLength={300} value={fbImprovement} onChange={(e) => setFbImprovement(e.target.value)} placeholder="e.g. The roti was a bit cold, quantity could be more..." />
                      </FormField>

                      {/* Would order again */}
                      <FormField label="Would you order from this vendor again?">
                        <div className="flex items-center gap-2 flex-wrap">
                          {['Yes', 'Maybe', 'No'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setFbWouldOrder(opt)}
                              className={`px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${fbWouldOrder === opt ? 'border-railway-600 bg-railway-800 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}`}
                            >
                              {opt === 'Yes' ? '👍 Yes' : opt === 'No' ? '👎 No' : '🤔 Maybe'}
                            </button>
                          ))}
                        </div>
                      </FormField>

                      {/* Optional name */}
                      <FormField label="Your Name (Optional)" htmlFor="fb-name">
                        <TextInput id="fb-name" value={fbName} onChange={(e) => setFbName(e.target.value)} placeholder="Leave blank to submit anonymously" />
                      </FormField>

                      <Button type="submit" variant="primary" size="md" disabled={fbSubmitting || !fbOverall} className="w-full h-11 text-sm font-semibold">
                        {fbSubmitting ? 'Submitting Feedback...' : 'Submit Meal Feedback →'}
                      </Button>
                    </form>
                  </div>
                )}

                {/* ── FEEDBACK DONE ── */}
                {activeFlow === 'feedbackDone' && (
                  <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-3xl">🌟</div>
                    <h3 className="text-base font-bold text-slate-800">Thank You for Your Feedback!</h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      Your ratings have been shared with <strong>{vendor?.name || 'the vendor'}</strong>. This helps IRCTC maintain catering quality standards across all trains.
                    </p>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      Your feedback contributes to the vendor's public quality scorecard.
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => { setTokenInput(''); setManualCode(''); setActiveFlow('choose'); setFbOverall(0); setFbFoodQuality(0); setFbQuantity(0); setFbPackaging(0); setFbTemperature(0); setFbPositive(''); setFbImprovement(''); setFbName(''); setFbWouldOrder(''); }}>
                      Scan Another Meal
                    </Button>
                  </div>
                )}

                {/* ── COMPLAINT FLOW ── */}
                {activeFlow === 'complaint' && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <button type="button" onClick={() => setActiveFlow('choose')} className="text-slate-500 hover:text-slate-700 cursor-pointer text-xs flex items-center gap-1 font-semibold">← Back</button>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">File a Safety Grievance</h3>
                        <p className="text-[11px] text-slate-500">Formal complaint to Railway Food Safety Officers</p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                      <strong>⚠️ For Safety Issues Only:</strong> Foreign objects, spoiled food, serious hygiene violations. For general feedback, go back and use the Rating option.
                    </div>

                    <form onSubmit={handleComplaintSubmit} className="space-y-4" noValidate>
                      {createComplaintMutation.isError && (
                        <ErrorMessage title="Submission Error" message={createComplaintMutation.error?.message || 'Failed to submit grievance.'} />
                      )}

                      <FormField label="Overall Meal Rating" required error={fieldErrors.rating}>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <StarRatingInput value={rating} onChange={(r) => { setRating(r); if (fieldErrors.rating) setFieldErrors((p) => ({ ...p, rating: undefined })); }} />
                        </div>
                      </FormField>

                      <FormField label="Complaint Category" required error={fieldErrors.category}>
                        <div className="grid grid-cols-2 gap-1.5" role="radiogroup">
                          {COMPLAINT_CATEGORIES.map((catKey) => {
                            const item = categoryLabels[catKey] || { label: catKey, icon: '📌' };
                            const isSelected = category === catKey;
                            return (
                              <button key={catKey} type="button" role="radio" aria-checked={isSelected}
                                onClick={() => { setCategory(catKey); if (fieldErrors.category) setFieldErrors((p) => ({ ...p, category: undefined })); }}
                                className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all text-left min-h-[42px] cursor-pointer ${isSelected ? 'border-railway-600 bg-railway-50 text-railway-900 font-bold ring-1 ring-railway-500' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}
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
                          <TextInput id="foreign-object-detail" value={foreignObjectDetail} onChange={(e) => setForeignObjectDetail(e.target.value)} placeholder="e.g. Staple pin, insect, glass shard..." error={fieldErrors.foreignObjectDetail} />
                        </FormField>
                      )}

                      <FormField label="Describe the Issue" htmlFor="passenger-comment" required error={fieldErrors.comment}>
                        <div ref={commentInputRef} tabIndex={-1}>
                          <TextArea id="passenger-comment" rows={3} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Provide details about the food safety issue..." error={fieldErrors.comment} />
                        </div>
                      </FormField>

                      <FormField label="Photographic Evidence (1 to 3 Photos)" error={fieldErrors.images}>
                        <FileInput images={images} onImagesChange={setImages} maxImages={3} />
                      </FormField>

                      <div className="grid grid-cols-2 gap-2">
                        <FormField label="PNR (Optional)" htmlFor="pnr-input" error={fieldErrors.pnr}>
                          <TextInput id="pnr-input" type="text" maxLength={10} value={pnr} onChange={(e) => setPnr(e.target.value)} placeholder="10-digit PNR" error={fieldErrors.pnr} />
                        </FormField>
                        <FormField label="Coach / Seat" htmlFor="seat-input" error={fieldErrors.seat}>
                          <input ref={seatRef} id="seat-input" type="text" defaultValue="Coach B3 - Berth 42" className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-railway-500" />
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

                      <Button type="submit" variant="primary" size="md" disabled={createComplaintMutation.isPending} loading={createComplaintMutation.isPending} className="w-full h-11 text-sm font-semibold bg-red-700 hover:bg-red-800 focus:ring-red-500">
                        {createComplaintMutation.isPending ? 'Submitting Grievance...' : '⚠️ Submit Formal Grievance'}
                      </Button>
                    </form>
                  </div>
                )}

                {/* ── COMPLAINT DONE ── */}
                {activeFlow === 'complaintDone' && submittedRef && (
                  <div className="p-6 text-center space-y-4">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
                    <h3 className="text-base font-bold text-slate-800">Grievance Registered</h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">
                      Filed with <strong>{derivedSeverity.toUpperCase()}</strong> priority. Railway Food Safety Officers have been alerted.
                    </p>
                    <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono font-bold text-slate-800 border border-slate-200 flex items-center justify-between">
                      <span>Ref: {submittedRef}</span>
                      <button type="button" onClick={() => { if (navigator?.clipboard) { navigator.clipboard.writeText(submittedRef); useUIStore.getState().showToast({ type: 'success', title: 'Copied', message: `Reference ${submittedRef} copied to clipboard.` }); } }} className="text-xs text-railway-700 hover:text-railway-900 underline font-sans font-semibold cursor-pointer">Copy</button>
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <Link to={`/track/${submittedRef}`}>
                        <Button variant="primary" size="sm" className="w-full min-h-[44px]">Track Real-Time Status &rarr;</Button>
                      </Link>
                      <Button variant="outline" size="sm" className="w-full min-h-[44px]" onClick={() => { setActiveFlow('choose'); setComment(''); setImages([]); setSubmittedRef(null); }}>
                        Back to Options
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export default PassengerMobileView;
