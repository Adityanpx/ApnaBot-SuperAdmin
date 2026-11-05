// app/(dashboard)/businesses/page.jsx
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useCategorySummary } from '@/hooks/useCategorySummary';
import BusinessFilters from '@/components/businesses/BusinessFilters';
import BusinessTable from '@/components/businesses/BusinessTable';
import CategorySummaryStrip from '@/components/businesses/CategorySummaryStrip';
import DeleteBusinessModal from '@/components/businesses/DeleteBusinessModal';
import Pagination from '@/components/ui/Pagination';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import { API } from '@/lib/constants';
import { downloadCsv } from '@/lib/downloadCsv';
import { filterParams } from '@/lib/businessList';

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
    connected,
    handleSearchChange,
    handleActiveChange,
    handleTypeChange,
    handleConnectedChange,
    handlePageChange,
    toggleBusiness,
    deleteBusiness,
  } = useBusinesses();

  const [deletingBusiness, setDeletingBusiness] = useState(null);
  const [togglingBusiness, setTogglingBusiness] = useState(null);
  const [exporting, setExporting] = useState(false);
  const summary = useCategorySummary();

  // The CSV carries whatever filters the list is showing now (all pages)
  const exportCsv = async () => {
    setExporting(true);
    try {
      const params = filterParams({ search, isActive, businessType, connected });
      await downloadCsv(API.BUSINESSES_CSV, params, 'businesses.csv');
    } catch {
      toast.error('Could not export the CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 min-w-0 lg:-mx-2">

      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Business</h1>
          <p className="text-sm text-text-secondary mt-1">
            View, search, and manage all registered businesses on the platform.
          </p>
        </div>
        <Button variant="outline" icon={Download} loading={exporting} onClick={exportCsv}>Export CSV</Button>
      </div>

      {/* Businesses per category; a chip filters the list */}
      <CategorySummaryStrip
        total={summary.total}
        categories={summary.categories}
        selected={businessType}
        onSelect={handleTypeChange}
      />

      {/* Filters */}
      <BusinessFilters
        search={search}
        isActive={isActive}
        businessType={businessType}
        connected={connected}
        onSearchChange={handleSearchChange}
        onActiveChange={handleActiveChange}
        onTypeChange={handleTypeChange}
        onConnectedChange={handleConnectedChange}
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
