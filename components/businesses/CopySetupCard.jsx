// components/businesses/CopySetupCard.jsx
'use client';

import { useState } from 'react';
import { Copy } from 'lucide-react';
import Button from '@/components/ui/Button';
import CopySetupModal, { getCategoryLabel } from '@/components/businesses/CopySetupModal';

/**
 * CopySetupCard — Businesses → <business> → Copy setup.
 * Opens CopySetupModal to copy the auto-reply flow and service form from
 * another business of the same category, or from a saved category template.
 */
export default function CopySetupCard({ business, onSuccess }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card p-5">
      <h3 className="text-base font-bold text-text-primary tracking-tight">Copy setup</h3>
      <p className="text-xs text-text-secondary mt-0.5 mb-4">
        Copy the auto-reply flow and service form from another {getCategoryLabel(business.businessCategory)} business or a saved template.
      </p>
      <Button variant="secondary" size="sm" icon={<Copy className="w-4 h-4" />} onClick={() => setOpen(true)}>
        Copy setup…
      </Button>

      <CopySetupModal
        open={open}
        onClose={() => setOpen(false)}
        business={business}
        onSuccess={onSuccess}
      />
    </div>
  );
}
