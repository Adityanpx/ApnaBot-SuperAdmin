// components/ui/Spinner.jsx
import { cn } from '@/lib/utils';

export default function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4 border-[2px]',
    md: 'w-6 h-6 border-[2.5px]',
    lg: 'w-8 h-8 border-[3px]',
  };
  return (
    <div
      className={cn(
        'rounded-full border-border animate-spin',
        'border-t-brand-500',
        sizes[size],
        className
      )}
    />
  );
}
