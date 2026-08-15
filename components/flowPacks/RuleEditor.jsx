// components/flowPacks/RuleEditor.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import KeywordAutocomplete from './KeywordAutocomplete';
import { cn } from '@/lib/utils';

/** Stable identity for a rule that may not have a real _id yet (matches FlowMap.jsx node ids). */
export function getRuleKey(rule, index) {
  return String(rule._id || rule._tempId || index);
}

const MATCH_TYPES = [
  { value: 'contains',   label: 'Contains' },
  { value: 'exact',      label: 'Exact match' },
  { value: 'startsWith', label: 'Starts with' },
];

const REPLY_TYPES = [
  { value: 'text',            label: 'Text reply' },
  { value: 'booking_trigger', label: 'Booking trigger' },
  { value: 'payment_trigger', label: 'Payment trigger' },
];

const MAX_BUTTONS      = 3;
const MAX_LIST_OPTIONS = 10;

export const EMPTY_RULE = {
  keyword:       '',
  matchType:     'contains',
  hindiAliases:  [],
  reply:         '',
  replyType:     'text',
  replyImageUrl: '',
  buttons:       [],
  listOptions:   [],
};

/**
 * RuleEditor — manages the rules array for a flow pack
 * Adapted from components/templates/RuleEditor.jsx for the FlowPack.rules
 * shape (adds hindiAliases, replyImageUrl, buttons, listOptions).
 *
 * Props:
 *   rules         array        — current rules array
 *   onChange      fn(arr)      — called with updated rules array on every change
 *   focusRequest  {key, ts}    — when set, scrolls that rule into view and briefly highlights it
 *                                (used by FlowMap.jsx when a node is clicked)
 */
