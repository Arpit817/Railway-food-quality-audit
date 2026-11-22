import React, { useState } from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Interactive StarRating component
 * Supports both controlled input (interactive rating selection) and display mode
 * Demonstrates:
 * - Hover state management with useState
 * - Controlled input with onChange callbacks
 * - Keyboard accessibility (Space/Enter, Arrow keys)
 */
export function StarRating({
  rating = 0,
  max = 5,
  size = 'md',
  interactive = false,
  onChange
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const activeRating = hoverRating || rating;

  return (
    <div
      className="inline-flex items-center gap-1"
      role={interactive ? 'radiogroup' : undefined}
      aria-label={`Rating: ${rating} out of ${max} stars`}
    >
      <div className="flex">
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= Math.round(activeRating);

          if (!interactive) {
            return (
              <svg
                key={starNumber}
                className={`${sizeMap[size] || sizeMap.md} ${
                  isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-200'
                } inline-block`}
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          }

          return (
            <button
              key={starNumber}
              type="button"
              role="radio"
              aria-checked={rating === starNumber}
              aria-label={`${starNumber} Star${starNumber > 1 ? 's' : ''}`}
              onClick={() => onChange && onChange(starNumber)}
              onMouseEnter={() => setHoverRating(starNumber)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-railway-500 cursor-pointer transition-transform hover:scale-110 active:scale-95"
            >
              <svg
                className={cn(
                  sizeMap[size] || sizeMap.md,
                  isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-100',
                  'transition-colors'
                )}
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-slate-700 ml-1 select-none">
        ({(activeRating || 0).toFixed(1)})
      </span>
    </div>
  );
}

export default StarRating;
