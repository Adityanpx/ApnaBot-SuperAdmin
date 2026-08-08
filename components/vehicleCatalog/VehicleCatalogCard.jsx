// components/vehicleCatalog/VehicleCatalogCard.jsx
'use client';

import { motion } from 'framer-motion';
import {
  Edit2, Trash2, Car,
  ToggleLeft, ToggleRight, Users,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { VEHICLE_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * VehicleCatalogCard — displays one vehicle catalog entry
 * Props:
 *   entry    object  — vehicle catalog document from API
 *   onEdit   fn      — opens EditVehicleCatalogModal
 *   onDelete fn      — opens DeleteVehicleCatalogModal
 *   onToggle fn      — flips isActive
 *   delay    number  — stagger animation delay
 */
export default function VehicleCatalogCard({ entry, onEdit, onDelete, onToggle, delay = 0 }) {
  const isInactive = !entry.isActive;
  const typeLabel = VEHICLE_TYPES.find(t => t.value === entry.type)?.label || entry.type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: isInactive ? 0 : -3 }}
      className={cn('card p-6 flex flex-col', isInactive && 'opacity-60')}
    >
      {/* Photo */}
      <div className="w-full h-36 rounded-xl bg-bg-subtle flex items-center justify-center overflow-hidden mb-4 flex-shrink-0">
        {entry.photoUrl ? (
          <img
            src={entry.photoUrl}
            alt={entry.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Car className="w-10 h-10 text-text-disabled" />
        )}
      </div>

      {/* Header — name + type + toggle */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-text-primary tracking-tight truncate">
            {entry.name}
          </h3>
          <Badge variant="brand" className="mt-1.5">{typeLabel}</Badge>
        </div>
        <button
          onClick={onToggle}
          title={entry.isActive ? 'Deactivate' : 'Activate'}
          className="
            w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0
            text-text-tertiary hover:text-text-primary hover:bg-bg-subtle
            transition-colors duration-150
          "
        >
          {entry.isActive
            ? <ToggleRight className="w-5 h-5 text-success" />
            : <ToggleLeft className="w-5 h-5" />
          }
        </button>
      </div>

      {/* Inactive warning */}
      {isInactive && (
        <p className="text-xs text-warning-text bg-warning-bg rounded-lg px-3 py-2 mb-4">
          Hidden from shop owner&apos;s vehicle selection
        </p>
      )}

      {/* Seats */}
      <div className="flex items-center justify-between text-sm mb-5 pb-5 border-b border-border-subtle">
        <span className="text-text-secondary flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
          Seats
        </span>
        <span className="font-semibold text-text-primary">{entry.seats ?? '—'}</span>
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
