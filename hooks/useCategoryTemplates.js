// hooks/useCategoryTemplates.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { parseCloneResult, stashWarnings } from '@/lib/categoryTemplates';

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

  const cloneFromBusiness = async (payload) => {
    try {
      const res = await api.post(API.CATEGORY_TEMPLATE_CLONE, payload);
      const { id, warnings } = parseCloneResult(res.data.data);
      stashWarnings(id, warnings);
      toast.success('Category template cloned successfully');
      if (warnings.length > 0) {
        toast.warning('Some replies mention the source business name. Open the template to fix.');
      }
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

  const setDefault = async (id) => {
    try {
      await api.post(API.CATEGORY_TEMPLATE_SET_DEFAULT(id));
      toast.success('Default flow updated');
      await fetchTemplates();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to set the default flow');
      throw err;
    }
  };

  const unsetDefault = async (id) => {
    try {
      await api.post(API.CATEGORY_TEMPLATE_UNSET_DEFAULT(id));
      toast.success('Default flow removed');
      await fetchTemplates();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to remove the default flow');
      throw err;
    }
  };

  const importFromJson = async (payload) => {
    try {
      const res = await api.post(API.CATEGORY_TEMPLATE_IMPORT_JSON, payload);
      toast.success('Category template imported successfully');
      await fetchTemplates();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to import category template');
      throw err;
    }
  };

  const exportTemplate = async (id) => {
    try {
      const res = await api.get(API.CATEGORY_TEMPLATE_EXPORT(id));
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${res.data.data.category}-template.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to export category template');
    }
  };

  return {
    templates,
    loading,
    refetch: fetchTemplates,
    cloneFromBusiness,
    deleteTemplate,
    setDefault,
    unsetDefault,
    importFromJson,
    exportTemplate,
  };
}
