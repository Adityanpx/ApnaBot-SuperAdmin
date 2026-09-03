// app/(dashboard)/business-categories/page.jsx
'use client';

import { motion } from 'framer-motion';
import { useBusinessCategories } from '@/hooks/useBusinessCategories';
import BusinessCategoryTable from '@/components/businessCategories/BusinessCategoryTable';

export default function BusinessCategoriesPage() {
  const { categories, loading, toggleCategory } = useBusinessCategories();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div>
        <h1 className="page-title">Business Categories</h1>
        <p className="text-sm text-text-secondary mt-1">
          Choose which business categories are offered to new signups
        </p>
      </div>

      {/* Table */}
      <BusinessCategoryTable
        categories={categories}
        loading={loading}
        onToggle={toggleCategory}
      />
    </motion.div>
  );
}
