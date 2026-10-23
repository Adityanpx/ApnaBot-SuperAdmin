// components/ui/CopyId.jsx
'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/** "64f1a2…9c0d" — keeps the first and last characters of a long id. */
export function truncateId(id, head = 6, tail = 4) {
  const s = String(id ?? '');
  return s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;
}

/**
 * CopyId — a long id shown truncated, with a button that copies the full value.
 * Props: value (full id), label (a11y name, default "ID"), className
 */
export default function CopyId({ value, label = 'ID', className }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy — long-press the id to select it');
    }
  };

  return (
    <span className={cn('inline-flex items-center gap-1 min-w-0', className)}>
      <span className="font-mono text-xs text-text-tertiary truncate" title={String(value)}>
        {truncateId(value)}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="icon-btn !w-7 !h-7 max-md:!w-11 max-md:!h-11 -my-1 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </span>
  );
}
