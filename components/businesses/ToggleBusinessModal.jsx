// components/businesses/ToggleBusinessModal.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * Confirm dialog before toggling a business active/inactive
 *
 * Props:
 *   open       — boolean
 *   onClose    — () => void
 *   business   — the business object { _id, name, isActive }
 *   onSuccess  — (updatedBusiness) => void — called after successful API call
 */
export default function ToggleBusinessModal({ open, onClose, business, onSuccess }) {
  const [loading, setLoading] = useState(false);

  if (!business) return null;

  const willDeactivate = business.isActive;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const res = await api.put(API.BUSINESS_TOGGLE(business._id));
      const newStatus = res.data.data.isActive;

      toast.success(
        newStatus
          ? `${business.name} is now active.`
          : `${business.name} has been deactivated.`
      );

      onSuccess({ ...business, isActive: newStatus });
    } catch (err) {
      toast.error(err.userMessage || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={willDeactivate ? 'Deactivate Business?' : 'Activate Business?'}
      subtitle={business.name}
      size="sm"
    >
      <div className="space-y-5">

        {/* Warning / info box */}
        <div className={`
          flex gap-3 p-4 rounded-xl
          ${willDeactivate ? 'bg-warning-bg' : 'bg-success-bg'}
        `}>
          {willDeactivate
            ? <AlertTriangle className="w-5 h-5 text-warning-text flex-shrink-0 mt-0.5" />
            : <CheckCircle   className="w-5 h-5 text-success-text flex-shrink-0 mt-0.5" />
          }
          <p className={`text-sm leading-relaxed ${willDeactivate ? 'text-warning-text' : 'text-success-text'}`}>
            {willDeactivate
              ? `Deactivating "${business.name}" will immediately stop their WhatsApp chatbot from responding to any customer messages.`
              : `Activating "${business.name}" will allow their chatbot to start responding to customer messages again.`
            }
          </p>
        </div>

        {/* Confirm / cancel */}
        <div className="flex items-center gap-3 justify-end pt-2">
          <Button variant="ghost" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={willDeactivate ? 'danger' : 'primary'}
            size="md"
            loading={loading}
            onClick={handleConfirm}
          >
            {willDeactivate ? 'Yes, Deactivate' : 'Yes, Activate'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
