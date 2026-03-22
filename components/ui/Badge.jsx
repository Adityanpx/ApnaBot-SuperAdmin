import { cn } from '@/lib/utils';

/**
 * Badge component for status indicators, labels, counts
 *
 * Variants: success | warning | danger | info | neutral | brand
 *
 * Usage:
 *   <Badge variant="success">Active</Badge>
 *   <Badge variant="danger" dot>Expired</Badge>
 */

const variantClasses = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
  neutral: 'badge-neutral',
  brand: `
    bg-brand-500/15 text-brand-400
  `,
};

export default function Badge({ children, variant = 'neutral', dot = false, className }) {
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          variant === 'success' && 'bg-success',
          variant === 'warning' && 'bg-warning',
          variant === 'danger'  && 'bg-danger',
          variant === 'info'    && 'bg-info',
          variant === 'neutral' && 'bg-text-tertiary',
          variant === 'brand'   && 'bg-brand-500',
        )} />
      )}
      {children}
    </span>
  );
}