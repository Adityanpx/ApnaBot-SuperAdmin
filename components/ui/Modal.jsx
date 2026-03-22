'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Modal — animated overlay dialog
 *
 * Sizes: sm (400px) | md (520px) | lg (640px) | xl (760px)
 *
 * Usage:
 *   <Modal open={isOpen} onClose={() => setOpen(false)} title="Edit Plan" size="md">
 *     <p>Content here</p>
 *   </Modal>
 */

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  hideClose = false,
  className,
}) {
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              className={cn(
                'relative w-full bg-bg-overlay border border-border',
                'rounded-2xl shadow-modal',
                'max-h-[90vh] flex flex-col',
                sizeClasses[size],
                className
              )}
            >
              {(title || !hideClose) && (
                <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-border-subtle flex-shrink-0">
                  <div>
                    {title && (
                      <h2 className="text-lg font-semibold text-text-primary leading-tight">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
                    )}
                  </div>
                  {!hideClose && (
                    <button
                      onClick={onClose}
                      className="
                        ml-4 w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center
                        text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
                        transition-colors duration-150
                      "
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
