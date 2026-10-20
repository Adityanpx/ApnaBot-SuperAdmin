// app/(dashboard)/category-templates/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Info, Star, AlertTriangle } from 'lucide-react';
import { useCategoryTemplates } from '@/hooks/useCategoryTemplates';
import CategoryTemplateTable from '@/components/categoryTemplates/CategoryTemplateTable';
import CloneCategoryTemplateModal from '@/components/categoryTemplates/CloneCategoryTemplateModal';
import ImportJsonTemplateModal from '@/components/categoryTemplates/ImportJsonTemplateModal';
import DeleteCategoryTemplateModal from '@/components/categoryTemplates/DeleteCategoryTemplateModal';
import TranslateCategoryTemplateModal from '@/components/categoryTemplates/TranslateCategoryTemplateModal';
import DefaultFlowModal from '@/components/categoryTemplates/DefaultFlowModal';
import CreateDefaultFlowModal from '@/components/categoryTemplates/CreateDefaultFlowModal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';
import {
  defaultFor, filterByCategory, noDefaultNotice, categoriesMissingDefault,
} from '@/lib/categoryTemplates';

const ALL_CATEGORIES = [{ value: 'all', label: 'All categories' }, ...CATEGORY_TEMPLATE_CATEGORIES];
const labelOf = (v) => CATEGORY_TEMPLATE_CATEGORIES.find((c) => c.value === v)?.label || v;

export default function CategoryTemplatesPage() {
  const {
    templates, loading,
    cloneFromBusiness, deleteTemplate,
    importFromJson, exportTemplate, setDefault, unsetDefault,
    translateTemplate,
  } = useCategoryTemplates();

  // Modal state
  const [showClone, setShowClone]             = useState(false);
  const [showImportJson, setShowImportJson]   = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [showCreateDefault, setShowCreateDefault] = useState(false);
  const [defaultAction, setDefaultAction] = useState(null); // { mode, template }
  const [translatingTemplate, setTranslatingTemplate] = useState(null);
  const [category, setCategory] = useState('all');

  const selected = category === 'all' ? '' : category;
  const visible = filterByCategory(templates, selected);
  const missing = categoriesMissingDefault(templates).map(labelOf);
  let notice = null;
  if (!loading && selected) notice = noDefaultNotice(templates, selected, labelOf(selected));
  else if (!loading && missing.length > 0) {
    notice = `No default yet for: ${missing.join(', ')}. New businesses there get the General default.`;
  }
  const actionCategory = defaultAction?.template.category;

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
          <Button variant="secondary" icon={Star} onClick={() => setShowCreateDefault(true)}>
            Create default from business
          </Button>
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
          <p className="font-semibold mb-1">Defaults and editing</p>
          <p>
            The default template of a category is what new businesses in that category start
            with. Open a template to review its replies and edit their text and Hindi / Marathi
            translations. To change the flow itself, edit it through a real business and use
            &ldquo;Clone from Business&rdquo; to save it again.
          </p>
        </div>
      </div>

      {/* Category filter + no-default notice */}
      <div className="space-y-3">
        <Select
          label="Category"
          options={ALL_CATEGORIES}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder={null}
          containerClassName="max-w-xs"
        />
        {notice && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-bg text-warning-text">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{notice}</p>
          </div>
        )}
      </div>

      {/* Table */}
      <CategoryTemplateTable
        templates={visible}
        loading={loading}
        onDelete={setDeletingTemplate}
        onExport={exportTemplate}
        onSetDefault={(template) => setDefaultAction({ mode: 'set', template })}
        onUnsetDefault={(template) => setDefaultAction({ mode: 'unset', template })}
        onTranslate={setTranslatingTemplate}
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
      <DefaultFlowModal
        open={!!defaultAction}
        mode={defaultAction?.mode}
        template={defaultAction?.template}
        categoryLabel={labelOf(actionCategory)}
        replacing={defaultAction?.mode === 'set' ? defaultFor(templates, actionCategory) : undefined}
        onClose={() => setDefaultAction(null)}
        onConfirm={(t) => (defaultAction.mode === 'set' ? setDefault(t._id) : unsetDefault(t._id))}
      />
      <CreateDefaultFlowModal
        open={showCreateDefault}
        onClose={() => setShowCreateDefault(false)}
        cloneFromBusiness={cloneFromBusiness}
        setDefault={setDefault}
      />
      <TranslateCategoryTemplateModal
        open={!!translatingTemplate}
        template={translatingTemplate}
        onClose={() => setTranslatingTemplate(null)}
        translateTemplate={translateTemplate}
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
