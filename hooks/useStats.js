// hooks/useStats.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

export function useStats() {
  const [stats,           setStats]          = useState(null);
  const [revenue,         setRevenue]        = useState([]);
  const [revenueMonths,   setRevenueMonths]  = useState(6);
  const [loadingStats,    setLoadingStats]   = useState(true);
  const [loadingRevenue,  setLoadingRevenue] = useState(true);

  // ── Fetch platform stats ────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await api.get(API.STATS);
      setStats(res.data.data);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load stats');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Fetch revenue report ────────────────────────────────────────────────
  const fetchRevenue = useCallback(async (months = revenueMonths) => {
    try {
      setLoadingRevenue(true);
      const res = await api.get(API.REVENUE, { params: { months } });
      setRevenue(res.data.data.report);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load revenue');
    } finally {
      setLoadingRevenue(false);
    }
  }, [revenueMonths]);

  // ── Change revenue period ───────────────────────────────────────────────
  const changeRevenuePeriod = (months) => {
    setRevenueMonths(months);
    fetchRevenue(months);
  };

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchRevenue(6);
  }, []);

  // Computed loading state (true if either stats or revenue is loading)
  // If API failed (loading is false but stats is still null), we should still show loading
  const loading = loadingStats || loadingRevenue || (stats === null && !loadingStats);

  return {
    stats,
    revenueData: revenue,          // Alias for backward compatibility
    revenuePeriod: revenueMonths,  // Alias for backward compatibility
    loading,
    loadingStats,
    loadingRevenue,
    refetchStats: fetchStats,
    changeRevenuePeriod,
  };
}
