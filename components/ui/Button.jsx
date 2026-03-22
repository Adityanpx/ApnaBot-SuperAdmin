'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Button variants:
 *   primary   — gradient blue (main CTAs)
 *   secondary — subtle bg (secondary actions)
 *   danger    — red toned (destructive actions)
 *   ghost     — no bg, just hover (tertiary actions)
 *   outline   — bordered (neutral actions)
 *
 * Sizes: sm | md | lg
 *
 * Usage:
 *   <Button variant="primary" size="md" loading={isLoading}>Save</Button>
 *   <Button variant="danger" onClick={handleDelete}>Delete</Button>
 *   <Button variant="ghost" icon={<Plus />}>Add item</Button>
 */

const variants = {
  primary: `
    bg-gradient-brand text-white shadow-glow-brand
    hover:opacity-90 hover:shadow-[0_0_28px_rgba(59,130,246,0.45)]
    active:scale-[0.98]
  `,
  secondary: `
    bg-bg-subtle text-text-primary border border-border
    hover:bg-bg-overlay hover:border-border-strong
    active:scale-[0.98]
  `,
  danger: `
    bg-danger-bg text-danger-text border border-danger-DEFAULT/30
    hover:bg-danger-DEFAULT hover:text-white hover:border-danger-DEFAULT
    active:scale-[0.98]
  `,
  ghost: `
    bg-transparent text-text-secondary
    hover:bg-bg-subtle hover:text-text-primary
    active:scale-[0.98]
  `,
  outline: `
    bg-transparent text-text-primary border border-border
    hover:bg-bg-subtle hover:border-border-strong
    active:scale-[0.98]
  `,
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-11 px-6 text-sm gap-2 rounded-xl',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    iconRight,
    className,
    onClick,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={cn(
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : icon ? (
        <span className="flex-shrink-0">
          {React.isValidElement(icon) ? React.cloneElement(icon, { className: cn(icon.props.className, 'w-4 h-4') }) : 
           typeof icon === 'function' ? React.createElement(icon, { className: 'w-4 h-4' }) : 
           icon}
        </span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="flex-shrink-0">
          {React.isValidElement(iconRight) ? React.cloneElement(iconRight, { className: cn(iconRight.props.className, 'w-4 h-4') }) : 
           typeof iconRight === 'function' ? React.createElement(iconRight, { className: 'w-4 h-4' }) : 
           iconRight}
        </span>
      )}
    </motion.button>
  );
});

export default Button;
