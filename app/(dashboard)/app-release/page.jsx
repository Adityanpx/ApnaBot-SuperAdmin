'use client';

import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAppConfig } from '@/hooks/useAppConfig';
import Button from '@/components/ui/Button';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import AppReleaseForm from '@/components/appRelease/AppReleaseForm';

/** "Last updated 12 Oct 2026, 3:42 pm by Sam" or "Never changed". */
function LastUpdated({ updatedAt, updatedBy }) {
  if (!updatedAt) return <p className="text-xs text-text-tertiary mt-1">Never changed</p>;
  const date = new Date(updatedAt);
  const ago = formatDistanceToNow(date, { addSuffix: true });
  return (
    <p className="text-xs text-text-tertiary mt-1" title={ago}>
      Last updated {format(date, 'd MMM yyyy, h:mm a')}
      {updatedBy ? ` by ${updatedBy}` : ''}
    </p>
  );
}

function LoadingCard() {
  return (
    <div className="card p-5 space-y-3 max-w-2xl">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/** App Release settings — min/latest Android version, force update, maintenance. */
export default function AppReleasePage() {
  const { data, loading, error, refetch, save } = useAppConfig();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">App Release</h1>
          <p className="text-sm text-text-secondary mt-1">
            Control which Android versions can use the app, and switch on maintenance mode.
          </p>
          {data && <LastUpdated updatedAt={data.updatedAt} updatedBy={data.updatedBy} />}
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={refetch}>Refresh</Button>
      </div>

      {loading && !data && <LoadingCard />}
      {error && !data && (
        <ErrorState title="Could not load app release settings" message={error} onRetry={refetch} />
      )}
      {data && <AppReleaseForm key={data.updatedAt || 'new'} data={data} onSave={save} />}
    </motion.div>
  );
}
