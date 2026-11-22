import React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Reusable accessible Button with Tailwind class-map and cn() helper
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
  ...rest
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none';

  const variantStyles = {
    primary: 'bg-railway-700 text-white hover:bg-railway-800 focus-visible:ring-railway-600 disabled:bg-railway-300 shadow-xs',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus-visible:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300 shadow-xs',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus-visible:ring-railway-500 disabled:bg-slate-50 disabled:text-slate-300 shadow-xs'
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading ? 'true' : 'false'}
      className={cn(
        baseStyles,
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:scale-[0.98]',
        className
      )}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
