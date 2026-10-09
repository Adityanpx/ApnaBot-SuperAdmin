// hooks/useStorage.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';

const errorText = (err, fallback) => {
  const m = err && err.userMessage;
  return typeof m === 'string' ? m : fallback;
};

/**
 * Loads the three things the Storage page shares: the R2 summary, the
 * cleanup runs list and the platform retention settings. Each has its own
 * loading/error so a slow bucket scan never blocks history or settings.
 */
export function useStorage() {
  const [summary,  setSummary]  = useState({ data: null, loading: true, error: null });
  const [runs,     setRuns]     = useState({ data: [],   loading: true, error: null });
  const [settings, setSettings] = useState({ data: null, loading: true, error: null });

  const load = useCallback(async (setter, url, pick, fallback) => {
    setter((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get(url, url === API.STORAGE_RUNS ? { params: { limit: 100 } } : undefined);
      setter({ data: pick(res.data.data), loading: false, error: null });
    } catch (err) {
      setter((s) => ({ ...s, loading: false, error: errorText(err, fallback) }));
    }
  }, []);

  const fetchSummary  = useCallback(() => load(setSummary,  API.STORAGE_SUMMARY,  (d) => d,      'Failed to load storage usage'), [load]);
  const fetchRuns     = useCallback(() => load(setRuns,     API.STORAGE_RUNS,     (d) => d.runs,  'Failed to load cleanup history'), [load]);
  const fetchSettings = useCallback(() => load(setSettings, API.STORAGE_SETTINGS, (d) => d,      'Failed to load settings'), [load]);

  useEffect(() => { fetchSummary(); fetchRuns(); fetchSettings(); }, [fetchSummary, fetchRuns, fetchSettings]);

  return { summary, runs, settings, fetchSummary, fetchRuns, fetchSettings };
}
