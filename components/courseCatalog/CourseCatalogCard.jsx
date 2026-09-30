// components/courseCatalog/CourseCatalogCard.jsx
'use client';

import { motion } from 'framer-motion';
import { Edit2, Trash2, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, GraduationCap } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * CourseCatalogCard — one course catalog entry
 * Props:
 *   entry     object — course catalog row from API
 *   onEdit / onDelete / onToggle / onMoveUp / onMoveDown  fn
 *   isFirst / isLast  boolean — hide the move arrow that can't apply
 *   delay     number — stagger animation delay
 */
export default function CourseCatalogCard({
  entry, onEdit, onDelete, onToggle, onMoveUp, onMoveDown, isFirst, isLast, delay = 0,
}) {
  const isInactive = !entry.isActive;
  const hasBlanks = /_{3,}/.test(entry.details || '') || /_{3,}/.test(entry.description || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className={cn('card p-5 flex flex-col', isInactive && 'opacity-60')}
    >
      {/* Header — name + toggle */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-bg-subtle flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-text-tertiary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-text-primary tracking-tight truncate">{entry.name}</h3>
            {entry.description && (
              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{entry.description}</p>
            )}
            {entry.groupName && (
              <p className="text-xs text-text-tertiary mt-0.5">Group: {entry.groupName}</p>
            )}
          </div>
        </div>
        <button
          onClick={onToggle}
          title={entry.isActive ? 'Hide from business owners' : 'Show to business owners'}
          className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle transition-colors duration-150"
        >
          {entry.isActive ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5" />}
        </button>
      </div>

      {isInactive && (
        <p className="text-xs text-warning-text bg-warning-bg rounded-lg px-3 py-2 mb-3">
          Hidden — business owners can&apos;t pick this course
        </p>
      )}

      {/* Details preview */}
      <div className="text-xs text-text-secondary bg-bg-subtle rounded-lg px-3 py-2 mb-4 whitespace-pre-line line-clamp-5 min-h-[3rem]">
        {entry.details || <span className="text-text-tertiary italic">No starting details text</span>}
      </div>
      {hasBlanks && (
        <p className="text-[11px] text-text-tertiary -mt-2 mb-4">
          Has blanks (____) — each business fills these in before publishing
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button variant="secondary" icon={Edit2} size="sm" onClick={onEdit} className="flex-1">Edit</Button>
        <Button variant="secondary" icon={ArrowUp} size="sm" onClick={onMoveUp} disabled={isFirst} className="w-9 px-0 flex-shrink-0" title="Move up" />
        <Button variant="secondary" icon={ArrowDown} size="sm" onClick={onMoveDown} disabled={isLast} className="w-9 px-0 flex-shrink-0" title="Move down" />
        <Button variant="danger" icon={Trash2} size="sm" onClick={onDelete} className="w-9 px-0 flex-shrink-0" />
      </div>
    </motion.div>
  );
}
