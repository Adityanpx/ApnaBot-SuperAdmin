// components/businesses/CopySetupModal.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Search } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { useCategoryOptions } from '@/hooks/useCategoryOptions';
import { withAny } from '@/lib/categoryOptions';
import { capitalize, getBusinessEmoji, cn } from '@/lib/utils';
import { useCategoryTemplates } from '@/hooks/useCategoryTemplates';
import { useCopySetup } from '@/hooks/useCopySetup';

export function getCategoryLabel(categories, category) {
  return withAny(categories).find((c) => c.value === category)?.label || capitalize(category);
}

// Same debounce as components/categoryTemplates/BusinessPicker.jsx
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const COUNT_ROWS = [
  ['nodes',             'Replies / questions'],
  ['edges',             'Connections'],
  ['webFormNodes',      'Service forms in flow'],
  ['serviceFormFields', 'Form fields'],
];

const TEMPLATE_FORM_HINT =
  "Templates don't include the business-wide form — per-reply forms inside the flow are still copied";

const STEP_TITLES = { 1: 'Choose a source', 2: 'What to copy', 3: 'Preview & confirm' };

// "Will be replaced" warning first (and bold); otherwise keep server order
const isReplaceWarning = (w) => /replace/i.test(w);
const sortWarnings = (warnings = []) => [
  ...warnings.filter(isReplaceWarning),
  ...warnings.filter((w) => !isReplaceWarning(w)),
];

function SourceOption({ selected, onClick, emoji, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl border transition-colors duration-150',
        selected ? 'border-brand-500 bg-bg-subtle' : 'border-border hover:bg-bg-subtle'
      )}
    >
      <span className="text-base flex-shrink-0">{emoji}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text-primary truncate">{title}</span>
        {subtitle && <span className="block text-xs text-text-tertiary truncate">{subtitle}</span>}
      </span>
    </button>
  );
}

