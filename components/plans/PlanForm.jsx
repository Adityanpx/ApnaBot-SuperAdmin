// components/plans/PlanForm.jsx
'use client';

import { ArrowUp, ArrowDown, Plus, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Toggle from '@/components/plans/Toggle';
import { formatCurrency } from '@/lib/utils';
import { buildDurationOptions, moveItem } from '@/lib/planForm';

/**
 * Fields shared by Create and Edit Plan. Controlled: the parent owns `form`
 * (see lib/planForm.js) and receives every change through `onChange(nextForm)`.
 *
 * Props:
 *   form      object  — form state from emptyPlanForm() / planToForm()
 *   onChange  fn      — called with the updated form
 *   isEdit    boolean — Internal ID is read-only when true
 *   broadcastError string — server message shown under the broadcast limit
 */
export default function PlanForm({ form, onChange, isEdit = false, broadcastError }) {
  const set = (field) => (e) => onChange({ ...form, [field]: e.target.value });
  const flip = (field) => (next) => onChange({ ...form, [field]: next });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Internal ID"
          placeholder="e.g. starter"
          value={form.name}
          onChange={set('name')}
          disabled={isEdit}
          required={!isEdit}
          helper={isEdit ? 'Cannot be changed after creation' : 'No spaces, e.g. starter, pro'}
        />
        <Input
          label="Display Name"
          placeholder="e.g. Starter"
          value={form.displayName}
          onChange={set('displayName')}
          required
        />
      </div>

      <Input
        label="Monthly Price (₹)"
        type="number"
        placeholder="0"
        value={form.price}
        onChange={set('price')}
        required
        min="0"
        helper="The only base price. Longer durations are calculated from it."
      />

      <DurationPricing form={form} onChange={onChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Messages/month" type="number" placeholder="0" step="1"
          value={form.msgLimit} onChange={set('msgLimit')} helper="-1 = unlimited" />
        <Input label="Broadcast recipients per broadcast" type="number" placeholder="100" step="1"
          value={form.broadcastRecipientLimit} onChange={set('broadcastRecipientLimit')}
          error={broadcastError}
          helper="Whole number from 1, or -1 = unlimited" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input label="Photos per reply" type="number" placeholder="1" min="1" max="10" step="1"
          value={form.imagesPerReply} onChange={set('imagesPerReply')} helper="1–10" />
        <Input label="Catalogue collections (cards per reply)" type="number" placeholder="3" min="2" max="10" step="1"
          value={form.carouselMaxCards} onChange={set('carouselMaxCards')}
          helper="Max swipe cards in one bot carousel reply" />
        <Input label="Media storage (MB)" type="number" placeholder="Default" min="0" step="1"
          value={form.storageLimitMb} onChange={set('storageLimitMb')} />
        <Input label="Display order" type="number" placeholder="0" step="1"
          value={form.sortOrder} onChange={set('sortOrder')} helper="Lower shows first" />
      </div>

      {form.staffEnabled && (
        <Input label="Staff accounts" type="number" placeholder="e.g. 5" min="1"
          value={form.maxStaff} onChange={set('maxStaff')} />
      )}

      <FeaturesEditor
        features={form.features}
        onChange={(features) => onChange({ ...form, features })}
      />

      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-x-4 gap-y-1 pt-2">
        <Toggle label="Active (visible to customers)" checked={form.isActive}
          onChange={flip('isActive')} />
        <Toggle label="Popular badge" checked={form.isPopular} onChange={flip('isPopular')} />
        <Toggle label="Booking feature" checked={form.bookingEnabled}
          onChange={flip('bookingEnabled')} />
        <Toggle label="Staff management" checked={form.staffEnabled}
          onChange={flip('staffEnabled')} />
        <Toggle label="Video per reply (16 MB)" checked={form.videoPerReply}
          onChange={flip('videoPerReply')} />
      </div>
    </div>
  );
}

/** Monthly (= price) plus read-only computed totals; only the discount % is editable. */
function DurationPricing({ form, onChange }) {
  const options = buildDurationOptions(form.price || 0, form.tiers);
  const setDiscount = (idx, value) => onChange({
    ...form,
    tiers: form.tiers.map((t, i) => (i === idx ? { ...t, discount: value } : t)),
  });

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-secondary">
        Duration Pricing
        <span className="text-xs text-text-tertiary ml-2">
          (total for each duration, calculated)
        </span>
      </p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={opt.months} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm text-text-secondary w-28 flex-shrink-0">{opt.label}</span>
            <span
              className="text-sm font-semibold text-text-primary w-24"
              data-testid={`tier-total-${opt.months}`}
            >
              {formatCurrency(opt.price)}
            </span>
            {opt.months > 1 && (
              <Input
                aria-label={`${opt.label} discount %`}
                type="number" min="0" max="100" suffix="%"
                containerClassName="w-28"
                value={form.tiers[i - 1].discount}
                onChange={(e) => setDiscount(i - 1, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** One feature per line: add, remove and reorder. Blank lines are dropped on save. */
function FeaturesEditor({ features, onChange }) {
  const edit = (idx, value) => onChange(features.map((f, i) => (i === idx ? value : f)));
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-secondary">
        Features
        <span className="text-xs text-text-tertiary ml-2">(shown to customers, one per line)</span>
      </p>
      {features.map((feature, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <Input
            aria-label={`Feature ${idx + 1}`}
            containerClassName="flex-1"
            value={feature}
            maxLength={200}
            onChange={(e) => edit(idx, e.target.value)}
          />
          <IconButton label={`Move feature ${idx + 1} up`} icon={ArrowUp}
            disabled={idx === 0} onClick={() => onChange(moveItem(features, idx, idx - 1))} />
          <IconButton label={`Move feature ${idx + 1} down`} icon={ArrowDown}
            disabled={idx === features.length - 1}
            onClick={() => onChange(moveItem(features, idx, idx + 1))} />
          <IconButton label={`Remove feature ${idx + 1}`} icon={X}
            onClick={() => onChange(features.filter((_, i) => i !== idx))} />
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" icon={Plus}
        onClick={() => onChange([...features, ''])}>
        Add feature
      </Button>
    </div>
  );
}

function IconButton({ label, icon: Icon, onClick, disabled }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="icon-btn text-text-tertiary hover:text-text-primary hover:bg-bg-subtle disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
