// hooks/useAppConfig.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';

const EDITABLE = [
  'androidMinVersion', 'androidLatestVersion', 'forceUpdate', 'maintenanceMode', 'playStoreUrl',
];

/**
 * Loads and saves the app release config (GET/PUT /api/admin/app-config).
 * `save` sends only the editable fields, replaces `data` with the server's
 * answer (so updatedAt/updatedBy are fresh) and throws on failure so the
 * caller can show its own message.
 * @returns {{data: object|null, loading: boolean, error: string|null,
 *   refetch: Function, save: Function}}
 */
export function useAppConfig() {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get(API.APP_CONFIG);
      setState({ data: res.data.data, loading: false, error: null });
    } catch (err) {
      const m = err && err.userMessage;
      const error = typeof m === 'string' ? m : 'Failed to load app release settings';
      setState((s) => ({ ...s, loading: false, error }));
    }
  }, []);

  const save = useCallback(async (values) => {
    const body = Object.fromEntries(EDITABLE.map((k) => [k, values[k]]));
    const res = await api.put(API.APP_CONFIG, body);
    setState({ data: res.data.data, loading: false, error: null });
    return res.data.data;
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { ...state, refetch, save };
}
