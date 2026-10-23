// hooks/useBusinessCategories.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { invalidateCategoryOptions } from '@/hooks/useCategoryOptions';

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
      invalidateCategoryOptions();
      toast.success(`${updated.label || value} ${updated.isEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      setCategories(previous);
      toast.error(err.userMessage || 'Failed to update business category');
    }
  };

  // Create / edit rethrow the server error (409 duplicate value, 400 validation...) so the
  // modal can show it inline; success refreshes the list and the shared option cache.
  const saveCategory = async (value, body) => {
    const res = value
      ? await api.put(API.BUSINESS_CATEGORY_BY_VALUE(value), body)
      : await api.post(API.BUSINESS_CATEGORIES, body);
    const saved = res.data.data;
    invalidateCategoryOptions();
    await fetchCategories();
    toast.success(`${saved?.label || body.label} ${value ? 'updated' : 'created'}`);
    return saved;
  };

  return {
    categories,
    saveCategory,
    loading,
    refetch: fetchCategories,
    toggleCategory,
  };
}
