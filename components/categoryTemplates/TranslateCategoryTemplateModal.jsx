// components/categoryTemplates/TranslateCategoryTemplateModal.jsx
'use client';

import { useState, useEffect } from 'react';
import Modal  from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * TranslateCategoryTemplateModal — fills one language's empty texts on a template.
 * Existing translations are never overwritten, so it is safe to run again.
 *
 * Props:
 *   open               boolean — is the modal visible?
 *   template           object  — the template being translated (null when closed)
 *   onClose            fn      — hide modal
 *   translateTemplate  fn      — useCategoryTemplates().translateTemplate(id, to) → result (toasts errors itself)
 */
export default function TranslateCategoryTemplateModal({ open, template, onClose, translateTemplate }) {
  const [languages, setLanguages] = useState([]);
  const [langError, setLangError] = useState(false);
  const [to, setTo]               = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);

  // The catalog is fetched once, the first time the modal opens
  useEffect(() => {
    if (!open || languages.length > 0) return undefined;
    let cancelled = false;
    setLangError(false);
    api.get(API.PUBLIC_LANGUAGES)
      .then((res) => {
        if (!cancelled) setLanguages(res.data.data.languages.filter((l) => l.code !== 'en'));
      })
      .catch(() => { if (!cancelled) setLangError(true); });
    return () => { cancelled = true; };
  }, [open, languages.length]);

  const handleClose = () => {
    setTo('');
    setResult(null);
    onClose();
  };

  const handleTranslate = async () => {
    setLoading(true);
    setResult(null);
    try {
      setResult(await translateTemplate(template._id, to));
    } catch {
      // error already toasted by translateTemplate — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  const options = languages.map((l) => ({ value: l.code, label: `${l.name} (${l.englishName})` }));
  const skipped = result?.skipped || [];
  const warnings = result?.warnings || [];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Translate Template"
      subtitle={template?.name}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Fills the empty texts of the chosen language on this template, so businesses created from
          it start translated. Existing translations are kept.
        </p>

        <Select
          label="Language"
          options={options}
          value={to}
          onChange={(e) => { setTo(e.target.value); setResult(null); }}
          disabled={loading || options.length === 0}
          required
        />
        {langError && <p className="text-xs text-danger-text">Could not load the language list.</p>}

        {result && (
          <div className="rounded-xl bg-bg-subtle p-4 text-sm space-y-2" data-testid="translate-result">
            <p className="font-semibold text-text-primary">
              {result.translated} translated, {result.alreadyTranslated} already translated
              {skipped.length > 0 ? `, ${skipped.length} skipped` : ''}
            </p>
            <p className="text-text-secondary">{result.charged} characters charged.</p>
            {skipped.length > 0 && (
              <ul className="text-xs text-text-tertiary list-disc pl-4 space-y-0.5">
                {skipped.map((s, i) => <li key={i}>{s.slot}: {s.reason}</li>)}
              </ul>
            )}
            {warnings.length > 0 && (
              <ul className="text-xs text-warning-text list-disc pl-4 space-y-0.5">
                {warnings.map((w, i) => <li key={i}>{typeof w === 'string' ? w : JSON.stringify(w)}</li>)}
              </ul>
            )}
          </div>
        )}

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          <Button onClick={handleTranslate} loading={loading} disabled={!to}>
            Translate
          </Button>
        </div>
      </div>
    </Modal>
  );
}
