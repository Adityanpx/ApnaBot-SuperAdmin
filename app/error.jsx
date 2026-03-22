// app/error.jsx
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Global error boundary — catches unexpected JS errors
 * Next.js requires this to be a Client Component with (error, reset) props
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-10 max-w-md w-full text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-danger-bg flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-6 h-6 text-danger-text" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Unexpected Error
            </h2>
            <p className="text-sm text-text-tertiary mb-6 leading-relaxed">
              Something went wrong on our end. This has been logged.
            </p>
            <Button
              variant="primary"
              icon={RefreshCw}
              onClick={reset}
              className="mx-auto"
            >
              Try again
            </Button>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
