// components/templates/TemplateCard.jsx
'use client';

import { motion } from 'framer-motion';
import { Edit2, MessageSquare, ClipboardList } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getBusinessEmoji, capitalize } from '@/lib/utils';

/**
 * TemplateCard — shows one business type template
 * Displays: business type name, rule count, booking field count,
 *           preview of first 2 rules, edit button
 *
 * Props:
 *   template  object   — full template document from API
 *   onEdit    fn       — opens EditTemplateModal with this template
 *   delay     number   — framer motion stagger delay
 */
export default function TemplateCard({ template, onEdit, delay = 0 }) {
  const emoji      = getBusinessEmoji(template.businessType);
  const ruleCount  = template.defaultRules?.length  || 0;
  const fieldCount = template.bookingFields?.length || 0;

  // Show first 3 rules as preview
  const previewRules  = template.defaultRules?.slice(0, 3)  || [];
  // Show first 3 booking fields as preview
  const previewFields = template.bookingFields?.slice(0, 3) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2 }}
      className="card p-6 flex flex-col gap-5"
    >
      {/* Header — emoji + type name + edit button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="
            w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0
            bg-bg-subtle text-2xl
          ">
            {emoji}
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary tracking-tight capitalize">
              {capitalize(template.businessType)}
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Business type template
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          icon={Edit2}
          size="sm"
          onClick={onEdit}
          className="flex-shrink-0"
        >
          Edit
        </Button>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <StatPill icon={MessageSquare} label="Rules"  value={ruleCount} />
        <StatPill icon={ClipboardList} label="Fields" value={fieldCount} />
      </div>

      {/* Rules preview */}
      {previewRules.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            Default Rules
          </p>
          <div className="space-y-1.5">
            {previewRules.map((rule, i) => (
              <div key={i} className="flex items-center gap-2.5 min-w-0">
                <ReplyTypeDot type={rule.replyType} />
                <span className="
                  text-xs font-mono bg-bg-subtle text-info-text
                  px-2 py-0.5 rounded-md flex-shrink-0
                ">
                  {rule.keyword}
                </span>
                <span className="text-xs text-text-tertiary truncate">
                  {rule.reply?.slice(0, 48)}…
                </span>
              </div>
            ))}
            {ruleCount > 3 && (
              <p className="text-xs text-text-disabled pl-1">
                +{ruleCount - 3} more rules
              </p>
            )}
          </div>
        </div>
      )}

      {/* Booking fields preview */}
      {previewFields.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-border-subtle">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            Booking Fields
          </p>
          <div className="flex flex-wrap gap-1.5">
            {previewFields.map((field, i) => (
              <Badge key={i} variant={field.required ? 'info' : 'neutral'}>
                {field.fieldKey}
                {field.required && ' *'}
              </Badge>
            ))}
            {fieldCount > 3 && (
              <Badge variant="neutral">+{fieldCount - 3} more</Badge>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-bg-subtle rounded-xl px-3 py-2">
      <Icon className="w-3.5 h-3.5 text-text-tertiary" />
      <span className="text-xs text-text-secondary">
        <span className="font-bold text-text-primary">{value}</span> {label}
      </span>
    </div>
  );
}

function ReplyTypeDot({ type }) {
  const colors = {
    text:            'bg-info-DEFAULT',
    booking_trigger: 'bg-warning-DEFAULT',
    payment_link:    'bg-success-DEFAULT',
  };
  return (
    <span className={`
      w-2 h-2 rounded-full flex-shrink-0
      ${colors[type] || 'bg-text-tertiary'}
    `} />
  );
}
