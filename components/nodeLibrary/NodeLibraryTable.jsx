// components/nodeLibrary/NodeLibraryTable.jsx
'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
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

export default function NodeLibraryTable({ entries, loading, onDelete }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Head */}
          <thead className="border-b border-border bg-bg-subtle/50">
            <tr>
              <TH>Category</TH>
              <TH>Type</TH>
              <TH>Label / Keyword</TH>
              <TH className="hidden md:table-cell">Added</TH>
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
            {!loading && entries.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon="🗂️"
                    title="No nodes in the library yet"
                    description="Add reply or question nodes from a business to get started."
                  />
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && entries.map((entry, i) => {
              const category = CATEGORY_TEMPLATE_CATEGORIES.find((c) => c.value === entry.category);
              const identifier = entry.nodeType === 'question' ? entry.fieldKey : entry.keyword;
              return (
                <motion.tr
                  key={entry._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="table-row"
                >
                  {/* Category */}
                  <TD>
                    <Badge variant="brand">
                      {category?.emoji ? `${category.emoji} ` : ''}{category?.label || entry.category}
                    </Badge>
                  </TD>

                  {/* Node type */}
                  <TD>
                    <Badge variant={entry.nodeType === 'question' ? 'info' : 'neutral'}>
                      {entry.nodeType}
                    </Badge>
                  </TD>

                  {/* Label / keyword */}
                  <TD>
                    <span className="font-semibold text-text-primary">{entry.label}</span>
                    {identifier && (
                      <span className="block text-text-tertiary text-xs mt-0.5">{identifier}</span>
                    )}
                  </TD>

                  {/* Added */}
                  <TD className="hidden md:table-cell">
                    <span className="text-text-tertiary text-xs">{formatDate(entry.createdAt)}</span>
                  </TD>

                  {/* Actions */}
                  <TD className="text-right">
                    <button
                      onClick={() => onDelete(entry)}
                      title="Remove from node library"
                      className="
                        w-8 h-8 flex items-center justify-center rounded-lg
                        text-text-tertiary hover:text-danger-text hover:bg-danger-bg
                        transition-colors duration-150
                      "
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
