// app/(dashboard)/category-templates/[id]/page.jsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useCategoryTemplate } from '@/hooks/useCategoryTemplate';
import TemplateNodeRow from '@/components/categoryTemplates/TemplateNodeRow';
import WarningsBanner from '@/components/categoryTemplates/WarningsBanner';
import Badge from '@/components/ui/Badge';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { replaceMatchedNames } from '@/lib/categoryTemplates';

/** Template detail — read-only node list with inline text/translation editing. */
export default function CategoryTemplateDetailPage() {
  const { id } = useParams();
  const { template, nodes, warnings, loading, error, refetch, saveNodeTexts } =
    useCategoryTemplate(id);

  /** One-click fix: swap each matched name for {{businessName}} in the text and translations. */
  const replaceInNode = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return Promise.resolve();
    const matched = warnings.filter((w) => w.nodeId === nodeId).map((w) => w.matched);
    return saveNodeTexts(nodeId, replaceMatchedNames(node, matched));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Link
        href="/category-templates"
        className="inline-flex items-center gap-1 min-h-[44px] md:min-h-0 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="w-4 h-4" /> Category Templates
      </Link>

      {loading && !template && <Skeleton className="h-24 w-full" />}
      {error && !template && (
        <ErrorState title="Could not load this template" message={error} onRetry={refetch} />
      )}

      {template && (
        <>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">{template.name}</h1>
              {template.isDefault && <Badge variant="success">Default</Badge>}
            </div>
            <p className="text-sm text-text-secondary mt-1">
              {nodes.length} node(s). Edit the text and Hindi / Marathi translations of a reply
              below; the flow structure is read-only.
            </p>
          </div>

          <WarningsBanner warnings={warnings} onReplace={replaceInNode} />

          {nodes.length === 0 && (
            <EmptyState icon="🗂️" title="This template has no nodes" />
          )}
          <div className="space-y-3">
            {nodes.map((node) => (
              <TemplateNodeRow
                key={node.id}
                node={node}
                flagged={warnings.some((w) => w.nodeId === node.id)}
                onSave={saveNodeTexts}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
