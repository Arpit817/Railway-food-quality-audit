import React from 'react';
import Card from './ui/Card.jsx';
import Badge from './ui/Badge.jsx';
import StarRating from './ui/StarRating.jsx';

/**
 * Domain-specific ComplaintCard component
 * Demonstrates:
 * - Component composition with Card, Badge, and StarRating
 * - Conditional styling based on selection state and severity
 * - Event callback props (onSelect)
 */
export function ComplaintCard({
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
      className={`transition-all duration-150 ${isSelected ? 'ring-2 ring-blue-500 border-transparent shadow-md' : 'hover:shadow-md'}`}
    >
      <Card.Header className="pb-3">
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-slate-800 tracking-tight">
            {referenceNo}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">{vendorName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant={severity}>{severity}</Badge>
        </div>
      </Card.Header>

      <Card.Body className="py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
            {category.replace(/_/g, ' ')}
          </span>
          <StarRating rating={rating} size="sm" />
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          "{comment}"
        </p>

        {images.length > 0 && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{images.length} photo attached</span>
          </div>
        )}
      </Card.Body>

      <Card.Footer className="py-2.5 text-xs text-slate-500">
        <span>Logged: {formattedDate}</span>
        <span className="capitalize font-medium text-slate-700">{status.replace(/_/g, ' ')}</span>
      </Card.Footer>
    </Card>
  );
}

export default ComplaintCard;
