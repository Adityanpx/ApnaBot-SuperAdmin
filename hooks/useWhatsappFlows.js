// hooks/useWhatsappFlows.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

export function useWhatsappFlows() {
  const [flows, setFlows]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFlows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.WHATSAPP_FLOWS);
      setFlows(res.data.data.flows);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load WhatsApp flows');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlows(); }, [fetchFlows]);

  const createFlow = async (payload) => {
    try {
      const res = await api.post(API.WHATSAPP_FLOWS, payload);
      toast.success('WhatsApp flow created successfully');
      await fetchFlows();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to create WhatsApp flow');
      throw err;
    }
  };

  const updateFlow = async (id, payload) => {
    try {
      const res = await api.put(API.WHATSAPP_FLOW_BY_ID(id), payload);
      toast.success('WhatsApp flow updated successfully');
      await fetchFlows();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update WhatsApp flow');
      throw err;
    }
  };

  const deleteFlow = async (id) => {
    try {
      await api.delete(API.WHATSAPP_FLOW_BY_ID(id));
      toast.success('WhatsApp flow deleted successfully');
      await fetchFlows();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete WhatsApp flow');
      throw err;
    }
  };

  const publishToBusiness = async (id, payload) => {
    try {
      const res = await api.post(API.WHATSAPP_FLOW_PUBLISH(id), payload);
      const status = res.data.data.whatsappFlowStatus;
      toast.success(status ? `Published! Flow status: ${status}` : 'Published!');
      await fetchFlows();
      return res.data.data;
    } catch (err) {
      // err.userMessage carries the server's exact message (e.g. the
      // partial-draft warning) — surface it as-is, no generic override
      toast.error(err.userMessage || 'Failed to publish WhatsApp flow');
      throw err;
    }
  };

  return {
    flows,
    loading,
    refetch: fetchFlows,
    createFlow,
    updateFlow,
    deleteFlow,
    publishToBusiness,
  };
}
