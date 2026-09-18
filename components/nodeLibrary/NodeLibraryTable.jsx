// components/nodeLibrary/NodeLibraryTable.jsx
'use client';

import { SkeletonCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import NodeLibraryCard from './NodeLibraryCard';

export default function NodeLibraryTable({ entries, loading, onDelete }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry, i) => (
        <NodeLibraryCard key={entry._id} entry={entry} index={i} onDelete={onDelete} />
      ))}
    </div>
  );
}
