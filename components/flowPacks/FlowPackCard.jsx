// components/flowPacks/FlowPackCard.jsx
'use client';

import { motion } from 'framer-motion';
import { Edit2, Trash2, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FLOW_PACK_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * FlowPackCard — shows one flow pack
 * Displays: name, description, category badge, rule count, active state,
 *           preview of first rules, edit/delete actions
 *
 * Props:
 *   pack      object   — flow pack document from API
 *   onEdit    fn       — opens EditFlowPackModal with this pack
 *   onDelete  fn       — opens DeleteFlowPackModal with this pack
 *   delay     number   — framer motion stagger delay
 */
export default function FlowPackCard({ pack, onEdit, onDelete, delay = 0 }) {
  const category = FLOW_PACK_CATEGORIES.find((c) => c.value === pack.category);
  const ruleCount = pack.rules?.length || 0;
  const isInactive = !pack.isActive;

  const previewRules = pack.rules?.slice(0, 3) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: isInactive ? 0 : -2 }}
      className={cn('card p-6 flex flex-col gap-5', isInactive && 'opacity-60')}
    >
      {/* Header — name + description + active badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-text-primary tracking-tight truncate">
            {pack.name}
          </h3>
          {pack.description && (
            <p className="text-xs text-text-tertiary mt-0.5 line-clamp-2">
              {pack.description}
            </p>
          )}
        </div>
        <Badge variant={pack.isActive ? 'success' : 'neutral'} dot className="flex-shrink-0">
          {pack.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Category + order */}
      <div className="flex items-center gap-2">
        <Badge variant="brand">
          {category?.emoji ? `${category.emoji} ` : ''}{category?.label || pack.category}
        </Badge>
        <span className="text-xs text-text-disabled">Order: {pack.order ?? 0}</span>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <StatPill icon={MessageSquare} label="Rules" value={ruleCount} />
      </div>

      {/* Rules preview */}
      {previewRules.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            Rules
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

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button
          variant="secondary"
          icon={Edit2}
          size="sm"
          onClick={onEdit}
          className="flex-1"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          icon={Trash2}
          size="sm"
          onClick={onDelete}
          className="w-9 px-0 flex-shrink-0"
        />
      </div>
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
    text:            'bg-info',
    booking_trigger: 'bg-warning',
    payment_trigger: 'bg-success',
  };
  return (
    <span className={`
      w-2 h-2 rounded-full flex-shrink-0
      ${colors[type] || 'bg-text-tertiary'}
    `} />
  );
}
