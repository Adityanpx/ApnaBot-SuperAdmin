// components/categoryTemplates/DefaultFlowModal.jsx
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * DefaultFlowModal — confirm step for "Set as default" / "Remove default".
 * Props:
 *   open            boolean
 *   mode            'set' | 'unset'
 *   template        object  — the template being changed (null when closed)
 *   categoryLabel   string  — display name of the template's category
 *   replacing       object? — current default of the category that "set" would replace
 *   onClose         fn
 *   onConfirm       fn(template) — useCategoryTemplates().setDefault / unsetDefault
 */
export default function DefaultFlowModal({
  open, mode, template, categoryLabel, replacing, onClose, onConfirm,
}) {
  const [loading, setLoading] = useState(false);
  if (!template) return null;
  const isSet = mode === 'set';

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(template);
      onClose();
    } catch {
      // error already toasted by the hook — keep the dialog open
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isSet ? 'Set as default flow?' : 'Remove default flow?'}
      size="sm"
    >
      <div className="space-y-5">
        <div className="flex gap-3 p-4 rounded-xl bg-info-bg text-info-text">
          <Star className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1.5">
            <p className="font-semibold">{template.name}</p>
            {isSet ? (
              <p>New businesses in {categoryLabel} will start with this flow.</p>
            ) : (
              <p>
                New businesses in {categoryLabel} will no longer start with this flow. They
                get the General default instead.
              </p>
            )}
            {isSet && replacing && (
              <p>It replaces the current default, <strong>{replacing.name}</strong>.</p>
            )}
            <p>Businesses that already exist are not changed.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button loading={loading} onClick={handleConfirm}>
            {isSet ? 'Yes, set default' : 'Yes, remove default'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
