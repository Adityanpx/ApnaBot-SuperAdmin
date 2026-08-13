// components/templates/FieldEditor.jsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

const EMPTY_FIELD = {
  fieldKey:     '',
  label:        '',
  summaryLabel: '',
  required:     true,
  order:        1,
  fieldType:    'text',
  options:      [],
};

const FIELD_TYPE_OPTIONS = [
  { value: 'text',    label: 'Text' },
  { value: 'buttons', label: 'Buttons' },
  { value: 'list',    label: 'List' },
];

/**
 * FieldEditor — manages the bookingFields array for a template
 * Props:
 *   fields    array   — current booking fields array
 *   onChange  fn(arr) — called with updated fields on every change
 */
export default function FieldEditor({ fields = [], onChange }) {

  const addField = () => {
    const newOrder = fields.length + 1;
    onChange([...fields, { ...EMPTY_FIELD, order: newOrder, _tempId: Date.now() }]);
  };

  const removeField = (index) => {
    // Re-number order after removal
    const updated = fields
      .filter((_, i) => i !== index)
      .map((f, i) => ({ ...f, order: i + 1 }));
    onChange(updated);
  };

  const updateField = (index, field, value) => {
    const updated = fields.map((f, i) =>
      i === index
        ? (typeof field === 'object' ? { ...f, ...field } : { ...f, [field]: value })
        : f
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">

      <AnimatePresence initial={false}>
        {fields.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-sm text-text-tertiary border border-dashed border-border rounded-xl"
          >
            No fields yet. Click &quot;Add Field&quot; to create the first one.
          </motion.div>
        ) : (
          fields.map((field, index) => (
            <motion.div
              key={field._id || field._tempId || index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FieldRow
                field={field}
                index={index}
                onChange={(key, val) => updateField(index, key, val)}
                onRemove={() => removeField(index)}
              />
            </motion.div>
          ))
        )}
      </AnimatePresence>

      <Button
        variant="secondary"
        icon={Plus}
        size="sm"
        onClick={addField}
        className="w-full border-dashed"
      >
        Add Field
      </Button>
    </div>
  );
}

// ── Single field row ───────────────────────────────────────────────────────
function FieldRow({ field, index, onChange, onRemove }) {
  return (
    <div className="
      bg-bg-subtle border border-border rounded-xl p-4 space-y-3
      hover:border-border-strong transition-colors duration-150
    ">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-text-disabled" />
          <span className="text-xs font-bold text-text-tertiary">
            Field #{field.order || index + 1}
          </span>
          {field.required && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-info-bg text-info-text uppercase tracking-wide">
              Required
            </span>
          )}
        </div>
        <button
          onClick={onRemove}
          className="
            w-6 h-6 rounded-lg flex items-center justify-center
            text-text-tertiary hover:text-danger-text hover:bg-danger-bg
            transition-colors duration-150
          "
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Field key + label */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Field key (camelCase)"
          placeholder="e.g. customerName"
          value={field.fieldKey}
          onChange={(e) => onChange('fieldKey', e.target.value)}
          hint="Used internally — no spaces"
        />
        <Input
          label="Bot question label"
          placeholder="What is your name?"
          value={field.label}
          onChange={(e) => onChange('label', e.target.value)}
          hint="Shown to customer in chat"
        />
      </div>

      {/* Summary label + Field type */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Summary label"
          placeholder="e.g. Name"
          value={field.summaryLabel || ''}
          onChange={(e) => onChange('summaryLabel', e.target.value)}
          hint="Short name used in the booking confirmation"
        />
        <Select
          label="Field type"
          options={FIELD_TYPE_OPTIONS}
          placeholder={null}
          value={field.fieldType || 'text'}
          onChange={(e) => {
            const value = e.target.value;
            onChange(value === 'text' ? { fieldType: value, options: [] } : { fieldType: value });
          }}
        />
      </div>

      {/* Options editor — only for buttons/list field types */}
      {(field.fieldType === 'buttons' || field.fieldType === 'list') && (
        <div className="space-y-2">
          <span className="block text-sm font-medium text-text-secondary">Options</span>
          {(field.options || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={opt}
                placeholder={`Option ${i + 1}`}
                onChange={(e) => {
                  const updated = [...field.options];
                  updated[i] = e.target.value;
                  onChange('options', updated);
                }}
                containerClassName="flex-1"
              />
              <button
                onClick={() => onChange('options', field.options.filter((_, idx) => idx !== i))}
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  text-text-tertiary hover:text-danger-text hover:bg-danger-bg
                  transition-colors duration-150
                "
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <Button
            variant="secondary"
            icon={Plus}
            size="sm"
            onClick={() => onChange('options', [...(field.options || []), ''])}
            className="w-full border-dashed"
          >
            Add Option
          </Button>
        </div>
      )}

      {/* Order + Required toggle */}
      <div className="flex items-center justify-between">
        <div className="w-28">
          <Input
            label="Order"
            type="number"
            value={field.order}
            onChange={(e) => onChange('order', parseInt(e.target.value) || 1)}
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <span className="text-sm font-medium text-text-secondary">Required</span>
          <div
            onClick={() => onChange('required', !field.required)}
            className={`
              relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer
              ${field.required ? 'bg-brand-500' : 'bg-bg-overlay border border-border'}
            `}
          >
            <span className={`
              absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
              transition-transform duration-200 shadow-sm
              ${field.required ? 'translate-x-4' : 'translate-x-0'}
            `} />
          </div>
        </label>
      </div>
    </div>
  );
}
