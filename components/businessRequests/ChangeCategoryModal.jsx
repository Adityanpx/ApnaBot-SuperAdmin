// components/businessRequests/ChangeCategoryModal.jsx
'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { categoryChoices } from '@/lib/businessRequests';
import { categoryLabel } from '@/lib/categoryOptions';

/**
 * ChangeCategoryModal — pick the real category for a business that signed up as "general".
 * Only the category (and the settings derived from it) changes; the flow is not re-seeded.
 * Props:
 *   open        boolean
 *   row         display row from requestRow() | null
 *   categories  all categories from useCategoryOptions() (multi_brand is filtered out here)
 *   onClose     fn
 *   onConfirm   fn(businessId, category) — useBusinessRequests().changeCategory (toasts and throws on failure)
 *   onChanged   fn(row, category) — called after a successful change
 */
export default function ChangeCategoryModal({ open, row, categories, onClose, onConfirm, onChanged }) {
  if (!row) return null;
  return (
    <CategoryForm
      key={row.id}
      open={open}
      row={row}
      categories={categories}
      onClose={onClose}
      onConfirm={onConfirm}
      onChanged={onChanged}
    />
  );
}

function CategoryForm({ open, row, categories, onClose, onConfirm, onChanged }) {
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    try {
      await onConfirm(row.businessId, category);
      onChanged(row, category);
    } catch {
      // already toasted by the hook - keep the dialog open
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Change category" subtitle={row.businessName} size="sm">
      <div className="space-y-5">
        <p className="text-sm text-text-secondary">
          Current category: <strong>{categoryLabel(categories, row.businessCategory) || '—'}</strong>
        </p>
        <Select
          label="New category"
          placeholder="Select a category…"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryChoices(categories)}
        />
        <div className="flex gap-3 p-4 rounded-xl bg-warning-bg text-warning-text">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            This also resets the fleet and fare switches to the new category&apos;s defaults. The auto-reply flow
            is not changed — use Copy setup afterwards.
          </p>
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            loading={saving}
            disabled={!category || category === row.businessCategory}
            onClick={confirm}
          >
            Change category
          </Button>
        </div>
      </div>
    </Modal>
  );
}
