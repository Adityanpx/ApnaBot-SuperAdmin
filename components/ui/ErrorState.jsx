// components/ui/ErrorState.jsx
'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * ErrorState — shown when a Page-level data fetch fails
 * Props:
 *   title       string — error heading
 *   message     string — error detail
 *   onRetry     fn     — optional retry callback
 */
export default function ErrorState({
  title   = 'Something went wrong',
  message = 'We could not load this data. Please try again.',
  onRetry,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-danger-bg flex items-center justify-center mb-5">
        <AlertTriangle className="w-7 h-7 text-danger-text" />
      </div>
      <h2 className="text-lg font-bold text-text-primary mb-2">{title}</h2>
      <p className="text-sm text-text-tertiary max-w-sm leading-relaxed mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </motion.div>
  );
}
