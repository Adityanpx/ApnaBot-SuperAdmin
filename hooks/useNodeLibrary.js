// hooks/useNodeLibrary.js
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

export function useNodeLibrary() {
  const [entries, setEntries]                 = useState([]);
  const [entriesLoading, setEntriesLoading]    = useState(true);
  const [businessNodes, setBusinessNodes]      = useState([]);
  const [businessNodesLoading, setBusinessNodesLoading] = useState(false);

  // Tracks which business the current businessNodes list belongs to, so
  // addToLibrary can refresh the alreadyInLibrary badges after a successful add
  const currentBusinessIdRef = useRef(null);

  const fetchEntries = useCallback(async (category) => {
    setEntriesLoading(true);
    try {
      const res = await api.get(API.NODE_LIBRARY, { params: category ? { category } : undefined });
      setEntries(res.data.data.entries);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load node library');
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const fetchBusinessNodes = useCallback(async (businessId) => {
    currentBusinessIdRef.current = businessId;
    setBusinessNodesLoading(true);
    try {
      const res = await api.get(API.NODE_LIBRARY_BUSINESS_NODES(businessId));
      setBusinessNodes(res.data.data.nodes);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load business nodes');
      setBusinessNodes([]);
    } finally {
      setBusinessNodesLoading(false);
    }
  }, []);

  const addToLibrary = async ({ sourceBusinessId, sourceNodeId, category }) => {
    try {
      const res = await api.post(API.NODE_LIBRARY, { sourceBusinessId, sourceNodeId, category });
      toast.success('Added to node library');
      await fetchEntries();
      if (currentBusinessIdRef.current === sourceBusinessId) {
        await fetchBusinessNodes(sourceBusinessId);
      }
      return res.data.data;
    } catch (err) {
      // err.userMessage carries the server's exact message (e.g. a 409
      // "already added" conflict) — surface it as-is, no generic override
      toast.error(err.userMessage || 'Failed to add to node library');
      throw err;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await api.delete(API.NODE_LIBRARY_BY_ID(id));
      toast.success('Removed from node library');
      await fetchEntries();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to remove from node library');
      throw err;
    }
  };

  return {
    entries,
    entriesLoading,
    fetchEntries,
    businessNodes,
    businessNodesLoading,
    fetchBusinessNodes,
    addToLibrary,
    deleteEntry,
  };
}
