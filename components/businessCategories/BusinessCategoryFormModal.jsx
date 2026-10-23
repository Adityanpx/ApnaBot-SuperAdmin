// components/businessCategories/BusinessCategoryFormModal.jsx
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Switch from '@/components/ui/Switch';
import Button from '@/components/ui/Button';
import {
  emptyCategoryForm, categoryToForm, validateCategoryForm, categoryPayload, suggestValue,
} from '@/lib/categoryOptions';

/**
 * Create (category omitted) or edit (category given) a business category.
 * `onSave(value | null, body)` rejects with the server error, which is shown inline.
 */
export default function BusinessCategoryFormModal({ open, onClose, category, onSave }) {
  const isEdit = !!category;
  const [form, setForm]               = useState(emptyCategoryForm());
  const [valueTouched, setTouched]    = useState(false);
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(category ? categoryToForm(category) : emptyCategoryForm());
    setTouched(false);
    setErrors({});
    setServerError('');
  }, [open, category]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // The slug follows the English label until the admin edits it by hand.
  const setLabel = (e) => {
    const label = e.target.value;
    setForm((prev) => ({ ...prev, label, value: isEdit || valueTouched ? prev.value : suggestValue(label) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validateCategoryForm(form, isEdit);
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length) return;
    setSaving(true);
    try {
      await onSave(isEdit ? category.value : null, categoryPayload(form, isEdit));
      onClose();
    } catch (err) {
      setServerError(err?.userMessage || err?.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Edit ${category.label}` : 'Add category'} size="md">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          label="English label"
          required
          value={form.label}
          onChange={setLabel}
          error={errors.label}
        />
        <Input
          label="Value (slug)"
          value={form.value}
          onChange={(e) => { setTouched(true); setForm((prev) => ({ ...prev, value: e.target.value })); }}
          disabled={isEdit}
          helper={isEdit ? 'The value cannot be changed' : 'Lowercase, digits and _ — saved with each business'}
          error={errors.value}
          className="font-mono"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Hindi label" value={form.labelHi} onChange={set('labelHi')} error={errors.labelHi} />
          <Input label="Marathi label" value={form.labelMr} onChange={set('labelMr')} error={errors.labelMr} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Emoji" value={form.emoji} onChange={set('emoji')} placeholder="🧵" error={errors.emoji} />
          <Input label="Lucide icon" value={form.icon} onChange={set('icon')} placeholder="graduation-cap" error={errors.icon} />
          <Input
            label="Display order"
            type="number"
            min="0"
            value={form.displayOrder}
            onChange={set('displayOrder')}
            error={errors.displayOrder}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-text-secondary">Enabled</p>
            <p className="text-xs text-text-tertiary">Offer this category to new signups</p>
          </div>
          <Switch
            checked={form.isEnabled}
            label="Enabled"
            onChange={(isEnabled) => setForm((prev) => ({ ...prev, isEnabled }))}
          />
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-danger-text">{serverError}</p>
        )}

        <div className="modal-actions">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? 'Save changes' : 'Add category'}</Button>
        </div>
      </form>
    </Modal>
  );
}
