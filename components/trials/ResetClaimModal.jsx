// components/trials/ResetClaimModal.jsx
'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { isValidReason, MIN_REASON_LENGTH } from '@/lib/trials';

/**
 * ResetClaimModal — confirm dialog for resetting a trial claim; a reason is required.
 * Props:
 *   open       boolean
 *   claim      { id, phone, businessName } | null — display row from claimRow()
 *   onClose    fn
 *   onConfirm  fn(id, reason) — useTrials().resetClaim (toasts on failure and throws)
 */
export default function ResetClaimModal({ open, claim, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  if (!claim) return null;
  const trimmed = reason.trim();

  const close = () => { setReason(''); onClose(); };

  const confirm = async () => {
    setLoading(true);
    try {
      await onConfirm(claim.id, trimmed);
      close();
    } catch {
      // already toasted by the hook — keep the dialog open
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Reset trial claim?" size="sm">
      <div className="space-y-5">
        <div className="flex gap-3 p-4 rounded-xl bg-warning-bg text-warning-text">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong>{claim.phone}</strong> will be able to claim a free trial again.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-secondary">
            Reason <span className="text-danger-text">*</span>
            <span className="text-xs text-text-tertiary ml-2">
              at least {MIN_REASON_LENGTH} characters
            </span>
          </span>
          <textarea
            className="input-field w-full min-h-[80px]"
            placeholder="e.g. Claimed on the wrong business by mistake"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <div className="modal-actions">
          <Button variant="ghost" onClick={close} disabled={loading}>Cancel</Button>
          <Button variant="danger" loading={loading} disabled={!isValidReason(trimmed)} onClick={confirm}>
            Reset claim
          </Button>
        </div>
      </div>
    </Modal>
  );
}
