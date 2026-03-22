// components/templates/RuleEditor.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';

const MATCH_TYPES = [
  { value: 'contains',    label: 'Contains' },
  { value: 'exact',       label: 'Exact match' },
  { value: 'starts_with', label: 'Starts with' },
];

const REPLY_TYPES = [
  { value: 'text',            label: 'Text reply' },
  { value: 'booking_trigger', label: 'Booking trigger' },
  { value: 'payment_link',    label: 'Payment link' },
];

const EMPTY_RULE = {
  keyword:   '',
  matchType: 'contains',
  reply:     '',
  replyType: 'text',
};

/**
 * RuleEditor — manages the defaultRules array for a template
 * Props:
 *   rules     array   — current rules array
 *   onChange  fn(arr) — called with updated rules array on every change
 */
export default function RuleEditor({ rules = [], onChange }) {

  // ── Add new empty rule ─────────────────────────────────────────────────
  const addRule = () => {
    onChange([...rules, { ...EMPTY_RULE, _tempId: Date.now() }]);
  };

  // ── Remove rule by index ───────────────────────────────────────────────
  const removeRule = (index) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  // ── Update single field of a rule ─────────────────────────────────────
  const updateRule = (index, field, value) => {
    const updated = rules.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">

      {/* Rules list */}
      <AnimatePresence initial={false}>
        {rules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-sm text-text-tertiary border border-dashed border-border rounded-xl"
          >
            No rules yet. Click &quot;Add Rule&quot; to create the first one.
          </motion.div>
        ) : (
          rules.map((rule, index) => (
            <motion.div
              key={rule._id || rule._tempId || index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RuleRow
                rule={rule}
                index={index}
                total={rules.length}
                onChange={(field, val) => updateRule(index, field, val)}
                onRemove={() => removeRule(index)}
              />
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {/* Add rule button */}
      <Button
        variant="secondary"
        icon={Plus}
        size="sm"
        onClick={addRule}
        className="w-full border-dashed"
      >
        Add Rule
      </Button>
    </div>
  );
}

// ── Single rule row ────────────────────────────────────────────────────────
function RuleRow({ rule, index, onChange, onRemove }) {

  // Reply type colour indicator
  const typeColors = {
    text:            'bg-info-bg    text-info-text',
    booking_trigger: 'bg-warning-bg text-warning-text',
    payment_link:    'bg-success-bg text-success-text',
  };

  return (
    <div className="
      bg-bg-subtle border border-border rounded-xl p-4 space-y-3
      hover:border-border-strong transition-colors duration-150
    ">
      {/* Row header — rule number + type indicator + delete */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-text-disabled cursor-grab" />
          <span className="text-xs font-bold text-text-tertiary">
            Rule #{index + 1}
          </span>
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
            typeColors[rule.replyType] || typeColors.text
          )}>
            {rule.replyType?.replace('_', ' ')}
          </span>
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

      {/* Fields — 2 col grid for keyword+matchType, then reply+replyType */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Keyword"
          placeholder="e.g. price"
          value={rule.keyword}
          onChange={(e) => onChange('keyword', e.target.value)}
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">
            Match type
          </label>
          <select
            value={rule.matchType}
            onChange={(e) => onChange('matchType', e.target.value)}
            className="input-field appearance-none cursor-pointer"
          >
            {MATCH_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Reply text — spans 2 cols */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Reply text
          </label>
          <textarea
            rows={2}
            placeholder="What the bot will send…"
            value={rule.reply}
            onChange={(e) => onChange('reply', e.target.value)}
            className="input-field resize-none text-sm"
          />
        </div>

        {/* Reply type */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">
            Reply type
          </label>
          <select
            value={rule.replyType}
            onChange={(e) => onChange('replyType', e.target.value)}
            className="input-field appearance-none cursor-pointer h-[72px]"
          >
            {REPLY_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
