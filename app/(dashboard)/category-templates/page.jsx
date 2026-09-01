// app/(dashboard)/category-templates/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useCategoryTemplates } from '@/hooks/useCategoryTemplates';
import CategoryTemplateTable from '@/components/categoryTemplates/CategoryTemplateTable';
import CloneCategoryTemplateModal from '@/components/categoryTemplates/CloneCategoryTemplateModal';
import DeleteCategoryTemplateModal from '@/components/categoryTemplates/DeleteCategoryTemplateModal';
import Button from '@/components/ui/Button';

export default function CategoryTemplatesPage() {
  const {
    templates, loading,
    cloneFromBusiness, deleteTemplate,
  } = useCategoryTemplates();

  // Modal state
  const [showClone, setShowClone]             = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(null);

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
          <h1 className="page-title">Category Templates</h1>
          <p className="text-sm text-text-secondary mt-1">
            One reusable chatbot rule set per business category, cloned from an existing business
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => setShowClone(true)}
        >
          Clone from Business
        </Button>
      </div>

      {/* Table */}
      <CategoryTemplateTable
        templates={templates}
        loading={loading}
        onDelete={setDeletingTemplate}
      />

      {/* Modals — mutation hook toasts + refetches internally on success */}
      <CloneCategoryTemplateModal
        open={showClone}
        onClose={() => setShowClone(false)}
        templates={templates}
        cloneFromBusiness={cloneFromBusiness}
      />
      <DeleteCategoryTemplateModal
        open={!!deletingTemplate}
        template={deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        deleteTemplate={deleteTemplate}
      />
    </motion.div>
  );
}
