// hooks/useWhatsappDiagnostics.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';

/**
 * Live Meta checks (GET /api/super-admin/whatsapp-diagnostics[?businessId=]) and the
 * business's last connect attempts (GET .../whatsapp-connect-attempts?businessId=).
 * Read-only. `error` is set when the report fails; `attemptsError` when only the attempts fail.
 * @param {string|null} businessId
 */
export function useWhatsappDiagnostics(businessId) {
  const [report, setReport] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptsError, setAttemptsError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAttemptsError(null);
    const params = businessId ? { businessId } : undefined;
    const [diag, att] = await Promise.allSettled([
      api.get(API.WHATSAPP_DIAGNOSTICS, { params }),
      businessId ? api.get(API.WHATSAPP_CONNECT_ATTEMPTS, { params }) : Promise.resolve(null),
    ]);
    if (diag.status === 'fulfilled') {
      setReport(diag.value.data.data);
    } else {
      setReport(null);
      setError(diag.reason?.userMessage || 'Failed to load WhatsApp diagnostics');
    }
    if (att.status === 'fulfilled') {
      setAttempts(att.value?.data.data.attempts || []);
    } else {
      setAttempts([]);
      setAttemptsError(att.reason?.userMessage || 'Failed to load connect attempts');
    }
    setLoading(false);
  }, [businessId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { report, attempts, loading, error, attemptsError, refetch };
}
