// components/businesses/BusinessFeaturesCard.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import OwnerMediaSwitch from '@/components/businesses/OwnerMediaSwitch';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

/**
 * BusinessFeaturesCard — Businesses → <business> → Features.
 * Per-business override of a category switch (ApnaBot-server
 * business_features): follow the category, or force on / off for just this
 * business (e.g. pilot Bot Builder with one institute). The server lists only
 * features that apply to the business's category; renders nothing when none do.
 * Turning a feature off hides its dashboard pages — it deletes nothing.
 */
export default function BusinessFeaturesCard({ businessId, businessName }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [pendingOff, setPendingOff] = useState(null); // { feature } awaiting "Off for this business" confirmation

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.BUSINESS_FEATURES(businessId));
      setFeatures(res.data.data.features);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load features');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { fetchFeatures(); }, [fetchFeatures]);

  const setOverride = async (feature, override) => {
    if (override === feature.override) return false;
    setSaving(feature.feature);
    try {
      const res = await api.put(API.BUSINESS_FEATURE(businessId, feature.feature), { override });
      setFeatures(res.data.data.features);
      toast.success(res.data.message || 'Saved');
      return true;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update feature');
      return false;
    } finally {
      setSaving(null);
    }
  };

  if (loading || features.length === 0) return null;

  return (
    <div className="card p-4 sm:p-5">
      <h3 className="text-base font-bold text-text-primary tracking-tight">Features</h3>
      <p className="text-xs text-text-secondary mt-0.5 mb-4">
        Follow the category&apos;s switch (Business Settings → Features), or turn a feature on or off for just this business.
      </p>
      <div className="space-y-4">
        {features.map((f) => {
          if (f.feature === 'owner_phone_media') {
            return (
              <OwnerMediaSwitch
                key={f.feature}
                businessId={businessId}
                businessName={businessName}
                feature={f}
                saving={saving === f.feature}
                onChange={(override) => setOverride(f, override)}
              />
            );
          }
          const choices = [
            { value: null, label: `Follow category — currently ${f.categoryEnabled ? 'On' : 'Off'}` },
            { value: true, label: 'On for this business' },
            { value: false, label: 'Off for this business' },
          ];
          return (
            <div key={f.feature} className="border-t border-border-subtle pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{f.label}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{f.description}</p>
                </div>
                <Badge variant={f.isEnabled ? 'success' : 'neutral'}>{f.isEnabled ? 'On' : 'Off'}</Badge>
              </div>
              <div className="mt-3 space-y-1.5">
                {choices.map((c) => (
                  <label key={String(c.value)} className="flex items-center gap-3 sm:gap-2 min-h-[44px] sm:min-h-0 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="radio"
                      className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0"
                      name={`feature-${f.feature}`}
                      checked={f.override === c.value}
                      disabled={saving === f.feature}
                      onChange={() => (c.value === false ? setPendingOff(f) : setOverride(f, c.value))}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!pendingOff}
        onClose={() => setPendingOff(null)}
        title="Turn this feature off?"
        subject={`${pendingOff?.label ?? ''} · ${businessName ?? 'this business'}`}
        confirmLabel="Yes, turn off"
        onConfirm={() => setOverride(pendingOff, false)}
      >
        <p>
          <strong>{pendingOff?.label}</strong> will be hidden for <strong>{businessName ?? 'this business'}</strong> only.
          Nothing is deleted.
        </p>
      </ConfirmDialog>
    </div>
  );
}
