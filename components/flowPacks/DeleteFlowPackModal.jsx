// components/flowPacks/DeleteFlowPackModal.jsx
'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Modal   from '@/components/ui/Modal';
import Button  from '@/components/ui/Button';

/**
 * DeleteFlowPackModal — confirmation dialog to delete a flow pack
 * Props:
 *   open        boolean — is the modal visible?
 *   pack        object  — the flow pack being deleted (null when closed)
 *   onClose     fn      — hide modal
 *   deletePack  fn      — useFlowPacks().deletePack (toasts + refetches internally)
 */
export default function DeleteFlowPackModal({ open, pack, onClose, deletePack }) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const packName = pack?.name || 'this flow pack';
  const isConfirmed = confirmText.toLowerCase() === packName.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setLoading(true);
    try {
      await deletePack(pack._id);
      onClose();
      setConfirmText('');
    } catch {
      // error already toasted by deletePack — keep the modal open
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
          title="Delete Flow Pack"
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
                  Deleting <strong>{packName}</strong> will remove it permanently.
                </p>
              </div>
            </div>

            {/* Confirmation input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Type <span className="font-semibold text-text-primary">{packName}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={`Type "${packName}"`}
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
                Delete Flow Pack
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
