// hooks/useNewRequestCount.js
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';

const EVENT = 'business-requests-changed';
const POLL_MS = 60 * 1000;

/** Tells every mounted useNewRequestCount to refetch (after a status edit). */
export function notifyRequestsChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT));
}

/**
 * Number of requests with status 'new' (GET business-requests?status=new&limit=1 -> pagination.total),
 * for the sidebar badge. Refetches every minute and when notifyRequestsChanged() fires; a failed
 * read keeps the last count (the badge is a hint, not worth an error).
 * @returns {number}
 */
export function useNewRequestCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const res = await api.get(API.BUSINESS_REQUESTS, { params: { status: 'new', page: 1, limit: 1 } });
        if (live) setCount(res.data.data.pagination?.total || 0);
      } catch {
        // keep the last count
      }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    window.addEventListener(EVENT, load);
    return () => {
      live = false;
      clearInterval(timer);
      window.removeEventListener(EVENT, load);
    };
  }, []);

  return count;
}
