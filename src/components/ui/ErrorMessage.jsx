import React from 'react';

/**
 * Reusable ErrorMessage component with optional retry trigger
 */
export function ErrorMessage({
  title = 'An error occurred',
  message = 'Failed to process your request. Please try again.',
  onRetry
}) {
  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-900">
      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-red-800">{title}</h4>
        <p className="text-sm text-red-700 mt-0.5">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-red-800 underline hover:text-red-900 cursor-pointer"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;
