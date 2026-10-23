// components/plans/Toggle.jsx
'use client';

import Switch from '@/components/ui/Switch';

/**
 * Labelled on/off switch used by the plan forms.
 *
 * Props:
 *   label     string
 *   checked   boolean
 *   onChange  (next: boolean) => void
 */
export default function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 sm:gap-2 min-h-[44px] sm:min-h-0">
      <Switch checked={checked} onChange={onChange} label={label} />
      <span className="text-sm text-text-secondary">{label}</span>
    </div>
  );
}
