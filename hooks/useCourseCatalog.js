// hooks/useCourseCatalog.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * Course catalog for one business category (only 'coaching' today).
 * Same shape as useVehicleCatalog: mutations toast + refetch.
 */
export function useCourseCatalog(category) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.COURSE_CATALOG, { params: { category } });
      setCatalog(res.data.data.catalog);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  const createEntry = async (payload) => {
    try {
      const res = await api.post(API.COURSE_CATALOG, { ...payload, category });
      toast.success('Course added');
      await fetchCatalog();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to add course');
      throw err;
    }
  };

  const updateEntry = async (id, payload, { quiet = false } = {}) => {
    try {
      const res = await api.put(API.COURSE_CATALOG_BY_ID(id), payload);
      if (!quiet) toast.success('Course updated');
      await fetchCatalog();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update course');
      throw err;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await api.delete(API.COURSE_CATALOG_BY_ID(id));
      toast.success('Course removed from catalog');
      await fetchCatalog();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete course');
      throw err;
    }
  };

  /**
   * Move a course up (-1) or down (+1): renumbers every entry 0..n-1 in the
   * new order (only rows whose order actually changes are saved), so gaps or
   * duplicate order values from older edits are cleaned up too.
   */
  const moveEntry = async (id, direction) => {
    const index = catalog.findIndex((c) => c._id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= catalog.length) return;
    const next = [...catalog];
    [next[index], next[target]] = [next[target], next[index]];
    try {
      for (let i = 0; i < next.length; i++) {
        if (next[i].order !== i) await api.put(API.COURSE_CATALOG_BY_ID(next[i]._id), { order: i });
      }
    } catch (err) {
      toast.error(err.userMessage || 'Failed to reorder courses');
    }
    await fetchCatalog();
  };

  return { catalog, loading, refetch: fetchCatalog, createEntry, updateEntry, deleteEntry, moveEntry };
}
