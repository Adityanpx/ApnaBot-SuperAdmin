// hooks/useShops.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

// ── Deleted-row summary for the post-delete toast ───────────────────────────
// Matches the `deleted` breakdown returned by DELETE /api/admin/shops/:id
const DELETED_COUNT_LABELS = [
  ['rules',            'rule'],
  ['bookings',         'booking'],
  ['customers',        'customer'],
  ['vehicles',         'vehicle'],
  ['route_fares',      'route fare'],
  ['rental_packages',  'rental package'],
  ['subscriptions',    'subscription'],
  ['staffUsers',       'staff account'],
];

export function summarizeDeletedCounts(deleted = {}) {
  const parts = DELETED_COUNT_LABELS
    .map(([key, label]) => [deleted[key] || 0, label])
    .filter(([count]) => count > 0)
    .map(([count, label]) => `${count} ${label}${count === 1 ? '' : 's'}`);
  return parts.length ? parts.join(', ') : 'no related records';
}

export function useShops() {
  const [shops,      setShops]      = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading,    setLoading]    = useState(true);

  // ── Filter state ────────────────────────────────────────────────────────
  const [page,         setPage]         = useState(1);
  const [limit]                         = useState(15);
  const [search,       setSearch]       = useState('');
  const [isActive,     setIsActive]     = useState('');
  const [businessType, setBusinessType] = useState('');

  // ── Fetch shops ─────────────────────────────────────────────────────────
  const fetchShops = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search)       params.search       = search;
      if (isActive)     params.isActive     = isActive;
      if (businessType) params.businessCategory = businessType;

      const res = await api.get(API.SHOPS, { params });
      setShops(res.data.data.shops);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load businesses');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, isActive, businessType]);

  // ── Reset to page 1 when filters change ─────────────────────────────────
  const handleSearchChange  = (val) => { setSearch(val);       setPage(1); };
  const handleActiveChange  = (val) => { setIsActive(val);     setPage(1); };
  const handleTypeChange    = (val) => { setBusinessType(val); setPage(1); };
  const handlePageChange    = (val) => setPage(val);

  // ── Toggle a shop (optimistic update) ───────────────────────────────────
  const toggleShop = async (shopId) => {
    // Optimistic — flip locally first
    setShops((prev) =>
      prev.map((s) => s._id === shopId ? { ...s, isActive: !s.isActive } : s)
    );
    try {
      await api.put(API.SHOP_TOGGLE(shopId));
    } catch (err) {
      // Revert on failure
      setShops((prev) =>
        prev.map((s) => s._id === shopId ? { ...s, isActive: !s.isActive } : s)
      );
      toast.error(err.userMessage || 'Toggle failed');
    }
  };

  // ── Delete a shop (permanent — removes all related data) ────────────────
  const deleteShop = async (shopId) => {
    try {
      const res = await api.delete(API.SHOP_BY_ID(shopId));
      const { businessName, deleted } = res.data.data;

      setShops((prev) => prev.filter((s) => s._id !== shopId));

      toast.success(`${businessName} deleted`, {
        description: `Removed ${summarizeDeletedCounts(deleted)}.`,
      });
      return true;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete business');
      return false;
    }
  };

  useEffect(() => { fetchShops(); }, [fetchShops]);

  return {
    shops,
    pagination,
    loading,
    page,
    limit,
    search,
    isActive,
    businessType,
    handleSearchChange,
    handleActiveChange,
    handleTypeChange,
    handlePageChange,
    refetch: fetchShops,
    toggleShop,
    deleteShop,
  };
}
