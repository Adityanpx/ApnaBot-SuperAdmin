// components/businesses/BusinessTable.jsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
  getInitials,
  capitalize,
  formatDate,
  getBusinessEmoji,
  formatRelative,
  cn,
} from '@/lib/utils';

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

export default function BusinessTable({ businesses, loading, onToggle, onDelete }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Head */}
          <thead className="border-b border-border bg-bg-subtle/50">
            <tr>
              <TH>Business</TH>
              <TH>Owner</TH>
              <TH className="hidden md:table-cell">Type</TH>
              <TH className="hidden lg:table-cell">Joined</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {/* Loading skeleton rows */}
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={6} />
            ))}

            {/* Empty state */}
            {!loading && businesses.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon="🏪"
                    title="No businesses found"
                    description="Try adjusting your search or filter criteria."
                  />
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && businesses.map((business, i) => (
              <motion.tr
                key={business._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                className="table-row"
              >
                {/* Business name + city */}
                <TD>
                  <div className="flex items-center gap-3">
                    <div className="
                      w-9 h-9 rounded-xl flex items-center justify-center
                      bg-bg-subtle text-base flex-shrink-0
                    ">
                      {getBusinessEmoji(business.businessCategory)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary truncate max-w-[180px]">
                        {business.name}
                      </p>
                      {business.city && (
                        <p className="text-xs text-text-tertiary mt-0.5">
                          📍 {business.city}
                        </p>
                      )}
                    </div>
                  </div>
                </TD>

                {/* Owner */}
                <TD>
                  {business.ownerUserId ? (
                    <div className="flex items-center gap-2">
                      <div className="
                        w-7 h-7 rounded-full flex items-center justify-center
                        bg-gradient-brand text-white text-xs font-bold flex-shrink-0
                      ">
                        {getInitials(business.ownerUserId.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-text-primary text-xs font-medium truncate max-w-[130px]">
                          {business.ownerUserId.name}
                        </p>
                        <p className="text-text-tertiary text-[11px] truncate max-w-[130px]">
                          {business.ownerUserId.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-text-tertiary text-xs">—</span>
                  )}
                </TD>

                {/* Business type */}
                <TD className="hidden md:table-cell">
                  <span className="text-text-secondary text-xs">
                    {getBusinessEmoji(business.businessCategory)}{' '}
                    {capitalize(business.businessCategory)}
                  </span>
                </TD>

                {/* Date joined */}
                <TD className="hidden lg:table-cell">
                  <span className="text-text-tertiary text-xs">
                    {formatDate(business.createdAt)}
                  </span>
                </TD>

                {/* Status badge */}
                <TD>
                  <Badge
                    variant={business.isActive ? 'success' : 'neutral'}
                    dot
                  >
                    {business.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TD>

                {/* Actions */}
                <TD className="text-right">
                  <div className="flex items-center justify-end gap-1">

                    {/* Toggle active/inactive */}
                    <button
                      onClick={() => onToggle(business._id)}
                      title={business.isActive ? 'Deactivate business' : 'Activate business'}
                      className="
                        w-8 h-8 flex items-center justify-center rounded-lg
                        text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
                        transition-colors duration-150
                      "
                    >
                      {business.isActive
                        ? <ToggleRight className="w-4 h-4 text-success" />
                        : <ToggleLeft  className="w-4 h-4" />
                      }
                    </button>

                    {/* View detail */}
                    <Link href={`/businesses/${business._id}`}>
                      <button
                        title="View business details"
                        className="
                          w-8 h-8 flex items-center justify-center rounded-lg
                          text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
                          transition-colors duration-150
                        "
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(business)}
                      title="Delete business"
                      className="
                        w-8 h-8 flex items-center justify-center rounded-lg
                        text-text-tertiary hover:text-danger-text hover:bg-danger-bg
                        transition-colors duration-150
                      "
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TD>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
