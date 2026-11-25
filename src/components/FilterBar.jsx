import React, { useState, useEffect } from 'react';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../utils/complaintUtils.js';
import { cn } from '../utils/cn.js';

/**
 * FilterBar Component with Debounced Search
 * Demonstrates:
 * - useEffect with setTimeout for debouncing search input (350ms delay)
 * - Essential cleanup function: clearTimeout to cancel pending search on keystroke
 * - Eliminates lag when typing rapidly
 */
export function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  totalCount,
  filteredCount,
  severityCounts = {}
}) {
  // Local immediate state for typing responsiveness
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // SYNC FROM PARENT: Keep local searchInput aligned if filters reset externally
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // EFFECT: Debounce search input changes by 350ms
  useEffect(() => {
    // Set a timer to propagate search text to parent filters after 350ms idle
    const handler = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange('search', searchInput);
      }
    }, 350);

    // CLEANUP: If user types another character before 350ms passes, cancel previous timer!
    return () => {
      clearTimeout(handler);
    };
  }, [searchInput, filters.search, onFilterChange]);

  const categoryLabels = {
    hygiene_issue: 'Hygiene',
    foreign_object: 'Foreign Object',
    stale_spoiled_food: 'Stale Food',
    wrong_quantity: 'Quantity',
    overcharging: 'Overcharge',
    damaged_packaging: 'Packaging',
    taste: 'Taste',
    other: 'Other'
  };

  const handleStatusChange = (e) => {
    onFilterChange('status', e.target.value);
  };

  const handleCategoryToggle = (category) => {
    const nextCategory = filters.category === category ? '' : category;
    onFilterChange('category', nextCategory);
  };

  const handleSeverityChange = (severity) => {
    onFilterChange('severity', severity);
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.category || filters.severity !== 'ALL'
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 space-y-3.5 shadow-2xs">
      {/* Top Row: Debounced Search Input + Status Dropdown + Reset */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Controlled Search Box with Debouncing */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            🔍
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by Reference No, PNR, QR Token, or grievance details..."
            aria-label="Search complaints"
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent transition-all placeholder:text-slate-400"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                onFilterChange('search', '');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="status-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Status:
          </label>
          <select
            id="status-select"
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-railway-500 font-medium cursor-pointer"
          >
            <option value="">All Statuses</option>
            {COMPLAINT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1.5 rounded hover:bg-red-50 transition-colors whitespace-nowrap self-end sm:self-auto cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Middle Row: Severity Buttons with Derived Counts */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600 mr-1">Severity:</span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
            const isActive = filters.severity === sev;
            const count = sev === 'ALL' ? totalCount : severityCounts[sev.toLowerCase()] || 0;

            const activeColors = {
              ALL: 'bg-slate-800 text-white',
              HIGH: 'bg-red-600 text-white',
              MEDIUM: 'bg-amber-600 text-white',
              LOW: 'bg-emerald-600 text-white'
            };

            return (
              <button
                key={sev}
                type="button"
                onClick={() => handleSeverityChange(sev)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-railway-500',
                  isActive
                    ? activeColors[sev]
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                <span>{sev}</span>
                <span className={cn(
                  'text-[10px] px-1 rounded-full font-mono',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-800">{filteredCount}</strong> of {totalCount} complaints
        </div>
      </div>

      {/* Bottom Row: Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
        <span className="text-xs font-bold text-slate-600 mr-1 flex-shrink-0">Category:</span>
        {COMPLAINT_CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryToggle(cat)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer border select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-railway-500',
                isSelected
                  ? 'bg-railway-700 text-white border-railway-700 shadow-2xs font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              )}
            >
              {categoryLabels[cat] || cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FilterBar;
