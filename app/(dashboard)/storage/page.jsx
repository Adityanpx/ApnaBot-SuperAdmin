'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStorage } from '@/hooks/useStorage';
import Button from '@/components/ui/Button';
import StorageOverview from '@/components/storage/StorageOverview';
import CleanupWizard from '@/components/storage/CleanupWizard';
import CleanupHistory from '@/components/storage/CleanupHistory';
import RetentionRule from '@/components/storage/RetentionRule';
import OrphanScan from '@/components/storage/OrphanScan';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'cleanup',  label: 'Clean up' },
  { id: 'history',  label: 'Cleanup history' },
  { id: 'auto',     label: 'Automatic rule' },
  { id: 'orphans',  label: 'Orphan files' },
];

export default function StoragePage() {
  const { summary, runs, settings, fetchSummary, fetchRuns, fetchSettings } = useStorage();
  const [tab, setTab] = useState('overview');
  // Clean up pressed on a business row → wizard opens pre-filled. The key remounts it fresh.
  const [wizardSeed, setWizardSeed] = useState({ business: null, n: 0 });

  const businessNames = useMemo(() => {
    const map = {};
    ((summary.data && summary.data.byBusiness) || []).forEach((b) => { if (b.businessId) map[b.businessId] = b.name; });
    return map;
  }, [summary.data]);

  const refreshAll = () => { fetchSummary(); fetchRuns(); fetchSettings(); };
  const afterRunChange = () => { fetchRuns(); fetchSummary(); };

  const openCleanup = (business) => {
    setWizardSeed((s) => ({ business: business || null, n: s.n + 1 }));
    setTab('cleanup');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Storage</h1>
          <p className="text-sm text-text-secondary mt-1">
            See what is using space, and delete files safely. Nothing is deleted until a 24-hour wait is over.
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={refreshAll}>Refresh</Button>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border-subtle -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-brand-500 text-text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <StorageOverview
          summary={summary}
          runs={runs}
          platformDays={settings.data ? settings.data.chatMediaRetentionDays : null}
          onCleanUp={openCleanup}
          onRefresh={refreshAll}
        />
      )}
      {tab === 'cleanup' && (
        <CleanupWizard
          key={wizardSeed.n}
          initialBusiness={wizardSeed.business}
          onScheduled={afterRunChange}
          onGoToHistory={() => setTab('history')}
        />
      )}
      {tab === 'history' && <CleanupHistory runs={runs} businessNames={businessNames} onRefresh={afterRunChange} />}
      {tab === 'auto' && <RetentionRule settings={settings} onSaved={fetchSettings} onRetry={fetchSettings} />}
      {tab === 'orphans' && (
        <OrphanScan summary={summary} runs={runs} onChanged={afterRunChange} onGoToHistory={() => setTab('history')} />
      )}
    </motion.div>
  );
}
