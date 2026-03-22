// app/(dashboard)/plans/page.jsx
'use client';

import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

export default function PlansPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div>
        <h1 className="page-title">Plans</h1>
        <p className="text-sm text-text-secondary mt-1">
          Subscription plan management
        </p>
      </div>

      {/* Coming Soon - Feature not implemented yet */}
      <EmptyState
        icon={CreditCard}
        title="Plans Management Coming Soon"
        description="This feature is currently under development. Stay tuned for updates."
      />
    </motion.div>
  );
}
