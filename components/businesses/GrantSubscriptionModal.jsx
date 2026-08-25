// components/businesses/GrantSubscriptionModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { cn, formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * Modal to manually grant/override a business's subscription — superadmin-only,
 * bypasses payment entirely. Full control over plan, status, and duration.
 *
 * Props:
 *   open         — boolean
 *   onClose      — () => void
 *   businessId   — string
 *   businessName — string
 *   onSuccess    — () => void — called after the grant succeeds
 */

const STATUS_OPTIONS = [
  { value: 'trial',     label: 'Trial' },
  { value: 'active',    label: 'Active' },
  { value: 'expired',   label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DURATION_PRESETS = [7, 15, 30];

export default function GrantSubscriptionModal({ open, onClose, businessId, businessName, onSuccess }) {
  const [plans,        setPlans]        = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [planId,       setPlanId]       = useState('');
  const [status,       setStatus]       = useState('active');
  const [selectedDays, setSelectedDays] = useState(30);
  const [customDays,   setCustomDays]   = useState('');
  const [useCustom,    setUseCustom]    = useState(false);
  const [saving,       setSaving]       = useState(false);

  const durationDays = useCustom ? parseInt(customDays) || 0 : selectedDays;

  // Fetch active plans when modal opens
  useEffect(() => {
    if (!open) return;
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const res = await api.get(API.PLANS);
        const activePlans = res.data.data.plans.filter((p) => p.isActive);
        setPlans(activePlans);
        setPlanId(activePlans[0]?.id || '');
        setStatus('active');
        setSelectedDays(30);
        setUseCustom(false);
        setCustomDays('');
      } catch (err) {
        toast.error('Failed to load plans');
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [open]);

  const handleConfirm = async () => {
    if (!planId) {
      toast.error('Please select a plan.');
      return;
    }
    if (durationDays <= 0) {
      toast.error('Please enter a valid number of days.');
      return;
    }
    try {
      setSaving(true);
      await api.post(API.BUSINESS_GRANT_SUBSCRIPTION(businessId), { planId, status, durationDays });
      toast.success('Subscription granted successfully.');
      onSuccess();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to grant subscription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Grant Subscription"
      subtitle={businessName}
      size="sm"
    >
      <div className="space-y-5">

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-info-bg border border-info/20">
          <ShieldCheck className="w-4 h-4 text-info-text flex-shrink-0" />
          <p className="text-xs text-info-text">
            Manual override — this bypasses payment and directly creates a subscription record.
          </p>
        </div>

        {/* Plan selector */}
        {loadingPlans ? (
          <div className="flex items-center justify-center py-6">
            <Spinner size="lg" />
          </div>
        ) : (
          <Select
            label="Plan"
            options={plans.map((p) => ({
              value: p.id,
              label: `${p.displayName} — ${formatCurrency(p.price)}/mo`,
            }))}
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          />
        )}

        {/* Status selector */}
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />

        {/* Duration selector */}
        <div>
          <p className="text-sm font-medium text-text-secondary mb-3">Duration</p>
          <div className="grid grid-cols-3 gap-2">
            {DURATION_PRESETS.map((days) => (
              <button
                key={days}
                onClick={() => { setSelectedDays(days); setUseCustom(false); }}
                className={cn(
                  'p-3 rounded-xl border text-center transition-all duration-200',
                  !useCustom && selectedDays === days
                    ? 'border-brand-500 bg-info-bg'
                    : 'border-border bg-bg-subtle hover:border-border-strong'
                )}
              >
                <p className="text-sm font-semibold text-text-primary">{days} Days</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setUseCustom(!useCustom)}
            className="text-xs text-info-text hover:underline mt-3"
          >
            {useCustom ? '← Use preset options' : 'Enter custom days'}
          </button>
          {useCustom && (
            <input
              type="number"
              min="1"
              placeholder="e.g. 45"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="input-field mt-2"
              autoFocus
            />
          )}
        </div>

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
            disabled={!planId || durationDays <= 0 || loadingPlans}
          >
            Grant Subscription
          </Button>
        </div>
      </div>
    </Modal>
  );
}
