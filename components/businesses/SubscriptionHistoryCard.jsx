// components/businesses/SubscriptionHistoryCard.jsx
import Badge from '@/components/ui/Badge';
import { formatDate, formatCurrency, getSubStatusVariant, capitalize } from '@/lib/utils';
import { History, ShieldCheck, CreditCard } from 'lucide-react';

/**
 * SubscriptionHistoryCard — lists every subscription row ever created for a
 * business, newest first. Distinguishes manual superadmin grants (no
 * razorpay ids) from paid Razorpay subscriptions.
 *
 * Props:
 *   history — array of subscription rows (from GET .../subscription-history)
 */
export default function SubscriptionHistoryCard({ history = [] }) {
  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-text-secondary mb-4">Subscription History</h3>

      {history.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <History className="w-8 h-8 text-text-disabled mb-3" />
          <p className="text-sm text-text-secondary font-medium">No subscription history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((sub) => {
            const isManualGrant = !sub.razorpaySubscriptionId && !sub.razorpayPaymentId;
            return (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl bg-bg-subtle border border-border-subtle"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {sub.plan?.displayName || 'Unknown plan'}
                      </p>
                      <Badge variant={getSubStatusVariant(sub.status)} dot>
                        {capitalize(sub.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
                    </p>
                  </div>
                  {sub.plan?.price !== undefined && (
                    <p className="text-sm font-semibold text-text-primary flex-shrink-0">
                      {formatCurrency(sub.plan.price)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border-subtle">
                  {isManualGrant ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-info-text" />
                      <span className="text-xs text-info-text">Manual grant by superadmin</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5 text-text-tertiary" />
                      <span className="text-xs text-text-tertiary">Paid via Razorpay</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
