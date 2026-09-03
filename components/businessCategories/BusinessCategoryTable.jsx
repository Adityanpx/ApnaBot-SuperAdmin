// components/businessCategories/BusinessCategoryTable.jsx
'use client';

import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

const TH = ({ children, className }) => (
  <th className={cn(
    'px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider',
    className
  )}>
    {children}
  </th>
);

const TD = ({ children, className }) => (
  <td className={cn('px-4 py-4 text-sm', className)}>
    {children}
  </td>
);

export default function BusinessCategoryTable({ categories, loading, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Head */}
          <thead className="border-b border-border bg-bg-subtle/50">
            <tr>
              <TH>Category</TH>
              <TH className="hidden md:table-cell">Value</TH>
              <TH>Status</TH>
              <TH className="text-right">Offered at signup</TH>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {/* Loading skeleton rows */}
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={4} />
            ))}

            {/* Empty state */}
            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    icon="🏷️"
                    title="No business categories"
                    description="Business categories offered at signup will appear here."
                  />
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && categories.map((category, i) => (
              <motion.tr
                key={category.value}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                className="table-row"
              >
                {/* Category */}
                <TD>
                  <span className="flex items-center gap-2 font-semibold text-text-primary">
                    {category.emoji ? (
                      <span>{category.emoji}</span>
                    ) : (
                      <Tag className="w-3.5 h-3.5 text-text-tertiary" />
                    )}
                    {category.label}
                  </span>
                </TD>

                {/* Value */}
                <TD className="hidden md:table-cell">
                  <span className="font-mono text-xs text-text-tertiary">{category.value}</span>
                </TD>

                {/* Status */}
                <TD>
                  {category.isEnabled ? (
                    <Badge variant="success">Enabled</Badge>
                  ) : (
                    <Badge variant="neutral">Disabled</Badge>
                  )}
                </TD>

                {/* Toggle */}
                <TD className="text-right">
                  <button
                    role="switch"
                    aria-checked={category.isEnabled}
                    onClick={() => onToggle(category.value, !category.isEnabled)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-200',
                      category.isEnabled
                        ? 'bg-brand-500 border-brand-500'
                        : 'bg-bg-overlay border-border'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                        category.isEnabled ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </TD>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
