// hooks/useBusinessCategories.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

export function useBusinessCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.BUSINESS_CATEGORIES);
      setCategories(res.data.data.categories);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load business categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Optimistic — flips the row immediately, then reconciles with the server
  // response (or rolls back on failure) so the toggle feels instant.
  const toggleCategory = async (value, isEnabled) => {
    const previous = categories;
    setCategories((prev) => prev.map((c) => (c.value === value ? { ...c, isEnabled } : c)));

    try {
      const res = await api.put(API.BUSINESS_CATEGORY_TOGGLE(value), { isEnabled });
      const updated = res.data.data;
      setCategories((prev) => prev.map((c) => (c.value === value ? updated : c)));
      toast.success(`${updated.label || value} ${updated.isEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      setCategories(previous);
      toast.error(err.userMessage || 'Failed to update business category');
    }
  };

  return {
    categories,
    loading,
    refetch: fetchCategories,
    toggleCategory,
  };
}
