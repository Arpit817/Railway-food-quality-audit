import React from 'react';
import { Card, Badge, StarRating } from './ui/index.js';
import { cn } from '../utils/cn.js';

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
        'transition-all duration-150 relative select-none cursor-pointer',
        isSelected
          ? 'ring-2 ring-railway-600 border-transparent shadow-md bg-sky-50/30'
          : 'hover:border-slate-300 hover:shadow-xs'
      )}
    >
      <Card.Header className="pb-2">
        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800 tracking-tight truncate">
              {referenceNo}
            </span>
          </div>
          <span className="text-xs text-slate-500 truncate mt-0.5" title={vendorName}>
            {vendorName}
          </span>
        </div>
        <Badge variant={severity}>{severity.toUpperCase()}</Badge>
      </Card.Header>

      <Card.Body className="py-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
            {category.replace(/_/g, ' ')}
          </span>
          <StarRating rating={rating} size="sm" />
        </div>

        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
          {comment}
        </p>

        {images.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-railway-700 font-medium">
            <span>📷</span>
            <span>{images.length} photo evidence attached</span>
          </div>
        )}
      </Card.Body>

      <Card.Footer className="py-2 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Logged at {formattedDate}</span>
        <span className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {status.replace(/_/g, ' ')}
        </span>
      </Card.Footer>
    </Card>
  );
});

export default ComplaintCard;
