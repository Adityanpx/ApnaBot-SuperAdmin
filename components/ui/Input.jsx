import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Input — consistent form input with label, error, helper text
 *
 * Usage:
 *   <Input label="Plan Name" placeholder="e.g. Pro" error={errors.name?.message} {...register('name')} />
 *   <Input label="Price" type="number" prefix="₹" />
 */

const Input = forwardRef(function Input(
  { label, error, helper, prefix, suffix, className, containerClassName, ...props },
  ref
) {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
          {props.required && <span className="text-danger-text ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="
            absolute left-3 text-sm text-text-tertiary
            pointer-events-none select-none
          ">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'input-field',
            prefix && 'pl-8',
            suffix && 'pr-8',
            error && 'border-danger-DEFAULT/60 focus:border-danger-DEFAULT focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="
            absolute right-3 text-sm text-text-tertiary
            pointer-events-none select-none
          ">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-danger-text">{error}</p>}
      {helper && !error && <p className="text-xs text-text-tertiary">{helper}</p>}
    </div>
  );
});

export default Input;
