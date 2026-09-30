// components/courseCatalog/CourseCatalogFormModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import Modal  from '@/components/ui/Modal';
import Input  from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { COURSE_LIMITS } from '@/lib/constants';

/**
 * CourseCatalogFormModal — add or edit a course catalog entry
 * Props:
 *   open     boolean
 *   entry    object|null — null = add, row = edit
 *   onClose  fn
 *   onSubmit fn(payload) — createEntry or (payload) => updateEntry(entry._id, payload);
 *                          toasts + refetches internally, throws on failure
 */
export default function CourseCatalogFormModal({ open, entry, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', details: '', groupName: '' });

  useEffect(() => {
    if (open) {
      setForm({
        name: entry?.name || '',
        description: entry?.description || '',
        details: entry?.details || '',
        groupName: entry?.groupName || '',
      });
    }
  }, [open, entry]);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const tooLong = form.name.trim().length > COURSE_LIMITS.NAME
    || form.description.trim().length > COURSE_LIMITS.DESCRIPTION
    || form.details.trim().length > COURSE_LIMITS.DETAILS
    || form.groupName.trim().length > COURSE_LIMITS.GROUP;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Course name is required');
      return;
    }
    if (tooLong) {
      toast.error('Some text is too long — see the character counters');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim() || null,
        details: form.details.trim() || null,
        groupName: form.groupName.trim() || null,
      });
      onClose();
    } catch {
      // error already toasted by the hook — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  const counter = (value, max) => {
    const n = value.trim().length;
    return <span className={n > max ? 'text-danger-text font-semibold' : ''}>{n}/{max}</span>;
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal
          open={open}
          onClose={onClose}
          title={entry ? 'Edit Course' : 'Add Course'}
          subtitle="Starting text businesses copy and then edit for their own institute"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Course name"
              placeholder="e.g. JEE Main + Advanced"
              value={form.name}
              onChange={update('name')}
              required
              helper={<>Shown as a WhatsApp list item · {counter(form.name, COURSE_LIMITS.NAME)}</>}
            />
            <Input
              label="Short description"
              placeholder="e.g. Engineering entrance prep, 11th & 12th"
              value={form.description}
              onChange={update('description')}
              helper={<>Shown under the course name in the list · {counter(form.description, COURSE_LIMITS.DESCRIPTION)}</>}
            />
            <Input
              label="Suggested group (optional)"
              placeholder="e.g. JEE / NEET, Foundation, Skill classes"
              value={form.groupName}
              onChange={update('groupName')}
              helper={<>Copied to a business when they add this course; they can change it. With 2+ groups, WhatsApp shows groups first · {counter(form.groupName, COURSE_LIMITS.GROUP)}</>}
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Details page (starting text)</label>
              <textarea
                className="input-field w-full min-h-[160px] resize-y"
                placeholder={'🎯 JEE Main + Advanced\n📚 Subjects: Physics, Chemistry, Maths\n🕘 Duration: ____\n💰 Fees: ₹____'}
                value={form.details}
                onChange={update('details')}
              />
              <p className="text-xs text-text-tertiary">
                Use <strong>____</strong> for things each institute must fill in (fees, duration) — they can&apos;t publish
                until they do · {counter(form.details, COURSE_LIMITS.DETAILS)}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" loading={loading}>{entry ? 'Save Changes' : 'Add Course'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </AnimatePresence>
  );
}
