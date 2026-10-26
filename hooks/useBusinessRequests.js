// hooks/useBusinessRequests.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { requestParams } from '@/lib/businessRequests';
import { notifyRequestsChanged } from '@/hooks/useNewRequestCount';

/**
 * Business requests (GET /api/admin/business-requests?status=&page=&limit=, PUT .../:id) and
 * the category change (PUT /api/admin/businesses/:id/category).
 * `updateRequest` and `changeCategory` toast on failure and rethrow so the caller can keep its
 * dialog open; both refetch the list, and `updateRequest` refreshes the sidebar badge.
 * @param {{status?: string, page?: number}} query  status '' = all
 */
export function useBusinessRequests({ status = '', page = 1 } = {}) {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    const res = await api.get(API.BUSINESS_REQUESTS, { params: requestParams({ status, page }) });
    setRequests(res.data.data.requests || []);
    setTotal(res.data.data.pagination?.total || 0);
  }, [status, page]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchRequests();
    } catch (err) {
      setError(err.userMessage || 'Failed to load business requests');
    } finally {
      setLoading(false);
    }
  }, [fetchRequests]);

  useEffect(() => { refetch(); }, [refetch]);

  const updateRequest = async (id, body) => {
    try {
      await api.put(API.BUSINESS_REQUEST_BY_ID(id), body);
      toast.success('Request updated');
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update the request');
      throw err;
    }
    notifyRequestsChanged();
    await fetchRequests();
  };

  const changeCategory = async (businessId, businessCategory) => {
    try {
      const res = await api.put(API.BUSINESS_CHANGE_CATEGORY(businessId), { businessCategory });
      toast.success('Category changed');
      await fetchRequests();
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to change the category');
      throw err;
    }
  };

  return { requests, total, loading, error, refetch, updateRequest, changeCategory };
}
