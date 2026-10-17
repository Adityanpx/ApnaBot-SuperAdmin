// hooks/useTrials.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { claimsParams } from '@/lib/trials';

/**
 * Trial settings (GET/PUT /api/admin/trial-settings) and trial claims
 * (GET /api/admin/trial-claims?search=&limit=&offset=, DELETE .../:id with { reason }).
 * Search and paging are server-side: pass the debounced `search` and the 1-based `page`.
 * `saveSettings` and `resetClaim` toast on failure and rethrow so the caller can keep its
 * dialog open; resetting a claim refetches the list.
 * @param {{search?: string, page?: number}} query
 * @returns {{settings: object|null, claims: object[], total: number, loading: boolean,
 *   error: string|null, refetch: Function, saveSettings: Function, resetClaim: Function}}
 */
export function useTrials({ search = '', page = 1 } = {}) {
  const [settings, setSettings] = useState(null);
  const [claims, setClaims] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClaims = useCallback(async () => {
    const res = await api.get(API.TRIAL_CLAIMS, { params: claimsParams({ search, page }) });
    setClaims(res.data.data.claims || []);
    setTotal(res.data.data.total || 0);
  }, [search, page]);

  const fetchSettings = useCallback(async () => {
    const res = await api.get(API.TRIAL_SETTINGS);
    setSettings(res.data.data);
  }, []);

  /** Runs a load, tracking the loading flag and the error message. */
  const run = useCallback(async (load) => {
    setLoading(true);
    setError(null);
    try {
      await load();
    } catch (err) {
      setError(err.userMessage || 'Failed to load trials');
    } finally {
      setLoading(false);
    }
  }, []);

  // Settings load once; claims reload whenever the search or page changes.
  useEffect(() => { run(fetchSettings); }, [run, fetchSettings]);
  useEffect(() => { run(fetchClaims); }, [run, fetchClaims]);

  const refetch = useCallback(() => run(() => Promise.all([fetchSettings(), fetchClaims()])),
    [run, fetchSettings, fetchClaims]);

  const saveSettings = async (body) => {
    try {
      const res = await api.put(API.TRIAL_SETTINGS, body);
      setSettings(res.data.data);
      toast.success('Trial settings saved');
    } catch (err) {
      toast.error(err.userMessage || 'Failed to save trial settings');
      throw err;
    }
  };

  const resetClaim = async (id, reason) => {
    try {
      await api.delete(API.TRIAL_CLAIM_BY_ID(id), { data: { reason } });
      toast.success('Trial claim reset');
    } catch (err) {
      toast.error(err.userMessage || 'Failed to reset the trial claim');
      throw err;
    }
    await fetchClaims();
  };

  return { settings, claims, total, loading, error, refetch, saveSettings, resetClaim };
}
