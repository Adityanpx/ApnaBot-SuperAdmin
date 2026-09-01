// hooks/usePlans.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

export function usePlans() {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.PLANS);
      setPlans(res.data.data.plans || []);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  return { plans, loading, refetch: fetchPlans };
}
