import React, { useEffect } from 'react';

/**
 * Toast Notification Component
 * Supports: 'success' | 'error' | 'alert' | 'warning' | 'info'
 * Ensures 44px+ touch targets and automatic dismissal timer with cleanup
 */
export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;

    const duration = toast.duration || (toast.type === 'error' || toast.type === 'alert' ? 7000 : 4500);
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [toast, onClose]);

  if (!toast) return null;

  const typeConfig = {
    success: {
      border: 'border-emerald-300',
      bgIcon: 'bg-emerald-100 text-emerald-700',
      bar: 'bg-emerald-500',
      icon: '✓',
      titleColor: 'text-emerald-950',
      defaultTitle: 'Success'
    },
    error: {
      border: 'border-red-300',
      bgIcon: 'bg-red-100 text-red-700 animate-pulse',
      bar: 'bg-red-500',
      icon: '🚨',
      titleColor: 'text-red-950',
      defaultTitle: 'Error'
    },
    alert: {
      border: 'border-red-300',
      bgIcon: 'bg-red-100 text-red-700 animate-pulse',
      bar: 'bg-red-500',
      icon: '⚠️',
      titleColor: 'text-red-950',
      defaultTitle: 'Safety Alert'
    },
    warning: {
      border: 'border-amber-300',
      bgIcon: 'bg-amber-100 text-amber-700',
      bar: 'bg-amber-500',
      icon: '⚠️',
      titleColor: 'text-amber-950',
      defaultTitle: 'Notice'
    },
    info: {
      border: 'border-railway-300',
      bgIcon: 'bg-railway-100 text-railway-700',
      bar: 'bg-railway-600',
      icon: 'ℹ️',
      titleColor: 'text-railway-950',
      defaultTitle: 'Information'
    }
  };

  const config = typeConfig[toast.type] || typeConfig.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-4 sm:right-6 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border ${config.border} overflow-hidden transition-all duration-300 ease-out`}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-full ${config.bgIcon} flex items-center justify-center flex-shrink-0 text-sm font-bold`}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${config.titleColor}`}>
              {toast.title || config.defaultTitle}
            </h4>
            <span className="text-[10px] text-slate-400">Just now</span>
          </div>
          <p className="text-xs text-slate-700 mt-1 leading-snug">
            {toast.message}
          </p>
          {toast.meta && (
            <div className="mt-1.5 text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {toast.meta}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
          aria-label="Dismiss notification"
        >
          <span className="text-sm font-bold">✕</span>
        </button>
      </div>
      <div className={`h-1 ${config.bar} animate-[shrink_4.5s_linear]`} />
    </div>
  );
}

export default Toast;
