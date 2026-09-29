// app/(dashboard)/business-settings/[category]/page.jsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { useBusinessCategories } from '@/hooks/useBusinessCategories';
import { CATEGORY_SETTINGS_TABS } from '@/lib/constants';
import VehicleCatalogPanel from '@/components/vehicleCatalog/VehicleCatalogPanel';
import CourseCatalogPanel from '@/components/courseCatalog/CourseCatalogPanel';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

// Tab key -> panel. Add a new category setting by adding its tab to
// CATEGORY_SETTINGS_TABS (lib/constants.js) and its panel here.
const PANELS = {
  'vehicle-types': () => <VehicleCatalogPanel />,
  courses: (category) => <CourseCatalogPanel category={category} />,
};

/**
 * One category's settings, as tabs (?tab= keeps the choice in the URL so
 * the old /vehicle-catalog link can deep-link to Vehicle types).
 * params/searchParams come in as page props, so no useSearchParams
 * Suspense boundary is needed.
 */
export default function CategorySettingsPage({ params, searchParams }) {
  const { category } = params;
  const router = useRouter();
  const { categories } = useBusinessCategories();
  const label = categories.find((c) => c.value === category)?.label || category;

  const tabs = CATEGORY_SETTINGS_TABS[category] || [];
  const activeKey = tabs.some((t) => t.key === searchParams?.tab) ? searchParams.tab : tabs[0]?.key;
  const selectTab = (key) => router.replace(`/business-settings/${category}?tab=${key}`, { scroll: false });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div>
        <Link href="/business-settings" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-3">
          <ArrowLeft className="w-4 h-4" /> Business Settings
        </Link>
        <h1 className="page-title">{label}</h1>
        <p className="text-sm text-text-secondary mt-1">Settings shared by all {label} businesses</p>
      </div>

      {tabs.length === 0 && (
        <EmptyState
          icon={Settings2}
          title="No settings yet"
          description={`There's nothing to configure for ${label} businesses yet.`}
        />
      )}

      {tabs.length > 0 && (
        <>
          <div className="flex gap-1 border-b border-border-subtle">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => selectTab(tab.key)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors',
                  tab.key === activeKey
                    ? 'border-brand-500 text-text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {PANELS[activeKey]?.(category)}
        </>
      )}
    </motion.div>
  );
}
