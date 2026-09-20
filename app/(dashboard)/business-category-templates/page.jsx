// app/(dashboard)/business-category-templates/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useBusinessCategoryTemplates } from '@/hooks/useBusinessCategoryTemplates';
import BusinessCategoryTemplateCard from '@/components/businessCategoryTemplates/BusinessCategoryTemplateCard';
import ApplyBusinessCategoryTemplateModal from '@/components/businessCategoryTemplates/ApplyBusinessCategoryTemplateModal';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

export default function BusinessCategoryTemplatesPage() {
  const { templates, loading, applyTemplate } = useBusinessCategoryTemplates();
  const [applyingTemplate, setApplyingTemplate] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div>
        <h1 className="page-title">Booking Form Templates</h1>
        <p className="text-sm text-text-secondary mt-1">
          Starter booking-form fields per business category — apply as-is to a business
        </p>
      </div>

      {/* Scope note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-info-bg text-info-text">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">These are booking-form fields, not chatbot rules</p>
          <p>
            This page only applies a category&apos;s booking form template to a business as-is.
            Templates themselves are seeded/updated server-side. Looking for the conversation
            graph templates instead? Those live under Category Templates.
          </p>
        </div>
      </div>

      {/* Templates */}
      <div className="space-y-4">
        {loading && (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </>
        )}

        {!loading && templates.length === 0 && (
          <div className="card">
            <EmptyState
              icon="📋"
              title="No business category templates yet"
              description="Templates are seeded via the server-side script."
            />
          </div>
        )}

        {!loading && templates.map((template) => (
          <BusinessCategoryTemplateCard
            key={template.id}
            template={template}
            onApply={setApplyingTemplate}
          />
        ))}
      </div>

      {/* Apply modal */}
      <ApplyBusinessCategoryTemplateModal
        open={!!applyingTemplate}
        template={applyingTemplate}
        onClose={() => setApplyingTemplate(null)}
        applyTemplate={applyTemplate}
      />
    </motion.div>
  );
}
