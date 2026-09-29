// app/(dashboard)/business-settings/page.jsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tag, ChevronRight, icons as lucideIcons } from 'lucide-react';
import { useBusinessCategories } from '@/hooks/useBusinessCategories';
import { CATEGORY_SETTINGS_TABS } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

// business_categories.icon is a kebab-case lucide name (e.g. 'graduation-cap')
// — same lookup as BusinessCategoryTable.jsx.
function getCategoryIcon(iconName) {
  if (!iconName) return null;
  const pascalName = iconName.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  return lucideIcons[pascalName] || null;
}

/**
 * Business Settings — every business category as a tile; tapping one opens
 * that category's settings (e.g. Travels/Cab → Vehicle types,
 * Coaching → Courses).
 */
export default function BusinessSettingsPage() {
  const { categories, loading } = useBusinessCategories();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div>
        <h1 className="page-title">Business Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Settings shared by all businesses of a category — pick a category to manage it
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((category, idx) => {
            const Icon = getCategoryIcon(category.icon) || Tag;
            const tabs = CATEGORY_SETTINGS_TABS[category.value] || [];
            return (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.4) }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={`/business-settings/${category.value}`}
                  className={cn('card p-5 flex flex-col gap-3 h-full hover:border-brand-500/40 transition-colors', tabs.length === 0 && 'opacity-70')}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-bg-subtle flex items-center justify-center">
                      <Icon className="w-4 h-4 text-text-secondary" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-tertiary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{category.label}</p>
                    <p className="text-xs text-text-tertiary mt-1 truncate">
                      {tabs.length > 0 ? tabs.map((t) => t.label).join(' · ') : 'No settings yet'}
                    </p>
                  </div>
                  {!category.isEnabled && <Badge variant="neutral" className="self-start">Signup off</Badge>}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
