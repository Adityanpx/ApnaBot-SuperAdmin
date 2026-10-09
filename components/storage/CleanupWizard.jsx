// components/storage/CleanupWizard.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, ShieldCheck, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { formatBytes, formatNumber, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BusinessPicker from '@/components/categoryTemplates/BusinessPicker';
import {
  ALL_BUSINESSES_PHRASE, NOT_ON_PHONES_NOTE, PICKABLE_KINDS, kindLabel, isImageUrl, fileExt, countdown,
} from './storageShared';

const errText = (err, fallback) => (typeof err.userMessage === 'string' ? err.userMessage : fallback);

/**
 * CleanupWizard — Filters → Preview (safe vs in-use) → typed confirmation → scheduled run.
 * Nothing is deleted by this screen: the server marks the files and deletes them
 * after 24 hours unless the run is cancelled in Cleanup history.
 *
 * Props:
 *   initialBusiness  { businessId, name } | null — from "Clean up" in the Overview table
 *   onScheduled      fn() — refresh runs/summary after a run is created
 *   onGoToHistory    fn()
 */
export default function CleanupWizard({ initialBusiness, onScheduled, onGoToHistory }) {
  const [step, setStep] = useState('filters'); // filters | preview | done
  const [scope, setScope] = useState(initialBusiness ? 'one' : 'all');
  const [business, setBusiness] = useState(
    initialBusiness ? { _id: initialBusiness.businessId, name: initialBusiness.name } : null
  );
  const [kinds, setKinds] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [minMb, setMinMb] = useState('');

  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState(null); // { safe, withInUse }
  const [includeInUse, setIncludeInUse] = useState(false);
  const [typed, setTyped] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [run, setRun] = useState(null);

  const dateError = from && to && from > to ? 'The start date must not be after the end date' : null;
  const mbNum = minMb === '' ? 0 : Number(minMb);
  const mbError = !Number.isFinite(mbNum) || mbNum < 0 ? 'Enter 0 or more' : null;
  const canPreview = !dateError && !mbError && (scope === 'all' || business);

  const toggleKind = (k) => setKinds((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));

  const body = (extra = {}) => ({
    businessId: scope === 'all' ? 'all' : business._id,
    kinds,
    from: from || undefined,
    to: to || undefined,
    minBytes: Math.round(mbNum * 1048576),
    ...extra,
  });

  const runPreview = async () => {
    setPreviewing(true);
    try {
      const [safe, withInUse] = await Promise.all([
        api.post(API.STORAGE_PREVIEW, body({ includeInUse: false })),
        api.post(API.STORAGE_PREVIEW, body({ includeInUse: true })),
      ]);
      setPreview({ safe: safe.data.data, withInUse: withInUse.data.data });
      setIncludeInUse(false);
      setTyped('');
      setStep('preview');
    } catch (err) {
      toast.error(errText(err, 'Could not preview this cleanup'));
    } finally {
      setPreviewing(false);
    }
  };

  const schedule = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(API.STORAGE_RUNS, body({
        includeInUse,
        confirmPhrase: scope === 'all' ? typed.trim() : undefined,
        confirmBusinessName: includeInUse ? typed.trim() : undefined,
      }));
      setRun(res.data.data);
      setStep('done');
      onScheduled();
    } catch (err) {
      toast.error(errText(err, 'Could not schedule the cleanup'));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep('filters'); setPreview(null); setRun(null); setIncludeInUse(false); setTyped('');
  };

  // ── Step 3: scheduled ─────────────────────────────────────────────────────
  if (step === 'done' && run) {
    return (
      <div className="card p-6 text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-success-bg flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-success-text" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mt-4">Cleanup scheduled</h3>
        <p className="text-sm text-text-secondary mt-1">
          {formatNumber(run.file_count)} files ({formatBytes(run.total_bytes)}) will be deleted in 24 hours
          {run.pending_delete_at ? ` — ${countdown(run.pending_delete_at)}` : ''}.
        </p>
        <p className="text-sm text-text-secondary mt-2">
          Changed your mind? You can cancel it any time before then in Cleanup history.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          <Button onClick={onGoToHistory}>View cleanup history</Button>
          <Button variant="outline" onClick={reset}>Start another</Button>
        </div>
      </div>
    );
  }

  // ── Step 2: preview + confirm ─────────────────────────────────────────────
  if (step === 'preview' && preview) {
    const { safe, withInUse } = preview;
    const inUse = safe.excluded.inUse;
    const inUseSample = (withInUse.sample || []).filter((i) => i.inUse);
    const inUseByBusiness = diffByBusiness(withInUse.byBusiness, safe.byBusiness);
    const inUseByKind = diffByKind(withInUse.byKind, safe.byKind);
    const canIncludeInUse = scope === 'one' && inUse.count > 0;
    const finalCount = safe.count + (includeInUse ? inUse.count : 0);
    const finalBytes = safe.bytes + (includeInUse ? inUse.bytes : 0);
    const needed = scope === 'all' ? ALL_BUSINESSES_PHRASE : includeInUse ? (business && business.name) : null;
    const typedOk = !needed || typed.trim() === String(needed).trim();
    const tooMany = includeInUse ? withInUse.tooMany : safe.tooMany;
    const truncated = safe.truncated || withInUse.truncated;
    const blocked = finalCount === 0 || tooMany || truncated;
    const otherSkipped = safe.excluded.protected.count + safe.excluded.alreadyPending.count;

    return (
      <div className="space-y-5">
        <button type="button" onClick={() => setStep('filters')} className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" /> Change filters
        </button>

        {truncated && <Warning>There are too many files to scan in one go. Narrow the filters (pick one business or a few file types).</Warning>}
        {tooMany && <Warning>That is too many files for one cleanup. Narrow the filters and try again.</Warning>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Safe */}
          <div className="card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success-text" />
              <h3 className="text-base font-bold text-text-primary tracking-tight">Safe to delete</h3>
            </div>
            <p className="text-xs text-text-tertiary mt-0.5">Not shown anywhere in ApnaBot right now.</p>
            <p className="text-2xl font-bold text-text-primary mt-3">{formatNumber(safe.count)} files</p>
            <p className="text-sm text-text-secondary">{formatBytes(safe.bytes)}</p>
            <Breakdown byKind={safe.byKind} byBusiness={safe.byBusiness} showBusinesses={scope === 'all'} />
            <Thumbs items={safe.sample} emptyText="Nothing to delete with these filters." />
          </div>

          {/* In use */}
          <div className="card p-5 border-danger-DEFAULT/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-danger-text" />
              <h3 className="text-base font-bold text-text-primary tracking-tight">⚠️ In use</h3>
            </div>
            <p className="text-xs text-text-tertiary mt-0.5">
              These are still showing in a chat, the media library, a bot or a logo. Deleting them leaves broken images.
              They are skipped unless you choose otherwise below.
            </p>
            <p className="text-2xl font-bold text-text-primary mt-3">{formatNumber(inUse.count)} files</p>
            <p className="text-sm text-text-secondary">{formatBytes(inUse.bytes)}</p>
            <Breakdown byKind={inUseByKind} byBusiness={inUseByBusiness} showBusinesses={scope === 'all'} />
            <Thumbs items={inUseSample} emptyText="No files in use match these filters." />
          </div>
        </div>

        {otherSkipped > 0 && (
          <p className="text-xs text-text-tertiary">
            {formatNumber(otherSkipped)} more files were left out automatically (protected files, or already waiting in another cleanup).
          </p>
        )}

        {/* Confirmation */}
        <div className="card p-5 space-y-4">
          <h3 className="text-base font-bold text-text-primary tracking-tight">Confirm</h3>

          {canIncludeInUse ? (
            <label className="flex items-start gap-2 text-sm text-text-primary cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={includeInUse}
                onChange={(e) => { setIncludeInUse(e.target.checked); setTyped(''); }}
              />
              <span>
                Also delete in-use files ({formatNumber(inUse.count)} files, {formatBytes(inUse.bytes)})
                <span className="block text-xs text-danger-text">Images and files that are still shown to customers will stop working.</span>
              </span>
            </label>
          ) : inUse.count > 0 ? (
            <p className="text-xs text-text-tertiary">
              In-use files can only be deleted for one business at a time, so they will be skipped here.
            </p>
          ) : null}

          <div className="rounded-xl border border-danger-DEFAULT/30 bg-danger-bg p-4 text-sm text-danger-text space-y-1.5">
            <p className="font-semibold">
              {scope === 'all' ? 'This will delete files for ALL businesses. ' : ''}
              {formatNumber(finalCount)} files ({formatBytes(finalBytes)}) will be deleted.
            </p>
            <p>Once the 24-hour wait is over the files are gone for good and cannot be brought back.</p>
            <p>{NOT_ON_PHONES_NOTE}</p>
          </div>

          {needed && (
            <Input
              label={scope === 'all' ? `Type ${ALL_BUSINESSES_PHRASE} to continue` : `Type the business name (${needed}) to delete in-use files`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={needed}
              autoComplete="off"
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="danger" loading={submitting} disabled={blocked || !typedOk} onClick={schedule}>
              Schedule deletion in 24 hours
            </Button>
            <p className="text-xs text-text-tertiary">Nothing is deleted now. You can cancel during the 24 hours.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: filters ───────────────────────────────────────────────────────
  return (
    <div className="card p-5 sm:p-6 max-w-2xl space-y-5">
      <div>
        <h3 className="text-base font-bold text-text-primary tracking-tight">Clean up storage</h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Choose what to look at. You will see exactly what would be deleted before anything is scheduled.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">Business</p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="radio" name="scope" checked={scope === 'one'} onChange={() => setScope('one')} /> One business
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="radio" name="scope" checked={scope === 'all'} onChange={() => setScope('all')} /> All businesses
          </label>
        </div>
        {scope === 'one' && <BusinessPicker value={business} onChange={setBusiness} />}
        {scope === 'all' && (
          <p className="text-xs text-danger-text">Cleaning all businesses at once needs an extra typed confirmation later.</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-text-secondary">File types</p>
          <button type="button" className="text-xs text-info-text hover:underline" onClick={() => setKinds([])}>
            All types
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PICKABLE_KINDS.map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <input type="checkbox" checked={kinds.includes(k)} onChange={() => toggleKind(k)} />
              {kindLabel(k)}
            </label>
          ))}
        </div>
        <p className="text-xs text-text-tertiary">Leave all unticked to include every type.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Files from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="Files up to" type="date" value={to} onChange={(e) => setTo(e.target.value)} error={dateError || undefined} />
        <Input
          label="Bigger than"
          type="number"
          min="0"
          step="any"
          value={minMb}
          onChange={(e) => setMinMb(e.target.value)}
          suffix="MB"
          placeholder="Any size"
          error={mbError || undefined}
        />
      </div>

      <p className="text-xs text-text-tertiary">{NOT_ON_PHONES_NOTE}</p>

      <Button loading={previewing} disabled={!canPreview} onClick={runPreview}>
        Preview what would be deleted
      </Button>
    </div>
  );
}

function Warning({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-danger-DEFAULT/30 bg-danger-bg p-3 text-sm text-danger-text">
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function diffByKind(all, safe) {
  const out = {};
  for (const [k, v] of Object.entries(all || {})) {
    const s = (safe || {})[k] || { count: 0, bytes: 0 };
    if (v.count - s.count > 0) out[k] = { count: v.count - s.count, bytes: v.bytes - s.bytes };
  }
  return out;
}

function diffByBusiness(all, safe) {
  const safeMap = new Map((safe || []).map((b) => [b.businessId || 'none', b]));
  return (all || [])
    .map((b) => {
      const s = safeMap.get(b.businessId || 'none');
      return { ...b, count: b.count - (s ? s.count : 0), bytes: b.bytes - (s ? s.bytes : 0) };
    })
    .filter((b) => b.count > 0);
}

function Breakdown({ byKind, byBusiness, showBusinesses }) {
  const kinds = Object.entries(byKind || {}).sort((a, b) => b[1].bytes - a[1].bytes);
  if (kinds.length === 0) return null;
  return (
    <div className="mt-3 space-y-1 text-xs text-text-secondary">
      {kinds.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3">
          <span className="truncate">{kindLabel(k)}</span>
          <span className="flex-shrink-0">{formatNumber(v.count)} · {formatBytes(v.bytes)}</span>
        </div>
      ))}
      {showBusinesses && byBusiness && byBusiness.length > 0 && (
        <div className="pt-2 mt-2 border-t border-border-subtle space-y-1">
          <p className="text-text-tertiary">By business</p>
          {byBusiness.slice(0, 8).map((b) => (
            <div key={b.businessId || 'none'} className="flex justify-between gap-3">
              <span className="truncate">{b.name || 'Unknown business'}</span>
              <span className="flex-shrink-0">{formatNumber(b.count)} · {formatBytes(b.bytes)}</span>
            </div>
          ))}
          {byBusiness.length > 8 && <p className="text-text-tertiary">and {byBusiness.length - 8} more…</p>}
        </div>
      )}
    </div>
  );
}

function Thumbs({ items, emptyText }) {
  if (!items || items.length === 0) return <p className="text-xs text-text-tertiary mt-4">{emptyText}</p>;
  const shown = items.slice(0, 12);
  return (
    <div className="mt-4">
      <p className="text-xs text-text-tertiary mb-2">Examples</p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {shown.map((i) => (
          <a
            key={i.key}
            href={i.url}
            target="_blank"
            rel="noreferrer"
            title={`${kindLabel(i.kind)} · ${formatBytes(i.sizeBytes)}${i.objectDate ? ` · ${formatDate(i.objectDate)}` : ''}`}
            className="aspect-square rounded-lg bg-bg-subtle border border-border-subtle overflow-hidden flex items-center justify-center text-text-tertiary hover:border-border-strong"
          >
            {isImageUrl(i.url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={i.url} alt="" loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-0.5 text-[10px]">
                <FileText className="w-4 h-4" />
                {fileExt(i.url)}
              </span>
            )}
          </a>
        ))}
      </div>
      {items.length > shown.length && (
        <p className="text-xs text-text-tertiary mt-2">Showing {shown.length} of the first {items.length} examples.</p>
      )}
    </div>
  );
}
