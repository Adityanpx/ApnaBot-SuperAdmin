// components/shops/ChangePlanModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { cn, formatCurrency, formatLimit } from '@/lib/utils';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * Modal to pick a new plan for a shop and assign it
 *
 * Props:
 *   open          — boolean
 *   onClose       — () => void
 *   shopId        — string
 *   currentPlanId — string (to highlight current plan)
 *   onSuccess     — () => void — called after plan change
 */
export default function ChangePlanModal({ open, onClose, shopId, currentPlanId, onSuccess }) {
  const [plans,        setPlans]        = useState([]);
  const [selected,     setSelected]     = useState(currentPlanId || '');
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [saving,       setSaving]       = useState(false);

  // Fetch active plans when modal opens
  useEffect(() => {
    if (!open) return;
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const res = await api.get(API.PLANS);
        // Only show active plans
        setPlans(res.data.data.plans.filter((p) => p.isActive));
        setSelected(currentPlanId || '');
      } catch (err) {
        toast.error('Failed to load plans');
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [open, currentPlanId]);

  const handleConfirm = async () => {
    if (!selected || selected === currentPlanId) {
      toast.info('Please select a different plan.');
      return;
    }
    try {
      setSaving(true);
      await api.put(API.SHOP_PLAN(shopId), { planId: selected });
      const chosenPlan = plans.find((p) => p._id === selected);
      toast.success(`Plan changed to ${chosenPlan?.displayName}.`);
      onSuccess();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to change plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change Subscription Plan"
      subtitle="Select a new plan to assign to this shop."
      size="md"
    >
      <div className="space-y-5">

        {/* Plan selector */}
        {loadingPlans ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan, i) => {
              const isCurrentPlan = plan._id === currentPlanId;
              const isSelected    = plan._id === selected;

              return (
                <motion.button
                  key={plan._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(plan._id)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-all duration-200',
                    isSelected
                      ? 'border-brand-500 bg-info-bg shadow-glow-brand'
                      : 'border-border bg-bg-subtle hover:border-border-strong hover:bg-bg-overlay'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-text-primary">
                          {plan.displayName}
                        </span>
                        {isCurrentPlan && (
                          <span className="badge badge-info text-[10px]">Current</span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-text-primary mt-1">
                        {formatCurrency(plan.price)}
                        <span className="text-xs font-normal text-text-tertiary">/mo</span>
                      </p>
                      {/* Key limits inline */}
                      <p className="text-xs text-text-tertiary mt-2">
                        {formatLimit(plan.msgLimit)} msgs ·{' '}
                        {formatLimit(plan.ruleLimit)} rules ·{' '}
                        {formatLimit(plan.customerLimit)} customers
                        {plan.staffEnabled ? ` · ${plan.maxStaff} staff` : ''}
                        {plan.paymentLinkEnabled ? ' · Payments' : ''}
                      </p>
                    </div>

                    {/* Selected indicator */}
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1',
                      isSelected
                        ? 'bg-brand-500 border-brand-500'
                        : 'border-border'
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end pt-2 border-t border-border-subtle">
          <Button variant="ghost" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={saving}
            onClick={handleConfirm}
            disabled={!selected || selected === currentPlanId}
          >
            Confirm Change
          </Button>
        </div>
      </div>
    </Modal>
  );
}
