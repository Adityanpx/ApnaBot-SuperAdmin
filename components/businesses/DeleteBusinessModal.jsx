// components/businesses/DeleteBusinessModal.jsx
'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

// Matches the tables cascade-deleted by DELETE /api/admin/businesses/:id
const DELETED_ITEMS = [
  'Rules', 'Bookings', 'Customers', 'Vehicles',
  'Route fares', 'Rental packages', 'Subscriptions', 'Staff accounts',
];

/**
 * DeleteBusinessModal — destructive, irreversible confirmation dialog
 * Requires typing the business name to enable the delete button.
 *
 * Props:
 *   open      boolean — is the modal visible?
 *   business  object  — the business being deleted (null when closed)
 *   onClose   fn      — hide modal
 *   onConfirm fn      — async (businessId) => boolean — performs the delete;
 *                       return true on success to close the modal
 */
export default function DeleteBusinessModal({ open, business, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!business) return null;

  const isConfirmed = confirmText.trim().toLowerCase() === business.name.toLowerCase();

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    const success = await onConfirm(business._id);
    setLoading(false);
    if (success) {
      setConfirmText('');
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Delete Business?"
      subtitle={business.name}
      size="sm"
    >
      <div className="space-y-5">

        {/* Warning */}
        <div className="flex gap-3 p-4 rounded-xl bg-danger-bg">
          <AlertTriangle className="w-5 h-5 text-danger-text flex-shrink-0 mt-0.5" />
          <div className="text-sm text-danger-text leading-relaxed">
            <p className="font-semibold mb-1">This action is permanent and cannot be undone.</p>
            <p>
              Deleting <strong>{business.name}</strong> will immediately stop their WhatsApp chatbot
              and permanently remove the business, its owner account, and all related data:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-0.5">
              {DELETED_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Confirmation input */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Type <span className="font-semibold text-text-primary">{business.name}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Type "${business.name}"`}
            className="input input-bordered w-full"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end pt-2 border-t border-border-subtle">
          <Button variant="ghost" size="md" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={loading}
            disabled={!isConfirmed}
            onClick={handleDelete}
          >
            Delete Business
          </Button>
        </div>
      </div>
    </Modal>
  );
}