// Mounted only while the modal is open (Modal renders children only when open),
// so every open starts fresh at step 1 and the templates list is fetched lazily.
function CopySetupBody({ business, onClose, onSuccess }) {
  const { categories } = useCategoryOptions();
  const categoryLabel = getCategoryLabel(categories, business.businessCategory);
  const emoji = getBusinessEmoji(business.businessCategory);

  const { templates, loading: templatesLoading } = useCategoryTemplates();
  const { loading: busy, previewCopy, applyCopy } = useCopySetup();

  const [step, setStep]             = useState(1);
  const [sourceType, setSourceType] = useState('business');
  const [source, setSource]         = useState(null); // { type, id, name }
  const [includeFlow, setIncludeFlow]               = useState(true);
  const [includeServiceForm, setIncludeServiceForm] = useState(true);
  const [preview, setPreview]       = useState(null);
  const [confirmText, setConfirmText] = useState('');

  // ── Businesses in the same category (server-side category + name filter) ──
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [businesses, setBusinesses] = useState([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setBusinessesLoading(true);
    const params = { businessCategory: business.businessCategory, limit: 50 };
    if (debouncedQuery.trim()) params.search = debouncedQuery.trim();
    api.get(API.BUSINESSES, { params })
      .then((res) => {
        if (!cancelled) setBusinesses(res.data.data.businesses.filter((b) => b._id !== business._id));
      })
      .catch((err) => {
        if (!cancelled) {
          setBusinesses([]);
          toast.error(err.userMessage || 'Failed to load businesses');
        }
      })
      .finally(() => { if (!cancelled) setBusinessesLoading(false); });
    return () => { cancelled = true; };
  }, [business._id, business.businessCategory, debouncedQuery]);

  const categoryTemplates = useMemo(
    () => templates.filter((t) => t.category === business.businessCategory),
    [templates, business.businessCategory]
  );

  const isTemplate = sourceType === 'template';
  const serviceFormOn = includeServiceForm && !isTemplate;
  const nothingSelected = !includeFlow && !serviceFormOn;

  const pickSourceType = (type) => {
    if (type === sourceType) return;
    setSourceType(type);
    setSource(null);
  };

  const buildPayload = () => ({
    source: { type: source.type, id: source.id },
    include: { flow: includeFlow, serviceForm: serviceFormOn },
  });

  const handlePreview = async () => {
    try {
      setPreview(await previewCopy(business._id, buildPayload()));
      setConfirmText('');
      setStep(3);
    } catch {
      // error already toasted by useCopySetup — stay on this step
    }
  };

  const handleApply = async () => {
    try {
      await applyCopy(business._id, buildPayload());
      toast.success(`Setup copied from ${source.name}. A restore point was saved — undo from the business's Versions tab in the ApnaBot dashboard.`);
      onSuccess?.();
      onClose();
    } catch {
      // error already toasted by useCopySetup — keep the modal open
    }
  };

  const isConfirmed = confirmText.trim().toLowerCase() === business.name.toLowerCase();
  const warnings = sortWarnings(preview?.warnings);
  const emptyList = isTemplate ? categoryTemplates.length === 0 : businesses.length === 0;
  const listLoading = isTemplate ? templatesLoading : businessesLoading;

  return (
    <div className="space-y-5">
      <p className="text-xs text-text-tertiary">
        Step {step} of 3 — {STEP_TITLES[step]}
      </p>

      {/* ── Step 1 — Source ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-bg-subtle">
            {[['business', 'From a business'], ['template', 'From a template']].map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => pickSourceType(type)}
                className={cn(
                  'h-11 sm:h-8 rounded-lg text-sm font-medium transition-colors duration-150',
                  sourceType === type
                    ? 'bg-bg-overlay text-text-primary shadow-card'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {!isTemplate && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search businesses by name…"
                className="input-field pl-10"
              />
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {listLoading ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : emptyList && !(query.trim() && !isTemplate) ? (
              <p className="text-sm text-text-secondary text-center py-6">
                No other {categoryLabel} businesses or templates yet.
              </p>
            ) : emptyList ? (
              <p className="text-sm text-text-tertiary text-center py-6">
                No {categoryLabel} businesses match &quot;{query.trim()}&quot;
              </p>
            ) : isTemplate ? (
              categoryTemplates.map((t) => (
                <SourceOption
                  key={t._id}
                  selected={source?.id === t._id}
                  onClick={() => setSource({ type: 'template', id: t._id, name: t.name })}
                  emoji="🗂️"
                  title={t.name}
                  subtitle={t.description}
                />
              ))
            ) : (
              businesses.map((b) => (
                <SourceOption
                  key={b._id}
                  selected={source?.id === b._id}
                  onClick={() => setSource({ type: 'business', id: b._id, name: b.name })}
                  emoji={getBusinessEmoji(b.businessCategory)}
                  title={b.name}
                  subtitle={b.city}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Step 2 — What to copy ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Copying from <span className="font-semibold text-text-primary">{source.name}</span> into{' '}
            <span className="font-semibold text-text-primary">{business.name}</span>.
          </p>

          <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
            <input type="checkbox" checked={includeFlow} onChange={(e) => setIncludeFlow(e.target.checked)} />
            Auto-reply flow
          </label>

          <div>
            <label className={cn(
              'flex items-center gap-2 text-sm',
              isTemplate ? 'text-text-tertiary cursor-not-allowed' : 'text-text-primary cursor-pointer'
            )}>
              <input
                type="checkbox"
                checked={serviceFormOn}
                disabled={isTemplate}
                onChange={(e) => setIncludeServiceForm(e.target.checked)}
              />
              Service form
            </label>
            {isTemplate && <p className="text-xs text-text-tertiary mt-1 ml-6">{TEMPLATE_FORM_HINT}</p>}
          </div>
        </div>
      )}

      {/* ── Step 3 — Preview & confirm ──────────────────────────────────── */}
      {step === 3 && preview && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Copying from <span className="font-semibold text-text-primary">{source.name}</span> into{' '}
            <span className="font-semibold text-text-primary">{business.name}</span> will copy:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {COUNT_ROWS.map(([key, label]) => (
              <div key={key} className="p-3 rounded-xl bg-bg-subtle">
                <p className="text-xl font-bold text-text-primary">{preview.willCopy?.[key] ?? 0}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {warnings.length > 0 && (
            <div className="flex gap-3 p-4 rounded-xl bg-warning-bg">
              <AlertTriangle className="w-5 h-5 text-warning-text flex-shrink-0 mt-0.5" />
              <ul className="list-disc list-inside space-y-1 text-sm text-warning-text leading-relaxed">
                {warnings.map((w, i) => (
                  <li key={i} className={i === 0 && isReplaceWarning(w) ? 'font-bold' : undefined}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Type <span className="font-semibold text-text-primary">{business.name}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${business.name}"`}
              className="input-field"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="modal-actions">
        {step === 1 && (
          <>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button disabled={!source} onClick={() => setStep(2)}>Next</Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button variant="ghost" onClick={() => setStep(1)} disabled={busy}>Back</Button>
            <Button loading={busy} disabled={nothingSelected} onClick={handlePreview}>Preview</Button>
          </>
        )}
        {step === 3 && (
          <>
            <Button variant="ghost" onClick={() => setStep(2)} disabled={busy}>Back</Button>
            <Button loading={busy} disabled={!isConfirmed} onClick={handleApply}>Copy now</Button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * CopySetupModal — 3-step wizard: pick a source (same-category business or
 * template) → choose what to copy → preview (dryRun) and confirm by typing the
 * target business name.
 *
 * Props:
 *   open       boolean
 *   onClose    fn
 *   business   object — the target business (needs _id, name, businessCategory)
 *   onSuccess  fn     — called after a successful copy
 */
export default function CopySetupModal({ open, onClose, business, onSuccess }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Copy setup"
      subtitle={business.name}
      size="md"
    >
      <CopySetupBody business={business} onClose={onClose} onSuccess={onSuccess} />
    </Modal>
  );
}
