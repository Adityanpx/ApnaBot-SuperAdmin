// hooks/useShops.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';

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
      if (businessType) params.businessType = businessType;

      const res = await api.get(API.SHOPS, { params });
      setShops(res.data.data.shops);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load shops');
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
  };
}
