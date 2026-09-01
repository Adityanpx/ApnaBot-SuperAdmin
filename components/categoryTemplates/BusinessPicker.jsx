// components/categoryTemplates/BusinessPicker.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { getBusinessEmoji, capitalize } from '@/lib/utils';

// Debounce hook — same pattern as components/businesses/BusinessFilters.jsx,
// prevents an API call on every keystroke
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * BusinessPicker — search-as-you-type business lookup. Reuses the debounced
 * search pattern from components/businesses/BusinessFilters.jsx (GET
 * /api/admin/businesses?search=) but resolves to a single selected business
 * instead of filtering a table.
 *
 * Props:
 *   value     object|null — selected business ({_id, name, businessCategory, city}) or null
 *   onChange  fn(business|null)
 */
export default function BusinessPicker({ value, onChange }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen]   = useState(false);
  const containerRef = useRef(null);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.get(API.BUSINESSES, { params: { search: debouncedQuery, limit: 8 } })
      .then((res) => {
        if (!cancelled) setResults(res.data.data.businesses);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectBusiness = (business) => {
    onChange(business);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const clearSelection = () => {
    onChange(null);
    setQuery('');
  };

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 px-3 h-10 rounded-xl border border-border bg-bg-subtle">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{getBusinessEmoji(value.businessCategory)}</span>
          <span className="text-sm font-medium text-text-primary truncate">{value.name}</span>
          {value.city && (
            <span className="text-xs text-text-tertiary truncate">— {value.city}</span>
          )}
        </div>
        <button
          type="button"
          onClick={clearSelection}
          className="text-text-tertiary hover:text-text-primary flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search businesses by name…"
        className="input-field pl-10"
      />
      {isOpen && query.trim() && (
        <div className="absolute z-20 mt-1 w-full bg-bg-raised border border-border rounded-lg shadow-card max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-xs text-text-tertiary">Searching…</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-text-tertiary">
              No businesses match &quot;{query}&quot;
            </div>
          ) : (
            results.map((business) => (
              <button
                key={business._id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); selectBusiness(business); }}
                className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-bg-subtle transition-colors duration-150"
              >
                <span className="text-base flex-shrink-0">{getBusinessEmoji(business.businessCategory)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-text-primary font-medium truncate">{business.name}</span>
                  <span className="block text-text-tertiary text-xs truncate">
                    {capitalize(business.businessCategory)}{business.city ? ` · ${business.city}` : ''}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
