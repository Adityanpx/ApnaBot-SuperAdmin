// components/businesses/OwnerMediaSwitch.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const POLL_MS = 2500;
const BACKFILL_DAYS = 7;

/**
 * OwnerMediaSwitch — the "Save owner's phone-app media" switch
 * (feature 'owner_phone_media') inside Businesses → <business> → Features.
 * Turning it ON offers to also fetch the last 7 days of the owner's media
 * (backfill preview → backfill → live status). Turning it OFF deletes nothing.
 *
 * Props:
 *   businessId  string
 *   feature     object — { feature, isEnabled, override, categoryEnabled }
 *   saving      bool
 *   onChange    async fn(override: true|false|null) → boolean (saved?)
 */
export default function OwnerMediaSwitch({ businessId, feature, saving, onChange }) {
  const on = feature.isEnabled;

  const [offer, setOffer] = useState(null);       // { count } — the "also fetch?" prompt
  const [checking, setChecking] = useState(false);
  const [starting, setStarting] = useState(false);
  const [job, setJob] = useState(null);
  const timer = useRef(null);

  const stopPolling = () => { clearTimeout(timer.current); timer.current = null; };
  useEffect(() => stopPolling, []);

  const poll = useCallback(async () => {
    try {
      const res = await api.get(API.OWNER_MEDIA_BACKFILL_STATUS(businessId));
      const next = res.data.data.job;
      setJob(next);
      if (next && next.status === 'running') timer.current = setTimeout(poll, POLL_MS);
    } catch {
      timer.current = setTimeout(poll, POLL_MS * 2);
    }
  }, [businessId]);

  // Pick up a backfill that is already running (e.g. page reopened).
  useEffect(() => {
    if (on) poll();
    return stopPolling;
  }, [on, poll]);

  const loadOffer = async () => {
    setChecking(true);
    try {
      const res = await api.post(API.OWNER_MEDIA_BACKFILL_PREVIEW(businessId), { days: BACKFILL_DAYS });
      setOffer({ count: res.data.data.count });
    } catch (err) {
      toast.error(err.userMessage || 'Could not check the last 7 days');
    } finally {
      setChecking(false);
    }
  };

  const toggle = async () => {
    const ok = await onChange(!on);
    if (ok && !on) loadOffer();
    if (ok && on) { setOffer(null); }
  };

  const startBackfill = async () => {
    setStarting(true);
    try {
      const res = await api.post(API.OWNER_MEDIA_BACKFILL(businessId), { days: BACKFILL_DAYS });
      setJob(res.data.data);
      setOffer(null);
      stopPolling();
      timer.current = setTimeout(poll, POLL_MS);
    } catch (err) {
      toast.error(err.userMessage || 'Could not start fetching');
    } finally {
      setStarting(false);
    }
  };

  const running = job && job.status === 'running';

  return (
    <div className="border-t border-border-subtle pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">{feature.label}</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            Copies photos, videos and PDFs the owner sends from the WhatsApp Business app into ApnaBot.
            Customer media is always saved.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={feature.label}
          disabled={saving}
          onClick={toggle}
          className={cn(
            'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            on ? 'bg-brand-500' : 'bg-bg-overlay border border-border',
            saving && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
            on ? 'translate-x-6' : 'translate-x-1'
          )} />
        </button>
      </div>

      {feature.override !== null && (
        <p className="text-xs text-text-tertiary mt-2">
          Set for this business only (category default is {feature.categoryEnabled ? 'On' : 'Off'}).{' '}
          <button
            type="button"
            disabled={saving}
            onClick={() => onChange(null)}
            className="text-info-text hover:underline"
          >
            Follow the category instead
          </button>
        </p>
      )}

      {checking && <p className="text-xs text-text-tertiary mt-3">Checking the last 7 days…</p>}

      {offer && !running && (
        <div className="mt-3 rounded-xl border border-border bg-bg-subtle p-3">
          {offer.count > 0 ? (
            <>
              <p className="text-sm text-text-primary">
                Also fetch the owner&apos;s media from the last 7 days?{' '}
                <span className="font-semibold">({offer.count} {offer.count === 1 ? 'file' : 'files'})</span>
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                WhatsApp only keeps these for about 30 days, so older ones can&apos;t be fetched.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button size="sm" loading={starting} onClick={startBackfill}>Yes, fetch them</Button>
                <Button size="sm" variant="ghost" onClick={() => setOffer(null)}>No thanks</Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-text-secondary">
                No earlier owner media from the last 7 days to fetch. New media will be saved from now on.
              </p>
              <Button size="sm" variant="ghost" onClick={() => setOffer(null)}>OK</Button>
            </div>
          )}
        </div>
      )}

      {job && <BackfillStatus job={job} />}

      {on && !offer && !running && (
        <button
          type="button"
          disabled={checking}
          onClick={loadOffer}
          className="text-xs text-info-text hover:underline mt-3"
        >
          Fetch the last 7 days of the owner&apos;s media
        </button>
      )}
    </div>
  );
}

function BackfillStatus({ job }) {
  const pct = job.total > 0 ? Math.round((job.processed / job.total) * 100) : 100;
  const variant = job.status === 'running' ? 'info' : job.status === 'done' ? 'success' : 'danger';
  const label = job.status === 'running' ? 'Fetching…' : job.status === 'done' ? 'Finished' : 'Failed';
  return (
    <div className="mt-3 rounded-xl border border-border-subtle p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-text-primary">Last 7 days fetch</p>
        <Badge variant={variant}>{label}</Badge>
      </div>
      <div className="h-1.5 rounded-full bg-bg-subtle mt-2 overflow-hidden">
        <div className="h-full bg-brand-500 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-text-secondary mt-2">
        {job.processed} of {job.total} checked · {job.stored} saved
        {job.skipped > 0 && ` · ${job.skipped} skipped (type or size not allowed)`}
        {job.expired > 0 && ` · ${job.expired} expired on WhatsApp`}
        {job.failed > 0 && ` · ${job.failed} failed`}
      </p>
      {job.error && <p className="text-xs text-danger-text mt-1">{job.error}</p>}
    </div>
  );
}
