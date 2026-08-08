// app/(dashboard)/vehicle-catalog/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Car } from 'lucide-react';
import { useVehicleCatalog } from '@/hooks/useVehicleCatalog';
import VehicleCatalogCard from '@/components/vehicleCatalog/VehicleCatalogCard';
import CreateVehicleCatalogModal from '@/components/vehicleCatalog/CreateVehicleCatalogModal';
import EditVehicleCatalogModal from '@/components/vehicleCatalog/EditVehicleCatalogModal';
import DeleteVehicleCatalogModal from '@/components/vehicleCatalog/DeleteVehicleCatalogModal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

export default function VehicleCatalogPage() {
  const {
    catalog, loading,
    createEntry, updateEntry, deleteEntry, uploadImage,
  } = useVehicleCatalog();

  // Modal state
  const [showCreate, setShowCreate]   = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);

  // updateEntry toasts + refetches internally — errors are swallowed here
  // only to keep the toggle click from throwing into the console.
  const handleToggle = async (entry) => {
    try {
      await updateEntry(entry._id, { isActive: !entry.isActive });
    } catch {
      // no-op
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Vehicle Catalog</h1>
          <p className="text-sm text-text-secondary mt-1">
            Vehicle types shop owners can add to their fleet
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => setShowCreate(true)}
        >
          Add Vehicle Type
        </Button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 space-y-4">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-6 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && catalog.length === 0 && (
        <EmptyState
          icon={Car}
          title="No vehicle types yet"
          description="Add one so shop owners can build their fleet."
          action={{
            label: 'Add Vehicle Type',
            onClick: () => setShowCreate(true),
          }}
        />
      )}

      {/* Catalog grid */}
      {!loading && catalog.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalog.map((entry, idx) => (
            <VehicleCatalogCard
              key={entry._id}
              entry={entry}
              delay={idx * 0.1}
              onEdit={() => setEditingEntry(entry)}
              onDelete={() => setDeletingEntry(entry)}
              onToggle={() => handleToggle(entry)}
            />
          ))}
        </div>
      )}

      {/* Modals — mutation hooks toast + refetch internally on success */}
      <CreateVehicleCatalogModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        createEntry={createEntry}
        uploadImage={uploadImage}
      />
      <EditVehicleCatalogModal
        open={!!editingEntry}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        updateEntry={updateEntry}
        uploadImage={uploadImage}
      />
      <DeleteVehicleCatalogModal
        open={!!deletingEntry}
        entry={deletingEntry}
        onClose={() => setDeletingEntry(null)}
        deleteEntry={deleteEntry}
      />
    </motion.div>
  );
}
