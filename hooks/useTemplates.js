// hooks/useTemplates.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
// import api from '@/lib/api';
// import { API } from '@/lib/constants';

// Dummy data for testing
const DUMMY_TEMPLATES = [
  {
    _id: '1',
    businessType: 'tailor',
    defaultRules: [
      { keyword: 'hello', reply: 'Welcome to our tailor shop!', replyType: 'text' },
      { keyword: 'price', reply: 'Our starting price is ₹500', replyType: 'text' },
    ],
    bookingFields: [
      { fieldKey: 'name', label: 'Name', required: true },
      { fieldKey: 'phone', label: 'Phone', required: true },
    ],
  },
  {
    _id: '2',
    businessType: 'salon',
    defaultRules: [
      { keyword: 'hi', reply: 'Welcome to our salon!', replyType: 'text' },
    ],
    bookingFields: [
      { fieldKey: 'name', label: 'Name', required: true },
    ],
  },
];

export default function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call with dummy data
      await new Promise(resolve => setTimeout(resolve, 500));
      setTemplates(DUMMY_TEMPLATES);
      
      // Uncomment below for real API call:
      // const res = await api.get(API.TEMPLATES);
      // setTemplates(res.data.data.templates);
    } catch (err) {
      setError(err.userMessage || 'Failed to load templates');
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  return { templates, loading, error, refetch: fetchTemplates };
}
