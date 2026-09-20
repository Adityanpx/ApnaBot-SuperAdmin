// components/businessCategoryTemplates/BusinessCategoryTemplateCard.jsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ListChecks } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { FLOW_PACK_CATEGORIES } from '@/lib/constants';
import { cn, formatDate } from '@/lib/utils';

/**
 * BusinessCategoryTemplateCard — one booking-form (flow_fields) starter
 * template. Expands to a read-only field list. Templates are seeded/updated
 * server-side only — this card never edits flowFields, it only previews and
 * applies them as-is.
 *
 * Props:
 *   template  object — { businessCategory, label, flowFields, notes, updatedAt }
 *   onApply   fn()   — open the apply-to-business modal for this template
 */
export default function BusinessCategoryTemplateCard({ template, onApply }) {
  const [expanded, setExpanded] = useState(false);

  const category = FLOW_PACK_CATEGORIES.find((c) => c.value === template.businessCategory);
  const fieldCount = template.flowFields?.length || 0;

  return (
    <div className="card overflow-hidden">
      <div className="p-5 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-3 min-w-0 text-left flex-1"
        >
          <span className="text-2xl flex-shrink-0">{category?.emoji || '📋'}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-text-primary">{template.label}</span>
              <Badge variant="brand">{category?.label || template.businessCategory}</Badge>
            </div>
            <p className="text-xs text-text-tertiary mt-1">
              {fieldCount} field{fieldCount === 1 ? '' : 's'} · Updated {formatDate(template.updatedAt)}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" onClick={() => onApply(template)}>
            Apply to Business
          </Button>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            title={expanded ? 'Hide fields' : 'Show fields'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-subtle transition-colors duration-150"
          >
            <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', expanded && 'rotate-180')} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-subtle px-5 py-4">
              {template.notes && (
                <p className="text-xs text-text-tertiary mb-3">{template.notes}</p>
              )}

              {fieldCount === 0 ? (
                <div className="flex items-center gap-2 text-sm text-text-tertiary py-2">
                  <ListChecks className="w-4 h-4" />
                  No fields defined for this template.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Label</th>
                        <th className="py-2">Conditional</th>
                      </tr>
                    </thead>
                    <tbody>
                      {template.flowFields.map((field, i) => (
                        <tr key={field.name || i} className="border-t border-border-subtle">
                          <td className="py-2 pr-4 font-mono text-xs text-text-primary">{field.name}</td>
                          <td className="py-2 pr-4">
                            <Badge variant="neutral">{field.type}</Badge>
                          </td>
                          <td className="py-2 pr-4 text-text-secondary">{field.label}</td>
                          <td className="py-2 text-xs text-text-tertiary">
                            {field.visibleWhen
                              ? `when ${field.visibleWhen.field} = "${field.visibleWhen.equals}"`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
