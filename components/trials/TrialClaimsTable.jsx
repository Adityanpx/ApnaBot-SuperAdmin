// components/trials/TrialClaimsTable.jsx
'use client';

import { Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { claimRow, CLAIMS_PAGE_SIZE } from '@/lib/trials';
import { formatDate } from '@/lib/utils';

const HEADERS = ['Phone', 'Business', 'Claimed', 'Subscription', ''];

/** One claim row with its Reset button. */
function ClaimTr({ row, onReset }) {
  return (
    <tr className="table-row">
      <td className="px-4 py-4 text-sm font-medium text-text-primary">{row.phone}</td>
      <td className="px-4 py-4 text-sm">{row.businessName || '—'}</td>
      <td className="px-4 py-4 text-xs text-text-tertiary">{formatDate(row.claimedAt)}</td>
      <td className="px-4 py-4">
        <Badge variant={row.hasSubscription ? 'success' : 'neutral'}>
          {row.hasSubscription ? 'Linked' : 'None'}
        </Badge>
      </td>
      <td className="px-4 py-4 text-right">
        <Button size="sm" variant="secondary" onClick={() => onReset(row)}>Reset claim</Button>
      </td>
    </tr>
  );
}

/**
 * TrialClaimsTable — one page of claims; search and paging happen on the server.
 * Props:
 *   claims, total   from useTrials()
 *   loading         boolean
 *   search          string — current search box text
 *   onSearch        fn(text)
 *   page, onPage    1-based page and its setter
 *   onReset         fn(row) — row is a claimRow() display row
 */
export default function TrialClaimsTable({
  claims, total, loading, search, onSearch, page, onPage, onReset,
}) {
  const rows = claims.map(claimRow);
  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by phone or business…"
          className="input-field pl-10"
        />
      </div>
      <div className="card overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-bg-subtle/50">
            <tr>
              {HEADERS.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">
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
              <tr>
                <td colSpan={HEADERS.length}>
                  <EmptyState
                    icon="🎁"
                    title={search ? 'No claims match your search' : 'No trial claims yet'}
                  />
                </td>
              </tr>
            )}
            {!loading && rows.map((row) => <ClaimTr key={row.id} row={row} onReset={onReset} />)}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={Math.ceil(total / CLAIMS_PAGE_SIZE)}
        onPageChange={onPage}
        total={total}
        limit={CLAIMS_PAGE_SIZE}
      />
    </div>
  );
}
