import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Select — styled native select with custom chevron
 *
 * Usage:
 *   <Select label="Business Type" options={BUSINESS_TYPES} {...register('businessType')} />
 */

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder = 'Select…', className, containerClassName, ...props },
  ref
) {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'input-field appearance-none pr-10 cursor-pointer',
            error && 'border-danger-DEFAULT/60',
            className
          )}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg-overlay text-text-primary">
              {opt.emoji ? `${opt.emoji} ` : ''}{opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="
          absolute right-3 top-1/2 -translate-y-1/2
          w-4 h-4 text-text-tertiary pointer-events-none
        " />
      </div>
      {error && <p className="text-xs text-danger-text">{error}</p>}
    </div>
  );
});

export default Select;
