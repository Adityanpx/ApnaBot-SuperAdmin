// hooks/useCategorySummary.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * How many businesses are in each category (GET /api/admin/businesses/category-summary).
 * The strip is a nicety, so a failure leaves it empty instead of toasting over the page.
 * @returns {{total: number, categories: {value: string, label: string, count: number}[], loading: boolean, refetch: Function}}
 */
export function useCategorySummary() {
  const [summary, setSummary] = useState({ total: 0, categories: [] });
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.BUSINESSES_CATEGORY_SUMMARY);
      setSummary({ total: res.data.data.total || 0, categories: res.data.data.categories || [] });
    } catch {
      setSummary({ total: 0, categories: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { ...summary, loading, refetch };
}
