// components/vehicleCatalog/DeleteVehicleCatalogModal.jsx
'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Modal   from '@/components/ui/Modal';
import Button  from '@/components/ui/Button';

/**
 * DeleteVehicleCatalogModal — confirmation dialog to delete a vehicle catalog entry
 * Props:
 *   open        boolean — is the modal visible?
 *   entry       object  — the catalog entry being deleted (null when closed)
 *   onClose     fn      — hide modal
 *   deleteEntry fn      — useVehicleCatalog().deleteEntry (toasts + refetches internally)
 */
export default function DeleteVehicleCatalogModal({ open, entry, onClose, deleteEntry }) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const entryName = entry?.name || 'this vehicle type';
  const isConfirmed = confirmText.toLowerCase() === entryName.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setLoading(true);
    try {
      await deleteEntry(entry._id);
      onClose();
      setConfirmText('');
    } catch {
      // error already toasted by deleteEntry — keep the modal open
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
          title="Delete Vehicle Type"
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
                  Deleting <strong>{entryName}</strong> will remove it permanently.
                  Business owners will no longer be able to select this vehicle type.
                </p>
              </div>
            </div>

            {/* Confirmation input */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Type <span className="font-semibold text-text-primary">{entryName}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={`Type "${entryName}"`}
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
                Delete Vehicle Type
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
