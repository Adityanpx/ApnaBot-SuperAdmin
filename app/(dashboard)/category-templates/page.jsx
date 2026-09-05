// app/(dashboard)/category-templates/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload } from 'lucide-react';
import { useCategoryTemplates } from '@/hooks/useCategoryTemplates';
import CategoryTemplateTable from '@/components/categoryTemplates/CategoryTemplateTable';
import CloneCategoryTemplateModal from '@/components/categoryTemplates/CloneCategoryTemplateModal';
import ImportJsonTemplateModal from '@/components/categoryTemplates/ImportJsonTemplateModal';
import DeleteCategoryTemplateModal from '@/components/categoryTemplates/DeleteCategoryTemplateModal';
import Button from '@/components/ui/Button';

export default function CategoryTemplatesPage() {
  const {
    templates, loading,
    cloneFromBusiness, deleteTemplate,
    importFromJson, exportTemplate,
  } = useCategoryTemplates();

  // Modal state
  const [showClone, setShowClone]             = useState(false);
  const [showImportJson, setShowImportJson]   = useState(false);
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
            Reusable chatbot rule sets for business categories, cloned from an existing business
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={Upload}
            onClick={() => setShowImportJson(true)}
          >
            Import from JSON
          </Button>
          <Button
            icon={Plus}
            onClick={() => setShowClone(true)}
          >
            Clone from Business
          </Button>
        </div>
      </div>

      {/* Table */}
      <CategoryTemplateTable
        templates={templates}
        loading={loading}
        onDelete={setDeletingTemplate}
        onExport={exportTemplate}
      />

      {/* Modals — mutation hook toasts + refetches internally on success */}
      <CloneCategoryTemplateModal
        open={showClone}
        onClose={() => setShowClone(false)}
        cloneFromBusiness={cloneFromBusiness}
      />
      <ImportJsonTemplateModal
        open={showImportJson}
        onClose={() => setShowImportJson(false)}
        importFromJson={importFromJson}
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
