// components/whatsappFlows/CreateFlowModal.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Modal  from '@/components/ui/Modal';
import Input  from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';

const EMPTY_FORM = { category: '', name: '', flowJsonText: '' };

/**
 * CreateFlowModal — creates a WhatsApp flow definition from a hand-authored
 * Flow JSON. Unlike category templates (which are exported from this system),
 * flow JSON is normally copied out of Meta's Flow Builder, so it's pasted into
 * a textarea rather than uploaded as a file.
 *
 * Props:
 *   open       boolean — is the modal visible?
 *   onClose    fn      — hide modal
 *   createFlow fn      — useWhatsappFlows().createFlow (toasts + refetches internally)
 */
export default function CreateFlowModal({ open, onClose, createFlow }) {
  const [form, setForm]             = useState(EMPTY_FORM);
  const [parsedJson, setParsedJson] = useState(null);
  const [parseError, setParseError] = useState('');
  const [loading, setLoading]       = useState(false);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setParsedJson(null);
    setParseError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleJsonChange = (e) => {
    const text = e.target.value;
    setForm((prev) => ({ ...prev, flowJsonText: text }));
    setParsedJson(null);
    setParseError('');

    if (!text.trim()) return;
    try {
      setParsedJson(JSON.parse(text));
    } catch {
      setParseError('This is not valid JSON');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Please enter a flow name');
      return;
    }
    if (!parsedJson) {
      toast.error(parseError || 'Please paste the flow JSON');
      return;
    }

    setLoading(true);
    try {
      await createFlow({
        category: form.category,
        name: form.name.trim(),
        flowJson: parsedJson,
      });
      handleClose();
    } catch {
      // error already toasted by createFlow — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New WhatsApp Flow"
      subtitle="Paste a Flow JSON from Meta's Flow Builder"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Category"
          options={CATEGORY_TEMPLATE_CATEGORIES}
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          required
        />

        <Input
          label="Flow Name"
          placeholder="e.g. Salon appointment booking"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">
            Flow JSON
          </label>
          <textarea
            rows={12}
            spellCheck={false}
            value={form.flowJsonText}
            onChange={handleJsonChange}
            placeholder='{ "version": "3.1", "screens": [ … ] }'
            className="input-field font-mono text-xs resize-y"
          />
          {parsedJson && !parseError && (
            <p className="text-xs text-text-tertiary">Valid JSON</p>
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
            Create Flow
          </Button>
        </div>
      </form>
    </Modal>
  );
}
