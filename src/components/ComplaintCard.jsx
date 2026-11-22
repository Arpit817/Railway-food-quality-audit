import React from 'react';
import { Card, Badge, StarRating } from './ui/index.js';
import { cn } from '../utils/cn.js';
import { RenderCounter } from './RenderCounter.jsx';

/**
 * ComplaintCard optimized with React.memo
 * Demonstrates:
 * - React.memo skips re-rendering when props (complaint, vendorName, isSelected, onSelect)
 *   have not changed referentially!
 * - When used in a 500+ item list, selecting 1 card only re-renders 2 cards (the previously selected
 *   and newly selected one) instead of all 500!
 */
export const ComplaintCard = React.memo(function ComplaintCard({
  complaint,
  vendorName = 'Unknown Vendor',
  isSelected = false,
  onSelect
}) {
  const { referenceNo, category, rating, comment, severity, status, createdAt, images = [] } = complaint;

  const formattedDate = new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card
      onClick={() => onSelect && onSelect(complaint)}
      className={cn(
        'transition-all duration-150 relative select-none',
        isSelected
          ? 'ring-2 ring-railway-600 border-transparent shadow-md bg-blue-50/20'
          : 'hover:border-slate-300 hover:shadow-xs'
      )}
    >
      <Card.Header className="pb-2.5">
        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-slate-800 tracking-tight truncate">
              {referenceNo}
            </span>
            {/* Dev Render Counter to visually prove memoization */}
            {isSelected && <RenderCounter componentName="Card" />}
          </div>
          <span className="text-xs text-slate-500 truncate mt-0.5" title={vendorName}>
            {vendorName}
          </span>
        </div>
        <Badge variant={severity}>{severity}</Badge>
      </Card.Header>

      <Card.Body className="py-2.5 sm:py-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
            {category.replace(/_/g, ' ')}
          </span>
          <StarRating rating={rating} size="sm" />
        </div>

        <p className="text-xs sm:text-sm text-slate-700 line-clamp-2 leading-relaxed">
          "{comment}"
        </p>

        {images.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-railway-700 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{images.length} photo attached</span>
          </div>
        )}
      </Card.Body>

      <Card.Footer className="py-2 text-[11px] sm:text-xs text-slate-500">
        <span>Logged at {formattedDate}</span>
        <span className="capitalize font-medium text-slate-800 bg-slate-200/60 px-2 py-0.5 rounded">
          {status.replace(/_/g, ' ')}
        </span>
      </Card.Footer>
    </Card>
  );
});

export default ComplaintCard;
