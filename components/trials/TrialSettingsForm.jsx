// components/trials/TrialSettingsForm.jsx
'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import { validateTrialSettings, settingsPatch } from '@/lib/trials';

/**
 * TrialSettingsForm — free-trial switch, the plan trials start on, and the trial length.
 * Props:
 *   settings  { trialEnabled, trialDays, trialPlanId, trialPlanIsDefault }
 *   plans     plan documents from usePlans()
 *   onSave    fn(body) — useTrials().saveSettings (toasts on failure and throws)
 */
export default function TrialSettingsForm({ settings, plans, onSave }) {
  const [values, setValues] = useState({
    trialEnabled: !!settings.trialEnabled,
    trialPlanId: settings.trialPlanId || '',
    trialDays: String(settings.trialDays ?? ''),
  });
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const errors = validateTrialSettings(values);
  const set = (field) => (v) => setValues((s) => ({ ...s, [field]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      await onSave(settingsPatch(settings, values));
    } catch {
      // already toasted by the hook
    } finally {
      setSaving(false);
    }
  };

  const options = plans.filter((p) => p.isActive !== false).map((p) => ({ value: p._id, label: p.displayName || p.name }));
  return (
    <form onSubmit={submit} noValidate className="card p-5 space-y-4 max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">Free trial</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            When on, a new business can claim one free trial per phone number.
          </p>
        </div>
        <Switch
          checked={values.trialEnabled}
          onChange={set('trialEnabled')}
          label="Free trial enabled"
        />
      </div>
      <Select
        label="Trial plan"
        options={options}
        value={values.trialPlanId}
        onChange={(e) => set('trialPlanId')(e.target.value)}
        placeholder={null}
      />
      {settings.trialPlanIsDefault && (
        <p className="text-xs text-text-tertiary -mt-2">Using the default plan (Basic).</p>
      )}
      <Input
        label="Trial days"
        type="number"
        min="1"
        value={values.trialDays}
        onChange={(e) => set('trialDays')(e.target.value)}
        error={touched ? errors.trialDays : undefined}
      />
      <div className="flex justify-end pt-2 border-t border-border-subtle">
        <Button type="submit" loading={saving}>Save settings</Button>
      </div>
    </form>
  );
}
