// components/businessCategoryTemplates/ApplyBusinessCategoryTemplateModal.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import Modal  from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import BusinessPicker from '@/components/categoryTemplates/BusinessPicker';

/**
 * ApplyBusinessCategoryTemplateModal — applies a booking-form template to a
 * business. Apply is a direct overwrite (not a merge) of the business's
 * flow_fields, so this always confirms before submitting.
 *
 * Props:
 *   open           boolean — is the modal visible?
 *   template       object|null — { businessCategory, label } being applied
 *   onClose        fn      — hide modal
 *   applyTemplate  fn(category, businessId) — useBusinessCategoryTemplates().applyTemplate
 */
export default function ApplyBusinessCategoryTemplateModal({ open, template, onClose, applyTemplate }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null); // { fieldCount, business }

  const handleClose = () => {
    setBusiness(null);
    setResult(null);
    onClose();
  };

  const handleApply = async () => {
    if (!business || !template) return;
    setLoading(true);
    try {
      const data = await applyTemplate(template.businessCategory, business._id);
      setResult({ fieldCount: data.flowFields?.length || 0, business });
    } catch {
      // error already toasted by applyTemplate — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  if (!template) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={result ? 'Template Applied' : `Apply "${template.label}"`}
      subtitle={result ? undefined : "Overwrites the selected business's booking form fields"}
      size="md"
    >
      {result ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-success-bg text-success-text">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Applied — {result.business.name} updated</p>
              <p>
                Business now has <strong>{result.fieldCount}</strong> booking form field
                {result.fieldCount === 1 ? '' : 's'}.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle">
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Link href={`/businesses/${result.business._id}`}>
              <Button iconRight={<ArrowRight />} onClick={handleClose}>
                View Business
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">
              Business to apply to
            </label>
            <BusinessPicker value={business} onChange={setBusiness} />
          </div>

          {business && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-bg text-warning-text">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">This will overwrite existing fields</p>
                <p>
                  This will overwrite <strong>{business.name}</strong>&apos;s current booking form
                  fields with the <strong>{template.label}</strong> template. Continue?
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleApply} loading={loading} disabled={!business}>
              Apply Template
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
