'use client';

import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Modal — animated overlay dialog, rendered in a portal on <body>.
 *
 * Sizes: sm (400px) | md (520px) | lg (640px) | xl (760px)
 * On screens < 768px a modal is a full-screen sheet: the header stays on top, the body
 * scrolls, and a `footer` (or a `.modal-actions` row at the end of the body) stays pinned
 * to the bottom. `variant="sheet"` makes it a bottom sheet that only grows as tall as its
 * content instead (used for filters and row-action menus).
 *
 * Usage:
 *   <Modal open={isOpen} onClose={() => setOpen(false)} title="Edit Plan" size="md">
 *     <p>Content here</p>
 *   </Modal>
 */

const sizeClasses = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-lg',
  lg: 'md:max-w-2xl',
  xl: 'md:max-w-3xl',
  '2xl': 'md:max-w-5xl',
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  variant = 'full',
  hideClose = false,
  className,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!mounted) return null;

  const isSheet = variant === 'sheet';

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          <div
            key="modal-wrap"
            className={cn(
              'fixed inset-0 z-[70] flex justify-center pointer-events-none md:items-center md:p-4',
              isSheet ? 'items-end' : 'items-stretch'
            )}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={typeof title === 'string' ? title : undefined}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              className={cn(
                'pointer-events-auto relative w-full bg-bg-overlay border-border shadow-modal flex flex-col',
                'md:border md:rounded-2xl md:h-auto md:max-h-[90vh]',
                isSheet
                  ? 'max-h-[85dvh] rounded-t-2xl border-t'
                  : 'h-[100dvh] rounded-none',
                sizeClasses[size],
                className
              )}
            >
              {(title || !hideClose) && (
                <div className="flex items-start justify-between gap-3 px-4 md:px-6 pt-4 md:pt-6 pb-4 md:pb-5 border-b border-border-subtle flex-shrink-0">
                  <div className="min-w-0">
                    {title && (
                      <h2 className="text-lg font-semibold text-text-primary leading-tight break-words">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-sm text-text-secondary mt-1 break-words">{subtitle}</p>
                    )}
                  </div>
                  {!hideClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className="
                        -mt-1 -mr-2 md:mr-0 w-11 h-11 md:w-8 md:h-8 flex-shrink-0 rounded-lg flex items-center justify-center
                        text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
                        transition-colors duration-150
                      "
                    >
                      <X className="w-5 h-5 md:w-4 md:h-4" />
                    </button>
                  )}
                </div>
              )}

              <div className="modal-body flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 md:px-6 py-5">
                {children}
              </div>

              {footer && (
                <div className="px-4 md:px-6 py-3 md:py-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-5 border-t border-border-subtle flex-shrink-0">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
