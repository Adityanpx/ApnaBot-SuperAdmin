// components/courseCatalog/CourseCatalogFormModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import Modal  from '@/components/ui/Modal';
import Input  from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { COURSE_LIMITS } from '@/lib/constants';
import { COURSE_MODE_LABELS, coursePageText, hasStructuredDetails } from '@/lib/coursePage';

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
  const [form, setForm] = useState({
    name: '', description: '', details: '', groupName: '', ageGroup: '', duration: '', fees: '', mode: '', moreDetails: '', batchesText: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: entry?.name || '',
        description: entry?.description || '',
        details: entry?.details || '',
        groupName: entry?.groupName || '',
        ageGroup: entry?.ageGroup || '',
        duration: entry?.duration || '',
        fees: entry?.fees || '',
        mode: entry?.mode || '',
        moreDetails: entry?.moreDetails || '',
        batchesText: (entry?.batches || []).join('\n'),
      });
    }
  }, [open, entry]);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  // Suggested batches: one per line in the box, a list on the server.
  const batches = form.batchesText.split('\n').map((b) => b.trim()).filter(Boolean);
  const batchProblem = batches.length > COURSE_LIMITS.BATCHES
    ? `At most ${COURSE_LIMITS.BATCHES} batches`
    : batches.some((b) => b.length > COURSE_LIMITS.BATCH)
      ? `Each batch must be ${COURSE_LIMITS.BATCH} characters or less`
      : batches.some((b, i) => batches.findIndex((x) => x.toLowerCase() === b.toLowerCase()) !== i)
        ? 'A batch is listed twice'
        : null;
  const usesFields = hasStructuredDetails(form);
  const page = coursePageText({ ...form, batches });
  const tooLong = form.name.trim().length > COURSE_LIMITS.NAME
    || form.description.trim().length > COURSE_LIMITS.DESCRIPTION
    || form.details.trim().length > COURSE_LIMITS.DETAILS
    || form.groupName.trim().length > COURSE_LIMITS.GROUP
    || [form.ageGroup, form.duration, form.fees].some((v) => v.trim().length > COURSE_LIMITS.LINE)
    || form.moreDetails.trim().length > COURSE_LIMITS.MORE_DETAILS;

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
    if (batchProblem) {
      toast.error(batchProblem);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim() || null,
        details: form.details.trim() || null,
        groupName: form.groupName.trim() || null,
        ageGroup: form.ageGroup.trim() || null,
        duration: form.duration.trim() || null,
        fees: form.fees.trim() || null,
        mode: form.mode || null,
        moreDetails: form.moreDetails.trim() || null,
        batches,
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
            <p className="text-xs text-text-tertiary">
              Course page details — use <strong>____</strong> for things each institute must fill in (fees, duration);
              they can&apos;t publish until they do.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="👦 Age / eligibility" placeholder="e.g. 6 years and above" value={form.ageGroup} onChange={update('ageGroup')}
                helper={counter(form.ageGroup, COURSE_LIMITS.LINE)} />
              <Input label="🕘 Duration" placeholder="e.g. ____ per level" value={form.duration} onChange={update('duration')}
                helper={counter(form.duration, COURSE_LIMITS.LINE)} />
              <Input label="💰 Fees" placeholder="e.g. ₹____ per level" value={form.fees} onChange={update('fees')}
                helper={counter(form.fees, COURSE_LIMITS.LINE)} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">💻 Mode</label>
                <select className="input-field w-full" value={form.mode} onChange={update('mode')}>
                  <option value="">Leave to the institute</option>
                  {Object.entries(COURSE_MODE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">More details (optional)</label>
              <textarea
                className="input-field w-full min-h-[90px] resize-y"
                placeholder={'e.g. 📚 Subjects: Physics, Chemistry, Maths\n📝 Regular tests & doubt sessions'}
                value={form.moreDetails}
                onChange={update('moreDetails')}
              />
              <p className="text-xs text-text-tertiary">{counter(form.moreDetails, COURSE_LIMITS.MORE_DETAILS)}</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">🗓 Suggested batches (optional, one per line)</label>
              <textarea
                className="input-field w-full min-h-[70px] resize-y"
                placeholder={'e.g. Mon–Fri 5–6 pm\nSat–Sun 10–11 am'}
                value={form.batchesText}
                onChange={update('batchesText')}
              />
              <p className={`text-xs ${batchProblem ? 'text-danger-text font-semibold' : 'text-text-tertiary'}`}>
                {batchProblem || 'Copied to a business when they add this course — usually best left empty, since timings differ per institute.'}
              </p>
            </div>
            {(form.details.trim() || !usesFields) && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">Old details text</label>
                <textarea
                  className="input-field w-full min-h-[90px] resize-y"
                  value={form.details}
                  onChange={update('details')}
                  disabled={usesFields}
                />
                <p className="text-xs text-text-tertiary">
                  {usesFields ? 'Not used — the course page is built from the fields above.' : 'Used only while the fields above are empty.'}
                  {' '}· {counter(form.details, COURSE_LIMITS.DETAILS)}
                </p>
              </div>
            )}
            {page && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">WhatsApp course page</label>
                <div className="text-xs text-text-secondary bg-bg-subtle rounded-lg px-3 py-2 whitespace-pre-line">{page}</div>
              </div>
            )}

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
