// components/appRelease/SaveWarningModal.jsx
'use client';

import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * Confirm dialog shown before a save that can lock users out of the app.
 *
 * Props:
 *   open               boolean
 *   onClose            () => void
 *   onConfirm          () => void
 *   loading            boolean — save in progress
 *   minVersion         string  — the minimum version being saved
 *   blocksOldVersions  boolean — force update is on and the minimum is new/raised
 *   maintenance        boolean — maintenance mode is being turned on
 */
export default function SaveWarningModal({
  open, onClose, onConfirm, loading, minVersion, blocksOldVersions, maintenance,
}) {
  return (
    <Modal open={open} onClose={onClose} title="Save these changes?" size="sm">
      <div className="space-y-5">
        <div className="flex gap-3 p-4 rounded-xl bg-warning-bg">
          <AlertTriangle className="w-5 h-5 text-warning-text flex-shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed text-warning-text space-y-2">
            {blocksOldVersions && (
              <p>
                Users below <span className="font-semibold">{minVersion}</span> will be blocked
                from the app until they update.
              </p>
            )}
            {maintenance && (
              <p>
                Maintenance mode is on: <span className="font-semibold">all users</span> will see
                a maintenance screen and cannot use the app.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>Yes, save</Button>
        </div>
      </div>
    </Modal>
  );
}
