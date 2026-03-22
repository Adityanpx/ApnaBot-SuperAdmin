// components/templates/EditTemplateModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { MessageSquare, ClipboardList } from 'lucide-react';
import Modal   from '@/components/ui/Modal';
import Button  from '@/components/ui/Button';
import RuleEditor  from './RuleEditor';
import FieldEditor from './FieldEditor';
import api     from '@/lib/api';
import { API } from '@/lib/constants';
import { getBusinessEmoji, capitalize } from '@/lib/utils';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'rules',  label: 'Default Rules',   icon: MessageSquare },
  { id: 'fields', label: 'Booking Fields',  icon: ClipboardList },
];

/**
 * EditTemplateModal — tabbed modal for editing a business type template
 * Tab 1: defaultRules  — managed by RuleEditor
 * Tab 2: bookingFields — managed by FieldEditor
 * Both saved together in one PUT request when "Save" is clicked
 */
export default function EditTemplateModal({ open, onClose, template, onSuccess }) {
  const [activeTab, setActiveTab] = useState('rules');
  const [rules,     setRules]     = useState([]);
  const [fields,    setFields]    = useState([]);
  const [saving,    setSaving]    = useState(false);

  // Hydrate local state when template prop changes (modal opened with new template)
  useEffect(() => {
    if (template) {
      // Deep clone to avoid mutating the original
      setRules(JSON.parse(JSON.stringify(template.defaultRules  || [])));
      setFields(JSON.parse(JSON.stringify(template.bookingFields || [])));
      setActiveTab('rules');
    }
  }, [template]);

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
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
    for (const field of fields) {
      if (!field.fieldKey?.trim()) {
        toast.error('All booking fields must have a field key');
        setActiveTab('fields');
        return false;
      }
      if (!field.label?.trim()) {
        toast.error('All booking fields must have a label');
        setActiveTab('fields');
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
      const cleanRules  = rules.map(({ _tempId, ...r }) => r);
      const cleanFields = fields.map(({ _tempId, ...f }) => f);

      await api.put(API.TEMPLATE_BY_ID(template._id), {
        defaultRules:  cleanRules,
        bookingFields: cleanFields,
      });

      toast.success(`Template updated: ${capitalize(template.businessType)}`);
      onSuccess?.();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (!template) return null;

  const emoji = getBusinessEmoji(template.businessType);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          {capitalize(template.businessType)} Template
        </span>
      }
      subtitle="Changes apply to new shops only — existing shops keep their current rules"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-text-tertiary">
            {rules.length} rules · {fields.length} booking fields
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Save Template
            </Button>
          </div>
        </div>
      }
    >
      {/* Tab switcher */}
      <div className="flex gap-1 bg-bg-subtle rounded-xl p-1 mb-5">
        {TABS.map((tab) => {
          const Icon    = tab.icon;
          const isActive = activeTab === tab.id;
          const count   = tab.id === 'rules' ? rules.length : fields.length;

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
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-info-bg text-info-text' : 'bg-bg-overlay text-text-tertiary'
              )}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatedTab tabKey={activeTab}>
        {activeTab === 'rules' ? (
          <RuleEditor rules={rules} onChange={setRules} />
        ) : (
          <FieldEditor fields={fields} onChange={setFields} />
        )}
      </AnimatedTab>
    </Modal>
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
