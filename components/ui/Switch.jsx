// components/ui/Switch.jsx
'use client';

import { cn } from '@/lib/utils';

/**
 * Switch — on/off toggle (role="switch").
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
        'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        checked ? 'bg-brand-500' : 'bg-bg-overlay border border-border',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={cn(
        'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-6' : 'translate-x-1'
      )} />
    </button>
  );
}
