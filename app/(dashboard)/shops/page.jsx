// app/(dashboard)/shops/page.jsx
'use client';

import { useState } from 'react';
import { useShops } from '@/hooks/useShops';
import ShopFilters from '@/components/shops/ShopFilters';
import ShopTable from '@/components/shops/ShopTable';
import DeleteShopModal from '@/components/shops/DeleteShopModal';
import Pagination from '@/components/ui/Pagination';

export default function ShopsPage() {
  const {
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
    toggleShop,
    deleteShop,
  } = useShops();

  const [deletingShop, setDeletingShop] = useState(null);

  return (
    <div className="space-y-6 max-w-screen-xl">

      {/* Page header */}
      <div>
        <h1 className="page-title">Business</h1>
        <p className="text-sm text-text-secondary mt-1">
          View, search, and manage all registered businesses on the platform.
        </p>
      </div>

      {/* Filters */}
      <ShopFilters
        search={search}
        isActive={isActive}
        businessType={businessType}
        onSearchChange={handleSearchChange}
        onActiveChange={handleActiveChange}
        onTypeChange={handleTypeChange}
        totalShops={pagination.total}
      />

      {/* Table */}
      <ShopTable
        shops={shops}
        loading={loading}
        onToggle={toggleShop}
        onDelete={setDeletingShop}
      />

      {/* Pagination */}
      {!loading && (
        <Pagination
          page={page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
          total={pagination.total}
          limit={limit}
        />
      )}

      {/* Delete confirmation */}
      <DeleteShopModal
        open={!!deletingShop}
        shop={deletingShop}
        onClose={() => setDeletingShop(null)}
        onConfirm={deleteShop}
      />
    </div>
  );
}