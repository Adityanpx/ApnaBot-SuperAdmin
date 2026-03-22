// components/dashboard/StatCard.jsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SkeletonStatCard } from '@/components/ui/Skeleton';

/**
 * StatCard — animated metric card
 *
 * iconBg options: 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'red'
 */

const iconBgMap = {
  blue:   'bg-info-bg text-info-text',
  green:  'bg-success-bg text-success-text',
  orange: 'bg-warning-bg text-warning-text',
  purple: 'bg-[rgba(139,92,246,0.12)] text-[#a78bfa]',
  cyan:   'bg-[rgba(6,182,212,0.12)] text-cyan-400',
  red:    'bg-danger-bg text-danger-text',
};

export default function StatCard({
  label,
  value,
  subtext,
  icon,
  iconBg = 'blue',
  loading = false,
  trend,            // optional: { value: '+12%', positive: true }
  index = 0,        // for stagger delay
}) {
  if (loading) return <SkeletonStatCard />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="card p-6 cursor-default group"
    >
      <div className="flex items-start justify-between gap-4">

        {/* Label */}
        <p className="text-sm font-medium text-text-secondary leading-tight">
          {label}
        </p>

        {/* Icon box */}
        {icon && React.isValidElement(icon) ? (
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            'transition-transform duration-200 group-hover:scale-110',
            iconBgMap[iconBg]
          )}>
            {icon}
          </div>
        ) : icon ? (
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            'transition-transform duration-200 group-hover:scale-110',
            iconBgMap[iconBg]
          )}>
            <span className="text-lg">{String(icon)}</span>
          </div>
        ) : null}
      </div>

      {/* Value — big number */}
      <motion.p
        key={value}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.06 + 0.1 }}
        className="text-3xl font-bold text-text-primary mt-3 tracking-tight"
      >
        {value ?? '—'}
      </motion.p>

      {/* Subtext or trend */}
      <div className="flex items-center gap-2 mt-2">
        {trend && (
          <span className={cn(
            'text-xs font-semibold px-1.5 py-0.5 rounded-md',
            trend.positive
              ? 'bg-success-bg text-success-text'
              : 'bg-danger-bg text-danger-text'
          )}>
            {trend.value}
          </span>
        )}
        {subtext && (
          <p className="text-xs text-text-tertiary">{subtext}</p>
        )}
      </div>
    </motion.div>
  );
}
