// components/shops/ExtendSubModal.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarClock } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * Modal to extend a shop's subscription by a preset number of days
 *
 * Props:
 *   open           — boolean
 *   onClose        — () => void
 *   shopId         — string
 *   shopName       — string
 *   currentEndDate — ISO date string
 *   onSuccess      — () => void
 */

const PRESET_OPTIONS = [
  { days: 7,   label: '7 Days',   description: 'Short trial extension' },
  { days: 14,  label: '14 Days',  description: 'Two week buffer' },
  { days: 30,  label: '30 Days',  description: 'One full month' },
  { days: 90,  label: '90 Days',  description: 'Quarterly extension' },
];

export default function ExtendSubModal({
  open,
  onClose,
  shopId,
  shopName,
  currentEndDate,
  onSuccess,
}) {
  const [selectedDays, setSelectedDays]   = useState(30);
  const [customDays,   setCustomDays]     = useState('');
  const [useCustom,    setUseCustom]      = useState(false);
  const [saving,       setSaving]         = useState(false);

  const effectiveDays = useCustom ? parseInt(customDays) || 0 : selectedDays;

  // Calculate new end date preview
  const newEndDate = (() => {
    if (!currentEndDate || effectiveDays <= 0) return null;
    const current = new Date(currentEndDate) > new Date()
      ? new Date(currentEndDate)
      : new Date();
    const next = new Date(current.getTime() + effectiveDays * 24 * 60 * 60 * 1000);
    return formatDate(next.toISOString());
  })();

  const handleConfirm = async () => {
    if (effectiveDays <= 0) {
      toast.error('Please enter a valid number of days.');
      return;
    }
    try {
      setSaving(true);
      await api.put(API.SHOP_EXTEND(shopId), { days: effectiveDays });
      toast.success(`Subscription extended by ${effectiveDays} days.`);
      onSuccess();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to extend subscription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Extend Subscription"
      subtitle={shopName}
      size="sm"
    >
      <div className="space-y-5">

        {/* Current end date */}
        {currentEndDate && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-bg-subtle">
            <CalendarClock className="w-4 h-4 text-text-tertiary flex-shrink-0" />
            <div>
              <p className="text-xs text-text-tertiary">Current end date</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">
                {formatDate(currentEndDate)}
              </p>
            </div>
          </div>
        )}

        {/* Preset day selector */}
        <div>
          <p className="text-sm font-medium text-text-secondary mb-3">Extend by</p>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                onClick={() => { setSelectedDays(opt.days); setUseCustom(false); }}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all duration-200',
                  !useCustom && selectedDays === opt.days
                    ? 'border-brand-500 bg-info-bg'
                    : 'border-border bg-bg-subtle hover:border-border-strong'
                )}
              >
                <p className="text-sm font-semibold text-text-primary">{opt.label}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom days toggle */}
        <div>
          <button
            onClick={() => setUseCustom(!useCustom)}
            className="text-xs text-info-text hover:underline"
          >
            {useCustom ? '← Use preset options' : 'Enter custom days'}
          </button>
          {useCustom && (
            <input
              type="number"
              min="1"
              max="365"
              placeholder="e.g. 45"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="input-field mt-2"
              autoFocus
            />
          )}
        </div>

        {/* New end date preview */}
        {newEndDate && (
          <div className="p-3.5 rounded-xl bg-success-bg border border-success/20">
            <p className="text-xs text-success-text font-medium">New end date</p>
            <p className="text-sm font-bold text-success-text mt-0.5">{newEndDate}</p>
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
            disabled={effectiveDays <= 0}
          >
            Extend by {effectiveDays > 0 ? effectiveDays : '…'} Days
          </Button>
        </div>
      </div>
    </Modal>
  );
}
