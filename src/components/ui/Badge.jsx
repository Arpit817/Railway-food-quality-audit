import React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Accessible Badge component with standard Railway severity colors (Red/Amber/Green)
 */
export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = ''
}) {
  const variantStyles = {
    high: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-600/10',
    medium: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-600/10',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/10',
    info: 'bg-railway-50 text-railway-800 border-railway-200 ring-1 ring-railway-600/10',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-600/10'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 leading-none',
    md: 'text-xs px-2.5 py-1 leading-tight'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full uppercase tracking-wider border select-none',
        variantStyles[variant] || variantStyles.neutral,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
    >
      {/* Semantic decorative dot for high severity */}
      {variant === 'high' && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-pulse" aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

export default Badge;
