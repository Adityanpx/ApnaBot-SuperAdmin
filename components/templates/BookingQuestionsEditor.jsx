// components/templates/BookingQuestionsEditor.jsx
'use client';

import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { NON_ENGLISH_LANGUAGES } from '@/lib/constants';

const TRANSLATABLE_TYPES = ['buttons', 'list'];

/**
 * BookingQuestionsEditor — edits labelTranslations on a template's
 * bookingFields array (the field's own label, and each buttons/list
 * option's label) for every non-English language in NON_ENGLISH_LANGUAGES.
 *
 * Everything else on a field/option (fieldKey, order, required,
 * summaryLabel, fieldType, option value) is read-only here — this tab only
 * ever writes the labelTranslations key. Option `value` is never touched:
 * it's matched against English data during booking, so changing or
 * reordering it here would silently break fare/option lookups.
 *
 * Props:
 *   fields    array   — current booking fields array (same array FieldEditor edits)
 *   onChange  fn(arr) — called with updated fields on every change
 */
export default function BookingQuestionsEditor({ fields = [], onChange }) {
  // Display order follows the field's `order` value, but edits are applied
  // by the field's actual index in `fields` — order is never rewritten here.
  const displayOrder = fields
    .map((field, index) => ({ field, index }))
    .sort((a, b) => (a.field.order ?? 0) - (b.field.order ?? 0));

  const setFieldLabelTranslation = (fieldIndex, langCode, value) => {
    const updated = fields.map((f, i) =>
      i !== fieldIndex
        ? f
        : { ...f, labelTranslations: { ...(f.labelTranslations || {}), [langCode]: value } }
    );
    onChange(updated);
  };

  const setOptionLabelTranslation = (fieldIndex, optionIndex, langCode, value) => {
    const updated = fields.map((f, i) => {
      if (i !== fieldIndex) return f;
      const options = (f.options || []).map((opt, oi) => {
        if (oi !== optionIndex) return opt;
        // Upgrade a plain-string option to {value,label} so it has somewhere
        // to hold labelTranslations — `value`/`label` stay equal to the
        // original string, only labelTranslations is new.
        const base = typeof opt === 'string' ? { value: opt, label: opt } : { ...opt };
        return { ...base, labelTranslations: { ...(base.labelTranslations || {}), [langCode]: value } };
      });
      return { ...f, options };
    });
    onChange(updated);
  };

  if (fields.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-text-tertiary border border-dashed border-border rounded-xl">
        No booking fields yet — add fields in the &quot;Booking Fields&quot; tab first.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayOrder.map(({ field, index }) => (
        <FieldTranslationRow
          key={field._id || field._tempId || index}
          field={field}
          onLabelChange={(langCode, value) => setFieldLabelTranslation(index, langCode, value)}
          onOptionLabelChange={(optionIndex, langCode, value) =>
            setOptionLabelTranslation(index, optionIndex, langCode, value)
          }
        />
      ))}
    </div>
  );
}

// ── Single field's translation row ──────────────────────────────────────────
function FieldTranslationRow({ field, onLabelChange, onOptionLabelChange }) {
  const isTranslatable = TRANSLATABLE_TYPES.includes(field.fieldType);

  return (
    <div className="bg-bg-subtle border border-border rounded-xl p-4 space-y-3">
      {/* Read-only identity — fieldKey / fieldType / English label */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-text-tertiary">
          #{field.order ?? '–'}
        </span>
        <code className="text-xs font-mono text-text-primary bg-bg-overlay px-1.5 py-0.5 rounded">
          {field.fieldKey}
        </code>
        <Badge variant={isTranslatable ? 'brand' : 'neutral'}>
          {field.fieldType || 'text'}
        </Badge>
        <span className="text-sm text-text-secondary italic truncate">
          &quot;{field.label}&quot;
        </span>
      </div>

      {!isTranslatable ? (
        <p className="text-xs text-text-tertiary">
          Stays English — this field&apos;s answers are matched against English data, so it isn&apos;t translated here.
        </p>
      ) : (
        <>
          {/* Field label translations */}
          <div className="grid grid-cols-2 gap-3">
            {NON_ENGLISH_LANGUAGES.map((lang) => (
              <Input
                key={lang.code}
                label={`Label (${lang.label})`}
                placeholder={field.label}
                value={field.labelTranslations?.[lang.code] || ''}
                onChange={(e) => onLabelChange(lang.code, e.target.value)}
              />
            ))}
          </div>

          {/* Option label translations — value is read-only, never edited/reordered */}
          {(field.options || []).length > 0 && (
            <div className="space-y-2">
              <span className="block text-sm font-medium text-text-secondary">Options</span>
              {(field.options || []).map((opt, i) => {
                const value = typeof opt === 'string' ? opt : opt.value;
                const translations = typeof opt === 'string' ? null : opt.labelTranslations;
                return (
                  <div
                    key={i}
                    className="border border-border rounded-lg p-3 space-y-2 bg-bg-raised"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wide">
                        Value
                      </span>
                      <code className="text-xs font-mono text-text-primary bg-bg-overlay px-1.5 py-0.5 rounded">
                        {value}
                      </code>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {NON_ENGLISH_LANGUAGES.map((lang) => (
                        <Input
                          key={lang.code}
                          label={`${lang.label}`}
                          placeholder={value}
                          value={translations?.[lang.code] || ''}
                          onChange={(e) => onOptionLabelChange(i, lang.code, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
