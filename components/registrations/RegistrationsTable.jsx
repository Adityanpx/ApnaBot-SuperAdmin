// components/registrations/RegistrationsTable.jsx
'use client';

import { Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Switch from '@/components/ui/Switch';
import OwnerPhone from '@/components/businesses/OwnerPhone';
import { MobileCardList, MobileCard, CardField } from '@/components/ui/MobileCards';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { registrationRow, daysLabel, REGISTRATIONS_PAGE_SIZE } from '@/lib/registrations';
import { formatDate } from '@/lib/utils';

const HEADERS = ['Name', 'Email', 'Phone', 'Verified', 'Registered', 'Days since', 'Last login'];

const VerifiedBadge = ({ verified }) => (
  <Badge variant={verified ? 'success' : 'warning'}>{verified ? 'Yes' : 'No'}</Badge>
);

/** Name, with an "Inactive" badge for a deactivated account. */
const NameCell = ({ row }) => (
  <span className="inline-flex items-center gap-2 flex-wrap">
    <span className="font-medium text-text-primary">{row.name || '-'}</span>
    {!row.isActive && <Badge variant="neutral">Inactive</Badge>}
  </span>
);

/** One registration as a table row. */
function RegistrationTr({ row }) {
  return (
    <tr className="table-row">
      <td className="px-4 py-4 text-sm"><NameCell row={row} /></td>
      <td className="px-4 py-4 text-sm text-text-secondary break-all">{row.email}</td>
      <td className="px-4 py-4"><OwnerPhone phone={row.phone} /></td>
      <td className="px-4 py-4"><VerifiedBadge verified={row.verified} /></td>
      <td className="px-4 py-4 text-xs text-text-tertiary whitespace-nowrap">{formatDate(row.registeredAt)}</td>
      <td className="px-4 py-4 text-sm text-text-secondary whitespace-nowrap">{daysLabel(row.daysSince)}</td>
      <td className="px-4 py-4 text-xs text-text-tertiary whitespace-nowrap">
        {row.lastLogin ? formatDate(row.lastLogin) : 'Never'}
      </td>
    </tr>
  );
}

/** One registration as a phone-width card. */
function RegistrationCard({ row }) {
  return (
    <MobileCard
      header={(
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <NameCell row={row} />
            <p className="text-sm text-text-secondary break-all">{row.email}</p>
          </div>
          <VerifiedBadge verified={row.verified} />
        </div>
      )}
    >
      <CardField label="Phone"><OwnerPhone phone={row.phone} /></CardField>
      <CardField label="Registered">{formatDate(row.registeredAt)} · {daysLabel(row.daysSince)}</CardField>
      <CardField label="Last login">{row.lastLogin ? formatDate(row.lastLogin) : 'Never'}</CardField>
    </MobileCard>
  );
}

/** A labelled on/off switch for one of the list filters. */
const FilterSwitch = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
    <Switch checked={checked} onChange={onChange} label={label} />
    {label}
  </label>
);

/**
 * RegistrationsTable — one page of owners with no business; search, switches and paging happen on the server.
 * Props:
 *   registrations, total   from useRegistrations()
 *   loading                boolean
 *   search / onSearch      search box text and its setter
 *   includeInactive / onIncludeInactive, unverifiedOnly / onUnverifiedOnly   the two switches
 *   page / onPage          1-based page and its setter
 *   actions                optional node shown at the end of the filter row (e.g. Export CSV)
 */
export default function RegistrationsTable({
  registrations, total, loading, search, onSearch, includeInactive, onIncludeInactive,
  unverifiedOnly, onUnverifiedOnly, page, onPage, actions,
}) {
  const rows = registrations.map(registrationRow);
  const isMobile = useIsMobile();
  const filtered = !!search || includeInactive || unverifiedOnly;
  const empty = (
    <EmptyState
      icon="🙌"
      title={filtered ? 'No registrations match your filters' : 'Everyone who registered has a business'}
    />
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <div className="relative sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search name, email or phone…"
            className="input-field pl-10 h-10"
          />
        </div>
        <FilterSwitch label="Unverified only" checked={unverifiedOnly} onChange={onUnverifiedOnly} />
        <FilterSwitch label="Show inactive" checked={includeInactive} onChange={onIncludeInactive} />
        {actions && <div className="sm:ml-auto">{actions}</div>}
      </div>
      {isMobile ? (
        <MobileCardList loading={loading} isEmpty={rows.length === 0} empty={empty}>
          {rows.map((row) => <RegistrationCard key={row.id} row={row} />)}
        </MobileCardList>
      ) : (
        <div className="card overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg-subtle/50">
              <tr>
                {HEADERS.map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTableRow key={i} cols={HEADERS.length} />
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={HEADERS.length}>{empty}</td></tr>
              )}
              {!loading && rows.map((row) => <RegistrationTr key={row.id} row={row} />)}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={page}
        totalPages={Math.ceil(total / REGISTRATIONS_PAGE_SIZE)}
        onPageChange={onPage}
        total={total}
        limit={REGISTRATIONS_PAGE_SIZE}
      />
    </div>
  );
}
