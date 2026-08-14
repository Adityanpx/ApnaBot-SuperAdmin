// hooks/useFlowPacks.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

export function useFlowPacks() {
  const [packs,   setPacks]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.FLOW_PACKS);
      setPacks(res.data.data.packs);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load flow packs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const createPack = async (payload) => {
    try {
      const res = await api.post(API.FLOW_PACKS, payload);
      toast.success('Flow pack created successfully');
      await fetchPacks();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to create flow pack');
      throw err;
    }
  };

  const updatePack = async (id, payload) => {
    try {
      const res = await api.put(API.FLOW_PACK_BY_ID(id), payload);
      toast.success('Flow pack updated successfully');
      await fetchPacks();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update flow pack');
      throw err;
    }
  };

  const deletePack = async (id) => {
    try {
      await api.delete(API.FLOW_PACK_BY_ID(id));
      toast.success('Flow pack deleted successfully');
      await fetchPacks();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete flow pack');
      throw err;
    }
  };

  return {
    packs,
    loading,
    refetch: fetchPacks,
    createPack,
    updatePack,
    deletePack,
  };
}
