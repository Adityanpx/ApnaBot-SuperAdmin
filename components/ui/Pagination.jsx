'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ page, totalPages, onPageChange, total, limit }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 3) return [1, 2, 3, 4, '…', totalPages];
    if (page >= totalPages - 2) {
      return [1, '…', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  };

  const pages      = getPageNumbers();
  const startItem  = (page - 1) * limit + 1;
  const endItem    = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
      <p className="text-sm text-text-tertiary order-2 sm:order-1">
        Showing{' '}
        <span className="font-medium text-text-secondary">{startItem}–{endItem}</span>
        {' '}of{' '}
        <span className="font-medium text-text-secondary">{total}</span>
        {' '}results
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-lg',
            'text-text-secondary border border-border',
            'hover:bg-bg-subtle hover:text-text-primary',
            'transition-colors duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-text-tertiary text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg',
                'text-sm font-medium transition-colors duration-150',
                p === page
                  ? 'bg-brand-500 text-white shadow-glow-brand'
                  : 'text-text-secondary border border-border hover:bg-bg-subtle hover:text-text-primary'
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-lg',
            'text-text-secondary border border-border',
            'hover:bg-bg-subtle hover:text-text-primary',
            'transition-colors duration-150',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
