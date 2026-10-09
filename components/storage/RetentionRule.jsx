// components/storage/RetentionRule.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { MIN_RETENTION_DAYS, NOT_ON_PHONES_NOTE } from './storageShared';

/**
 * RetentionRule — the platform-wide automatic rule:
 * "Delete chat media older than [__] days" (off by default).
 * Businesses can override it from the By business table in Overview.
 */
export default function RetentionRule({ settings, onSaved, onRetry }) {
  const { data, loading, error } = settings;
  const [enabled, setEnabled] = useState(null);
  const [days, setDays] = useState(null);
  const [saving, setSaving] = useState(false);

  if (loading && !data) return <div className="card p-5 space-y-3"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-10 w-48" /></div>;
  if (error && !data) return <ErrorState title="Could not load the automatic rule" message={error} onRetry={onRetry} />;
  if (!data) return null;

  const min = data.minRetentionDays || MIN_RETENTION_DAYS;
  const savedDays = data.chatMediaRetentionDays;
  const isOn = enabled === null ? savedDays !== null : enabled;
  const value = days === null ? String(savedDays ?? 30) : days;
  const n = Number(value);
  const valid = !isOn || (Number.isInteger(n) && n >= min);
  const dirty = isOn ? n !== savedDays : savedDays !== null;

  const save = async () => {
    setSaving(true);
    try {
      await api.put(API.STORAGE_SETTINGS, { chatMediaRetentionDays: isOn ? n : null });
      toast.success(isOn ? `Chat media older than ${n} days will be deleted automatically` : 'Automatic deletion is off');
      setEnabled(null);
      setDays(null);
      onSaved();
    } catch (err) {
      toast.error(typeof err.userMessage === 'string' ? err.userMessage : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 sm:p-6 max-w-2xl space-y-4">
      <div>
        <h3 className="text-base font-bold text-text-primary tracking-tight">Automatic deletion</h3>
        <p className="text-xs text-text-secondary mt-0.5">Off by default. Only chat media is deleted automatically.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
        <input type="checkbox" checked={isOn} onChange={(e) => setEnabled(e.target.checked)} />
        Delete chat media older than a number of days
      </label>

      {isOn && (
        <div className="max-w-xs">
          <Input
            label="Older than"
            type="number"
            min={min}
            value={value}
            onChange={(e) => setDays(e.target.value)}
            suffix="days"
            error={!valid ? `Enter ${min} or more` : undefined}
          />
        </div>
      )}

      <div className="rounded-xl border border-border bg-bg-subtle p-3 text-xs text-text-secondary space-y-1">
        <p>Chat media means customer photos/videos/PDFs and the owner&apos;s phone-app media. Logos, QR codes, the media library and other files are never deleted automatically.</p>
        <p>Once a day, ApnaBot lists what is older than the limit as a cleanup that waits 24 hours. You can cancel it in Cleanup history.</p>
        <p>A business can have its own number of days, or &quot;never&quot;, in the By business table on Overview.</p>
        <p>{NOT_ON_PHONES_NOTE}</p>
      </div>

      <Button loading={saving} disabled={!valid || !dirty} onClick={save}>Save</Button>
    </div>
  );
}
