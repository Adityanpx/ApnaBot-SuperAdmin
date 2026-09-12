// components/whatsappFlows/DeleteFlowModal.jsx
'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal  from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * DeleteFlowModal — confirmation dialog to delete a WhatsApp flow
 * Props:
 *   open       boolean — is the modal visible?
 *   flow       object  — the flow being deleted (null when closed)
 *   onClose    fn      — hide modal
 *   deleteFlow fn      — useWhatsappFlows().deleteFlow (toasts + refetches internally)
 */
export default function DeleteFlowModal({ open, flow, onClose, deleteFlow }) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const flowName = flow?.name || 'this flow';
  const isConfirmed = confirmText.toLowerCase() === flowName.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setLoading(true);
    try {
      await deleteFlow(flow._id);
      onClose();
      setConfirmText('');
    } catch {
      // error already toasted by deleteFlow — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Delete WhatsApp Flow"
      subtitle="This action cannot be undone"
      size="sm"
    >
      <div className="space-y-5">
        {/* Warning */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-bg text-warning-text">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Warning</p>
            <p>
              Deleting <strong>{flowName}</strong> will remove it permanently.
            </p>
          </div>
        </div>

        {/* Confirmation input */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Type <span className="font-semibold text-text-primary">{flowName}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Type "${flowName}"`}
            className="input-field w-full"
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
            Delete Flow
          </Button>
        </div>
      </div>
    </Modal>
  );
}
