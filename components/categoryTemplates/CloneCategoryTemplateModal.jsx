// components/categoryTemplates/CloneCategoryTemplateModal.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Modal  from '@/components/ui/Modal';
import Input  from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import BusinessPicker from './BusinessPicker';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';

const EMPTY_FORM = { business: null, category: '', name: '', description: '' };

/**
 * CloneCategoryTemplateModal — clones a business's chatbot rules into a
 * reusable category template. A category can hold multiple templates, so
 * this always adds a new template rather than replacing one.
 *
 * Props:
 *   open              boolean — is the modal visible?
 *   onClose           fn      — hide modal
 *   cloneFromBusiness fn      — useCategoryTemplates().cloneFromBusiness (toasts + refetches internally)
 */
export default function CloneCategoryTemplateModal({ open, onClose, cloneFromBusiness }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

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
        description: form.description.trim() || undefined,
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

        <Input
          label="Template Name"
          placeholder="e.g. Salon starter kit"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />

        <Input
          label="Description (optional)"
          placeholder="e.g. A lighter starter kit for small salons"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
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
