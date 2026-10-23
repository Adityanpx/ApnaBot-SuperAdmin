// components/plans/EditPlanModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import PlanForm from '@/components/plans/PlanForm';
import PriceChangeModal from '@/components/plans/PriceChangeModal';
import {
  emptyPlanForm, planToForm, validatePlanForm, formToPayload, pricingChange,
} from '@/lib/planForm';

/**
 * EditPlanModal — form to edit an existing subscription plan. Saving a changed
 * monthly price or discount first asks the admin to confirm.
 * Props:
 *   open      boolean — is the modal visible?
 *   plan      object  — the plan being edited (null when closed)
 *   onClose   fn      — hide modal
 *   onSuccess fn      — called after successful update (to refresh list)
 */
export default function EditPlanModal({ open, plan, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyPlanForm);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    if (plan) setForm(planToForm(plan));
    setPending(null);
  }, [plan]);

  const save = async () => {
    setLoading(true);
    try {
      await api.put(`${API.PLANS}/${plan._id}`, formToPayload(form, { isEdit: true }));
      toast.success('Plan updated successfully');
      setPending(null);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.userMessage || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validatePlanForm(form, { isEdit: true });
    if (error) {
      toast.error(error);
      return;
    }
    const change = pricingChange(plan, form);
    if (change) setPending(change);
    else save();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => (pending ? setPending(null) : onClose())}
        title="Edit Plan"
        subtitle="Update an existing subscription plan"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <PlanForm form={form} onChange={setForm} isEdit />
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading && !pending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
      <PriceChangeModal
        open={!!pending}
        change={pending}
        loading={loading}
        onClose={() => setPending(null)}
        onConfirm={save}
      />
    </>
  );
}
