import React, { useState } from 'react';
import { Card, Button, Badge } from './ui/index.js';

/**
 * PassengerMobileView component
 * Mobile-first view designed specifically for smartphone screens (QR code landing flow).
 * Demonstrates:
 * - Mobile-first responsive layout (single column, touch targets >= 44px)
 * - Semantic form tags and accessibility (aria-describedby, focus rings)
 * - Traceability metadata pre-filled from scanned authorized packaging token
 */
export function PassengerMobileView({ sampleComplaint, onBackToDashboard }) {
  const [rating, setRating] = useState(1);
  const [category, setCategory] = useState('hygiene_issue');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { id: 'hygiene_issue', label: 'Hygiene Issue', icon: '🧼' },
    { id: 'foreign_object', label: 'Foreign Object', icon: '⚠️' },
    { id: 'stale_spoiled_food', label: 'Stale / Spoiled Food', icon: '🍛' },
    { id: 'damaged_packaging', label: 'Damaged Packaging', icon: '📦' },
    { id: 'overcharging', label: 'Overcharging', icon: '💵' },
    { id: 'taste', label: 'Taste / Quality', icon: '👅' }
  ];

  return (
    <div className="max-w-md mx-auto py-2 sm:py-4 px-2">
      {/* Top Banner indicating mobile test environment */}
      <div className="flex items-center justify-between mb-4 bg-slate-200/80 px-3 py-2 rounded-lg text-xs">
        <span className="font-semibold text-slate-700">📱 Mobile Passenger Simulation</span>
        <button
          onClick={onBackToDashboard}
          className="text-railway-700 font-semibold underline hover:text-railway-800"
        >
          Exit to Dashboard
        </button>
      </div>

      <Card className="border-railway-200 shadow-md">
        {/* Mobile Header */}
        <div className="bg-railway-700 text-white p-4 text-center">
          <span className="text-2xl mb-1 block" role="img" aria-label="train">🚆</span>
          <h2 className="text-base font-bold">Authorized Packaging Scanned</h2>
          <p className="text-xs text-railway-100 mt-0.5">IRCTC Quality Feedback Portal</p>
          <div className="mt-2 inline-block bg-white/10 px-2.5 py-1 rounded-full font-mono text-xs">
            Token: <strong>Xk9PqA72mZ</strong>
          </div>
        </div>

        {/* Pre-filled Packaging Context */}
        <div className="bg-railway-50 px-4 py-3 border-b border-railway-100 text-xs space-y-1">
          <div className="flex justify-between text-slate-600">
            <span>Train No:</span> <strong className="text-slate-900">12424 (Rajdhani Exp)</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Vendor:</span> <strong className="text-slate-900">Express Caterers Pvt Ltd</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Kitchen:</span> <strong className="text-slate-900">New Delhi Base Kitchen</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Meal:</span> <strong className="text-slate-900">Standard Veg Thali</strong>
          </div>
        </div>

        {/* Feedback Form Content */}
        <div className="p-4 space-y-4">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h3 className="text-base font-bold text-slate-800">Complaint Registered!</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Your feedback has been linked to batch <code>bat-901</code>. Quality safety officers have been notified.
              </p>
              <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono font-bold text-slate-800">
                Ref No: RAIL-2026-X9921K
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => setIsSubmitted(false)}
              >
                Submit Another Feedback
              </Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }} className="space-y-4">
              {/* Star Rating Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Overall Meal Rating
                </label>
                <div className="flex justify-center gap-2 py-2 bg-slate-50 rounded-lg border border-slate-100">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`Rate ${star} star`}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none focus:ring-2 focus:ring-railway-500 rounded"
                    >
                      <svg
                        className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-200'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Chips Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Complaint Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all text-left focus:outline-none focus:ring-2 focus:ring-railway-500 min-h-[44px] ${
                        category === cat.id
                          ? 'border-railway-600 bg-railway-50 text-railway-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor="passenger-comment" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Describe the Issue
                </label>
                <textarea
                  id="passenger-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what went wrong with the food..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-railway-600 focus:border-transparent"
                  required
                />
              </div>

              {/* Simulated Camera Upload Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Food Photo Evidence (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center text-xs text-slate-500 bg-slate-50 flex items-center justify-center gap-2">
                  <span className="text-lg">📷</span>
                  <span>Tap to capture or upload photo</span>
                </div>
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
