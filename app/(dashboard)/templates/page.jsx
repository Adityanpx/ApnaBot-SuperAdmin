// app/(dashboard)/templates/page.jsx
'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import TemplateCard     from '@/components/templates/TemplateCard';
import EditTemplateModal from '@/components/templates/EditTemplateModal';
import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState       from '@/components/ui/EmptyState';
import useTemplates     from '@/hooks/useTemplates';

export default function TemplatesPage() {
  const { templates, loading, refetch } = useTemplates();
  const [editTemplate, setEditTemplate] = useState(null); // template object or null

  return (
    <div className="space-y-6 max-w-screen-xl">

      {/* Page header */}
      <div>
        <h1 className="page-title">Business Type Templates</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Default chatbot rules and booking fields applied when a new shop registers.
          Changes only affect new shops — existing shops keep their current rules.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-text-tertiary">
        <LegendItem color="bg-info-DEFAULT"    label="Text reply" />
        <LegendItem color="bg-warning-DEFAULT" label="Booking trigger" />
        <LegendItem color="bg-success-DEFAULT" label="Payment link" />
        <span className="text-text-disabled">|</span>
        <span>
          <span className="text-info-text font-semibold">*</span> = required booking field
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} lines={4} />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates found"
          description="Run the seed script on your backend to populate the 8 business type templates."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {templates.map((tmpl, i) => (
            <TemplateCard
              key={tmpl._id}
              template={tmpl}
              delay={i * 0.04}
              onEdit={() => setEditTemplate(tmpl)}
            />
          ))}
        </div>
      )}

      {/* Edit modal — mounts once, receives template via prop */}
      <EditTemplateModal
        open={!!editTemplate}
        onClose={() => setEditTemplate(null)}
        template={editTemplate}
        onSuccess={() => {
          refetch();
          setEditTemplate(null);
        }}
      />
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}