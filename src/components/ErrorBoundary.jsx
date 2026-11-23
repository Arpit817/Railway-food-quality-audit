import React, { Component } from 'react';

/**
 * Enterprise React Error Boundary
 * Catches unhandled JavaScript runtime exceptions anywhere in child component trees
 * and renders a safe, accessible railway error fallback rather than crashing the white screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
          <div className="max-w-md w-full bg-white rounded-xl border border-red-300 p-6 text-center shadow-lg space-y-4">
            <span className="text-4xl block" role="img" aria-label="emergency brake">🛑</span>
            <h2 className="text-lg font-bold text-red-900">Emergency System Interruption</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              An unexpected component error occurred on this view. The rest of the platform remains safe and operational.
            </p>
            <div className="p-3 bg-red-50 rounded text-left font-mono text-[11px] text-red-800 overflow-x-auto">
              {this.state.error?.toString()}
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-railway-800 hover:bg-railway-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Restart Platform View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
