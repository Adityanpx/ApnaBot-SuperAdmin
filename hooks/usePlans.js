// hooks/usePlans.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
// import api from '@/lib/api';
// import { API } from '@/lib/constants';

// Dummy data for testing
const DUMMY_PLANS = [
  {
    _id: '1',
    name: 'basic',
    displayName: 'Basic',
    price: 499,
    msgLimit: 1000,
    ruleLimit: 5,
    customerLimit: 100,
    isActive: true,
    bookingEnabled: false,
    paymentLinkEnabled: false,
    staffEnabled: false,
  },
  {
    _id: '2',
    name: 'pro',
    displayName: 'Pro',
    price: 999,
    msgLimit: 5000,
    ruleLimit: 20,
    customerLimit: 500,
    isActive: true,
    bookingEnabled: true,
    paymentLinkEnabled: false,
    staffEnabled: false,
  },
  {
    _id: '3',
    name: 'business',
    displayName: 'Business',
    price: 2499,
    msgLimit: 20000,
    ruleLimit: 50,
    customerLimit: 2000,
    isActive: true,
    bookingEnabled: true,
    paymentLinkEnabled: true,
    staffEnabled: true,
    maxStaff: 5,
  },
];

export function usePlans() {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call with dummy data
      await new Promise(resolve => setTimeout(resolve, 500));
      setPlans(DUMMY_PLANS);
      
      // Uncomment below for real API call:
      // const res = await api.get(API.PLANS);
      // setPlans(res.data.data.plans);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  return { plans, loading, refetch: fetchPlans };
}
