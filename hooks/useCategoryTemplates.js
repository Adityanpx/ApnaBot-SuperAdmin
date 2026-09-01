// hooks/useCategoryTemplates.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

export function useCategoryTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.CATEGORY_TEMPLATES);
      setTemplates(res.data.data.templates);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load category templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  // Server-side this deletes any existing template for `category` before
  // inserting the clone — callers should warn before submitting.
  const cloneFromBusiness = async (payload) => {
    try {
      const res = await api.post(API.CATEGORY_TEMPLATE_CLONE, payload);
      toast.success('Category template cloned successfully');
      await fetchTemplates();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to clone category template');
      throw err;
    }
  };

  const deleteTemplate = async (id) => {
    try {
      await api.delete(API.CATEGORY_TEMPLATE_BY_ID(id));
      toast.success('Category template deleted successfully');
      await fetchTemplates();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete category template');
      throw err;
    }
  };

  return {
    templates,
    loading,
    refetch: fetchTemplates,
    cloneFromBusiness,
    deleteTemplate,
  };
}
