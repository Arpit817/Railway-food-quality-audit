import React from 'react';

/**
 * Reusable Badge component for severity, status, and tags
 * Demonstrates:
 * - Variant mapping
 * - Composition
 */
export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = ''
}) {
  const variantStyles = {
    high: 'bg-red-100 text-red-800 border border-red-200',
    medium: 'bg-amber-100 text-amber-800 border border-amber-200',
    low: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full uppercase tracking-wider ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
