// components/businessRequests/BusinessRequestsTable.jsx
'use client';

import { MessageCircle, Pencil, Tag } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import RowMenu from '@/components/ui/RowMenu';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { MobileCardList, MobileCard, CardField } from '@/components/ui/MobileCards';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  requestRow, whatsappLink, STATUS_LABELS, STATUS_VARIANTS, REQUESTS_PAGE_SIZE,
} from '@/lib/businessRequests';
import { formatDate } from '@/lib/utils';

const HEADERS = ['Date', 'Business', 'Owner', 'Phone', 'Requested', 'Status', ''];

const openWhatsapp = (row) => {
  const link = whatsappLink(row.contactPhone, row.businessName);
  if (link) window.open(link, '_blank', 'noopener,noreferrer');
};

const menuActions = (row, { onEdit, onChangeCategory }) => [
  { label: 'Edit status / notes', icon: Pencil, onClick: () => onEdit(row) },
  { label: 'Change category', icon: Tag, onClick: () => onChangeCategory(row) },
];

function StatusBadge({ status }) {
  return <Badge variant={STATUS_VARIANTS[status] || 'neutral'}>{STATUS_LABELS[status] || status}</Badge>;
}

function WhatsappButton({ row }) {
  return (
    <Button
      size="sm"
      variant="secondary"
      icon={<MessageCircle className="w-4 h-4" />}
      disabled={!row.contactPhone}
      onClick={() => openWhatsapp(row)}
    >
      WhatsApp
    </Button>
  );
}

/** One request row on desktop. */
function RequestTr({ row, handlers }) {
  return (
    <tr className="table-row align-top">
      <td className="px-4 py-4 text-xs text-text-tertiary whitespace-nowrap">{formatDate(row.createdAt)}</td>
      <td className="px-4 py-4 text-sm font-medium text-text-primary">{row.businessName || '—'}</td>
      <td className="px-4 py-4 text-sm">
        <p>{row.ownerName || '—'}</p>
        {row.ownerEmail && <p className="text-xs text-text-tertiary break-all">{row.ownerEmail}</p>}
      </td>
      <td className="px-4 py-4 text-sm whitespace-nowrap">{row.phone || '—'}</td>
      <td className="px-4 py-4 text-sm max-w-xs">
        <p className="break-words">{row.requestedText}</p>
        {row.notes && <p className="text-xs text-text-tertiary mt-1 break-words">Note: {row.notes}</p>}
      </td>
      <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <WhatsappButton row={row} />
          <Button size="sm" variant="ghost" onClick={() => handlers.onEdit(row)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => handlers.onChangeCategory(row)}>Change category</Button>
        </div>
      </td>
    </tr>
  );
}

/** One request as a card on phones. */
function RequestCard({ row, handlers }) {
  return (
    <MobileCard
      header={(
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary break-words">{row.businessName || '—'}</p>
            <p className="text-sm text-text-secondary break-words">{row.requestedText}</p>
          </div>
          <StatusBadge status={row.status} />
          <RowMenu title={row.businessName || row.requestedText} actions={menuActions(row, handlers)} />
        </div>
      )}
    >
      <CardField label="Date">{formatDate(row.createdAt)}</CardField>
      <CardField label="Owner">{row.ownerName || '—'}</CardField>
      <CardField label="Phone">{row.phone || '—'}</CardField>
      {row.notes && <CardField label="Notes">{row.notes}</CardField>}
      <WhatsappButton row={row} />
    </MobileCard>
  );
}

/**
 * BusinessRequestsTable — one page of requests; the status filter and paging are server-side.
 * Props:
 *   requests, total     from useBusinessRequests()
 *   loading             boolean
 *   filtered            boolean — a status filter is active (for the empty message)
 *   page, onPage        1-based page and its setter
 *   onEdit              fn(row) — edit status / notes
 *   onChangeCategory    fn(row)
 */
export default function BusinessRequestsTable({
  requests, total, loading, filtered, page, onPage, onEdit, onChangeCategory,
}) {
  const rows = requests.map(requestRow);
  const isMobile = useIsMobile();
  const handlers = { onEdit, onChangeCategory };
  const empty = (
    <EmptyState icon="📥" title={filtered ? 'No requests with this status' : 'No business requests yet'} />
  );

  return (
    <div className="space-y-3">
      {isMobile ? (
        <MobileCardList loading={loading} isEmpty={rows.length === 0} empty={empty}>
          {rows.map((row) => <RequestCard key={row.id} row={row} handlers={handlers} />)}
        </MobileCardList>
      ) : (
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
                <tr><td colSpan={HEADERS.length}>{empty}</td></tr>
              )}
              {!loading && rows.map((row) => <RequestTr key={row.id} row={row} handlers={handlers} />)}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={page}
        totalPages={Math.ceil(total / REQUESTS_PAGE_SIZE)}
        onPageChange={onPage}
        total={total}
        limit={REQUESTS_PAGE_SIZE}
      />
    </div>
  );
}
