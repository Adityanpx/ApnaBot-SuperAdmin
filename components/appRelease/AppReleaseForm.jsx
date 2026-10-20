// components/appRelease/AppReleaseForm.jsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Switch from '@/components/ui/Switch';
import SaveWarningModal from '@/components/appRelease/SaveWarningModal';
import { validateAppConfig, warningFlags, PLAY_STORE_PREFIX, CAP_FIELDS } from '@/lib/appVersion';

const FIELDS = [
  'androidMinVersion', 'androidLatestVersion', 'forceUpdate', 'maintenanceMode', 'playStoreUrl',
  ...CAP_FIELDS,
];

// Caps are edited as text; a clean whole number becomes a number, anything else stays text (and fails validation).
const toCap = (s) => (/^\d{1,9}$/.test(s) ? Number(s) : s);
const pick = (src) => Object.fromEntries(FIELDS.map((k) => [
  k, CAP_FIELDS.includes(k) ? String(src[k] ?? '') : src[k],
]));
const clean = (v) => ({
  ...v,
  androidMinVersion: v.androidMinVersion.trim(),
  androidLatestVersion: v.androidLatestVersion.trim(),
  playStoreUrl: v.playStoreUrl.trim(),
  ...Object.fromEntries(CAP_FIELDS.map((k) => [k, toCap(v[k].trim())])),
});

/** One row: title + helper text on the left, a switch on the right. */
function FlagRow({ title, helper, checked, onChange, disabled }) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-border-subtle pt-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-tertiary mt-0.5">{helper}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} disabled={disabled} />
    </div>
  );
}

/** The two version inputs and the Play Store URL, with inline errors. */
function TextFields({ values, errors, touched, set }) {
  const err = (f) => (touched[f] ? errors[f] : undefined);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Android minimum version"
          placeholder="1.0.0"
          value={values.androidMinVersion}
          onChange={(e) => set('androidMinVersion', e.target.value)}
          error={err('androidMinVersion')}
          helper="Older app versions are treated as out of date."
        />
        <Input
          label="Android latest version"
          placeholder="1.0.0"
          value={values.androidLatestVersion}
          onChange={(e) => set('androidLatestVersion', e.target.value)}
          error={err('androidLatestVersion')}
        />
      </div>
      <Input
        label="Play Store URL"
        placeholder={`${PLAY_STORE_PREFIX}com.example.app`}
        value={values.playStoreUrl}
        onChange={(e) => set('playStoreUrl', e.target.value)}
        error={err('playStoreUrl')}
      />
    </>
  );
}

/** The two auto-translate character caps. */
function CapFields({ values, errors, touched, set }) {
  const err = (f) => (touched[f] ? errors[f] : undefined);
  return (
    <div className="grid gap-4 sm:grid-cols-2 border-t border-border-subtle pt-4">
      <Input
        label="Translate cap per business / month"
        inputMode="numeric"
        value={values.translateMonthlyCharCap}
        onChange={(e) => set('translateMonthlyCharCap', e.target.value)}
        error={err('translateMonthlyCharCap')}
        helper="Source characters one business can auto-translate each month."
      />
      <Input
        label="Translate cap, all businesses / month"
        inputMode="numeric"
        value={values.translateGlobalMonthlyCap}
        onChange={(e) => set('translateGlobalMonthlyCap', e.target.value)}
        error={err('translateGlobalMonthlyCap')}
        helper="Source characters sent to Azure across everyone each month."
      />
    </div>
  );
}

/** Edited values plus a `set(field, value)` that also marks the field as touched. */
function useEditableValues(data) {
  const [values, setValues] = useState(() => pick(data));
  const [touched, setTouched] = useState({});
  const set = (field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
    setTouched((t) => ({ ...t, [field]: true }));
  };
  return { values, touched, set };
}

/** Save state: calls onSave, toasts the outcome, and owns the confirm dialog flag. */
function useSubmit(onSave, next) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    setSaving(true);
    try {
      await onSave(next);
      toast.success('App release settings saved');
      setConfirmOpen(false);
    } catch (err) {
      toast.error(typeof err.userMessage === 'string' ? err.userMessage : 'Could not save');
    } finally {
      setSaving(false);
    }
  };
  return { saving, confirmOpen, setConfirmOpen, submit };
}

/** The Force update and Maintenance mode rows. */
function FlagRows({ values, set }) {
  return (
    <>
      <FlagRow
        title="Force update"
        helper="Users below the minimum version cannot use the app until they update."
        checked={values.forceUpdate}
        onChange={(v) => set('forceUpdate', v)}
      />
      <FlagRow
        title="Maintenance mode"
        helper="Every user sees a maintenance screen instead of the app."
        checked={values.maintenanceMode}
        onChange={(v) => set('maintenanceMode', v)}
      />
    </>
  );
}

/**
 * AppReleaseForm — edit the Android release settings.
 * Asks for confirmation before a save that can block users (see warningFlags).
 *
 * Props:
 *   data    object — the config as loaded from the server
 *   onSave  async fn(values) — throws on failure
 */
export default function AppReleaseForm({ data, onSave }) {
  const { values, touched, set } = useEditableValues(data);
  const next = clean(values);
  const errors = validateAppConfig(next);
  const flags = warningFlags(data, next);
  const { saving, confirmOpen, setConfirmOpen, submit } = useSubmit(onSave, next);
  const dirty = FIELDS.some((k) => next[k] !== data[k]);
  const needsWarning = flags.blocksOldVersions || flags.maintenance;

  return (
    <div className="card p-5 sm:p-6 max-w-2xl space-y-4">
      <TextFields values={values} errors={errors} touched={touched} set={set} />
      <FlagRows values={values} set={set} />
      <CapFields values={values} errors={errors} touched={touched} set={set} />
      <Button
        loading={saving && !confirmOpen}
        disabled={!dirty || Object.keys(errors).length > 0}
        onClick={needsWarning ? () => setConfirmOpen(true) : submit}
      >
        Save
      </Button>
      <SaveWarningModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submit}
        loading={saving}
        minVersion={next.androidMinVersion}
        blocksOldVersions={flags.blocksOldVersions}
        maintenance={flags.maintenance}
      />
    </div>
  );
}
