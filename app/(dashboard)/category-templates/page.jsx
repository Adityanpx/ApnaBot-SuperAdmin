// app/(dashboard)/category-templates/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Info } from 'lucide-react';
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

      {/* How to edit a template */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-info-bg text-info-text">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Want to edit an existing template?</p>
          <p>
            There&apos;s no in-place editor here yet. Edit it via a real business instead:
          </p>
          <ol className="list-decimal list-inside mt-1 space-y-0.5">
            <li>Pick a business already on this category (or create one).</li>
            <li>
              In that business&apos;s dashboard → Auto-Replies → Versions, click
              &ldquo;Import starter template&rdquo; and choose the one you want to edit.
            </li>
            <li>Edit it visually in that business&apos;s Canvas tab.</li>
            <li>Come back here and use &ldquo;Clone from Business&rdquo; to save your edits as a template again.</li>
          </ol>
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
