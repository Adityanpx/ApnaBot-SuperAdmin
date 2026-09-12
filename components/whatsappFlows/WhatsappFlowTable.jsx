// components/whatsappFlows/WhatsappFlowTable.jsx
'use client';

import { motion } from 'framer-motion';
import { Pencil, Send, Trash2 } from 'lucide-react';
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

export default function WhatsappFlowTable({ flows, loading, onEdit, onPublish, onDelete }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Head */}
          <thead className="border-b border-border bg-bg-subtle/50">
            <tr>
              <TH>Category</TH>
              <TH>Name</TH>
              <TH className="hidden md:table-cell">Updated</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {/* Loading skeleton rows */}
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={4} />
            ))}

            {/* Empty state */}
            {!loading && flows.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    icon="🗂️"
                    title="No WhatsApp flows yet"
                    description="Create one by pasting a Flow JSON from Meta's Flow Builder."
                  />
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && flows.map((flow, i) => {
              const category = CATEGORY_TEMPLATE_CATEGORIES.find((c) => c.value === flow.category);
              return (
                <motion.tr
                  key={flow._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="table-row"
                >
                  {/* Category */}
                  <TD>
                    <Badge variant="brand">
                      {category?.emoji ? `${category.emoji} ` : ''}{category?.label || flow.category}
                    </Badge>
                  </TD>

                  {/* Name */}
                  <TD>
                    <span className="font-semibold text-text-primary">{flow.name}</span>
                  </TD>

                  {/* Updated */}
                  <TD className="hidden md:table-cell">
                    <span className="text-text-tertiary text-xs">{formatDate(flow.updatedAt)}</span>
                  </TD>

                  {/* Actions */}
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(flow)}
                        title="Edit WhatsApp flow"
                        className="
                          w-8 h-8 flex items-center justify-center rounded-lg
                          text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
                          transition-colors duration-150
                        "
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onPublish(flow)}
                        title="Publish to business"
                        className="
                          w-8 h-8 flex items-center justify-center rounded-lg
                          text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
                          transition-colors duration-150
                        "
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(flow)}
                        title="Delete WhatsApp flow"
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
