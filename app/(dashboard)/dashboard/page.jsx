// app/(dashboard)/dashboard/page.jsx
'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Store, CheckCircle2, PauseCircle } from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RevenueChart from '@/components/dashboard/RevenueChart';

export default function DashboardPage() {
  const {
    stats,
    revenueData,
    loading,
    revenuePeriod,
    changeRevenuePeriod,
  } = useStats();

  // Platform stats come back as totalBusinesses/activeBusinesses/inactiveBusinesses —
  // map to the card shape StatsGrid expects
  const statsCards = useMemo(() => {
    if (!stats) return null;
    return [
      {
        key: 'total',
        title: 'Total Businesses',
        value: stats.totalBusinesses,
        icon: <Store className="w-5 h-5" />,
      },
      {
        key: 'active',
        title: 'Active Businesses',
        value: stats.activeBusinesses,
        icon: <CheckCircle2 className="w-5 h-5" />,
        changeType: 'positive',
      },
      {
        key: 'inactive',
        title: 'Inactive Businesses',
        value: stats.inactiveBusinesses,
        icon: <PauseCircle className="w-5 h-5" />,
        changeType: 'negative',
      },
    ];
  }, [stats]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-8"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Dashboard
          </h1>
          <p className="text-text-secondary mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your platform.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <StatsGrid stats={statsCards} loading={loading} />

      {/* Revenue chart */}
      <RevenueChart
        data={revenueData}
        loading={loading}
        currentPeriod={revenuePeriod}
        onPeriodChange={changeRevenuePeriod}
      />
    </motion.div>
  );
}
