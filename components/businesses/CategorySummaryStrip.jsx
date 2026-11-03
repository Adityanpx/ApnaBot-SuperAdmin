// components/businesses/CategorySummaryStrip.jsx
'use client';

import { cn } from '@/lib/utils';

const chipClass = (selected) => cn(
  'inline-flex items-center gap-1.5 h-8 max-md:h-11 px-3 rounded-full text-xs font-medium whitespace-nowrap',
  'border transition-colors duration-150',
  selected
    ? 'bg-brand-500 text-white border-brand-500'
    : 'bg-bg-raised text-text-secondary border-border hover:text-text-primary hover:border-border-strong'
);

/**
 * CategorySummaryStrip — a scrollable row of "Category · count" chips; clicking one filters the list
 * to that category, clicking it again (or "All") clears the filter.
 * Props:
 *   total, categories   from useCategorySummary()
 *   selected            the active category value ('' for all)
 *   onSelect            fn(value) — '' clears
 */
export default function CategorySummaryStrip({ total, categories, selected, onSelect }) {
  if (categories.length === 0) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Businesses by category">
      <button type="button" aria-pressed={selected === ''} onClick={() => onSelect('')} className={chipClass(selected === '')}>
        All <span className="opacity-80">{total}</span>
      </button>
      {categories.map((c) => (
        <button
          key={c.value}
          type="button"
          aria-pressed={selected === c.value}
          onClick={() => onSelect(selected === c.value ? '' : c.value)}
          className={chipClass(selected === c.value)}
        >
          {c.label} <span className="opacity-80">{c.count}</span>
        </button>
      ))}
    </div>
  );
}
