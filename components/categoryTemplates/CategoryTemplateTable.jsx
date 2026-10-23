// components/categoryTemplates/CategoryTemplateTable.jsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Download, Star, StarOff, Languages, ExternalLink } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import RowMenu from '@/components/ui/RowMenu';
import { MobileCardList, MobileCard, CardField } from '@/components/ui/MobileCards';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useCategoryOptions } from '@/hooks/useCategoryOptions';
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

/** Phone layout: one card per template; actions live in the ⋯ sheet. */
function TemplateCards({
  templates, loading, onDelete, onExport, onSetDefault, onUnsetDefault, onTranslate,
}) {
  const router = useRouter();
  return (
    <MobileCardList
      loading={loading}
      isEmpty={templates.length === 0}
      empty={(
        <EmptyState
          icon="🗂️"
          title="No category templates yet"
          description="Clone one from an existing business to get started."
        />
      )}
    >
      {templates.map((template) => {
        const category = categories.find((c) => c.value === template.category);
        return (
          <MobileCard
            key={template._id}
            header={(
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/category-templates/${template._id}`}
                    className="block font-semibold text-text-primary break-words py-2 -my-1.5"
                  >
                    {template.name}
                  </Link>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <Badge variant="brand">
                      {category?.emoji ? `${category.emoji} ` : ''}{category?.label || template.category}
                    </Badge>
                    {template.isDefault && <Badge variant="success">Default</Badge>}
                  </div>
                </div>
                <RowMenu
                  title={template.name}
                  actions={[
                    { label: 'Open', icon: ExternalLink, onClick: () => router.push(`/category-templates/${template._id}`) },
                    template.isDefault
                      ? { label: 'Remove default', icon: StarOff, onClick: () => onUnsetDefault(template) }
                      : { label: 'Set as default', icon: Star, onClick: () => onSetDefault(template) },
                    { label: 'Translate…', icon: Languages, onClick: () => onTranslate(template) },
                    { label: 'Export', icon: Download, onClick: () => onExport(template._id) },
                    { label: 'Delete template', icon: Trash2, danger: true, onClick: () => onDelete(template) },
                  ]}
                />
              </div>
            )}
          >
            {template.description && (
              <p className="text-xs text-text-tertiary">{template.description}</p>
            )}
            <CardField label="Created">{formatDate(template.createdAt)}</CardField>
            <CardField label="Updated">{formatDate(template.updatedAt)}</CardField>
          </MobileCard>
        );
      })}
    </MobileCardList>
  );
}

export default function CategoryTemplateTable({
  templates, loading, onDelete, onExport, onSetDefault, onUnsetDefault, onTranslate,
}) {
  const { categories } = useCategoryOptions();
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <TemplateCards
        templates={templates}
        loading={loading}
        onDelete={onDelete}
        onExport={onExport}
        onSetDefault={onSetDefault}
        onUnsetDefault={onUnsetDefault}
        onTranslate={onTranslate}
      />
    );
  }

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
              const category = categories.find((c) => c.value === template.category);
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
                    <Link
                      href={`/category-templates/${template._id}`}
                      className="font-semibold text-text-primary hover:text-brand-400"
                    >
                      {template.name}
                    </Link>
                    {template.isDefault && (
                      <Badge variant="success" className="ml-2">Default</Badge>
                    )}
                    {template.description && (
                      <p className="text-xs text-text-tertiary mt-0.5">{template.description}</p>
                    )}
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
                      {template.isDefault ? (
                        <button
                          onClick={() => onUnsetDefault(template)}
                          title="Remove default"
                          className="
                            icon-btn
                            text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
                            transition-colors duration-150
                          "
                        >
                          <StarOff className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onSetDefault(template)}
                          title="Set as default"
                          className="
                            icon-btn
                            text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
                            transition-colors duration-150
                          "
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onTranslate(template)}
                        title="Translate…"
                        className="
                          icon-btn
                          text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
                          transition-colors duration-150
                        "
                      >
                        <Languages className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onExport(template._id)}
                        title="Export category template"
                        className="
                          icon-btn
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
                          icon-btn
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
