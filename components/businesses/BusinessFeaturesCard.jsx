// components/businesses/BusinessFeaturesCard.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import Badge from '@/components/ui/Badge';

/**
 * BusinessFeaturesCard — Businesses → <business> → Features.
 * Per-business override of a category switch (ApnaBot-server
 * business_features): follow the category, or force on / off for just this
 * business (e.g. pilot Bot Builder with one institute). The server lists only
 * features that apply to the business's category; renders nothing when none do.
 * Turning a feature off hides its dashboard pages — it deletes nothing.
 */
export default function BusinessFeaturesCard({ businessId }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

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
    if (override === feature.override) return;
    setSaving(feature.feature);
    try {
      const res = await api.put(API.BUSINESS_FEATURE(businessId, feature.feature), { override });
      setFeatures(res.data.data.features);
      toast.success(res.data.message || 'Saved');
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update feature');
    } finally {
      setSaving(null);
    }
  };

  if (loading || features.length === 0) return null;

  return (
    <div className="card p-5">
      <h3 className="text-base font-bold text-text-primary tracking-tight">Features</h3>
      <p className="text-xs text-text-secondary mt-0.5 mb-4">
        Follow the category&apos;s switch (Business Settings → Features), or turn a feature on or off for just this business.
      </p>
      <div className="space-y-4">
        {features.map((f) => {
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
                  <label key={String(c.value)} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="radio"
                      name={`feature-${f.feature}`}
                      checked={f.override === c.value}
                      disabled={saving === f.feature}
                      onChange={() => setOverride(f, c.value)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
