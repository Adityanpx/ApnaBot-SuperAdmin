// components/categoryTemplates/WarningsBanner.jsx
'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { BUSINESS_NAME_TOKEN } from '@/lib/categoryTemplates';

/**
 * WarningsBanner — replies that still mention the source business name, each with a
 * one-click "Replace" that swaps the matched name for {{businessName}}.
 * Props:
 *   warnings   Array<{ nodeId, key, matched }> — from the clone response
 *   onReplace  fn(nodeId) — async; throws when saving fails
 */
export default function WarningsBanner({ warnings, onReplace }) {
  const [busyId, setBusyId] = useState(null);
  if (warnings.length === 0) return null;
  const names = [...new Set(warnings.map((w) => w.matched))].join(', ');

  const replace = async (nodeId) => {
    setBusyId(nodeId);
    try {
      await onReplace(nodeId);
    } catch {
      // already toasted by the hook
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div role="alert" className="p-4 rounded-xl bg-warning-bg text-warning-text space-y-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-semibold">
          These replies mention {names}. Replace with {BUSINESS_NAME_TOKEN}
        </p>
      </div>
      <ul className="space-y-2">
        {warnings.map((w) => (
          <li key={w.nodeId} className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate">
              <code>{w.key}</code> — &ldquo;{w.matched}&rdquo;
            </span>
            <Button
              size="sm"
              variant="secondary"
              loading={busyId === w.nodeId}
              onClick={() => replace(w.nodeId)}
            >
              Replace
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
