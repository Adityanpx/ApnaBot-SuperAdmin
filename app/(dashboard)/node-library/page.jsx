// app/(dashboard)/node-library/page.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNodeLibrary } from '@/hooks/useNodeLibrary';
import BusinessPicker from '@/components/categoryTemplates/BusinessPicker';
import BusinessNodesPanel from '@/components/nodeLibrary/BusinessNodesPanel';
import NodeLibraryTable from '@/components/nodeLibrary/NodeLibraryTable';
import Select from '@/components/ui/Select';
import { CATEGORY_TEMPLATE_CATEGORIES } from '@/lib/constants';

export default function NodeLibraryPage() {
  const {
    entries, entriesLoading, fetchEntries,
    businessNodes, businessNodesLoading, fetchBusinessNodes,
    addToLibrary, deleteEntry,
  } = useNodeLibrary();

  const [sourceBusiness, setSourceBusiness] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');

  const handleBusinessChange = (business) => {
    setSourceBusiness(business);
    if (business) fetchBusinessNodes(business._id);
  };

  const handleAdd = async (node, category) => {
    try {
      await addToLibrary({
        sourceBusinessId: sourceBusiness._id,
        sourceNodeId: node._id,
        category,
      });
    } catch {
      // error already toasted by addToLibrary
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setCategoryFilter(value);
    fetchEntries(value || undefined);
  };

  const handleDelete = (entry) => {
    if (!window.confirm(`Remove "${entry.label}" from the node library?`)) return;
    deleteEntry(entry._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Page header */}
      <div>
        <h1 className="page-title">Node Library</h1>
        <p className="text-sm text-text-secondary mt-1">
          Reusable reply and question nodes, pulled from a business and tagged by category
        </p>
      </div>

      {/* Add from business */}
      <section className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Add from business</h2>
        <div className="max-w-md">
          <BusinessPicker value={sourceBusiness} onChange={handleBusinessChange} />
        </div>
        {sourceBusiness && (
          <BusinessNodesPanel
            nodes={businessNodes}
            loading={businessNodesLoading}
            onAdd={handleAdd}
          />
        )}
      </section>

      {/* Library */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Library</h2>
          <Select
            options={CATEGORY_TEMPLATE_CATEGORIES}
            value={categoryFilter}
            onChange={handleFilterChange}
            placeholder="All categories"
            containerClassName="w-48"
          />
        </div>
        <NodeLibraryTable
          entries={entries}
          loading={entriesLoading}
          onDelete={handleDelete}
        />
      </section>
    </motion.div>
  );
}
