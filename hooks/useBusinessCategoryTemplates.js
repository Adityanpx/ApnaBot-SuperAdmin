// hooks/useBusinessCategoryTemplates.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

export function useBusinessCategoryTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.BUSINESS_CATEGORY_TEMPLATES);
      setTemplates(res.data.data.templates);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load business category templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const applyTemplate = async (category, businessId) => {
    try {
      const res = await api.post(API.BUSINESS_CATEGORY_TEMPLATE_APPLY(category, businessId));
      toast.success(res.data.message || 'Template applied successfully');
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to apply template');
      throw err;
    }
  };

  return {
    templates,
    loading,
    refetch: fetchTemplates,
    applyTemplate,
  };
}
