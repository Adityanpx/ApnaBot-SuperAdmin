// components/businesses/BusinessTable.jsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import CopyId from '@/components/ui/CopyId';
import RowMenu from '@/components/ui/RowMenu';
import { MobileCardList, MobileCard, CardField } from '@/components/ui/MobileCards';
import { useIsMobile } from '@/hooks/useMediaQuery';
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
    'px-3 xl:px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider',
    className
  )}>
    {children}
  </th>
);

const TD = ({ children, className }) => (
  <td className={cn('px-3 xl:px-4 py-4 text-sm', className)}>
    {children}
  </td>
);

/** Phone layout: one card per business; Activate / View / Delete live in the ⋯ sheet. */
function BusinessCards({ businesses, loading, onToggle, onDelete }) {
  const router = useRouter();
  return (
    <MobileCardList
      loading={loading}
      isEmpty={businesses.length === 0}
      empty={(
        <EmptyState
          icon="🏪"
          title="No businesses found"
          description="Try adjusting your search or filter criteria."
        />
      )}
    >
      {businesses.map((business) => (
        <MobileCard
          key={business._id}
          header={(
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-bg-subtle text-lg flex-shrink-0">
                {getBusinessEmoji(business.businessCategory)}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/businesses/${business._id}`}
                  className="block font-semibold text-text-primary break-words line-clamp-2 py-2 -my-1.5"
                >
                  {business.name}
                </Link>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <Badge variant={business.isActive ? 'success' : 'neutral'} dot>
                    {business.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {business.city && (
                    <span className="text-xs text-text-tertiary">📍 {business.city}</span>
                  )}
                </div>
              </div>
              <RowMenu
                title={business.name}
                actions={[
                  { label: 'View details', icon: ExternalLink, onClick: () => router.push(`/businesses/${business._id}`) },
                  {
                    label: business.isActive ? 'Deactivate business' : 'Activate business',
                    icon: business.isActive ? ToggleRight : ToggleLeft,
                    onClick: () => onToggle(business),
                  },
                  { label: 'Delete business', icon: Trash2, danger: true, onClick: () => onDelete(business) },
                ]}
              />
            </div>
          )}
        >
          <CardField label="Type">
            {capitalize(business.businessCategory)}
          </CardField>
          <CardField label="Owner">
            {business.ownerUserId ? (
              <>
                {business.ownerUserId.name}
                <span className="block text-xs text-text-tertiary break-all">{business.ownerUserId.email}</span>
              </>
            ) : '—'}
          </CardField>
          <CardField label="Joined">{formatDate(business.createdAt)}</CardField>
          <CardField label="ID"><CopyId value={business._id} label="business ID" className="justify-end" /></CardField>
        </MobileCard>
      ))}
    </MobileCardList>
  );
}

export default function BusinessTable({ businesses, loading, onToggle, onDelete }) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <BusinessCards businesses={businesses} loading={loading} onToggle={onToggle} onDelete={onDelete} />;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Head */}
          <thead className="border-b border-border bg-bg-subtle/50">
            <tr>
              <TH>Business</TH>
              <TH>Owner</TH>
              <TH className="hidden xl:table-cell">Type</TH>
              <TH className="hidden xl:table-cell">Joined</TH>
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
                <TD className="hidden xl:table-cell">
                  <span className="text-text-secondary text-xs">
                    {getBusinessEmoji(business.businessCategory)}{' '}
                    {capitalize(business.businessCategory)}
                  </span>
                </TD>

                {/* Date joined */}
                <TD className="hidden xl:table-cell">
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
                      onClick={() => onToggle(business)}
                      title={business.isActive ? 'Deactivate business' : 'Activate business'}
                      className="
                        icon-btn
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
                          icon-btn
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
                        icon-btn
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
