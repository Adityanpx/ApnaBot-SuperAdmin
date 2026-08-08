// hooks/useVehicleCatalog.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

export function useVehicleCatalog() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.VEHICLE_CATALOG);
      setCatalog(res.data.data.catalog);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load vehicle catalog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  // Mutations always refetch the list rather than splicing the response into
  // local state — the list response nests entries under "catalog" while
  // mutation responses return the entry directly, so the shapes don't match.
  const createEntry = async (payload) => {
    try {
      const res = await api.post(API.VEHICLE_CATALOG, payload);
      toast.success('Vehicle type created successfully');
      await fetchCatalog();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to create vehicle type');
      throw err;
    }
  };

  const updateEntry = async (id, payload) => {
    try {
      const res = await api.put(API.VEHICLE_CATALOG_BY_ID(id), payload);
      toast.success('Vehicle type updated successfully');
      await fetchCatalog();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update vehicle type');
      throw err;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await api.delete(API.VEHICLE_CATALOG_BY_ID(id));
      toast.success('Vehicle type deleted successfully');
      await fetchCatalog();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete vehicle type');
      throw err;
    }
  };

  // Used by the modals to resolve a photoUrl before the entry form is
  // submitted — not a standalone mutation, so no toast/refetch here.
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post(API.VEHICLE_CATALOG_UPLOAD_IMAGE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.imageUrl;
  };

  return {
    catalog,
    loading,
    refetch: fetchCatalog,
    createEntry,
    updateEntry,
    deleteEntry,
    uploadImage,
  };
}
