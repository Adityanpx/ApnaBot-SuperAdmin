// components/storage/StorageOverview.jsx
'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { HardDrive, Files, Hourglass, Unlink, Trash2, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { formatBytes, formatDate, formatNumber } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton, { SkeletonStatCard } from '@/components/ui/Skeleton';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { kindLabel, MIN_RETENTION_DAYS } from './storageShared';

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-secondary">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-bg-subtle flex items-center justify-center">
          <Icon className="w-4 h-4 text-text-tertiary" />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary tracking-tight mt-2">{value}</p>
      {hint && <p className="text-xs text-text-tertiary mt-1">{hint}</p>}
    </div>
  );
}

function retentionText(retention, platformDays) {
  if (retention === 'never') return 'Never';
  if (typeof retention === 'number') return `${retention} days`;
  return platformDays ? `Platform (${platformDays} days)` : 'Platform (off)';
}

/**
 * StorageOverview — totals, breakdown by kind, and the per-business table
 * (biggest first) with a Clean up shortcut and the per-business retention override.
 *
 * ApnaBot-server's summary has no "added this month" figure, no chat-media-only
 * size per business, and doesn't return a business's current retention setting,
 * so the override column shows "Platform" until changed during this visit.
 */
export default function StorageOverview({ summary, runs, platformDays, onCleanUp, onRefresh }) {
  const { data, loading, error } = summary;
  // businessId → 'never' | number | null — only what was set during this visit
  const [overrides, setOverrides] = useState({});
  const [editing, setEditing] = useState(null);
  const isMobile = useIsMobile();

  const lastCleanup = useMemo(() => {
    const map = {};
    let platformWide = null;
    for (const r of runs.data || []) {
      if (r.status !== 'done' || !r.finished_at) continue;
      const bid = r.filters && r.filters.business_id;
      if (bid === 'all') { if (!platformWide || r.finished_at > platformWide) platformWide = r.finished_at; }
      else if (bid && (!map[bid] || r.finished_at > map[bid])) map[bid] = r.finished_at;
    }
    return (id) => {
      const own = map[id] || null;
      return own && platformWide ? (own > platformWide ? own : platformWide) : (own || platformWide);
    };
  }, [runs.data]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="card p-6 space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-5 w-full" />)}
        </div>
      </div>
    );
  }
  if (error && !data) return <ErrorState title="Could not load storage usage" message={error} onRetry={onRefresh} />;
  if (!data) return null;

  const kinds = Object.entries(data.byKind || {}).sort((a, b) => b[1].bytes - a[1].bytes);
  const maxKind = kinds.length ? kinds[0][1].bytes || 1 : 1;

  return (
    <div className="space-y-6">
      {data.truncated && (
        <div className="flex items-start gap-2 rounded-xl border border-warning-DEFAULT/30 bg-warning-bg p-3 text-sm text-warning-text">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          There are so many files that only part of them were counted. Totals below may be lower than the real figures.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={HardDrive} label="Total used" value={formatBytes(data.bytes)} />
        <StatCard icon={Files} label="Files" value={formatNumber(data.count)} hint={`${formatNumber(data.inUse)} currently in use`} />
        <StatCard
          icon={Hourglass}
          label="Waiting to be deleted"
          value={formatNumber(data.pending.count)}
          hint={data.pending.count ? `${formatBytes(data.pending.bytes)} · deleted after the 24h wait` : 'Nothing scheduled'}
        />
        <StatCard
          icon={Unlink}
          label="Unlinked files"
          value={formatNumber(data.orphanCount)}
          hint={data.orphanCount ? `${formatBytes(data.orphanBytes)} not used by anything` : 'None found'}
        />
      </div>

      <div className="card p-5">
        <h3 className="text-base font-bold text-text-primary tracking-tight">What is using the space</h3>
        {kinds.length === 0 ? (
          <p className="text-sm text-text-tertiary mt-3">No files stored yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {kinds.map(([kind, v]) => (
              <div key={kind}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-text-primary truncate">{kindLabel(kind)}</span>
                  <span className="text-text-secondary flex-shrink-0">
                    {formatBytes(v.bytes)} · {formatNumber(v.count)} files
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-subtle mt-1.5 overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${Math.max(2, (v.bytes / maxKind) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 pb-3">
          <h3 className="text-base font-bold text-text-primary tracking-tight">By business</h3>
          <p className="text-xs text-text-secondary mt-0.5">Biggest first. Only chat media is deleted automatically.</p>
        </div>
        {data.byBusiness.length === 0 ? (
          <EmptyState icon={HardDrive} title="No files yet" description="Once businesses upload or receive media it will show up here." />
        ) : isMobile ? (
          <ul className="divide-y divide-border-subtle border-t border-border-subtle">
            {data.byBusiness.map((b) => {
              const id = b.businessId;
              return (
                <li key={id || 'none'} className="p-4 space-y-2 text-sm">
                  <p className="font-semibold text-text-primary break-words">{b.name || 'Unknown business'}</p>
                  <div className="flex justify-between gap-3">
                    <span className="text-xs text-text-tertiary">Size · files</span>
                    <span className="text-text-secondary">{formatBytes(b.bytes)} · {formatNumber(b.count)} files</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-xs text-text-tertiary">Last cleanup</span>
                    <span className="text-text-secondary">{id && lastCleanup(id) ? formatDate(lastCleanup(id)) : '—'}</span>
                  </div>
                  {id && (
                    <>
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-xs text-text-tertiary">Auto-delete chat media</span>
                        <button
                          type="button"
                          onClick={() => setEditing(b)}
                          className="text-info-text min-h-[44px] text-right"
                        >
                          {retentionText(overrides[id], platformDays)}
                        </button>
                      </div>
                      <Button size="sm" variant="outline" icon={Trash2} className="w-full" onClick={() => onCleanUp(b)}>
                        Clean up {b.name || 'this business'}
                      </Button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs text-text-tertiary border-y border-border-subtle">
                  <th className="px-5 py-2.5 font-medium">Business</th>
                  <th className="px-3 py-2.5 font-medium">Size</th>
                  <th className="px-3 py-2.5 font-medium">Files</th>
                  <th className="px-3 py-2.5 font-medium">Last cleanup</th>
                  <th className="px-3 py-2.5 font-medium">Auto-delete chat media</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {data.byBusiness.map((b) => {
                  const id = b.businessId;
                  return (
                    <tr key={id || 'none'} className="border-b border-border-subtle last:border-0">
                      <td className="px-5 py-3 text-text-primary font-medium">{b.name || 'Unknown business'}</td>
                      <td className="px-3 py-3 text-text-secondary whitespace-nowrap">{formatBytes(b.bytes)}</td>
                      <td className="px-3 py-3 text-text-secondary">{formatNumber(b.count)}</td>
                      <td className="px-3 py-3 text-text-secondary whitespace-nowrap">{id && lastCleanup(id) ? formatDate(lastCleanup(id)) : '—'}</td>
                      <td className="px-3 py-3">
                        {id ? (
                          <button
                            type="button"
                            onClick={() => setEditing(b)}
                            className="text-info-text hover:underline text-left"
                          >
                            {retentionText(overrides[id], platformDays)}
                          </button>
                        ) : <span className="text-text-tertiary">—</span>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {id && (
                          <Button size="sm" variant="outline" icon={Trash2} onClick={() => onCleanUp(b)}>
                            Clean up
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RetentionOverrideModal
        key={editing ? editing.businessId : 'closed'}
        business={editing}
        platformDays={platformDays}
        current={editing ? overrides[editing.businessId] : undefined}
        onClose={() => setEditing(null)}
        onSaved={(id, value) => { setOverrides((o) => ({ ...o, [id]: value })); setEditing(null); }}
      />
    </div>
  );
}

function RetentionOverrideModal({ business, platformDays, current, onClose, onSaved }) {
  const [mode, setMode] = useState(current === 'never' ? 'never' : typeof current === 'number' ? 'days' : 'platform');
  const [days, setDays] = useState(typeof current === 'number' ? String(current) : '30');
  const [saving, setSaving] = useState(false);

  const n = Number(days);
  const daysValid = Number.isInteger(n) && n >= MIN_RETENTION_DAYS;

  const save = async () => {
    const retention = mode === 'platform' ? null : mode === 'never' ? 'never' : n;
    setSaving(true);
    try {
      await api.put(API.STORAGE_BUSINESS_RETENTION(business.businessId), { retention });
      toast.success('Saved');
      onSaved(business.businessId, retention);
    } catch (err) {
      toast.error(typeof err.userMessage === 'string' ? err.userMessage : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const choice = (value, label, hint) => (
    <label className="flex items-start gap-2 text-sm text-text-primary cursor-pointer">
      <input type="radio" className="mt-1" name="retention-mode" checked={mode === value} onChange={() => setMode(value)} />
      <span>{label}{hint && <span className="block text-xs text-text-tertiary">{hint}</span>}</span>
    </label>
  );

  return (
    <Modal
      open={!!business}
      onClose={onClose}
      title="Auto-delete chat media"
      subtitle={business ? business.name : ''}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={saving} disabled={mode === 'days' && !daysValid} onClick={save}>Save</Button>
        </div>
      }
    >
      <div className="space-y-3">
        {choice('platform', 'Follow the platform rule', platformDays ? `Currently deletes after ${platformDays} days` : 'Currently off')}
        {choice('never', 'Never delete this business’s chat media')}
        {choice('days', 'Delete chat media older than a set number of days')}
        {mode === 'days' && (
          <Input
            type="number"
            min={MIN_RETENTION_DAYS}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            suffix="days"
            error={!daysValid ? `Enter ${MIN_RETENTION_DAYS} or more` : undefined}
          />
        )}
        <p className="text-xs text-text-tertiary">
          Only chat media (customer photos and the owner&apos;s phone-app media) is deleted automatically.
          Logos, QR codes and the media library are never touched.
        </p>
        <p className="text-xs text-text-tertiary">
          Each automatic run waits 24 hours and can be cancelled in Cleanup history.
        </p>
      </div>
    </Modal>
  );
}
