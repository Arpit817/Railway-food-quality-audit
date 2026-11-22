import React from 'react';
import { cn } from '../../utils/cn.js';

export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-150',
        onClick && 'cursor-pointer hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-railway-500',
        className
      )}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between', className)}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={cn('p-4 sm:p-5', className)}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={cn('px-4 sm:px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between', className)}>
      {children}
    </div>
  );
};

export default Card;
