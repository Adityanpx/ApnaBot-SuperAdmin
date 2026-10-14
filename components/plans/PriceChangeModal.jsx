// components/plans/PriceChangeModal.jsx
'use client';

import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

/**
 * Confirm dialog shown before saving a plan whose monthly price or discount changed.
 *
 * Props:
 *   open       boolean
 *   change     { oldMonthly, newMonthly, tiers[] } from pricingChange(), or null
 *   loading    boolean — save in progress
 *   onClose    () => void
 *   onConfirm  () => void
 */
export default function PriceChangeModal({ open, change, loading, onClose, onConfirm }) {
  if (!change) return null;
  return (
    <Modal open={open} onClose={onClose} title="Save price change?" size="sm">
      <div className="space-y-5">
        <div className="flex gap-3 p-4 rounded-xl bg-warning-bg">
          <AlertTriangle className="w-5 h-5 text-warning-text flex-shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed text-warning-text">
            Existing subscribers keep their old price. New subscribers pay the new price.
          </p>
        </div>

        <div className="space-y-1.5 text-sm">
          <PriceRow label="Monthly" from={change.oldMonthly} to={change.newMonthly} />
          {change.tiers.map((t) => (
            <PriceRow key={t.months} label={t.label} from={t.oldPrice} to={t.newPrice} />
          ))}
        </div>

        <div className="flex items-center gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button loading={loading} onClick={onConfirm}>Yes, save</Button>
        </div>
      </div>
    </Modal>
  );
}

function PriceRow({ label, from, to }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className="font-semibold text-text-primary">
        {formatCurrency(from)} → {formatCurrency(to)}
      </span>
    </div>
  );
}
