// hooks/useCategoryTemplate.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import {
  normalizeNodes, nodeTextsPayload, readStashedWarnings, stashWarnings, remainingWarnings,
} from '@/lib/categoryTemplates';

/** Splits GET /:id into the template fields, display nodes and remembered clone warnings. */
function parseDetail(data, id) {
  const { nodes, edges, ...template } = data;
  return {
    template,
    nodes: normalizeNodes(nodes, edges),
    warnings: readStashedWarnings(id),
  };
}

/**
 * Loads one category template with its nodes and edges
 * (GET /api/admin/category-templates/:id) and saves node texts
 * (PATCH .../node-texts, keyed by node id). The detail endpoint returns no warnings;
 * the clone response does, so they are remembered per template (sessionStorage) and a
 * warning goes away once the saved text no longer contains the matched name.
 * @param {string} id template id
 * @returns {{template: object|null, nodes: Array, warnings: Array<{nodeId: string,
 *   key: string, matched: string}>, loading: boolean, error: string|null,
 *   refetch: Function, saveNodeTexts: Function}}
 */
export function useCategoryTemplate(id) {
  const [state, setState] = useState({ template: null, nodes: [], warnings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(API.CATEGORY_TEMPLATE_BY_ID(id));
      setState(parseDetail(res.data.data, id));
    } catch (err) {
      setError(err.userMessage || 'Failed to load the template');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  /** Saves one node's text and translations map; throws after toasting on failure. */
  const saveNodeTexts = async (nodeId, values) => {
    try {
      await api.patch(API.CATEGORY_TEMPLATE_NODE_TEXTS(id), nodeTextsPayload(nodeId, values));
    } catch (err) {
      toast.error(err.userMessage || 'Failed to save the node text');
      throw err;
    }
    const warnings = remainingWarnings(state.warnings, nodeId, values);
    stashWarnings(id, warnings);
    setState((s) => ({
      ...s,
      warnings,
      nodes: s.nodes.map((n) => (n.id === nodeId
        ? { ...n, text: values.text.trim(), translations: values.translations }
        : n)),
    }));
    toast.success('Node text saved');
  };

  return { ...state, loading, error, refetch, saveNodeTexts };
}
