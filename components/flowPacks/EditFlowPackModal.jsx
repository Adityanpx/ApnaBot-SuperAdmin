// components/flowPacks/EditFlowPackModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Settings, MessageSquare } from 'lucide-react';
import Modal   from '@/components/ui/Modal';
import Input   from '@/components/ui/Input';
import Select  from '@/components/ui/Select';
import Button  from '@/components/ui/Button';
import RuleEditor from './RuleEditor';
import { FLOW_PACK_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'details', label: 'Details', icon: Settings },
  { id: 'rules',   label: 'Rules',   icon: MessageSquare },
];

/**
 * EditFlowPackModal — tabbed modal for editing a flow pack
 * Tab 1: top-level fields (name, description, category, isActive, order)
 * Tab 2: rules — managed by RuleEditor
 * Both saved together in one PUT request when "Save" is clicked
 *
 * Props:
 *   open        boolean — is the modal visible?
 *   pack        object  — the flow pack being edited (null when closed)
 *   onClose     fn      — hide modal
 *   updatePack  fn      — useFlowPacks().updatePack (toasts + refetches internally)
 */
export default function EditFlowPackModal({ open, pack, onClose, updatePack }) {
  const [activeTab, setActiveTab] = useState('details');
  const [form,   setForm]   = useState(null);
  const [rules,  setRules]  = useState([]);
  const [saving, setSaving] = useState(false);

  // Hydrate local state when pack prop changes (modal opened with new pack)
  useEffect(() => {
    if (pack) {
      setForm({
        name: pack.name || '',
        description: pack.description || '',
        category: pack.category || 'any',
        isActive: pack.isActive ?? true,
        order: pack.order?.toString() || '0',
      });
      // Deep clone to avoid mutating the original
      setRules(JSON.parse(JSON.stringify(pack.rules || [])));
      setActiveTab('details');
    }
  }, [pack]);

  const update = field => e => setForm(prev => ({
    ...prev,
    [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.name.trim()) {
      toast.error('Flow pack must have a name');
      setActiveTab('details');
      return false;
    }
    for (const rule of rules) {
      if (!rule.keyword?.trim()) {
        toast.error('All rules must have a keyword');
        setActiveTab('rules');
        return false;
      }
      if (!rule.reply?.trim() && rule.replyType === 'text') {
        toast.error('All text rules must have a reply');
        setActiveTab('rules');
        return false;
      }
    }
    return true;
  };

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // Clean up temp IDs before sending to API
      const cleanRules = rules.map(({ _tempId, ...r }) => r);

      await updatePack(pack._id, {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        isActive: form.isActive,
        order: Number(form.order) || 0,
        rules: cleanRules,
      });

      onClose();
    } catch {
      // error already toasted by updatePack — keep the modal open
    } finally {
      setSaving(false);
    }
  };

  if (!pack || !form) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={form.name}
      subtitle="Changes apply immediately to shops using this flow pack"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-tertiary">
            {rules.length} rule{rules.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Save Flow Pack
            </Button>
          </div>
        </div>
      }
    >
      {/* Tab switcher */}
      <div className="flex gap-1 bg-bg-subtle rounded-xl p-1 mb-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tab.id === 'rules' ? rules.length : null;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg',
                'text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-bg-raised text-text-primary shadow-card'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {count !== null && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  isActive ? 'bg-info-bg text-info-text' : 'bg-bg-overlay text-text-tertiary'
                )}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatedTab tabKey={activeTab}>
        {activeTab === 'details' ? (
          <DetailsForm form={form} update={update} />
        ) : (
          <RuleEditor rules={rules} onChange={setRules} />
        )}
      </AnimatedTab>
    </Modal>
  );
}

// ── Details tab — top-level fields ──────────────────────────────────────────
function DetailsForm({ form, update }) {
  return (
    <div className="space-y-4">
      <Input
        label="Name"
        placeholder="e.g. Salon booking basics"
        value={form.name}
        onChange={update('name')}
        required
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-secondary">
          Description
        </label>
        <textarea
          rows={2}
          placeholder="What this flow pack is for…"
          value={form.description}
          onChange={update('description')}
          className="input-field resize-none text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Category"
          options={FLOW_PACK_CATEGORIES}
          placeholder={null}
          value={form.category}
          onChange={update('category')}
          required
        />
        <Input
          label="Display Order"
          type="number"
          placeholder="0"
          value={form.order}
          onChange={update('order')}
          min="0"
          hint="Lower numbers show first"
        />
      </div>

      <Toggle
        label="Active"
        checked={form.isActive}
        onChange={update('isActive')}
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className={cn(
          'w-9 h-5 rounded-full transition-colors',
          'bg-bg-subtle peer-checked:bg-brand-500'
        )} />
        <div className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm',
          'transition-transform peer-checked:translate-x-4',
          'group-hover:ring-2 group-hover:ring-brand-500/30'
        )} />
      </div>
      <span className="text-sm text-text-secondary group-hover:text-text-primary">
        {label}
      </span>
    </label>
  );
}

// Simple wrapper that animates when content switches
function AnimatedTab({ children, tabKey }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
