import React, { useState, useEffect } from 'react';

/**
 * Isolated AuditClock component
 * Demonstrates the FIRST and most important rule of React performance:
 * "Push state down to where it is needed instead of lifting it unnecessarily!"
 *
 * By isolating the 1-second ticking interval inside its own component,
 * ONLY this tiny component re-renders every second, preventing the entire
 * 500-item complaint list and detail panel from re-rendering!
 */
export function AuditClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-slate-600 font-medium">Standard Time:</span>
      <time className="font-mono font-bold text-slate-800" dateTime={time.toISOString()}>
        {time.toLocaleTimeString()}
      </time>
      <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">IST</span>
    </div>
  );
}

export default React.memo(AuditClock);
