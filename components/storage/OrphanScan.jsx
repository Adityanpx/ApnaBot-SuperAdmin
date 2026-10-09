// components/storage/OrphanScan.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { Unlink } from 'lucide-react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { formatBytes, formatNumber } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ALL_BUSINESSES_PHRASE, NOT_ON_PHONES_NOTE, countdown } from './storageShared';

const POLL_MS = 3000;

/**
 * OrphanScan — files in storage that nothing in ApnaBot points to any more.
 * The server's scan only counts files older than 48 hours, and when it finds
 * any it creates a normal cleanup that waits 24 hours (cancel in Cleanup history),
 * so "Delete all orphans" is the scan itself.
 */
export default function OrphanScan({ summary, runs, onChanged, onGoToHistory }) {
  const [job, setJob] = useState(null);
  const [typed, setTyped] = useState('');
  const [starting, setStarting] = useState(false);
  const timer = useRef(null);

  const stop = () => { clearTimeout(timer.current); timer.current = null; };

  const poll = useCallback(async () => {
    try {
      const res = await api.get(API.STORAGE_ORPHAN_SCAN);
      const next = res.data.data.job;
      setJob(next);
      if (next && next.status === 'running') {
        timer.current = setTimeout(poll, POLL_MS);
      } else if (next) {
        onChanged();
      }
    } catch {
      timer.current = setTimeout(poll, POLL_MS * 2);
    }
    // onChanged is a stable refetch bundle from the page; polling must not restart on its identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { poll(); return stop; }, [poll]);

  const start = async () => {
    setStarting(true);
    try {
      const res = await api.post(API.STORAGE_ORPHAN_SCAN, { confirmPhrase: typed.trim() });
      setJob(res.data.data);
      setTyped('');
      stop();
      timer.current = setTimeout(poll, POLL_MS);
    } catch (err) {
      toast.error(typeof err.userMessage === 'string' ? err.userMessage : 'Could not start the scan');
    } finally {
      setStarting(false);
    }
  };

  const running = job && job.status === 'running';
  const run = job && job.runId ? (runs.data || []).find((r) => r.id === job.runId) : null;
  const s = summary.data;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="card p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Unlink className="w-4 h-4 text-text-tertiary" />
          <h3 className="text-base font-bold text-text-primary tracking-tight">Unlinked (orphan) files</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Files that are still stored but that no chat, media library, bot, logo or other record uses any more — usually left behind
          after something was deleted. Only files older than 48 hours are picked up.
        </p>
        {s ? (
          <p className="text-sm text-text-primary">
            Right now: <span className="font-semibold">{formatNumber(s.orphanCount)} files</span> ({formatBytes(s.orphanBytes)}) look unlinked.
          </p>
        ) : (
          <p className="text-xs text-text-tertiary">{summary.loading ? 'Checking current usage…' : 'Usage figures are not available right now.'}</p>
        )}
      </div>

      <div className="card p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-text-primary tracking-tight">Scan and delete orphans</h3>

        <div className="rounded-xl border border-danger-DEFAULT/30 bg-danger-bg p-4 text-sm text-danger-text space-y-1.5">
          <p className="font-semibold">This scans every business and schedules all unlinked files for deletion.</p>
          <p>They are deleted after 24 hours and cannot be brought back. You can cancel in Cleanup history before then.</p>
          <p>{NOT_ON_PHONES_NOTE}</p>
        </div>

        <Input
          label={`Type ${ALL_BUSINESSES_PHRASE} to start`}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={ALL_BUSINESSES_PHRASE}
          autoComplete="off"
          disabled={running}
        />
        <Button
          variant="danger"
          loading={starting || running}
          disabled={typed.trim() !== ALL_BUSINESSES_PHRASE}
          onClick={start}
        >
          {running ? 'Scanning…' : 'Scan and schedule deletion'}
        </Button>
      </div>

      {job && !running && (
        <div className="card p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-text-primary tracking-tight">Last scan</h3>
            <Badge variant={job.status === 'done' ? 'success' : 'danger'}>{job.status === 'done' ? 'Finished' : 'Failed'}</Badge>
          </div>
          {job.status === 'failed' && <p className="text-sm text-danger-text">{job.error || 'The scan did not finish.'}</p>}
          {job.status === 'done' && job.found === 0 && (
            <p className="text-sm text-text-secondary">No unlinked files found. Nothing was scheduled.</p>
          )}
          {job.status === 'done' && job.found > 0 && (
            <>
              <p className="text-sm text-text-primary">
                Found <span className="font-semibold">{formatNumber(job.found)} files</span>
                {run ? ` (${formatBytes(run.total_bytes)})` : ''} and scheduled them for deletion
                {run && run.status === 'pending' ? ` — ${countdown(run.pending_delete_at)}` : ''}.
              </p>
              {run && run.status !== 'pending' && <p className="text-xs text-text-tertiary">This cleanup is now {run.status}.</p>}
              <Button size="sm" variant="outline" onClick={onGoToHistory}>View in Cleanup history</Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
