// components/courseCatalog/DeleteCourseCatalogModal.jsx
'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Modal  from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * DeleteCourseCatalogModal — type-the-name confirmation, same pattern as
 * DeleteVehicleCatalogModal. Businesses that already added this course keep
 * their own copy.
 */
export default function DeleteCourseCatalogModal({ open, entry, onClose, deleteEntry }) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const entryName = entry?.name || 'this course';
  const isConfirmed = confirmText.trim().toLowerCase() === entryName.toLowerCase();

  const handleClose = () => { setConfirmText(''); onClose(); };

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await deleteEntry(entry._id);
      handleClose();
    } catch {
      // error already toasted by deleteEntry — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal open={open} onClose={handleClose} title="Delete Course" subtitle="This removes it from the catalog" size="sm">
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-bg text-warning-text">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Warning</p>
                <p>
                  <strong>{entryName}</strong> will no longer be offered to business owners.
                  Businesses that already added it keep their own copy.
                  To hide it temporarily, use the toggle instead.
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Type <span className="font-semibold text-text-primary">{entryName}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Type "${entryName}"`}
                className="input-field w-full"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button type="button" variant="danger" loading={loading} disabled={!isConfirmed} onClick={handleDelete}>
                Delete Course
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
