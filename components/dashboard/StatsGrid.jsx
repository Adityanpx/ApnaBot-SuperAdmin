// components/dashboard/StatsGrid.jsx
'use client';

import { motion } from 'framer-motion';
import StatCard from './StatCard';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Grid layout for dashboard stats
 */
export default function StatsGrid({ stats = null, loading = false }) {
  // Show loading skeleton when loading OR when stats hasn't loaded yet (null)
  if (loading || stats === null) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  // Ensure stats is an array before mapping
  const statsArray = Array.isArray(stats) ? stats : [];

  // If array is empty after validation, show skeleton
  if (statsArray.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {statsArray.map((stat, index) => (
        <StatCard
          key={stat?.key || index}
          label={stat?.title || '—'}
          value={stat?.value ?? '—'}
          trend={stat?.change ? { value: stat.change, positive: stat.changeType === 'positive' } : undefined}
          icon={stat?.icon}
          iconBg={stat?.changeType === 'positive' ? 'green' : stat?.changeType === 'negative' ? 'red' : 'blue'}
          index={index}
        />
      ))}
    </motion.div>
  );
}
