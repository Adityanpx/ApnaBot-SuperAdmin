// components/businessCategories/BusinessCategoryTable.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, icons as lucideIcons } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Switch from '@/components/ui/Switch';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { MobileCardList, MobileCard } from '@/components/ui/MobileCards';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

// business_categories.icon stores a lucide-react icon name in kebab-case
// (e.g. 'graduation-cap'); lucide's `icons` map is keyed by the PascalCase
// component name (GraduationCap), so convert before lookup.
function getCategoryIcon(iconName) {
  if (!iconName) return null;
  const pascalName = iconName.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  return lucideIcons[pascalName] || null;
}

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

export default function BusinessCategoryTable({ categories, loading, onToggle }) {
  const isMobile = useIsMobile();
  const [disabling, setDisabling] = useState(null);

  // Turning a category OFF hides it from the signup screen, so it is confirmed by name;
  // turning it on is harmless and immediate.
  const requestToggle = (category) => {
    if (category.isEnabled) setDisabling(category);
    else onToggle(category.value, true);
  };

  const confirmDialog = (
    <ConfirmDialog
      open={!!disabling}
      onClose={() => setDisabling(null)}
      title="Stop offering this category?"
      subject={disabling?.label}
      confirmLabel="Yes, disable"
      onConfirm={() => onToggle(disabling.value, false)}
    >
      <p>
        <strong>{disabling?.label}</strong> will no longer be offered when new businesses sign up.
        Existing businesses are not changed.
      </p>
    </ConfirmDialog>
  );

  if (isMobile) {
    return (
      <>
        <MobileCardList
          loading={loading}
          skeletons={6}
          isEmpty={categories.length === 0}
          empty={(
            <EmptyState
              icon="🏷️"
              title="No business categories"
              description="Business categories offered at signup will appear here."
            />
          )}
        >
          {categories.map((category) => {
            const CategoryIcon = getCategoryIcon(category.icon) || Tag;
            return (
              <MobileCard
                key={category.value}
                header={(
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text-primary truncate">{category.label}</p>
                      <p className="font-mono text-xs text-text-tertiary truncate">{category.value}</p>
                    </div>
                    <Badge variant={category.isEnabled ? 'success' : 'neutral'}>
                      {category.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Switch
                      checked={category.isEnabled}
                      label={`Offer ${category.label} at signup`}
                      onChange={() => requestToggle(category)}
                    />
                  </div>
                )}
              />
            );
          })}
        </MobileCardList>
        {confirmDialog}
      </>
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
              <TH className="hidden md:table-cell">Value</TH>
              <TH>Status</TH>
              <TH className="text-right">Offered at signup</TH>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {/* Loading skeleton rows */}
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTableRow key={i} cols={4} />
            ))}

            {/* Empty state */}
            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    icon="🏷️"
                    title="No business categories"
                    description="Business categories offered at signup will appear here."
                  />
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && categories.map((category, i) => {
              const CategoryIcon = getCategoryIcon(category.icon) || Tag;
              return (
                <motion.tr
                  key={category.value}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="table-row"
                >
                  {/* Category */}
                  <TD>
                    <span className="flex items-center gap-2 font-semibold text-text-primary">
                      <CategoryIcon className="w-3.5 h-3.5 text-text-tertiary" />
                      {category.label}
                    </span>
                  </TD>

                  {/* Value */}
                  <TD className="hidden md:table-cell">
                    <span className="font-mono text-xs text-text-tertiary">{category.value}</span>
                  </TD>

                  {/* Status */}
                  <TD>
                    {category.isEnabled ? (
                      <Badge variant="success">Enabled</Badge>
                    ) : (
                      <Badge variant="neutral">Disabled</Badge>
                    )}
                  </TD>

                  {/* Toggle */}
                  <TD className="text-right">
                    <Switch
                      checked={category.isEnabled}
                      label={`Offer ${category.label} at signup`}
                      onChange={() => requestToggle(category)}
                    />
                  </TD>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {confirmDialog}
    </div>
  );
}
