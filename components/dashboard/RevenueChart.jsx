// components/dashboard/RevenueChart.jsx
'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { cn, formatMonth, formatCurrency } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Custom tooltip matching dark/light theme
 */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="
      bg-bg-overlay border border-border rounded-xl px-4 py-3
      shadow-modal text-sm
    ">
      <p className="text-text-secondary font-medium mb-1">{label}</p>
      <p className="text-text-primary font-bold">
        {formatCurrency(payload[0]?.value)}
      </p>
      <p className="text-text-tertiary text-xs mt-0.5">
        {payload[0]?.payload?.subscriptions} subscriptions
      </p>
    </div>
  );
}

const PERIOD_OPTIONS = [
  { label: '6M', value: 6 },
  { label: '12M', value: 12 },
];

export default function RevenueChart({
  data = null,
  loading = false,
  currentPeriod = 6,
  onPeriodChange,
}) {
  // Highlight hovered bar
  const [activeBar, setActiveBar] = useState(null);

  // Show loading when loading OR when data hasn't loaded yet (null)
  const showLoading = loading || data === null;

  // Ensure data is an array before mapping
  const dataArray = Array.isArray(data) ? data : [];

  // Transform API data for Recharts
  const chartData = dataArray.map((item) => ({
    ...item,
    label:   formatMonth(item.month),
    revenue: item.revenue,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="card p-6"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Revenue Overview
          </h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            Monthly subscription revenue
          </p>
        </div>

        {/* Period toggle */}
        <div className="flex items-center gap-1 bg-bg-subtle rounded-xl p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPeriodChange?.(opt.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200',
                currentPeriod === opt.value
                  ? 'bg-brand-500 text-white shadow-glow-brand'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {showLoading ? (
        <div className="space-y-3 h-64 flex flex-col justify-end pb-6">
          {[60, 40, 80, 55, 70, 45].map((h, i) => (
            <div key={i} className="flex items-end gap-3">
              <Skeleton className="flex-1" style={{ height: `${h}%` }} />
            </div>
          ))}
          <div className="flex gap-4 pt-2">
            {[6, 6, 6, 6, 6, 6].map((_, i) => (
              <Skeleton key={i} className="flex-1 h-3" />
            ))}
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            barCategoryGap="35%"
          >
            {/* Subtle horizontal grid lines only */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-subtle)"
            />

            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />

            <YAxis
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(59,130,246,0.06)', radius: 8 }}
            />

            <Bar
              dataKey="revenue"
              radius={[6, 6, 0, 0]}
              maxBarSize={52}
              onMouseEnter={(_, index) => setActiveBar(index)}
              onMouseLeave={() => setActiveBar(null)}
            >
              {/* Gradient fill — active bar is brighter */}
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={activeBar === index
                    ? 'url(#barGradientActive)'
                    : 'url(#barGradient)'
                  }
                />
              ))}
            </Bar>

            {/* SVG gradient defs */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.9} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
