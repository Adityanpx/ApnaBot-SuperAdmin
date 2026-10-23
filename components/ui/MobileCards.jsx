// components/ui/MobileCards.jsx
'use client';

import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

/**
 * MobileCardList — the phone (< 768px) replacement for a table: one card per row.
 * Tables render this instead of <table> when useIsMobile() is true.
 *
 * Props:
 *   loading      bool — shows `skeletons` placeholder cards
 *   isEmpty      bool — shows `empty` (an <EmptyState/>) in a card
 *   empty        node
 *   children     the cards (use <MobileCard/>)
 */
export function MobileCardList({ loading, skeletons = 4, isEmpty, empty, children }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletons }).map((_, i) => (
          <div key={i} className="card p-4 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }
  if (isEmpty) return <div className="card">{empty}</div>;
  return <ul className="space-y-3">{children}</ul>;
}

/** One row as a card: `header` (name + ⋯ menu) over a wrapped body of key fields. */
export function MobileCard({ header, children, className }) {
  return (
    <li className={cn('card p-4 space-y-3 min-w-0', className)}>
      {header}
      {children && <div className="space-y-2 text-sm">{children}</div>}
    </li>
  );
}

/** Label / value line inside a MobileCard. */
export function CardField({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 min-w-0">
      <span className="text-xs text-text-tertiary flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-text-primary text-right min-w-0 break-words">{children}</span>
    </div>
  );
}
