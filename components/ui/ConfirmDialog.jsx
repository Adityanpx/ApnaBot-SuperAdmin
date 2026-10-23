// components/ui/ConfirmDialog.jsx
'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * ConfirmDialog — confirm a risky change, always naming what it is applied to.
 *
 * Props:
 *   open, onClose
 *   title          string
 *   subject        string — the business / category / template name; shown in the header
 *                  and in the message so it is unmistakable on a small screen
 *   children       the explanation of what will happen
 *   confirmLabel   string (default "Confirm")
 *   danger         bool — red button
 *   requireText    string — if set, the user must type it before the button enables
 *   onConfirm      async fn — close happens after it resolves (return false to stay open)
 */
export default function ConfirmDialog({
  open, onClose, title, subject, children,
  confirmLabel = 'Confirm', danger = true, requireText, onConfirm,
}) {
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) setTyped(''); }, [open]);

  const ready = !requireText || typed.trim().toLowerCase() === requireText.trim().toLowerCase();

  const handleConfirm = async () => {
    if (!ready) return;
    setLoading(true);
    try {
      const result = await onConfirm();
      if (result !== false) onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title={title} subtitle={subject} size="sm">
      <div className="space-y-5">
        <div className={`flex gap-3 p-4 rounded-xl ${danger ? 'bg-danger-bg' : 'bg-warning-bg'}`}>
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${danger ? 'text-danger-text' : 'text-warning-text'}`} />
          <div className={`text-sm leading-relaxed min-w-0 break-words ${danger ? 'text-danger-text' : 'text-warning-text'}`}>
            {children}
          </div>
        </div>

        {requireText && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Type <span className="font-semibold text-text-primary break-all">{requireText}</span> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireText}
              className="input-field"
              autoCapitalize="off"
              autoCorrect="off"
            />
          </div>
        )}

        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} disabled={!ready} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
