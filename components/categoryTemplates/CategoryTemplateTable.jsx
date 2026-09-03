// components/categoryTemplates/CategoryTemplateTable.jsx
'use client';

import { motion } from 'framer-motion';
import { Trash2, Download } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';
import { formatDate, cn } from '@/lib/utils';

const TH = ({ children, className }) => (
  <th className={cn(
    'px-4 py-3 text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider',
    className
  )}>
    {children}
  </th>
);

const TD = ({ children, className }) => (
  <td className={cn('px-4 py-4 text-sm', className)}>
    {children}
  </td>
);

export default function CategoryTemplateTable({ templates, loading, onDelete, onExport }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Head */}
          <thead className="border-b border-border bg-bg-subtle/50">
            <tr>
              <TH>Category</TH>
              <TH>Name</TH>
              <TH className="hidden md:table-cell">Created</TH>
              <TH className="hidden md:table-cell">Updated</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {/* Loading skeleton rows */}
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={5} />
            ))}

            {/* Empty state */}
            {!loading && templates.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon="🗂️"
                    title="No category templates yet"
                    description="Clone one from an existing business to get started."
                  />
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && templates.map((template, i) => {
              const category = CATEGORY_TEMPLATE_CATEGORIES.find((c) => c.value === template.category);
              return (
                <motion.tr
                  key={template._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="table-row"
                >
                  {/* Category */}
                  <TD>
                    <Badge variant="brand">
                      {category?.emoji ? `${category.emoji} ` : ''}{category?.label || template.category}
                    </Badge>
                  </TD>

                  {/* Name */}
                  <TD>
                    <span className="font-semibold text-text-primary">{template.name}</span>
                  </TD>

                  {/* Created */}
                  <TD className="hidden md:table-cell">
                    <span className="text-text-tertiary text-xs">{formatDate(template.createdAt)}</span>
                  </TD>

                  {/* Updated */}
                  <TD className="hidden md:table-cell">
                    <span className="text-text-tertiary text-xs">{formatDate(template.updatedAt)}</span>
                  </TD>

                  {/* Actions */}
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onExport(template._id)}
                        title="Export category template"
                        className="
                          w-8 h-8 flex items-center justify-center rounded-lg
                          text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
                          transition-colors duration-150
                        "
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(template)}
                        title="Delete category template"
                        className="
                          w-8 h-8 flex items-center justify-center rounded-lg
                          text-text-tertiary hover:text-danger-text hover:bg-danger-bg
                          transition-colors duration-150
                        "
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TD>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
