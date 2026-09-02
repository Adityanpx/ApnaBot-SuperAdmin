// components/nodeLibrary/BusinessNodesPanel.jsx
'use client';

import { useState } from 'react';
import { Plus, MessageSquare, HelpCircle } from 'lucide-react';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';

// One node row — reply nodes are keyed by `keyword`, question nodes by
// `fieldKey`. A node already in the library shows a disabled badge instead
// of the category picker (server-side dedup, annotated on fetch).
function NodeRow({ node, onAdd }) {
  const [category, setCategory] = useState('');
  const [loading, setLoading]   = useState(false);
  const identifier = node.nodeType === 'question' ? node.fieldKey : node.keyword;

  if (node.alreadyInLibrary) {
    const cat = CATEGORY_TEMPLATE_CATEGORIES.find((c) => c.value === node.libraryCategory);
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-bg-subtle">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{node.label}</p>
          {identifier && <p className="text-xs text-text-tertiary truncate">{identifier}</p>}
        </div>
        <Badge variant="neutral" className="opacity-70 flex-shrink-0">
          Already in library{cat ? ` — ${cat.label}` : ''}
        </Badge>
      </div>
    );
  }

  const handleAdd = async () => {
    setLoading(true);
    try {
      await onAdd(node, category);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border-subtle">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary truncate">{node.label}</p>
        {identifier && <p className="text-xs text-text-tertiary truncate">{identifier}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Select
          options={CATEGORY_TEMPLATE_CATEGORIES}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category…"
          containerClassName="w-44"
        />
        <Button size="sm" icon={Plus} disabled={!category} loading={loading} onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}

/**
 * BusinessNodesPanel — a source business's reply + question nodes, grouped
 * by type, each with a per-row category picker and "Add to library" action.
 *
 * Props:
 *   nodes    array — from useNodeLibrary().businessNodes (server-annotated
 *            with alreadyInLibrary / libraryCategory)
 *   loading  boolean
 *   onAdd    fn(node, category) — useNodeLibrary().addToLibrary wrapper
 */
export default function BusinessNodesPanel({ nodes, loading, onAdd }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <EmptyState
        icon="🗂️"
        title="No nodes found"
        description="This business has no reply or question nodes yet."
      />
    );
  }

  const replyNodes    = nodes.filter((n) => n.nodeType === 'reply');
  const questionNodes = nodes.filter((n) => n.nodeType === 'question');

  return (
    <div className="space-y-6">
      {replyNodes.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" /> Reply Nodes
          </h3>
          <div className="space-y-2">
            {replyNodes.map((node) => (
              <NodeRow key={node._id} node={node} onAdd={onAdd} />
            ))}
          </div>
        </div>
      )}

      {questionNodes.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" /> Question Nodes
          </h3>
          <div className="space-y-2">
            {questionNodes.map((node) => (
              <NodeRow key={node._id} node={node} onAdd={onAdd} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
