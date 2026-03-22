// components/shops/ShopFilters.jsx
'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BUSINESS_TYPES } from '@/lib/constants';

// Debounce hook — prevents API call on every keystroke
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const STATUS_OPTIONS = [
  { value: '',      label: 'All Status' },
  { value: 'true',  label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  ...BUSINESS_TYPES,
];

export default function ShopFilters({
  search,
  isActive,
  businessType,
  onSearchChange,
  onActiveChange,
  onTypeChange,
  totalShops,
}) {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 400);

  // Sync debounced value up to parent
  useEffect(() => {
    if (debouncedSearch !== search) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch]);

  const selectClass = `
    h-10 pl-3 pr-8 rounded-xl text-sm font-medium cursor-pointer
    bg-bg-raised border border-border text-text-primary
    hover:border-border-strong focus:border-brand-500
    focus:outline-none appearance-none
    transition-colors duration-150
  `;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

      {/* Search input */}
      <div className="relative flex-1 min-w-0 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search shops or city…"
          className="input-field pl-10 pr-10 h-10"
        />
        {localSearch && (
          <button
            onClick={() => { setLocalSearch(''); onSearchChange(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">

        {/* Status filter */}
        <div className="relative">
          <select
            value={isActive}
            onChange={(e) => onActiveChange(e.target.value)}
            className={selectClass}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-bg-overlay">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Business type filter */}
        <div className="relative">
          <select
            value={businessType}
            onChange={(e) => onTypeChange(e.target.value)}
            className={selectClass}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-bg-overlay">
                {opt.emoji ? `${opt.emoji} ` : ''}{opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Total count */}
        {totalShops !== undefined && (
          <span className="text-sm text-text-tertiary whitespace-nowrap hidden md:block">
            {totalShops} shop{totalShops !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
