// components/nodeLibrary/NodeLibraryTable.jsx
'use client';

import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import NodeLibraryCard from './NodeLibraryCard';

export default function NodeLibraryTable({ entries, loading, onDelete }) {
  if (loading) {
    return (
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} lines={4} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon="🗂️"
          title="No nodes in the library yet"
          description="Add reply or question nodes from a business to get started."
        />
      </div>
    );
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
    >
      {entries.map((entry, i) => (
        <NodeLibraryCard key={entry._id} entry={entry} index={i} onDelete={onDelete} />
      ))}
    </div>
  );
}
