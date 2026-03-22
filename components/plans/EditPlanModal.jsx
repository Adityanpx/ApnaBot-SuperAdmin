// components/plans/EditPlanModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import Modal   from '@/components/ui/Modal';
import Input   from '@/components/ui/Input';
import Button  from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * EditPlanModal — form to edit an existing subscription plan
 * Props:
 *   open     boolean — is the modal visible?
 *   plan     object  — the plan being edited (null when closed)
 *   onClose  fn      — hide modal
 *   onSuccess fn     — called after successful update (to refresh list)
 */
export default function EditPlanModal({ open, plan, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const [form, setForm] = useState({
    name: '',           // internal ID (read‑only after create)
    displayName: '',    // visible name
    price: '',          // monthly price
    msgLimit: '',       // messages per month
    ruleLimit: '',      // chatbot rules
    customerLimit: '',  // max customers
    isActive: true,
    bookingEnabled: false,
    paymentLinkEnabled: false,
    staffEnabled: false,
    maxStaff: '',
  });

  // Populate form when plan changes
  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name || '',
        displayName: plan.displayName || '',
        price: plan.price?.toString() || '0',
        msgLimit: plan.msgLimit?.toString() || '0',
        ruleLimit: plan.ruleLimit?.toString() || '0',
        customerLimit: plan.customerLimit?.toString() || '0',
        isActive: plan.isActive ?? true,
        bookingEnabled: plan.bookingEnabled ?? false,
        paymentLinkEnabled: plan.paymentLinkEnabled ?? false,
        staffEnabled: plan.staffEnabled ?? false,
        maxStaff: plan.maxStaff?.toString() || '1',
      });
    }
  }, [plan]);

  const update = field => e => setForm(prev => ({
    ...prev,
    [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.displayName || !form.price) {
      toast.error('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim().toLowerCase(),
        displayName: form.displayName.trim(),
        price: Number(form.price),
        limits: {
          msgLimit: Number(form.msgLimit)    || 0,
          ruleLimit: Number(form.ruleLimit)  || 0,
          customerLimit: Number(form.customerLimit) || 0,
        },
        isActive: form.isActive,
        features: {
          bookingEnabled: form.bookingEnabled,
          paymentLinkEnabled: form.paymentLinkEnabled,
          staffEnabled: form.staffEnabled,
          maxStaff: form.staffEnabled ? Number(form.maxStaff) || 1 : 0,
        },
      };

      await api.put(`${API.PLANS}/${plan._id}`, payload);
      toast.success('Plan updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.userMessage || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal
          open={open}
          onClose={onClose}
          title="Edit Plan"
          description="Update an existing subscription plan"
          className="max-w-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic info - name is read-only */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Internal ID"
                value={form.name}
                disabled
                hint="Cannot be changed after creation"
              />
              <Input
                label="Display Name"
                placeholder="e.g. Starter"
                value={form.displayName}
                onChange={update('displayName')}
                required
              />
            </div>

            <Input
              label="Monthly Price (₹)"
              type="number"
              placeholder="0"
              value={form.price}
              onChange={update('price')}
              required
              min="0"
            />

            {/* Limits */}
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Messages/mo"
                type="number"
                placeholder="0"
                value={form.msgLimit}
                onChange={update('msgLimit')}
                min="0"
              />
              <Input
                label="Chatbot Rules"
                type="number"
                placeholder="0"
                value={form.ruleLimit}
                onChange={update('ruleLimit')}
                min="0"
              />
              <Input
                label="Customers"
                type="number"
                placeholder="0"
                value={form.customerLimit}
                onChange={update('customerLimit')}
                min="0"
              />
            </div>

            {/* Staff limit (conditional) */}
            <AnimatePresence mode="wait">
              {form.staffEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    label="Max Staff Count"
                    type="number"
                    placeholder="e.g. 5"
                    value={form.maxStaff}
                    onChange={update('maxStaff')}
                    min="1"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Toggle
                label="Active (visible to customers)"
                checked={form.isActive}
                onChange={update('isActive')}
              />
              <Toggle
                label="Booking feature"
                checked={form.bookingEnabled}
                onChange={update('bookingEnabled')}
              />
              <Toggle
                label="Payment link feature"
                checked={form.paymentLinkEnabled}
                onChange={update('paymentLinkEnabled')}
              />
              <Toggle
                label="Staff management"
                checked={form.staffEnabled}
                onChange={update('staffEnabled')}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save Changes
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
