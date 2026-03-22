// components/plans/DeletePlanModal.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import Modal   from '@/components/ui/Modal';
import Button  from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

/**
 * DeletePlanModal — confirmation dialog to delete a plan
 * Props:
 *   open     boolean — is the modal visible?
 *   plan     object  — the plan being deleted (null when closed)
 *   onClose  fn      — hide modal
 *   onSuccess fn     — called after successful deletion (to refresh list)
 */
export default function DeletePlanModal({ open, plan, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const planName = plan?.displayName || plan?.name || 'this plan';
  const isConfirmed = confirmText.toLowerCase() === planName.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setLoading(true);
    try {
      await api.delete(`${API.PLANS}/${plan._id}`);
      toast.success('Plan deleted successfully');
      onSuccess();
      onClose();
      setConfirmText('');
    } catch (err) {
      toast.error(err.response?.data?.userMessage || 'Failed to delete plan');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal
          open={open}
          onClose={handleClose}
          title="Delete Plan"
          description="This action cannot be undone"
          className="max-w-md"
        >
          <div className="space-y-5">
            {/* Warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-bg text-warning-text">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Warning</p>
                <p>
                  Deleting <strong>{planName}</strong> will remove it permanently.
                  All shops currently on this plan will lose access to its features.
                </p>
              </div>
            </div>

            {/* Confirmation input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Type <span className="font-semibold text-text-primary">{planName}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={`Type "${planName}"`}
                className="input input-bordered w-full"
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-border-subtle">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={loading}
                disabled={!isConfirmed}
              >
                Delete Plan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
