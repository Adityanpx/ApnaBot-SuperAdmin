// components/categoryTemplates/CloneCategoryTemplateModal.jsx
'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import Modal  from '@/components/ui/Modal';
import Input  from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import BusinessPicker from './BusinessPicker';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

const EMPTY_FORM = { business: null, category: '', name: '' };

/**
 * CloneCategoryTemplateModal — clones a business's chatbot rules into a
 * reusable per-category template. Server-side this deletes any existing
 * template for the chosen category before inserting the clone, so this
 * warns before submit if one already exists rather than overwriting silently.
 *
 * Props:
 *   open              boolean — is the modal visible?
 *   onClose           fn      — hide modal
 *   templates         array   — existing templates, used to detect an overwrite
 *   cloneFromBusiness fn      — useCategoryTemplates().cloneFromBusiness (toasts + refetches internally)
 */
export default function CloneCategoryTemplateModal({ open, onClose, templates, cloneFromBusiness }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const existingForCategory = useMemo(
    () => templates.find((t) => t.category === form.category) || null,
    [templates, form.category]
  );

  const resetForm = () => setForm(EMPTY_FORM);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business) {
      toast.error('Please select a business to clone from');
      return;
    }
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setLoading(true);
    try {
      await cloneFromBusiness({
        businessId: form.business._id,
        category: form.category,
        name: form.name.trim(),
      });
      handleClose();
    } catch {
      // error already toasted by cloneFromBusiness — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Clone from Business"
      subtitle="Copy a business's chatbot rules into a reusable category template"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">
            Business to clone from
          </label>
          <BusinessPicker
            value={form.business}
            onChange={(business) => setForm((prev) => ({ ...prev, business }))}
          />
        </div>

        <Select
          label="Category"
          options={CATEGORY_TEMPLATE_CATEGORIES}
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          required
        />

        {/* Overwrite warning — clone-from-business deletes the existing
            template for this category before inserting the new one */}
        {existingForCategory && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-bg text-warning-text">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">This will replace an existing template</p>
              <p>
                <strong>{existingForCategory.name}</strong> already covers this category
                (last updated {formatDate(existingForCategory.updatedAt)}). Cloning will
                permanently delete it and put this one in its place.
              </p>
            </div>
          </div>
        )}

        <Input
          label="Template Name"
          placeholder="e.g. Salon starter kit"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Clone Template
          </Button>
        </div>
      </form>
    </Modal>
  );
}
