// components/businesses/BusinessTable.jsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { ownerPhoneOf } from '@/lib/ownerContact';
import { categoryDetail, planText, subscriptionText } from '@/lib/businessList';
import { useCategoryOptions } from '@/hooks/useCategoryOptions';
import OwnerPhone from '@/components/businesses/OwnerPhone';
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
  getSubStatusVariant,
  cn,
} from '@/lib/utils';

const TH = ({ children, className }) => (
  <th className={cn(
    'px-2.5 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider whitespace-nowrap',
    className
  )}>
    {children}
  </th>
);

const TD = ({ children, className }) => (
  <td className={cn('px-2.5 py-3 text-sm', className)}>
    {children}
  </td>
);

// Sticky last column: opaque (also on row hover) so scrolled cells never show through
const STICKY_EDGE = 'sticky right-0 z-10 border-l border-border shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.25)]';

const WhatsappBadge = ({ connected }) => (
  <Badge variant={connected ? 'success' : 'neutral'}>{connected ? 'Connected' : 'Not connected'}</Badge>
);

/** Subscription status badge, or "-" when the business has no active / trial subscription. */
const SubscriptionBadge = ({ business }) => (
  business.subscriptionStatus
    ? <Badge variant={getSubStatusVariant(business.subscriptionStatus)}>{subscriptionText(business)}</Badge>
    : <span className="text-text-tertiary text-xs">-</span>
);

/** The category, with the typed-in category (general) or the sub-categories (multi_brand) under it. */
function CategoryCell({ business, labelOf }) {
  const detail = categoryDetail(business, labelOf);
  return (
    <>
      {capitalize(business.businessCategory)}
      {detail && <span className="block text-xs text-text-tertiary break-words">{detail}</span>}
    </>
  );
}

/** Phone layout: one card per business; Activate / View / Delete live in the ⋯ sheet. */
function BusinessCards({ businesses, loading, onToggle, onDelete }) {
  const router = useRouter();
  const { labelOf } = useCategoryOptions();
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
            <CategoryCell business={business} labelOf={labelOf} />
          </CardField>
          <CardField label="Owner">
            {business.ownerUserId ? (
              <>
                {business.ownerUserId.name}
                <span className="block text-xs text-text-tertiary break-all">{business.ownerUserId.email}</span>
              </>
            ) : '—'}
          </CardField>
          <CardField label="Owner phone">
            <OwnerPhone phone={ownerPhoneOf(business)} className="justify-end" />
          </CardField>
          <CardField label="WhatsApp"><WhatsappBadge connected={!!business.isWhatsappConnected} /></CardField>
          <CardField label="Plan">{planText(business)}</CardField>
          <CardField label="Subscription"><SubscriptionBadge business={business} /></CardField>
          <CardField label="Joined">{formatDate(business.createdAt)}</CardField>
          <CardField label="ID"><CopyId value={business._id} label="business ID" className="justify-end" /></CardField>
        </MobileCard>
      ))}
    </MobileCardList>
  );
}