export default function RuleEditor({ rules = [], onChange, focusRequest }) {

  const rowRefs = useRef({});
  const [highlightKey, setHighlightKey] = useState(null);

  useEffect(() => {
    if (!focusRequest?.key) return;
    const el = rowRefs.current[focusRequest.key];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightKey(focusRequest.key);
    const timer = setTimeout(() => setHighlightKey(null), 1600);
    return () => clearTimeout(timer);
  }, [focusRequest]);

  const addRule = () => {
    onChange([...rules, { ...EMPTY_RULE, _tempId: Date.now() }]);
  };

  const removeRule = (index) => {
    onChange(rules.filter((_, i) => i !== index));
  };

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
          rules.map((rule, index) => {
            const key = getRuleKey(rule, index);
            return (
              <motion.div
                key={key}
                ref={(el) => { rowRefs.current[key] = el; }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <RuleRow
                  rule={rule}
                  index={index}
                  highlighted={highlightKey === key}
                  onChange={(field, val) => updateRule(index, field, val)}
                  onRemove={() => removeRule(index)}
                  existingKeywords={rules
                    .filter((_, i) => i !== index)
                    .map((r) => r.keyword)
                    .filter(Boolean)}
                />
              </motion.div>
            );
          })
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
function RuleRow({ rule, index, onChange, onRemove, highlighted, existingKeywords }) {

  const typeColors = {
    text:            'bg-info-bg    text-info-text',
    booking_trigger: 'bg-warning-bg text-warning-text',
    payment_trigger: 'bg-success-bg text-success-text',
  };

  return (
    <div className={cn(
      'bg-bg-subtle border border-border rounded-xl p-4 space-y-3',
      'hover:border-border-strong transition-colors duration-300',
      highlighted && 'border-brand-500 ring-2 ring-brand-500/40'
    )}>
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

      {/* Keyword + match type */}
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

      {/* Hindi aliases — tag input */}
      <TagInput
        label="Hindi aliases"
        hint="Alternate keywords a customer might type (Hinglish/Hindi)"
        values={rule.hindiAliases || []}
        onChange={(vals) => onChange('hindiAliases', vals)}
      />

      {/* Reply text + reply type */}
      <div className="grid grid-cols-3 gap-3">
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

      {/* Reply image URL */}
      <Input
        label="Reply image URL"
        placeholder="Optional — https://…"
        value={rule.replyImageUrl || ''}
        onChange={(e) => onChange('replyImageUrl', e.target.value)}
      />

      {/* Buttons (max 3) */}
      <ButtonsEditor
        buttons={rule.buttons || []}
        onChange={(vals) => onChange('buttons', vals)}
        existingKeywords={existingKeywords}
      />

      {/* List options (max 10) */}
      <ListOptionsEditor
        listOptions={rule.listOptions || []}
        onChange={(vals) => onChange('listOptions', vals)}
        existingKeywords={existingKeywords}
      />
    </div>
  );
}

// ── Hindi aliases tag input ─────────────────────────────────────────────────
function TagInput({ label, hint, values, onChange }) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const val = draft.trim();
    if (!val || values.includes(val)) { setDraft(''); return; }
    onChange([...values, val]);
    setDraft('');
  };

  const removeTag = (i) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-secondary">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          placeholder="Type an alias and press Enter"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(); }
          }}
          className="input-field flex-1 text-sm"
        />
        <Button type="button" variant="secondary" size="sm" onClick={addTag}>
          Add
        </Button>
      </div>
      {hint && <p className="text-xs text-text-tertiary">{hint}</p>}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {values.map((tag, i) => (
            <span key={i} className="badge badge-neutral pl-2.5 pr-1.5 gap-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-danger-bg hover:text-danger-text transition-colors duration-150"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Buttons editor (max 3) ──────────────────────────────────────────────────
function ButtonsEditor({ buttons, onChange, existingKeywords }) {
  const update = (i, field, value) => {
    onChange(buttons.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  };
  const remove = (i) => onChange(buttons.filter((_, idx) => idx !== i));
  const add = () => onChange([...buttons, { title: '', nextKeyword: '' }]);

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-text-secondary">
        Buttons <span className="text-text-tertiary font-normal">(max {MAX_BUTTONS})</span>
      </span>
      {buttons.map((btn, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="Button title"
            value={btn.title}
            onChange={(e) => update(i, 'title', e.target.value)}
            containerClassName="flex-1"
          />
          <div className="flex-1">
            <KeywordAutocomplete
              placeholder="Next keyword"
              value={btn.nextKeyword}
              onChange={(val) => update(i, 'nextKeyword', val)}
              existingKeywords={existingKeywords}
            />
          </div>
          <button
            onClick={() => remove(i)}
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
      {buttons.length < MAX_BUTTONS && (
        <Button
          variant="secondary"
          icon={Plus}
          size="sm"
          onClick={add}
          className="w-full border-dashed"
        >
          Add Button
        </Button>
      )}
    </div>
  );
}

// ── List options editor (max 10) ────────────────────────────────────────────
function ListOptionsEditor({ listOptions, onChange, existingKeywords }) {
  const update = (i, field, value) => {
    onChange(listOptions.map((o, idx) => idx === i ? { ...o, [field]: value } : o));
  };
  const remove = (i) => onChange(listOptions.filter((_, idx) => idx !== i));
  const add = () => onChange([...listOptions, { label: '', description: '', nextKeyword: '' }]);

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-text-secondary">
        List options <span className="text-text-tertiary font-normal">(max {MAX_LIST_OPTIONS})</span>
      </span>
      {listOptions.map((opt, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
          <Input
            placeholder="Label"
            value={opt.label}
            onChange={(e) => update(i, 'label', e.target.value)}
          />
          <Input
            placeholder="Description"
            value={opt.description}
            onChange={(e) => update(i, 'description', e.target.value)}
          />
          <KeywordAutocomplete
            placeholder="Next keyword"
            value={opt.nextKeyword}
            onChange={(val) => update(i, 'nextKeyword', val)}
            existingKeywords={existingKeywords}
          />
          <button
            onClick={() => remove(i)}
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
      {listOptions.length < MAX_LIST_OPTIONS && (
        <Button
          variant="secondary"
          icon={Plus}
          size="sm"
          onClick={add}
          className="w-full border-dashed"
        >
          Add List Option
        </Button>
      )}
    </div>
  );
}
