// components/ui/Switch.jsx
'use client';

import { cn } from '@/lib/utils';

/**
 * Switch — on/off toggle (role="switch").
 *
 * The track grows on phones and an invisible ::before pad extends the tap area
 * to at least 44px tall, so it is easy to hit with a thumb.
 *
 * Props:
 *   checked    bool
 *   onChange   fn(next: bool)
 *   label      string — accessible name
 *   disabled   bool
 */
export default function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 max-md:h-7 max-md:w-14 flex-shrink-0 items-center rounded-full',
        "before:content-[''] before:absolute before:-inset-x-1 before:-inset-y-2.5",
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        checked ? 'bg-brand-500' : 'bg-bg-overlay border border-border',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={cn(
        'inline-block h-4 w-4 max-md:h-5 max-md:w-5 rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-6 max-md:translate-x-8' : 'translate-x-1'
      )} />
    </button>
  );
}
