// app/(dashboard)/whatsapp-flows/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useWhatsappFlows } from '@/hooks/useWhatsappFlows';
import WhatsappFlowTable from '@/components/whatsappFlows/WhatsappFlowTable';
import CreateFlowModal from '@/components/whatsappFlows/CreateFlowModal';
import EditFlowModal from '@/components/whatsappFlows/EditFlowModal';
import PublishToBusinessModal from '@/components/whatsappFlows/PublishToBusinessModal';
import DeleteFlowModal from '@/components/whatsappFlows/DeleteFlowModal';
import Button from '@/components/ui/Button';

export default function WhatsappFlowsPage() {
  const {
    flows, loading,
    createFlow, updateFlow, deleteFlow, publishToBusiness,
  } = useWhatsappFlows();

  // Modal state
  const [showCreate, setShowCreate]         = useState(false);
  const [editingFlow, setEditingFlow]       = useState(null);
  const [publishingFlow, setPublishingFlow] = useState(null);
  const [deletingFlow, setDeletingFlow]     = useState(null);

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
          <h1 className="page-title">WhatsApp Flows</h1>
          <p className="text-sm text-text-secondary mt-1">
            Reusable Meta Flow definitions, published into a business&apos;s WhatsApp account
          </p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreate(true)}>
          New Flow
        </Button>
      </div>

      {/* Table */}
      <WhatsappFlowTable
        flows={flows}
        loading={loading}
        onEdit={setEditingFlow}
        onPublish={setPublishingFlow}
        onDelete={setDeletingFlow}
      />

      {/* Modals — mutation hook toasts + refetches internally on success */}
      <CreateFlowModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        createFlow={createFlow}
      />
      <EditFlowModal
        open={!!editingFlow}
        flow={editingFlow}
        onClose={() => setEditingFlow(null)}
        updateFlow={updateFlow}
      />
      <PublishToBusinessModal
        open={!!publishingFlow}
        flow={publishingFlow}
        onClose={() => setPublishingFlow(null)}
        publishToBusiness={publishToBusiness}
      />
      <DeleteFlowModal
        open={!!deletingFlow}
        flow={deletingFlow}
        onClose={() => setDeletingFlow(null)}
        deleteFlow={deleteFlow}
      />
    </motion.div>
  );
}
