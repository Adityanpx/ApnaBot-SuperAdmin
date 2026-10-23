// components/ui/RowMenu.jsx
'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

/**
 * RowMenu — the "⋯" button on a mobile card. Opens a bottom sheet of actions
 * (each row 48px tall). Meant for card layouts below 768px; desktop tables keep
 * their inline icon buttons.
 *
 * Props:
 *   title    string — sheet heading (the row's name, so it is clear what the actions apply to)
 *   actions  [{ label, icon?, onClick, danger?, hidden? }]
 */
export default function RowMenu({ title, actions }) {
  const [open, setOpen] = useState(false);
  const visible = actions.filter((a) => !a.hidden);
  if (visible.length === 0) return null;

  const run = (action) => {
    setOpen(false);
    // Let the sheet close before a follow-up modal opens
    setTimeout(() => action.onClick?.(), 0);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={title ? `Actions for ${title}` : 'Actions'}
        aria-haspopup="dialog"
        className="icon-btn text-text-tertiary hover:text-text-primary hover:bg-bg-subtle"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title} variant="sheet" size="sm">
        <ul className="-my-2 -mx-2">
          {visible.map((action) => {
            const Icon = action.icon;
            return (
              <li key={action.label}>
                <button
                  type="button"
                  onClick={() => run(action)}
                  className={cn(
                    'w-full min-h-[48px] flex items-center gap-3 px-3 rounded-xl text-sm font-medium text-left',
                    'transition-colors duration-150',
                    action.danger
                      ? 'text-danger-text hover:bg-danger-bg'
                      : 'text-text-primary hover:bg-bg-subtle'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                  {action.label}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}
