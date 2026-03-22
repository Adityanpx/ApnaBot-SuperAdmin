// hooks/useTemplates.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * Fetches all 8 business type templates.
 * Returns templates array, loading state, and refetch function.
 */
export default function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(API.TEMPLATES);
      setTemplates(res.data.data.templates);
    } catch (err) {
      setError(err.userMessage || 'Failed to load templates');
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  return { templates, loading, error, refetch: fetchTemplates };
}
