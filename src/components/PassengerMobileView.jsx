import React, { useState } from 'react';
import { Card, Button } from './ui/index.js';
import { StarRating } from './ui/StarRating.jsx';
import { COMPLAINT_CATEGORIES, calculateSeverity, generateReferenceNumber } from '../utils/complaintUtils.js';

/**
 * PassengerMobileView
 * Demonstrates:
 * - Interactive controlled StarRating with live hover state
 * - Controlled category radio chips with useState
 * - Form event handling with preventDefault
 * - Automatic severity calculation derived from rating and category
 */
export function PassengerMobileView({ sampleComplaint, onSubmitFeedback, onBackToDashboard }) {
  const [rating, setRating] = useState(1);
  const [category, setCategory] = useState('hygiene_issue');
  const [comment, setComment] = useState('');
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

  // Derived state: calculate severity live as user interacts
  const derivedSeverity = calculateSeverity(category, rating);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const refNo = generateReferenceNumber();
    const newFeedback = {
      id: `cmp-${Date.now()}`,
      referenceNo: refNo,
      token: sampleComplaint?.token || 'Xk9PqA72mZ',
      batchId: sampleComplaint?.batchId || 'bat-901',
      vendorId: sampleComplaint?.vendorId || 'ven-001',
      kitchenId: sampleComplaint?.kitchenId || 'kit-101',
      rating,
      category,
      comment,
      severity: derivedSeverity,
      status: 'new',
      createdAt: new Date().toISOString(),
      images: [],
      actionLogs: [
        {
          id: `log-${Date.now()}`,
          action: 'CREATED',
          remarks: 'Complaint registered by passenger via mobile QR scan',
          timestamp: new Date().toISOString(),
          userId: 'passenger-public'
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

        {/* Pre-filled Packaging Context */}
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
                Your report has been queued in the Northern Zone Inspector Inbox with <strong>{derivedSeverity.toUpperCase()}</strong> severity.
              </p>
              <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono font-bold text-slate-850">
                Tracking Ref: {submittedRef}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setSubmittedRef(null);
                  setComment('');
                }}
              >
                Submit Another Feedback
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Interactive StarRating */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rating (Tap stars)
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">1 = Worst, 5 = Excellent</span>
                </div>
                <div className="flex justify-center py-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <StarRating
                    rating={rating}
                    size="lg"
                    interactive={true}
                    onChange={(newRating) => setRating(newRating)}
                  />
                </div>
              </div>

              {/* Category Radio Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Category
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {COMPLAINT_CATEGORIES.map((catKey) => {
                    const item = categoryLabels[catKey] || { label: catKey, icon: '📌' };
                    const isSelected = category === catKey;

                    return (
                      <button
                        key={catKey}
                        type="button"
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
              </div>

              {/* Real-time Derived Severity Indicator */}
              <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded border border-slate-200 text-xs">
                <span className="text-slate-500">Auto-Assigned Severity:</span>
                <span className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded ${
                  derivedSeverity === 'high'
                    ? 'bg-red-100 text-red-700'
                    : derivedSeverity === 'medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {derivedSeverity}
                </span>
              </div>

              {/* Comment Input */}
              <div>
                <label htmlFor="mobile-comment" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Describe the Issue
                </label>
                <textarea
                  id="mobile-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what was wrong with the meal..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-railway-600"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full h-11 text-sm font-semibold">
                Submit Quality Complaint
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

export default PassengerMobileView;
