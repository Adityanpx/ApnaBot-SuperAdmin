// app/(dashboard)/flow-packs/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Workflow } from 'lucide-react';
import { useFlowPacks } from '@/hooks/useFlowPacks';
import FlowPackCard from '@/components/flowPacks/FlowPackCard';
import CreateFlowPackModal from '@/components/flowPacks/CreateFlowPackModal';
import EditFlowPackModal from '@/components/flowPacks/EditFlowPackModal';
import DeleteFlowPackModal from '@/components/flowPacks/DeleteFlowPackModal';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';

export default function FlowPacksPage() {
  const {
    packs, loading,
    createPack, updatePack, deletePack,
  } = useFlowPacks();

  // Modal state
  const [showCreate, setShowCreate]     = useState(false);
  const [editingPack, setEditingPack]   = useState(null);
  const [deletingPack, setDeletingPack] = useState(null);

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
          <h1 className="page-title">Flow Packs</h1>
          <p className="text-sm text-text-secondary mt-1">
            Reusable sets of chatbot rules businesses can add to their bot
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => setShowCreate(true)}
        >
          Create Flow Pack
        </Button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} lines={4} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && packs.length === 0 && (
        <EmptyState
          icon={Workflow}
          title="No flow packs yet"
          description="Create one to give businesses a reusable set of chatbot rules."
          action={{
            label: 'Create Flow Pack',
            onClick: () => setShowCreate(true),
          }}
        />
      )}

      {/* Grid */}
      {!loading && packs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {packs.map((pack, i) => (
            <FlowPackCard
              key={pack._id}
              pack={pack}
              delay={i * 0.04}
              onEdit={() => setEditingPack(pack)}
              onDelete={() => setDeletingPack(pack)}
            />
          ))}
        </div>
      )}

      {/* Modals — mutation hook toasts + refetches internally on success */}
      <CreateFlowPackModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        createPack={createPack}
      />
      <EditFlowPackModal
        open={!!editingPack}
        pack={editingPack}
        onClose={() => setEditingPack(null)}
        updatePack={updatePack}
      />
      <DeleteFlowPackModal
        open={!!deletingPack}
        pack={deletingPack}
        onClose={() => setDeletingPack(null)}
        deletePack={deletePack}
      />
    </motion.div>
  );
}
