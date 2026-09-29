// components/courseCatalog/CourseCatalogPanel.jsx
'use client';

import { useState } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import { useCourseCatalog } from '@/hooks/useCourseCatalog';
import CourseCatalogCard from '@/components/courseCatalog/CourseCatalogCard';
import CourseCatalogFormModal from '@/components/courseCatalog/CourseCatalogFormModal';
import DeleteCourseCatalogModal from '@/components/courseCatalog/DeleteCourseCatalogModal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

/**
 * CourseCatalogPanel — Business Settings → Coaching → Courses.
 * Courses business owners can pick in "My courses"; each business gets its
 * own editable copy, so edits here only affect courses added afterwards.
 */
export default function CourseCatalogPanel({ category }) {
  const { catalog, loading, createEntry, updateEntry, deleteEntry, moveEntry } = useCourseCatalog(category);

  const [formEntry, setFormEntry] = useState(undefined); // undefined = closed, null = add, row = edit
  const [deletingEntry, setDeletingEntry] = useState(null);

  const handleToggle = async (entry) => {
    try {
      await updateEntry(entry._id, { isActive: !entry.isActive });
    } catch {
      // no-op — toasted by the hook
    }
  };

  const activeCount = catalog.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary tracking-tight">Courses</h2>
          <p className="text-sm text-text-secondary mt-1">
            Courses business owners can pick and then edit for their own institute
            {!loading && catalog.length > 0 && <> · {activeCount} shown, {catalog.length - activeCount} hidden</>}
          </p>
        </div>
        <Button icon={Plus} onClick={() => setFormEntry(null)}>Add Course</Button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {!loading && catalog.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No courses yet"
          description="Add courses so coaching businesses can pick them instead of typing from scratch."
          action={{ label: 'Add Course', onClick: () => setFormEntry(null) }}
        />
      )}

      {!loading && catalog.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalog.map((entry, idx) => (
            <CourseCatalogCard
              key={entry._id}
              entry={entry}
              delay={Math.min(idx * 0.05, 0.4)}
              isFirst={idx === 0}
              isLast={idx === catalog.length - 1}
              onEdit={() => setFormEntry(entry)}
              onDelete={() => setDeletingEntry(entry)}
              onToggle={() => handleToggle(entry)}
              onMoveUp={() => moveEntry(entry._id, -1)}
              onMoveDown={() => moveEntry(entry._id, 1)}
            />
          ))}
        </div>
      )}

      <CourseCatalogFormModal
        open={formEntry !== undefined}
        entry={formEntry || null}
        onClose={() => setFormEntry(undefined)}
        onSubmit={(payload) => (formEntry ? updateEntry(formEntry._id, payload) : createEntry(payload))}
      />
      <DeleteCourseCatalogModal
        open={!!deletingEntry}
        entry={deletingEntry}
        onClose={() => setDeletingEntry(null)}
        deleteEntry={deleteEntry}
      />
    </div>
  );
}
