// components/businesses/BusinessFilters.jsx
'use client';

import { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategoryOptions } from '@/hooks/useCategoryOptions';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useIsMobile } from '@/hooks/useMediaQuery';

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

export default function BusinessFilters({
  search,
  isActive,
  businessType,
  onSearchChange,
  onActiveChange,
  onTypeChange,
  totalBusinesses,
}) {
  const { categories } = useCategoryOptions();
  const TYPE_OPTIONS = [{ value: '', label: 'All Types' }, ...categories];
  const [localSearch, setLocalSearch] = useState(search);
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  // Draft values inside the Filters sheet — applied only on "Apply"
  const [draftActive, setDraftActive] = useState(isActive);
  const [draftType, setDraftType] = useState(businessType);
  const activeFilterCount = (isActive !== '' ? 1 : 0) + (businessType !== '' ? 1 : 0);

  const openSheet = () => {
    setDraftActive(isActive);
    setDraftType(businessType);
    setSheetOpen(true);
  };
  const applySheet = () => {
    if (draftActive !== isActive) onActiveChange(draftActive);
    if (draftType !== businessType) onTypeChange(draftType);
    setSheetOpen(false);
  };
  const resetSheet = () => { setDraftActive(''); setDraftType(''); };
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

      {/* Search input */}
      <div className="relative flex-1 min-w-0 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search business, city or owner phone…"
          className="input-field pl-10 pr-10 h-10"
        />
        {localSearch && (
          <button
            onClick={() => { setLocalSearch(''); onSearchChange(''); }}
            aria-label="Clear search"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Phones: filters collapse into a bottom sheet */}
      {isMobile && (
        <>
          <button
            type="button"
            onClick={openSheet}
            className="h-11 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium bg-bg-raised border border-border text-text-primary"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {totalBusinesses !== undefined && (
              <span className="text-text-tertiary font-normal">· {totalBusinesses}</span>
            )}
          </button>

          <Modal
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title="Filters"
            variant="sheet"
            size="sm"
            footer={(
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={resetSheet}>Reset</Button>
                <Button className="flex-1" onClick={applySheet}>Apply</Button>
              </div>
            )}
          >
            <div className="space-y-4">
              <Select label="Status" placeholder={null} options={STATUS_OPTIONS} value={draftActive} onChange={(e) => setDraftActive(e.target.value)} />
              <Select
                label="Business type"
                placeholder={null}
                options={TYPE_OPTIONS}
                value={draftType}
                onChange={(e) => setDraftType(e.target.value)}
              />
            </div>
          </Modal>
        </>
      )}

      <div className={cn('items-center gap-2 flex-wrap', isMobile ? 'hidden' : 'flex')}>

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
        {totalBusinesses !== undefined && (
          <span className="text-sm text-text-tertiary whitespace-nowrap hidden md:block">
            {totalBusinesses} business{totalBusinesses !== 1 ? 'es' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
