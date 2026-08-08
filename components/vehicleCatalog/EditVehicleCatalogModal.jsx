// components/vehicleCatalog/EditVehicleCatalogModal.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { Car, Upload, Loader2 } from 'lucide-react';
import Modal   from '@/components/ui/Modal';
import Input   from '@/components/ui/Input';
import Select  from '@/components/ui/Select';
import Button  from '@/components/ui/Button';
import { VEHICLE_TYPES } from '@/lib/constants';

/**
 * EditVehicleCatalogModal — form to edit an existing vehicle catalog entry
 * Props:
 *   open        boolean — is the modal visible?
 *   entry       object  — the catalog entry being edited (null when closed)
 *   onClose     fn      — hide modal
 *   updateEntry fn      — useVehicleCatalog().updateEntry (toasts + refetches internally)
 *   uploadImage fn      — useVehicleCatalog().uploadImage
 */
export default function EditVehicleCatalogModal({ open, entry, onClose, updateEntry, uploadImage }) {
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    type: '',
    seats: '',
    order: '',
    photoUrl: '',
  });

  // Populate form when entry changes
  useEffect(() => {
    if (entry) {
      setForm({
        name: entry.name || '',
        type: entry.type || '',
        seats: entry.seats?.toString() || '',
        order: entry.order?.toString() || '0',
        photoUrl: entry.photoUrl || '',
      });
    }
  }, [entry]);

  const update = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setForm(prev => ({ ...prev, photoUrl: imageUrl }));
    } catch (err) {
      toast.error(err.userMessage || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.type) {
      toast.error('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        seats: form.seats === '' ? undefined : Number(form.seats),
        order: Number(form.order) || 0,
        photoUrl: form.photoUrl || null,
      };

      await updateEntry(entry._id, payload);
      onClose();
    } catch {
      // error already toasted by updateEntry — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal
          open={open}
          onClose={onClose}
          title="Edit Vehicle Type"
          subtitle="Update an existing vehicle catalog entry"
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-bg-subtle flex items-center justify-center overflow-hidden flex-shrink-0">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-text-tertiary animate-spin" />
                  ) : form.photoUrl ? (
                    <img src={form.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Car className="w-7 h-7 text-text-disabled" />
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="vehicle-catalog-edit-image-input"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={Upload}
                    loading={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {form.photoUrl ? 'Replace image' : 'Upload image'}
                  </Button>
                </div>
              </div>
            </div>

            <Input
              label="Name"
              placeholder="e.g. Swift Dzire"
              value={form.name}
              onChange={update('name')}
              required
            />

            <Select
              label="Type"
              options={VEHICLE_TYPES}
              value={form.type}
              onChange={update('type')}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Seats"
                type="number"
                placeholder="Optional"
                value={form.seats}
                onChange={update('seats')}
                min="1"
              />
              <Input
                label="Display Order"
                type="number"
                placeholder="0"
                value={form.order}
                onChange={update('order')}
                min="0"
                hint="Lower numbers show first"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AnimatePresence>
  );
}
