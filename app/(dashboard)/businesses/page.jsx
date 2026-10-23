// app/(dashboard)/businesses/page.jsx
'use client';

import { useState } from 'react';
import { useBusinesses } from '@/hooks/useBusinesses';
import BusinessFilters from '@/components/businesses/BusinessFilters';
import BusinessTable from '@/components/businesses/BusinessTable';
import DeleteBusinessModal from '@/components/businesses/DeleteBusinessModal';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function BusinessesPage() {
  const {
    businesses,
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
    toggleBusiness,
    deleteBusiness,
  } = useBusinesses();

  const [deletingBusiness, setDeletingBusiness] = useState(null);
  const [togglingBusiness, setTogglingBusiness] = useState(null);

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
      <BusinessFilters
        search={search}
        isActive={isActive}
        businessType={businessType}
        onSearchChange={handleSearchChange}
        onActiveChange={handleActiveChange}
        onTypeChange={handleTypeChange}
        totalBusinesses={pagination.total}
      />

      {/* Table */}
      <BusinessTable
        businesses={businesses}
        loading={loading}
        onToggle={setTogglingBusiness}
        onDelete={setDeletingBusiness}
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

      {/* Activate / deactivate confirmation — names the business so a tap on the wrong row is caught */}
      <ConfirmDialog
        open={!!togglingBusiness}
        onClose={() => setTogglingBusiness(null)}
        title={togglingBusiness?.isActive ? 'Deactivate business?' : 'Activate business?'}
        subject={togglingBusiness?.name}
        danger={!!togglingBusiness?.isActive}
        confirmLabel={togglingBusiness?.isActive ? 'Yes, deactivate' : 'Yes, activate'}
        onConfirm={() => toggleBusiness(togglingBusiness._id)}
      >
        <p>
          {togglingBusiness?.isActive
            ? <>Deactivating <strong>{togglingBusiness?.name}</strong> will immediately stop their WhatsApp chatbot from responding to customers.</>
            : <>Activating <strong>{togglingBusiness?.name}</strong> will let their chatbot respond to customers again.</>}
        </p>
      </ConfirmDialog>

      {/* Delete confirmation */}
      <DeleteBusinessModal
        open={!!deletingBusiness}
        business={deletingBusiness}
        onClose={() => setDeletingBusiness(null)}
        onConfirm={deleteBusiness}
      />
    </div>
  );
}
