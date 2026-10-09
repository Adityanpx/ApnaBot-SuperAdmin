// components/storage/CleanupHistory.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { History, Download, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { formatBytes, formatNumber, formatDate } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { describeFilters, runOrigin, countdown, NOT_ON_PHONES_NOTE } from './storageShared';

const errText = (err, fallback) => (typeof err.userMessage === 'string' ? err.userMessage : fallback);

const STATUS = {
  pending:   { variant: 'warning', label: 'Pending' },
  purging:   { variant: 'info',    label: 'Deleting now' },
  done:      { variant: 'success', label: 'Done' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
  failed:    { variant: 'danger',  label: 'Failed' },
};

/**
 * CleanupHistory — every cleanup run (manual and automatic): status, who, what
 * was filtered, files and space. Pending runs show a countdown and can be
 * cancelled until they are deleted. Each run's file list downloads as CSV.
 */
export default function CleanupHistory({ runs, businessNames, onRefresh }) {
  const user = useAuthStore((s) => s.user);
  const myId = user && (user._id || user.id);
  const [now, setNow] = useState(() => Date.now());
  const [cancelling, setCancelling] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [csvBusy, setCsvBusy] = useState(null);

  // Keep the countdown fresh, and pick up runs finishing on the server.
  const hasOpen = useMemo(() => (runs.data || []).some((r) => r.status === 'pending' || r.status === 'purging'), [runs.data]);
  useEffect(() => {
    if (!hasOpen) return undefined;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, [hasOpen]);

  const cancelRun = async () => {
    setCancelBusy(true);
    try {
      await api.post(API.STORAGE_RUN_CANCEL(cancelling.id));
      toast.success('Cleanup cancelled — no files will be deleted');
      setCancelling(null);
      onRefresh();
    } catch (err) {
      toast.error(errText(err, 'Could not cancel this cleanup'));
      setCancelling(null);
      onRefresh();
    } finally {
      setCancelBusy(false);
    }
  };

  const downloadCsv = async (run) => {
    setCsvBusy(run.id);
    try {
      const res = await api.get(API.STORAGE_RUN_CSV(run.id), { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `storage-cleanup-${run.id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(errText(err, 'Could not download the file list'));
    } finally {
      setCsvBusy(null);
    }
  };

  if (runs.loading && (!runs.data || runs.data.length === 0)) {
    return (
      <div className="card p-5 space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }
  if (runs.error && (!runs.data || runs.data.length === 0)) {
    return <ErrorState title="Could not load cleanup history" message={runs.error} onRetry={onRefresh} />;
  }
  if (!runs.data || runs.data.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={History} title="No cleanups yet" description="Cleanups you schedule, and automatic ones, will be listed here." />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-tertiary">{NOT_ON_PHONES_NOTE}</p>
      {runs.data.map((r) => {
        const st = STATUS[r.status] || { variant: 'neutral', label: r.status };
        const canCancel = r.status === 'pending' && new Date(r.pending_delete_at).getTime() > now;
        return (
          <div key={r.id} className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={st.variant}>{st.label}</Badge>
                  {r.status === 'pending' && (
                    <span className="text-xs text-warning-text">Deletes {countdown(r.pending_delete_at, now)}</span>
                  )}
                  <Badge variant={r.is_automatic ? 'brand' : 'neutral'}>{runOrigin(r, myId)}</Badge>
                </div>
                <p className="text-sm text-text-primary">{describeFilters(r.filters, businessNames)}</p>
                <p className="text-xs text-text-tertiary">
                  Scheduled {formatDate(r.created_at)}
                  {r.finished_at ? ` · ${r.status === 'cancelled' ? 'cancelled' : 'finished'} ${formatDate(r.finished_at)}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" icon={Download} loading={csvBusy === r.id} onClick={() => downloadCsv(r)}>
                  CSV
                </Button>
                {canCancel && (
                  <Button size="sm" variant="danger" icon={XCircle} onClick={() => setCancelling(r)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-border-subtle text-sm">
              <Fact label="Files" value={formatNumber(r.file_count)} />
              <Fact label="Space" value={formatBytes(r.total_bytes)} />
              <Fact label="Deleted" value={r.status === 'done' || r.purged_count ? `${formatNumber(r.purged_count)} · ${formatBytes(r.purged_bytes)}` : '—'} />
              <Fact label="Problems" value={r.failed_count ? formatNumber(r.failed_count) : '—'} warn={r.failed_count > 0} />
            </div>
          </div>
        );
      })}

      <Modal
        open={!!cancelling}
        onClose={() => setCancelling(null)}
        title="Cancel this cleanup?"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelling(null)}>Keep it scheduled</Button>
            <Button loading={cancelBusy} onClick={cancelRun}>Yes, cancel</Button>
          </div>
        }
      >
        {cancelling && (
          <p className="text-sm text-text-secondary">
            {formatNumber(cancelling.file_count)} files ({formatBytes(cancelling.total_bytes)}) will be kept. Nothing will be deleted.
          </p>
        )}
      </Modal>
    </div>
  );
}

function Fact({ label, value, warn }) {
  return (
    <div>
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className={warn ? 'text-danger-text font-medium' : 'text-text-primary font-medium'}>{value}</p>
    </div>
  );
}
