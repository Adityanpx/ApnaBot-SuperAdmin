// components/shops/ShopDetailCard.jsx
import Badge from '@/components/ui/Badge';
import {
  getInitials,
  capitalize,
  formatDate,
  formatRelative,
  getBusinessEmoji,
} from '@/lib/utils';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-subtle last:border-0">
      <div className="w-8 h-8 rounded-lg bg-bg-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-text-tertiary w-4 h-4">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-tertiary font-medium">{label}</p>
        <p className="text-sm text-text-primary mt-0.5 break-all">{value}</p>
      </div>
    </div>
  );
}

export default function ShopDetailCard({ shop, staffCount }) {
  return (
    <div className="space-y-5">

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Business type emoji avatar */}
            <div className="w-14 h-14 rounded-2xl bg-bg-subtle flex items-center justify-center text-3xl flex-shrink-0">
              {getBusinessEmoji(shop.businessType)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary leading-tight">
                {shop.name}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {capitalize(shop.businessType)}{shop.city ? ` · ${shop.city}` : ''}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                Joined {formatDate(shop.createdAt)}
              </p>
            </div>
          </div>

          {/* Status */}
          <Badge
            variant={shop.isActive ? 'success' : 'neutral'}
            dot
            className="flex-shrink-0"
          >
            {shop.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Info rows */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-1">Shop Details</h3>
        <div className="mt-3">
          <InfoRow icon={<MapPin />} label="Address" value={shop.address} />
          <InfoRow icon={<Phone />}  label="WhatsApp Number" value={shop.whatsappNumber} />
        </div>

        {/* WhatsApp connection status */}
        <div className="flex items-center gap-3 pt-3 mt-1">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${shop.isWhatsappConnected ? 'bg-success-bg' : 'bg-bg-subtle'}`}>
            {shop.isWhatsappConnected
              ? <Wifi className="w-4 h-4 text-success-text" />
              : <WifiOff className="w-4 h-4 text-text-tertiary" />
            }
          </div>
          <div>
            <p className="text-xs text-text-tertiary font-medium">WhatsApp</p>
            <p className={`text-sm font-semibold mt-0.5 ${shop.isWhatsappConnected ? 'text-success-text' : 'text-text-tertiary'}`}>
              {shop.isWhatsappConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
      </div>

      {/* Owner card */}
      {shop.ownerUserId && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Owner</h3>
          <div className="flex items-center gap-3">
            <div className="
              w-10 h-10 rounded-full flex items-center justify-center
              bg-gradient-brand text-white text-sm font-bold flex-shrink-0
            ">
              {getInitials(shop.ownerUserId.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {shop.ownerUserId.name}
              </p>
              <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3 h-3 flex-shrink-0" />
                {shop.ownerUserId.email}
              </p>
              {shop.ownerUserId.lastLoginAt && (
                <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  Last seen {formatRelative(shop.ownerUserId.lastLoginAt)}
                </p>
              )}
            </div>
          </div>

          {/* Staff count */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-subtle">
            <User className="w-4 h-4 text-text-tertiary" />
            <span className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">{staffCount}</span>
              {' '}staff member{staffCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