export default function BusinessTable({ businesses, loading, onToggle, onDelete }) {
  const isMobile = useIsMobile();
  const { labelOf } = useCategoryOptions();
  if (isMobile) {
    return <BusinessCards businesses={businesses} loading={loading} onToggle={onToggle} onDelete={onDelete} />;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] table-fixed">
          <colgroup>
            <col />
            <col />
            <col className="w-[140px]" />
            <col className="w-[100px]" />
            <col className="w-[110px]" />
            <col className="w-[110px]" />
            <col className="w-[90px]" />
            <col className="w-[90px]" />
            <col className="w-[116px]" />
          </colgroup>

          {/* Head */}
          <thead className="border-b border-border bg-bg-overlay">
            <tr>
              <TH>Business</TH>
              <TH>Owner</TH>
              <TH>Owner phone</TH>
              <TH>Category</TH>
              <TH>WhatsApp</TH>
              <TH>Plan</TH>
              <TH>Created</TH>
              <TH>Status</TH>
              <TH className={cn('text-right bg-bg-overlay', STICKY_EDGE)}>Actions</TH>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {/* Loading skeleton rows */}
            {loading && Array.from({ length: 8 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={9} />
            ))}

            {/* Empty state */}
            {!loading && businesses.length === 0 && (
              <tr>
                <td colSpan={9}>
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
                className="table-row group"
              >
                {/* Business name + city */}
                <TD>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="
                      w-8 h-8 rounded-xl flex items-center justify-center
                      bg-bg-subtle text-base flex-shrink-0
                    ">
                      {getBusinessEmoji(business.businessCategory)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text-primary truncate" title={business.name}>
                        {business.name}
                      </p>
                      {business.city && (
                        <p className="text-xs text-text-tertiary mt-0.5 truncate" title={business.city}>
                          📍 {business.city}
                        </p>
                      )}
                    </div>
                  </div>
                </TD>

                {/* Owner */}
                <TD>
                  {business.ownerUserId ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="
                        w-7 h-7 rounded-full flex items-center justify-center
                        bg-gradient-brand text-white text-xs font-bold flex-shrink-0
                      ">
                        {getInitials(business.ownerUserId.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-text-primary text-xs font-medium truncate" title={business.ownerUserId.name}>
                          {business.ownerUserId.name}
                        </p>
                        <p className="text-text-tertiary text-[11px] truncate" title={business.ownerUserId.email}>
                          {business.ownerUserId.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-text-tertiary text-xs">—</span>
                  )}
                </TD>

                {/* Owner phone */}
                <TD className="whitespace-nowrap">
                  <OwnerPhone phone={ownerPhoneOf(business)} />
                </TD>

                {/* Business type */}
                <TD>
                  <div className="text-text-secondary text-xs min-w-0">
                    <CategoryCell business={business} labelOf={labelOf} />
                  </div>
                </TD>

                {/* WhatsApp connection */}
                <TD>
                  <WhatsappBadge connected={!!business.isWhatsappConnected} />
                </TD>

                {/* Plan + its subscription status */}
                <TD>
                  <div className="flex flex-col items-start gap-1 min-w-0 max-w-full">
                    <span className="text-text-secondary text-xs truncate max-w-full" title={planText(business)}>
                      {planText(business)}
                    </span>
                    {business.subscriptionStatus && <SubscriptionBadge business={business} />}
                  </div>
                </TD>

                {/* Date created */}
                <TD>
                  <span className="text-text-tertiary text-xs whitespace-nowrap">
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

                {/* Actions (sticky, always visible) */}
                <TD className={cn(
                  'text-right bg-bg-raised group-hover:bg-bg-subtle transition-colors duration-150',
                  STICKY_EDGE
                )}>
                  <div className="flex items-center justify-end gap-1">

                    {/* Toggle active/inactive */}
                    <button
                      type="button"
                      onClick={() => onToggle(business)}
                      title={business.isActive ? 'Deactivate business' : 'Activate business'}
                      aria-label={business.isActive ? `Deactivate ${business.name}` : `Activate ${business.name}`}
                      className="icon-btn text-text-tertiary hover:text-text-primary hover:bg-bg-overlay transition-colors duration-150"
                    >
                      {business.isActive
                        ? <ToggleRight className="w-4 h-4 text-success" />
                        : <ToggleLeft  className="w-4 h-4" />
                      }
                    </button>

                    {/* View detail */}
                    <Link
                      href={`/businesses/${business._id}`}
                      title="View business details"
                      aria-label={`View details of ${business.name}`}
                      className="icon-btn text-text-tertiary hover:text-text-primary hover:bg-bg-overlay transition-colors duration-150"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete(business)}
                      title="Delete business"
                      aria-label={`Delete ${business.name}`}
                      className="icon-btn text-text-tertiary hover:text-danger-text hover:bg-danger-bg transition-colors duration-150"
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
