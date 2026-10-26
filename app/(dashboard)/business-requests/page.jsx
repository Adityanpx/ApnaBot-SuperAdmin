// app/(dashboard)/business-requests/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Copy, X } from 'lucide-react';
import { useBusinessRequests } from '@/hooks/useBusinessRequests';
import { useCategoryOptions } from '@/hooks/useCategoryOptions';
import BusinessRequestsTable from '@/components/businessRequests/BusinessRequestsTable';
import EditRequestModal from '@/components/businessRequests/EditRequestModal';
import ChangeCategoryModal from '@/components/businessRequests/ChangeCategoryModal';
import CopySetupModal from '@/components/businesses/CopySetupModal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import ErrorState from '@/components/ui/ErrorState';
import { REQUEST_STATUSES, STATUS_LABELS } from '@/lib/businessRequests';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...REQUEST_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
];

/** Shown after a category change: points at the existing Copy setup action. */
function CopySetupHint({ changed, onOpen, onDismiss }) {
  return (
    <div className="card p-4 flex items-start gap-3 border-info-DEFAULT/30" role="status">
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm text-text-primary">
          <strong>{changed.name}</strong> is now in the new category. Use Copy setup to apply the category&apos;s flow.
        </p>
        <Button size="sm" variant="secondary" icon={<Copy className="w-4 h-4" />} onClick={onOpen}>
          Copy setup…
        </Button>
      </div>
      <button type="button" onClick={onDismiss} aria-label="Dismiss" className="icon-btn text-text-tertiary">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Business requests - owners who signed up for a business that is not in the category list. */
export default function BusinessRequestsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const {
    requests, total, loading, error, refetch, updateRequest, changeCategory,
  } = useBusinessRequests({ status, page });
  const { categories } = useCategoryOptions();
  const [editing, setEditing] = useState(null);
  const [changing, setChanging] = useState(null);
  const [changed, setChanged] = useState(null);   // { _id, name, businessCategory } after a category change
  const [copying, setCopying] = useState(false);

  const onFilter = (value) => { setStatus(value); setPage(1); };

  const onChanged = (row, category) => {
    setChanging(null);
    setChanged({ _id: row.businessId, name: row.businessName, businessCategory: category });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Business Requests</h1>
          <p className="text-sm text-text-secondary mt-1">
            Owners who said their business is not in the category list. Contact them, then set the category.
          </p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={refetch}>Refresh</Button>
      </div>

      <div className="sm:max-w-xs">
        <Select
          label="Status"
          placeholder={null}
          value={status}
          onChange={(e) => onFilter(e.target.value)}
          options={STATUS_OPTIONS}
        />
      </div>

      {changed && (
        <CopySetupHint changed={changed} onOpen={() => setCopying(true)} onDismiss={() => setChanged(null)} />
      )}

      {error ? (
        <ErrorState title="Could not load business requests" message={error} onRetry={refetch} />
      ) : (
        <BusinessRequestsTable
          requests={requests}
          total={total}
          loading={loading}
          filtered={!!status}
          page={page}
          onPage={setPage}
          onEdit={setEditing}
          onChangeCategory={setChanging}
        />
      )}

      <EditRequestModal
        open={!!editing}
        row={editing}
        onClose={() => setEditing(null)}
        onSave={updateRequest}
      />
      <ChangeCategoryModal
        open={!!changing}
        row={changing}
        categories={categories}
        onClose={() => setChanging(null)}
        onConfirm={changeCategory}
        onChanged={onChanged}
      />
      {changed && (
        <CopySetupModal open={copying} onClose={() => setCopying(false)} business={changed} />
      )}
    </motion.div>
  );
}
