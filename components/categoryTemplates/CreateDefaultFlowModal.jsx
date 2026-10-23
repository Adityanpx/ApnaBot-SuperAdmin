// components/categoryTemplates/CreateDefaultFlowModal.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import BusinessPicker from './BusinessPicker';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';
import { parseCloneResult, BUSINESS_NAME_TOKEN } from '@/lib/categoryTemplates';

const EMPTY = { business: null, category: '', name: '' };
const labelOf = (v) => CATEGORY_TEMPLATE_CATEGORIES.find((c) => c.value === v)?.label || v;

/** Category + name suggested for a picked business (blank when its category has no template list). */
function suggestionFor(business) {
  const known = CATEGORY_TEMPLATE_CATEGORIES.some((c) => c.value === business?.businessCategory);
  if (!business || !known) return { business, category: '', name: '' };
  const category = business.businessCategory;
  return { business, category, name: `${labelOf(category)} default` };
}

/** Step 1 — pick the business, the category and the template name. */
function PickStep({ form, setForm, loading, onNext, onCancel }) {
  const ready = form.business && form.category && form.name.trim();
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-secondary">Business</label>
        <BusinessPicker value={form.business} onChange={(b) => setForm(suggestionFor(b))} />
      </div>
      <Select
        label="Category"
        options={CATEGORY_TEMPLATE_CATEGORIES}
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />
      <Input
        label="Template name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <div className="modal-actions">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button loading={loading} disabled={!ready} onClick={onNext}>Clone as template</Button>
      </div>
    </div>
  );
}

/** Step 2 — show warnings, then confirm making the new template the default. */
function ConfirmStep({ created, categoryLabel, loading, onSet, onSkip }) {
  return (
    <div className="space-y-4">
      {created.warnings.length > 0 && (
        <div className="flex gap-3 p-4 rounded-xl bg-warning-bg text-warning-text">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            {created.warnings.length} reply node(s) mention the business name.{' '}
            <Link href={`/category-templates/${created.id}`} className="underline font-semibold">
              Open the template
            </Link>{' '}
            to replace it with {BUSINESS_NAME_TOKEN} first, or continue and fix it later.
          </p>
        </div>
      )}
      <p className="text-sm text-text-secondary">
        Template cloned. Make it the default? New businesses in {categoryLabel} will start with
        this flow.
      </p>
      <div className="modal-actions">
        <Button variant="ghost" onClick={onSkip} disabled={loading}>Not now</Button>
        <Button loading={loading} onClick={onSet}>Yes, set as default</Button>
      </div>
    </div>
  );
}

/**
 * CreateDefaultFlowModal — guided flow: pick a business, clone it as a template for its
 * category, then set that template as the category default.
 * Props: open, onClose, cloneFromBusiness, setDefault (from useCategoryTemplates)
 */
export default function CreateDefaultFlowModal({ open, onClose, cloneFromBusiness, setDefault }) {
  const [form, setForm] = useState(EMPTY);
  const [created, setCreated] = useState(null);
  const [loading, setLoading] = useState(false);

  const close = () => { setForm(EMPTY); setCreated(null); onClose(); };

  const clone = async () => {
    setLoading(true);
    try {
      const data = await cloneFromBusiness({
        businessId: form.business._id, category: form.category, name: form.name.trim(),
      });
      setCreated(parseCloneResult(data));
    } catch {
      // already toasted by the hook — stay on step 1
    } finally {
      setLoading(false);
    }
  };

  const makeDefault = async () => {
    if (!created.id) return toast.error('The server did not return the new template id');
    setLoading(true);
    try {
      await setDefault(created.id);
      close();
    } catch {
      // already toasted by the hook — stay on step 2
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="md"
      title="Create default from business"
      subtitle={created ? 'Step 2 of 2 — set as default' : 'Step 1 of 2 — clone the business flow'}
    >
      {created ? (
        <ConfirmStep
          created={created}
          categoryLabel={labelOf(form.category)}
          loading={loading}
          onSet={makeDefault}
          onSkip={close}
        />
      ) : (
        <PickStep form={form} setForm={setForm} loading={loading} onNext={clone} onCancel={close} />
      )}
    </Modal>
  );
}
