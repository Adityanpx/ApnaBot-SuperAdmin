// app/(dashboard)/error.jsx
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

/**
 * Dashboard-level error boundary
 * Shown when a dashboard route throws an unhandled error
 * The shell (sidebar + topbar) remains visible — only content fails
 */
export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-danger-bg flex items-center justify-center mb-5">
        <AlertTriangle className="w-6 h-6 text-danger-text" />
      </div>

      <h2 className="text-lg font-bold text-text-primary mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-text-tertiary max-w-sm leading-relaxed mb-6">
        This page encountered an error. You can try refreshing or go back to the dashboard.
      </p>

      <div className="flex gap-3">
        <Button variant="secondary" icon={RefreshCw} onClick={reset}>
          Retry
        </Button>
        <Link href="/dashboard">
          <Button variant="primary" icon={LayoutDashboard}>
            Dashboard
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
