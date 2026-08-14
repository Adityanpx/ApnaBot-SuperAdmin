// components/flowPacks/CreateFlowPackModal.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import Modal   from '@/components/ui/Modal';
import Input   from '@/components/ui/Input';
import Select  from '@/components/ui/Select';
import Button  from '@/components/ui/Button';
import { FLOW_PACK_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const EMPTY_FORM = {
  name: '',
  description: '',
  category: 'any',
  isActive: true,
  order: '',
};

/**
 * CreateFlowPackModal — form to add a new flow pack
 * Rules are added afterwards via EditFlowPackModal — this only creates
 * the pack's top-level fields.
 *
 * Props:
 *   open        boolean — is the modal visible?
 *   onClose     fn      — hide modal
 *   createPack  fn      — useFlowPacks().createPack (toasts + refetches internally)
 */
export default function CreateFlowPackModal({ open, onClose, createPack }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const update = field => e => setForm(prev => ({
    ...prev,
    [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  const resetForm = () => setForm(EMPTY_FORM);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        isActive: form.isActive,
        order: Number(form.order) || 0,
        rules: [],
      };

      await createPack(payload);
      onClose();
      resetForm();
    } catch {
      // error already toasted by createPack — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal
          open={open}
          onClose={handleClose}
          title="Create Flow Pack"
          subtitle="Add a new reusable set of chatbot rules"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              placeholder="e.g. Salon booking basics"
              value={form.name}
              onChange={update('name')}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="What this flow pack is for…"
                value={form.description}
                onChange={update('description')}
                className="input-field resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                options={FLOW_PACK_CATEGORIES}
                placeholder={null}
                value={form.category}
                onChange={update('category')}
                required
              />
              <Input
                label="Display Order"
                type="number"
                placeholder="0"
                value={form.order}
                onChange={update('order')}
                min="0"
                hint="Lower numbers show first"
              />
            </div>

            <Toggle
              label="Active"
              checked={form.isActive}
              onChange={update('isActive')}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create Flow Pack
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AnimatePresence>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className={cn(
          'w-9 h-5 rounded-full transition-colors',
          'bg-bg-subtle peer-checked:bg-brand-500'
        )} />
        <div className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm',
          'transition-transform peer-checked:translate-x-4',
          'group-hover:ring-2 group-hover:ring-brand-500/30'
        )} />
      </div>
      <span className="text-sm text-text-secondary group-hover:text-text-primary">
        {label}
      </span>
    </label>
  );
}
