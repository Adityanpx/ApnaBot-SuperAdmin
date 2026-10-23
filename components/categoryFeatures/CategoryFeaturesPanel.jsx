// components/categoryFeatures/CategoryFeaturesPanel.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Power } from 'lucide-react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import Switch from '@/components/ui/Switch';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

/**
 * CategoryFeaturesPanel — Business Settings → <category> → Features.
 * On/off switches (ApnaBot-server category_features) that apply to every
 * business in the category immediately — e.g. coaching → Bot Builder &
 * Courses. The server decides which switches exist for a category.
 */
export default function CategoryFeaturesPanel({ category, categoryLabel }) {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [pending, setPending] = useState(null); // feature awaiting confirmation
  const categoryName = categoryLabel || category;

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(API.CATEGORY_FEATURES(category));
      setFeatures(res.data.data.features);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load features');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchFeatures(); }, [fetchFeatures]);

  // Every change applies to ALL businesses in the category, so each one is confirmed by name
  const toggle = async (feature) => {
    const next = !feature.isEnabled;
    setSaving(feature.feature);
    try {
      const res = await api.put(API.CATEGORY_FEATURE_TOGGLE(category, feature.feature), { isEnabled: next });
      setFeatures(res.data.data.features);
      toast.success(`${feature.label} ${next ? 'switched on' : 'switched off'}`);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update feature');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-text-primary tracking-tight">Features</h2>
        <p className="text-sm text-text-secondary mt-1">
          Switch features on or off for every business in this category — changes apply immediately
        </p>
      </div>

      {loading && (
        <div className="card p-5 space-y-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {!loading && features.length === 0 && (
        <EmptyState icon={Power} title="No features to switch" description="There are no optional features for this category yet." />
      )}

      {!loading && features.map((feature) => (
        <div key={feature.feature} className="card p-4 sm:p-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-text-primary">{feature.label}</p>
              <Badge variant={feature.isEnabled ? 'success' : 'neutral'}>{feature.isEnabled ? 'On' : 'Off'}</Badge>
            </div>
            <p className="text-sm text-text-secondary mt-1">{feature.description}</p>
            {feature.updatedAt && (
              <p className="text-xs text-text-tertiary mt-2">Last changed {new Date(feature.updatedAt).toLocaleString()}</p>
            )}
          </div>
          <Switch
            checked={feature.isEnabled}
            disabled={saving === feature.feature}
            label={`${feature.label} for ${categoryName} businesses`}
            onChange={() => setPending(feature)}
          />
        </div>
      ))}

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        title={pending?.isEnabled ? 'Switch this feature off?' : 'Switch this feature on?'}
        subject={`${pending?.label ?? ''} · ${categoryName} businesses`}
        danger={!!pending?.isEnabled}
        confirmLabel={pending?.isEnabled ? 'Yes, switch off' : 'Yes, switch on'}
        onConfirm={() => toggle(pending)}
      >
        <p>
          {pending?.isEnabled
            ? <>Every <strong>{categoryName}</strong> business will immediately lose access to <strong>{pending?.label}</strong>.</>
            : <>Every <strong>{categoryName}</strong> business will immediately get <strong>{pending?.label}</strong>.</>}
        </p>
      </ConfirmDialog>
    </div>
  );
}
