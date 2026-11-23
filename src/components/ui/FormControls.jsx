import React from 'react';
import { cn } from '../../utils/cn.js';

export function FormField({
  label,
  htmlFor,
  error,
  required = false,
  helperText,
  children,
  className = ''
}) {
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;
  const helperId = helperText && htmlFor ? `${htmlFor}-helper` : undefined;

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {children}

      {helperText && !error && (
        <p id={helperId} className="text-[11px] text-slate-500">
          {helperText}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-[11px] text-red-600 font-medium animate-in fade-in">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  className = '',
  required = false,
  ...rest
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(
        'w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all',
        error
          ? 'border-red-400 focus:ring-red-500'
          : 'border-slate-300 focus:ring-railway-500 focus:border-transparent',
        className
      )}
      {...rest}
    />
  );
}

export function TextArea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  className = '',
  maxLength,
  ...rest
}) {
  return (
    <div className="relative">
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'w-full text-xs p-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all',
          error
            ? 'border-red-400 focus:ring-red-500'
            : 'border-slate-300 focus:ring-railway-500 focus:border-transparent',
          className
        )}
        {...rest}
      />
      {maxLength && (
        <div className="text-[10px] text-slate-400 text-right mt-0.5">
          {value?.length || 0} / {maxLength} characters
        </div>
      )}
    </div>
  );
}
