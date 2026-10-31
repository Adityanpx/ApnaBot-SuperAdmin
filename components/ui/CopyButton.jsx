// components/ui/CopyButton.jsx
'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/** Icon button that copies `value` to the clipboard. Props: value, label (a11y name), className */
export default function CopyButton({ value, label = 'value', className }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy — long-press to select it');
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className={cn(
        'icon-btn !w-7 !h-7 max-md:!w-11 max-md:!h-11 -my-1 flex-shrink-0 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle',
        className
      )}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
