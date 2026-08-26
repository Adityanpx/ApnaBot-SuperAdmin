// app/(dashboard)/rate-cards/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useRateCards } from '@/hooks/useRateCards';
import RateCardTable from '@/components/rateCards/RateCardTable';
import CreateRateCardModal from '@/components/rateCards/CreateRateCardModal';
import Button from '@/components/ui/Button';

export default function RateCardsPage() {
  const { rateCards, loading, createRateCard } = useRateCards();

  const [showCreate, setShowCreate] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-screen-xl"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Rate Cards</h1>
          <p className="text-sm text-text-secondary mt-1">
            Per-message pricing by country and category. Append-only — new
            rows schedule a rate change, existing rows are never edited.
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => setShowCreate(true)}
        >
          Add Rate
        </Button>
      </div>

      {/* Table */}
      <RateCardTable rateCards={rateCards} loading={loading} />

      {/* Add rate modal */}
      <CreateRateCardModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        createRateCard={createRateCard}
      />
    </motion.div>
  );
}
