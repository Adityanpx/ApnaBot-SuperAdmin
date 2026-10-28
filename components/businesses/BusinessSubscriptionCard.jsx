// components/businesses/BusinessSubscriptionCard.jsx
import React from 'react';
import Badge from '@/components/ui/Badge';
import { planLimitLines } from '@/lib/planForm';
import {
  formatDate,
  formatCurrency,
  getSubStatusVariant,
  capitalize,
} from '@/lib/utils';
import {
  MessageSquare,
  Image,
  Send,
  Users,
  HardDrive,
  CalendarClock,
  CreditCard,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const LIMIT_ICONS = {
  messages: MessageSquare,
  media: Image,
  collections: Image,
  broadcast: Send,
  staff: Users,
  storage: HardDrive,
};

function FeatureRow({ icon, label, value, enabled }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
      <div className="flex items-center gap-2.5">
        {React.isValidElement(icon) ? icon : (icon && React.createElement(icon, { className: 'w-4 h-4 text-text-tertiary' }))}
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${enabled === false ? 'text-text-disabled' : 'text-text-primary'}`}>
        {enabled === false
          ? <XCircle className="w-4 h-4 text-text-disabled" />
          : value
        }
      </span>
    </div>
  );
}

export default function BusinessSubscriptionCard({ subscription, plan }) {
  if (!subscription || !plan) {
    return (
      <div className="card p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4">Subscription</h3>
        <div className="flex flex-col items-center py-6 text-center">
          <CreditCard className="w-8 h-8 text-text-disabled mb-3" />
          <p className="text-sm text-text-secondary font-medium">No active subscription</p>
          <p className="text-xs text-text-tertiary mt-1">Assign a plan to activate this business.</p>
        </div>
      </div>
    );
  }

  const isExpiringSoon = (() => {
    if (!subscription.endDate) return false;
    const daysLeft = Math.ceil(
      (new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft > 0 && daysLeft <= 7;
  })();

  return (
    <div className="space-y-4">

      {/* Plan name + status */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-text-tertiary font-medium mb-1">Current Plan</p>
            <h3 className="text-xl font-bold text-text-primary">{plan.displayName}</h3>
            <p className="text-sm text-text-secondary mt-1">
              {formatCurrency(plan.price)}<span className="text-text-tertiary">/month</span>
            </p>
          </div>
          <Badge variant={getSubStatusVariant(subscription.status)} dot>
            {capitalize(subscription.status)}
          </Badge>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-border-subtle">
          <div>
            <p className="text-xs text-text-tertiary font-medium">Start Date</p>
            <p className="text-sm text-text-primary font-semibold mt-1">
              {formatDate(subscription.startDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-tertiary font-medium">
              End Date
              {isExpiringSoon && (
                <span className="ml-2 text-warning-text">⚠ Expiring soon</span>
              )}
            </p>
            <p className={`text-sm font-semibold mt-1 ${isExpiringSoon ? 'text-warning-text' : 'text-text-primary'}`}>
              {formatDate(subscription.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Plan features / limits */}
      <div className="card p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-2">Plan Limits</h3>
        <div className="mt-2">
          {planLimitLines(plan).map((l) => (
            <FeatureRow key={l.key} icon={LIMIT_ICONS[l.key]} label={l.label} value={l.value} />
          ))}
          <FeatureRow
            icon={<CalendarClock className="w-4 h-4" />}
            label="Booking flow"
            value={plan.bookingEnabled ? 'Enabled' : undefined}
            enabled={plan.bookingEnabled}
          />
        </div>
      </div>
    </div>
  );
}
