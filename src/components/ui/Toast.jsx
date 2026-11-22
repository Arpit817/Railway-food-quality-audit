import React, { useEffect } from 'react';

/**
 * Toast Notification Component
 * Demonstrates:
 * - useEffect with automatic dismissal timer (setTimeout)
 * - Crucial cleanup function (clearTimeout) to prevent memory leaks if dismissed or unmounted early
 */
export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;

    // Auto dismiss after 6 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    // CLEANUP FUNCTION: cancel timeout if toast changes or unmounts before 6s
    return () => {
      clearTimeout(timer);
    };
  }, [toast, onClose]);

  if (!toast) return null;

  const isAlert = toast.type === 'alert' || toast.type === 'error';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden animate-in slide-in-from-bottom-5 transition-all"
    >
      <div className="p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-base font-bold animate-pulse">
          🚨
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">
              {toast.title || 'High Severity Food Alert'}
            </h4>
            <span className="text-[10px] text-slate-400">Just now</span>
          </div>
          <p className="text-xs text-slate-700 mt-1 leading-snug">
            {toast.message}
          </p>
          {toast.meta && (
            <div className="mt-1.5 text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {toast.meta}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-xs p-1 rounded"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      </div>
      <div className="h-1 bg-red-500 animate-[shrink_6s_linear]" />
    </div>
  );
}

export default Toast;
