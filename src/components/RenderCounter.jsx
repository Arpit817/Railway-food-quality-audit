import React, { useRef } from 'react';

/**
 * Dev-only RenderCounter component
 * Uses useRef to count and visually highlight how many times a component re-renders
 * Demonstrates:
 * - useRef persists values across re-renders without triggering a re-render itself
 * - syllabus Unit III re-render debugging
 */
export function RenderCounter({ componentName = 'Component' }) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <span
      className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700 select-none shadow-2xs"
      title={`${componentName} re-rendered ${renderCount.current} times`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
      {componentName}: #{renderCount.current}
    </span>
  );
}

export default RenderCounter;
