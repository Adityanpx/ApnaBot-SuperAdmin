// app/(dashboard)/whatsapp-diagnostics/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useWhatsappDiagnostics } from '@/hooks/useWhatsappDiagnostics';
import BusinessPicker from '@/components/categoryTemplates/BusinessPicker';
import { MetaAppCard, WebhookChecklist, SystemTokenCard } from '@/components/whatsappDiagnostics/MetaSections';
import BusinessDiagnostics from '@/components/whatsappDiagnostics/BusinessDiagnostics';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';

/** WhatsApp diagnostics - live Meta checks plus one business's connect attempts. Read-only. */
export default function WhatsappDiagnosticsPage() {
  const [business, setBusiness] = useState(null);
  const { report, attempts, loading, error, attemptsError, refetch } = useWhatsappDiagnostics(business?._id ?? null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">WhatsApp Diagnostics</h1>
          <p className="text-sm text-text-secondary mt-1">
            Live checks against Meta. Nothing here is stored or changed, and no tokens are shown.
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={refetch}>Refresh</Button>
      </div>

      {error ? (
        <ErrorState title="Could not load diagnostics" message={error} onRetry={refetch} />
      ) : loading && !report ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <MetaAppCard config={report?.config} />
            <SystemTokenCard token={report?.systemUserToken} />
          </div>
          <WebhookChecklist subscriptions={report?.appSubscriptions} />
        </>
      )}

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-text-primary">Business</h2>
        <div className="sm:max-w-sm">
          <BusinessPicker value={business} onChange={setBusiness} />
        </div>
        {business && !error && (
          loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <BusinessDiagnostics business={report?.business} attempts={attempts} attemptsError={attemptsError} />
          )
        )}
      </section>
    </motion.div>
  );
}
