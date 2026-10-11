// hooks/useCopySetup.js
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * useCopySetup — copy the auto-reply flow / service form from another business
 * or a category template into a business.
 *
 * payload: { source: { type: 'business'|'template', id }, include: { flow, serviceForm } }
 * previewCopy → dryRun:true, returns { source, target, willCopy, warnings }
 * applyCopy   → dryRun:false, performs the copy
 * Both toast the error and rethrow so the caller can keep its modal open.
 */
export function useCopySetup() {
  const [loading, setLoading] = useState(false);

  const run = async (businessId, payload, dryRun, failMessage) => {
    setLoading(true);
    try {
      const res = await api.post(API.BUSINESS_COPY_SETUP(businessId), { ...payload, dryRun });
      return res.data.data;
    } catch (err) {
      toast.error(err.userMessage || failMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const previewCopy = (businessId, payload) =>
    run(businessId, payload, true, 'Failed to preview copy');

  const applyCopy = (businessId, payload) =>
    run(businessId, payload, false, 'Failed to copy setup');

  return { loading, previewCopy, applyCopy };
}
