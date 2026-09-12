// components/whatsappFlows/EditFlowModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Modal  from '@/components/ui/Modal';
import Input  from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';

/**
 * EditFlowModal — edits an existing WhatsApp flow definition
 * Props:
 *   open       boolean — is the modal visible?
 *   flow       object  — the flow being edited (null when closed)
 *   onClose    fn      — hide modal
 *   updateFlow fn      — useWhatsappFlows().updateFlow (toasts + refetches internally)
 */
export default function EditFlowModal({ open, flow, onClose, updateFlow }) {
  const [form, setForm]             = useState({ category: '', name: '', flowJsonText: '' });
  const [parsedJson, setParsedJson] = useState(null);
  const [parseError, setParseError] = useState('');
  const [loading, setLoading]       = useState(false);

  // Populate form when flow changes
  useEffect(() => {
    if (flow) {
      setForm({
        category: flow.category || '',
        name: flow.name || '',
        flowJsonText: flow.flowJson ? JSON.stringify(flow.flowJson, null, 2) : '',
      });
      setParsedJson(flow.flowJson || null);
      setParseError('');
    }
  }, [flow]);

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
      await updateFlow(flow._id, {
        category: form.category,
        name: form.name.trim(),
        flowJson: parsedJson,
      });
      onClose();
    } catch {
      // error already toasted by updateFlow — keep the modal open
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit WhatsApp Flow"
      subtitle="Update an existing flow definition"
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
