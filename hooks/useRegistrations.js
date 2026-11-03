// hooks/useRegistrations.js
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { listParams } from '@/lib/registrations';

/**
 * Owners who registered but never created a business
 * (GET /api/admin/registrations/no-business). Search, the two switches and paging are server-side:
 * pass the debounced `search` and the 1-based `page`. A slower, older response never overwrites a newer one.
 * @param {{search?: string, page?: number, includeInactive?: boolean, unverifiedOnly?: boolean}} query
 * @returns {{registrations: object[], total: number, loading: boolean, error: string|null, refetch: Function}}
 */
export function useRegistrations({ search = '', page = 1, includeInactive = false, unverifiedOnly = false } = {}) {
  const [registrations, setRegistrations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const latest = useRef(0);

  const refetch = useCallback(async () => {
    const request = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const params = listParams({ search, page, includeInactive, unverifiedOnly });
      const res = await api.get(API.REGISTRATIONS_NO_BUSINESS, { params });
      if (request !== latest.current) return;
      setRegistrations(res.data.data.registrations || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch (err) {
      if (request !== latest.current) return;
      setError(err.userMessage || 'Failed to load registrations');
    } finally {
      if (request === latest.current) setLoading(false);
    }
  }, [search, page, includeInactive, unverifiedOnly]);

  useEffect(() => { refetch(); }, [refetch]);

  return { registrations, total, loading, error, refetch };
}
