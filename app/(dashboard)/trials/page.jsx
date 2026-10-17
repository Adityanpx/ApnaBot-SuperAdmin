// app/(dashboard)/trials/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useTrials } from '@/hooks/useTrials';
import { usePlans } from '@/hooks/usePlans';
import TrialSettingsForm from '@/components/trials/TrialSettingsForm';
import TrialClaimsTable from '@/components/trials/TrialClaimsTable';
import ResetClaimModal from '@/components/trials/ResetClaimModal';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';

/** Debounced copy of a value, so typing in the search box does not call the API per key. */
function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Trials — free-trial settings and the per-phone claims table. */
export default function TrialsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounced(search);
  const {
    settings, claims, total, loading, error, refetch, saveSettings, resetClaim,
  } = useTrials({ search: debounced, page });
  const { plans } = usePlans();
  const [resetting, setResetting] = useState(null);

  const onSearch = (text) => { setSearch(text); setPage(1); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Trials</h1>
          <p className="text-sm text-text-secondary mt-1">
            Control the free trial and reset a phone number&apos;s claim when needed.
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={refetch}>Refresh</Button>
      </div>

      {error && !settings && (
        <ErrorState title="Could not load trials" message={error} onRetry={refetch} />
      )}
      {loading && !settings && <Skeleton className="h-48 w-full max-w-2xl" />}
      {settings && (
        <TrialSettingsForm
          key={`${settings.trialEnabled}-${settings.trialPlanId}-${settings.trialDays}`}
          settings={settings}
          plans={plans}
          onSave={saveSettings}
        />
      )}

      {(settings || !error) && (
        <TrialClaimsTable
          claims={claims}
          total={total}
          loading={loading}
          search={search}
          onSearch={onSearch}
          page={page}
          onPage={setPage}
          onReset={setResetting}
        />
      )}

      <ResetClaimModal
        open={!!resetting}
        claim={resetting}
        onClose={() => setResetting(null)}
        onConfirm={resetClaim}
      />
    </motion.div>
  );
}
