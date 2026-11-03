// components/businesses/OwnerPhone.jsx
'use client';

import { MessageCircle } from 'lucide-react';
import { telLink, waLink } from '@/lib/ownerContact';
import { cn } from '@/lib/utils';

/**
 * An owner's phone as a tap-to-call link plus a WhatsApp link; "-" when there is no phone.
 * Props: phone (stored "+91…" string), className.
 */
export default function OwnerPhone({ phone, className }) {
  if (!phone) return <span className="text-text-tertiary text-xs">-</span>;
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <a href={telLink(phone)} className="text-text-secondary text-xs hover:text-text-primary whitespace-nowrap">
        {phone}
      </a>
      <a
        href={waLink(phone)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open WhatsApp chat with owner"
        title="WhatsApp"
        className="icon-btn !w-7 !h-7 max-md:!w-11 max-md:!h-11 text-success hover:bg-bg-subtle"
      >
        <MessageCircle className="w-3.5 h-3.5" />
      </a>
    </span>
  );
}
