// components/plans/PlanCard.jsx
'use client';

import { motion } from 'framer-motion';
import {
  Edit2, Trash2,
  CheckCircle2, XCircle,
  Users, Zap, MessageSquare,
  BookOpen, CreditCard,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatLimit } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * PlanCard — displays one subscription plan with all its features
 * Props:
 *   plan     object  — plan document from API
 *   onEdit   fn      — opens EditPlanModal
 *   onDelete fn      — opens DeletePlanModal
 *   delay    number  — stagger animation delay
 */
export default function PlanCard({ plan, onEdit, onDelete, delay = 0 }) {
  const isPopular  = plan.name === 'pro';
  const isInactive = !plan.isActive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: isInactive ? 0 : -3 }}
      className={cn(
        'relative flex flex-col',
        isPopular
          ? 'rounded-2xl border border-brand-500 bg-bg-raised shadow-glow-brand p-6'
          : 'card p-6',
        isInactive && 'opacity-60'
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="badge badge-info px-3 py-1 text-[11px] shadow-glow-brand">
            ⭐ Popular
          </span>
        </div>
      )}

      {/* Header — name + status + price */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-text-primary tracking-tight">
            {plan.displayName}
          </h3>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-text-primary">
              {formatCurrency(plan.price)}
            </span>
            <span className="text-sm text-text-tertiary font-medium">/mo</span>
          </div>
        </div>
        <Badge variant={plan.isActive ? 'success' : 'neutral'} dot>
          {plan.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Inactive warning */}
      {isInactive && (
        <p className="text-xs text-warning-text bg-warning-bg rounded-lg px-3 py-2 mb-4">
          Hidden from public plan listing
        </p>
      )}

      {/* Limits */}
      <div className="space-y-2.5 mb-5">
        <LimitRow
          icon={MessageSquare}
          label="Messages / month"
          value={formatLimit(plan.msgLimit)}
        />
        <LimitRow
          icon={Zap}
          label="Chatbot rules"
          value={formatLimit(plan.ruleLimit)}
        />
        <LimitRow
          icon={Users}
          label="Customers"
          value={formatLimit(plan.customerLimit)}
        />
        {plan.staffEnabled && (
          <LimitRow
            icon={Users}
            label="Max staff"
            value={`Up to ${plan.maxStaff}`}
          />
        )}
      </div>

      {/* Feature flags */}
      <div className="flex flex-wrap gap-2 pb-5 mb-5 border-b border-border-subtle">
        <FeaturePill icon={BookOpen}   label="Bookings" enabled={plan.bookingEnabled} />
        <FeaturePill icon={CreditCard} label="Payments" enabled={plan.paymentLinkEnabled} />
        <FeaturePill icon={Users}      label="Staff"    enabled={plan.staffEnabled} />
      </div>

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

function LimitRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-secondary flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
        {label}
      </span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

function FeaturePill({ icon: Icon, label, enabled }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
      enabled
        ? 'bg-success-bg text-success-text'
        : 'bg-bg-subtle text-text-disabled'
    )}>
      {enabled
        ? <CheckCircle2 className="w-3 h-3" />
        : <XCircle className="w-3 h-3" />
      }
      {label}
    </span>
  );
}
