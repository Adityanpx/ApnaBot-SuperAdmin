// components/rateCards/RateCardTable.jsx
'use client';

import { motion } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { formatPaise, formatDate, capitalize, findActiveRateCardIds, cn } from '@/lib/utils';

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

export default function RateCardTable({ rateCards, loading }) {
  const activeIds = findActiveRateCardIds(rateCards);

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Head */}
          <thead className="border-b border-border bg-bg-subtle/50">
            <tr>
              <TH>Country</TH>
              <TH>Category</TH>
              <TH>Price</TH>
              <TH>Effective From</TH>
              <TH>Status</TH>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {/* Loading skeleton rows */}
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={5} />
            ))}

            {/* Empty state */}
            {!loading && rateCards.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon="💰"
                    title="No rate cards yet"
                    description="Add one to start pricing messages by country and category."
                  />
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && rateCards.map((rc, i) => {
              const isActive = activeIds.has(rc._id);
              return (
                <motion.tr
                  key={rc._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.25 }}
                  className={cn('table-row', isActive && 'bg-brand-500/5')}
                >
                  <TD>
                    <span className="font-semibold text-text-primary">{rc.countryCode}</span>
                  </TD>
                  <TD>
                    <span className="text-text-secondary">{capitalize(rc.category.replace(/_/g, ' '))}</span>
                  </TD>
                  <TD>
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-primary">{formatPaise(rc.pricePaise)}</span>
                      <span className="text-xs text-text-tertiary">{rc.pricePaise} paise</span>
                    </div>
                  </TD>
                  <TD>
                    <span className="text-text-secondary text-xs">{formatDate(rc.effectiveFrom)}</span>
                  </TD>
                  <TD>
                    {isActive ? (
                      <Badge variant="success" dot>Active</Badge>
                    ) : (
                      <span className="text-text-tertiary text-xs">—</span>
                    )}
                  </TD>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
