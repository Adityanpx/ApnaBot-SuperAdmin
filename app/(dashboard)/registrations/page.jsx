// app/(dashboard)/registrations/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRegistrations } from '@/hooks/useRegistrations';
import RegistrationsTable from '@/components/registrations/RegistrationsTable';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import { API } from '@/lib/constants';
import { downloadCsv } from '@/lib/downloadCsv';
import { filterParams } from '@/lib/registrations';

/** Debounced copy of a value, so typing in the search box does not call the API per key. */
function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Registered, no business — owners who signed up but never created a business. */
export default function RegistrationsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [unverifiedOnly, setUnverifiedOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const debounced = useDebounced(search);
  const { registrations, total, loading, error, refetch } = useRegistrations({
    search: debounced, page, includeInactive, unverifiedOnly,
  });

  // Any filter change goes back to the first page
  const changing = (setter) => (value) => { setter(value); setPage(1); };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const params = filterParams({ search: debounced, includeInactive, unverifiedOnly });
      await downloadCsv(API.REGISTRATIONS_NO_BUSINESS_CSV, params, 'registered-no-business.csv');
    } catch {
      toast.error('Could not export the CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Registered, no business</h1>
          <p className="text-sm text-text-secondary mt-1">
            Owners who signed up but have not created a business yet. Call or WhatsApp them to help finish setup.
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={refetch}>Refresh</Button>
      </div>

      {error ? (
        <ErrorState title="Could not load registrations" message={error} onRetry={refetch} />
      ) : (
        <RegistrationsTable
          registrations={registrations}
          total={total}
          loading={loading}
          search={search}
          onSearch={changing(setSearch)}
          includeInactive={includeInactive}
          onIncludeInactive={changing(setIncludeInactive)}
          unverifiedOnly={unverifiedOnly}
          onUnverifiedOnly={changing(setUnverifiedOnly)}
          page={page}
          onPage={setPage}
          actions={(
            <Button variant="outline" icon={Download} loading={exporting} onClick={exportCsv}>
              Export CSV
            </Button>
          )}
        />
      )}
    </motion.div>
  );
}
