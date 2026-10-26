// components/businessRequests/EditRequestModal.jsx
'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import {
  REQUEST_STATUSES, STATUS_LABELS, NOTES_MAX, validateNotes, requestChanges,
} from '@/lib/businessRequests';

/**
 * EditRequestModal — change a request's status and notes.
 * Props:
 *   open       boolean
 *   row        display row from requestRow() | null
 *   onClose    fn
 *   onSave     fn(id, body) — useBusinessRequests().updateRequest (toasts on failure and throws)
 */
export default function EditRequestModal({ open, row, onClose, onSave }) {
  if (!row) return null;
  // Remounted per request so the fields start from that request's values.
  return <EditForm key={row.id} open={open} row={row} onClose={onClose} onSave={onSave} />;
}

function EditForm({ open, row, onClose, onSave }) {
  const [status, setStatus] = useState(row.status);
  const [notes, setNotes] = useState(row.notes);
  const [saving, setSaving] = useState(false);
  const error = validateNotes(notes);
  const changes = requestChanges(row, { status, notes });

  const save = async () => {
    setSaving(true);
    try {
      await onSave(row.id, changes);
      onClose();
    } catch {
      // already toasted by the hook - keep the dialog open
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit request" subtitle={row.businessName} size="md">
      <div className="space-y-5">
        <p className="text-sm text-text-secondary break-words">
          Requested: <span className="text-text-primary">{row.requestedText}</span>
        </p>
        <Select
          label="Status"
          placeholder={null}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={REQUEST_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-secondary">
            Notes <span className="text-xs text-text-tertiary ml-2">{notes.length}/{NOTES_MAX}</span>
          </span>
          <textarea
            className="input-field w-full min-h-[100px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {error && <p className="text-xs text-danger-text">{error}</p>}
        </label>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button loading={saving} disabled={!changes || !!error} onClick={save}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
