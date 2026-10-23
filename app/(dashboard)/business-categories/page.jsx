// app/(dashboard)/business-categories/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useBusinessCategories } from '@/hooks/useBusinessCategories';
import BusinessCategoryTable from '@/components/businessCategories/BusinessCategoryTable';
import BusinessCategoryFormModal from '@/components/businessCategories/BusinessCategoryFormModal';
import Button from '@/components/ui/Button';

export default function BusinessCategoriesPage() {
  const { categories, loading, toggleCategory, saveCategory } = useBusinessCategories();
  // undefined = closed, null = creating, category = editing
  const [editing, setEditing] = useState(undefined);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Business Categories</h1>
          <p className="text-sm text-text-secondary mt-1">
            Choose which business categories are offered to new signups
          </p>
        </div>
        <Button icon={Plus} onClick={() => setEditing(null)}>Add category</Button>
      </div>

      {/* Table */}
      <BusinessCategoryTable
        categories={categories}
        loading={loading}
        onToggle={toggleCategory}
        onEdit={setEditing}
      />

      <BusinessCategoryFormModal
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        category={editing || undefined}
        onSave={saveCategory}
      />
    </motion.div>
  );
}
