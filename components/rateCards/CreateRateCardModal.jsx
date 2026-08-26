// components/rateCards/CreateRateCardModal.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Modal   from '@/components/ui/Modal';
import Input   from '@/components/ui/Input';
import Select  from '@/components/ui/Select';
import Button  from '@/components/ui/Button';
import { RATE_CARD_CATEGORIES } from '@/lib/constants';

const today = () => format(new Date(), 'yyyy-MM-dd');

const initialForm = () => ({
  countryCode:   'IN',
  category:      '',
  priceRupees:   '',
  effectiveFrom: today(),
});

/**
 * CreateRateCardModal — form to add a new rate card row
 * Append-only: this creates, never edits or deletes, matching the backend.
 *
 * Props:
 *   open          boolean
 *   onClose       fn
 *   createRateCard fn(payload) — from useRateCards; toasts + refetches internally
 */
export default function CreateRateCardModal({ open, onClose, createRateCard }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    setForm(initialForm());
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const countryCode = form.countryCode.trim().toUpperCase();
    const priceRupees = Number(form.priceRupees);

    if (!countryCode) {
      toast.error('Country code is required');
      return;
    }
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    if (!form.priceRupees || isNaN(priceRupees) || priceRupees < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!form.effectiveFrom) {
      toast.error('Effective date is required');
      return;
    }

    setLoading(true);
    try {
      await createRateCard({
        country_code:   countryCode,
        category:       form.category,
        price_paise:    Math.round(priceRupees * 100),
        effective_from: form.effectiveFrom,
      });
      handleClose();
    } catch {
      // createRateCard already toasts the error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Rate"
      subtitle="Append a new rate card row — existing rows are never edited"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Country Code"
          placeholder="e.g. IN"
          value={form.countryCode}
          onChange={update('countryCode')}
          maxLength={2}
          required
          helper="ISO 3166-1 alpha-2, e.g. IN"
        />

        <Select
          label="Category"
          options={RATE_CARD_CATEGORIES}
          value={form.category}
          onChange={update('category')}
          required
        />

        <Input
          label="Price"
          type="number"
          prefix="₹"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={form.priceRupees}
          onChange={update('priceRupees')}
          required
          helper="Converted to paise on submit"
        />

        <Input
          label="Effective From"
          type="date"
          value={form.effectiveFrom}
          onChange={update('effectiveFrom')}
          required
          helper="Future dates are allowed, to schedule ahead of a known price change"
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Rate
          </Button>
        </div>
      </form>
    </Modal>
  );
}
