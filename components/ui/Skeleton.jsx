import { cn } from '@/lib/utils';

/**
 * Skeleton loading state primitives
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />                    — single bar
 *   <SkeletonCard />                                       — full card
 *   <SkeletonStatCard />                                   — stat card
 *   <SkeletonTableRow />                                   — table row
 */

export default function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

export function SkeletonStatCard() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr className="border-b border-border-subtle">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard({ lines = 3, className }) {
  return (
    <div className={cn('card p-6 space-y-3', className)}>
      <Skeleton className="h-5 w-2/5" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-3/5' : 'w-full')} />
      ))}
    </div>
  );
}
