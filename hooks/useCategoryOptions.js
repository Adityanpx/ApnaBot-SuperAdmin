// hooks/useCategoryOptions.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { toCategoryOption, findCategory, categoryLabel } from '@/lib/categoryOptions';

// One shared fetch for every component that needs the category list: the first
// mount starts it, concurrent mounts join it, later mounts reuse the result.
// Category create/edit/toggle call invalidateCategoryOptions() so the next read refetches.
let cache = null;       // normalized list
let inflight = null;    // pending promise
let version = 0;
const listeners = new Set();

function load() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    const started = version;
    inflight = api.get(API.BUSINESS_CATEGORIES)
      .then((res) => {
        const list = (res.data.data.categories || []).map(toCategoryOption);
        if (started === version) cache = list;
        return list;
      })
      .finally(() => { inflight = null; });
  }
  return inflight;
}

export function invalidateCategoryOptions() {
  version += 1;
  cache = null;
  inflight = null;
  listeners.forEach((fn) => fn());
}

/** Test hook: forget everything. */
export function resetCategoryOptionsCache() {
  invalidateCategoryOptions();
  listeners.clear();
}

/**
 * All business categories, enabled or not, ordered as the server returns them.
 * Returns { categories, loading, error, labelOf(value), find(value) }.
 * Until loaded `categories` is [] and labelOf falls back to the raw value.
 */
export function useCategoryOptions() {
  const [state, setState] = useState({ categories: cache || [], loading: !cache, error: null });

  const refresh = useCallback(() => {
    let live = true;
    load()
      .then((categories) => { if (live) setState({ categories, loading: false, error: null }); })
      .catch((err) => {
        if (live) setState({ categories: [], loading: false, error: err.userMessage || 'Failed to load categories' });
      });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    let cancel = refresh();
    const onInvalidate = () => { cancel(); cancel = refresh(); };
    listeners.add(onInvalidate);
    return () => { cancel(); listeners.delete(onInvalidate); };
  }, [refresh]);

  const { categories } = state;
  return {
    ...state,
    labelOf: (value) => categoryLabel(categories, value),
    find: (value) => findCategory(categories, value),
  };
}
