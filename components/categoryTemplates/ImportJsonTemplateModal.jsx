// components/categoryTemplates/ImportJsonTemplateModal.jsx
'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import Modal  from '@/components/ui/Modal';
import Input  from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

const EMPTY_FORM = { category: '', name: '' };

/**
 * ImportJsonTemplateModal — imports a category template from a previously
 * exported (or hand-authored) JSON file. Server-side this deletes any
 * existing template for the chosen category before inserting the import,
 * so this warns before submit if one already exists rather than overwriting
 * silently. The file's own top-level `category`/`name` keys (if present,
 * e.g. from an exported file) are ignored in favor of the form's fields.
 *
 * Props:
 *   open           boolean — is the modal visible?
 *   onClose        fn      — hide modal
 *   templates      array   — existing templates, used to detect an overwrite
 *   importFromJson fn      — useCategoryTemplates().importFromJson (toasts + refetches internally)
 */
export default function ImportJsonTemplateModal({ open, onClose, templates, importFromJson }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [fileName, setFileName]   = useState('');
  const [parsedJson, setParsedJson] = useState(null);
  const [parseError, setParseError] = useState('');
  const [loading, setLoading]     = useState(false);

  const existingForCategory = useMemo(
    () => templates.find((t) => t.category === form.category) || null,
    [templates, form.category]
  );

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFileName('');
    setParsedJson(null);
    setParseError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsedJson(null);
    setParseError('');

    const reader = new FileReader();
    reader.onload = () => {
      try {
        setParsedJson(JSON.parse(reader.result));
      } catch {
        setParseError('This file is not valid JSON');
      }
    };
    reader.onerror = () => setParseError('Failed to read the selected file');
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    if (!parsedJson) {
      toast.error(parseError || 'Please select a JSON file to import');
      return;
    }

    setLoading(true);
    try {
      await importFromJson({
        category: form.category,
        name: form.name.trim(),
        nodes: parsedJson.nodes,
        edges: parsedJson.edges,
      });
      handleClose();
    } catch {
      // error already toasted by importFromJson — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import from JSON"
      subtitle="Import a category template from a previously exported JSON file"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Category"
          options={CATEGORY_TEMPLATE_CATEGORIES}
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          required
        />

        {/* Overwrite warning — import-from-json deletes the existing
            template for this category before inserting the new one */}
        {existingForCategory && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-bg text-warning-text">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">This will replace an existing template</p>
              <p>
                <strong>{existingForCategory.name}</strong> already covers this category
                (last updated {formatDate(existingForCategory.updatedAt)}). Importing will
                permanently delete it and put this one in its place.
              </p>
            </div>
          </div>
        )}

        <Input
          label="Template Name"
          placeholder="e.g. Salon starter kit"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">
            Template JSON file
          </label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="
              block w-full text-sm text-text-secondary
              file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-bg-subtle file:text-text-primary
              hover:file:bg-bg-overlay
            "
          />
          {fileName && !parseError && parsedJson && (
            <p className="text-xs text-text-tertiary">Loaded {fileName}</p>
          )}
          {parseError && (
            <p className="text-xs text-danger-text">{parseError}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Import Template
          </Button>
        </div>
      </form>
    </Modal>
  );
}
