// hooks/useRateCards.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

export function useRateCards() {
  const [rateCards, setRateCards] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchRateCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.RATE_CARDS);
      setRateCards(res.data.data.rateCards);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load rate cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRateCards(); }, [fetchRateCards]);

  // Append-only — no update/delete. Refetches rather than splicing the
  // response into local state, matching the create response's shape.
  const createRateCard = async (payload) => {
    try {
      const res = await api.post(API.RATE_CARDS, payload);
      toast.success('Rate card added successfully');
      await fetchRateCards();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to add rate card');
      throw err;
    }
  };

  return {
    rateCards,
    loading,
    refetch: fetchRateCards,
    createRateCard,
  };
}
