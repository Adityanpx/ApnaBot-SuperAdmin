// components/businesses/GrantPreviewCreditsModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Eye } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * Modal to grant extra manual-preview credits to a business — superadmin-only.
 * Additive: the amount is added to the business's purchased credit balance
 * rather than replacing it, so repeated grants accumulate.
 *
 * Props:
 *   open         — boolean
 *   onClose      — () => void
 *   businessId   — string
 *   businessName — string
 *   onSuccess    — () => void — called after the grant succeeds
 */

export default function GrantPreviewCreditsModal({ open, onClose, businessId, businessName, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset the field each time the modal opens
  useEffect(() => {
    if (open) setAmount('');
  }, [open]);

  const parsedAmount = parseInt(amount, 10);
  const isValid = Number.isInteger(parsedAmount) && parsedAmount > 0;

  const handleConfirm = async () => {
    if (!isValid) {
      toast.error('Please enter a valid number of previews.');
      return;
    }
    try {
      setSaving(true);
      const res = await api.put(API.BUSINESS_PREVIEW_CREDITS(businessId), { amount: parsedAmount });
      const { previewCreditsRemaining } = res.data.data;

      toast.success(`Granted ${parsedAmount} extra ${parsedAmount === 1 ? 'preview' : 'previews'}.`, {
        description: `${previewCreditsRemaining} previews remaining.`,
      });
      onSuccess();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to grant preview credits.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Grant Extra Previews"
      subtitle={businessName}
      size="sm"
    >
      <div className="space-y-5">

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-info-bg border border-info/20">
          <Eye className="w-4 h-4 text-info-text flex-shrink-0" />
          <p className="text-xs text-info-text">
            Added on top of the current preview balance — grants accumulate.
          </p>
        </div>

        <Input
          label="Extra previews"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 25"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && isValid && !saving) handleConfirm(); }}
          autoFocus
        />

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
            disabled={!isValid}
          >
            Grant
          </Button>
        </div>
      </div>
    </Modal>
  );
}
