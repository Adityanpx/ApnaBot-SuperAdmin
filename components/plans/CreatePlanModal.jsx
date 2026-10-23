// components/plans/CreatePlanModal.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import PlanForm from '@/components/plans/PlanForm';
import { emptyPlanForm, validatePlanForm, formToPayload } from '@/lib/planForm';

/**
 * CreatePlanModal — form to add a new subscription plan
 * Props:
 *   open      boolean — is the modal visible?
 *   onClose   fn      — hide modal
 *   onSuccess fn      — called after successful creation (to refresh list)
 */
export default function CreatePlanModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyPlanForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validatePlanForm(form, { isEdit: false });
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      await api.post(API.PLANS, formToPayload(form, { isEdit: false }));
      toast.success('Plan created successfully');
      onSuccess();
      onClose();
      setForm(emptyPlanForm());
    } catch (err) {
      toast.error(err.response?.data?.userMessage || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Plan"
      subtitle="Add a new subscription plan for your customers"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <PlanForm form={form} onChange={setForm} />
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
