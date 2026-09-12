// components/whatsappFlows/PublishToBusinessModal.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Modal  from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import BusinessPicker from '@/components/categoryTemplates/BusinessPicker';

/**
 * PublishToBusinessModal — pushes a flow definition into a business's own
 * WhatsApp account. The backend returns the resulting whatsappFlowStatus on
 * success, and its own verbatim message (surfaced by the hook via
 * err.userMessage) when the flow could only be saved as a partial draft.
 *
 * Props:
 *   open              boolean — is the modal visible?
 *   flow              object  — the flow being published (null when closed)
 *   onClose           fn      — hide modal
 *   publishToBusiness fn      — useWhatsappFlows().publishToBusiness (toasts + refetches internally)
 */
export default function PublishToBusinessModal({ open, flow, onClose, publishToBusiness }) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleClose = () => {
    setBusiness(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!business) {
      toast.error('Please select a business to publish to');
      return;
    }

    setLoading(true);
    try {
      await publishToBusiness(flow._id, { businessId: business._id });
      handleClose();
    } catch {
      // error already toasted by publishToBusiness — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Publish to Business"
      subtitle={flow ? `Publish "${flow.name}" into a business's WhatsApp account` : undefined}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">
            Business to publish to
          </label>
          <BusinessPicker value={business} onChange={setBusiness} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Publish Flow
          </Button>
        </div>
      </form>
    </Modal>
  );
}
