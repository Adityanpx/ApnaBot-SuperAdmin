// app/(dashboard)/plans/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard } from 'lucide-react';
import { usePlans } from '@/hooks/usePlans';
import PlanCard from '@/components/plans/PlanCard';
import CreatePlanModal from '@/components/plans/CreatePlanModal';
import EditPlanModal from '@/components/plans/EditPlanModal';
import DeletePlanModal from '@/components/plans/DeletePlanModal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

export default function PlansPage() {
  const { plans, loading, refetch } = usePlans();

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Plans</h1>
          <p className="text-sm text-text-secondary mt-1">
            Subscription plan management
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => setShowCreate(true)}
        >
          Create Plan
        </Button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && plans.length === 0 && (
        <EmptyState
          icon={CreditCard}
          title="No plans yet"
          description="Create your first subscription plan to get started"
          action={{
            label: 'Create Plan',
            onClick: () => setShowCreate(true),
          }}
        />
      )}

      {/* Plan grid */}
      {!loading && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              delay={idx * 0.1}
              onEdit={() => setEditingPlan(plan)}
              onDelete={() => setDeletingPlan(plan)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreatePlanModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={refetch}
      />
      <EditPlanModal
        open={!!editingPlan}
        plan={editingPlan}
        onClose={() => setEditingPlan(null)}
        onSuccess={refetch}
      />
      <DeletePlanModal
        open={!!deletingPlan}
        plan={deletingPlan}
        onClose={() => setDeletingPlan(null)}
        onSuccess={refetch}
      />
    </motion.div>
  );
}
