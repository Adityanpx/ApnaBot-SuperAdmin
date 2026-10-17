// lib/categoryTemplates.js
// Pure helpers for category-template defaults, node display and the
// "{{businessName}}" replacement. No React, no network.
//
// Shapes come from ApnaBot-server (categoryTemplate.controller.js):
//   GET /:id      -> { id, _id, category, name, isDefault, ..., nodes[], edges[] }
//                    nodes/edges are RAW snake_case rows (not camelCased):
//                    node { id, node_type, keyword, field_key, content_type, label,
//                           label_translations, options }, edge { id, from_node_id,
//                           to_node_id, label }
//   clone         -> { id, _id, ..., warnings: [{ nodeId, key, matched }] }
//   PATCH node-texts body { nodes: [{ id, label?, labelTranslations? }] }

export const BUSINESS_NAME_TOKEN = '{{businessName}}';
export const FALLBACK_CATEGORY = 'general';
export const TRANSLATION_LANGS = ['hi', 'mr'];

/** The default template of `category`, or undefined. */
export function defaultFor(templates, category) {
  return templates.find((t) => t.category === category && t.isDefault);
}

/** Templates of one category; an empty category means "all". */
export function filterByCategory(templates, category) {
  return category ? templates.filter((t) => t.category === category) : templates;
}

/**
 * Notice text for a category with no default template, or null when it has one.
 * The General category is the fallback itself, so it gets its own wording.
 */
export function noDefaultNotice(templates, category, label) {
  if (!category || defaultFor(templates, category)) return null;
  if (category === FALLBACK_CATEGORY) {
    return 'No default is set for General. New businesses start with an empty flow.';
  }
  return `No default is set for ${label}. New businesses get the General default.`;
}

/** Categories that have templates but none marked default (excluding General itself). */
export function categoriesMissingDefault(templates) {
  const withDefault = new Set(templates.filter((t) => t.isDefault).map((t) => t.category));
  const all = new Set(templates.map((t) => t.category));
  return [...all].filter((c) => !withDefault.has(c) && c !== FALLBACK_CATEGORY);
}

/** Escape a string for use inside a RegExp. */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Replace every (case-insensitive) occurrence of `matched` in `text` with the token. */
export function replaceBusinessName(text, matched) {
  if (typeof text !== 'string' || !matched || !matched.trim()) return text;
  return text.replace(new RegExp(escapeRegExp(matched.trim()), 'gi'), BUSINESS_NAME_TOKEN);
}

/** True when `text` still mentions `matched` (the server matches case-insensitively too). */
export function mentionsBusinessName(text, matched) {
  if (typeof text !== 'string' || !matched || !matched.trim()) return false;
  return text.toLowerCase().includes(matched.trim().toLowerCase());
}

/** Applies replaceBusinessName for every matched name to a text and a translations map. */
export function replaceMatchedNames({ text, translations }, matchedNames) {
  const swap = (v) => matchedNames.reduce((acc, m) => replaceBusinessName(acc, m), v);
  return {
    text: swap(text),
    translations: Object.fromEntries(
      Object.entries(translations).map(([lang, value]) => [lang, swap(value)])
    ),
  };
}

/** Warnings that still apply to a node after its text and translations were saved. */
export function remainingWarnings(warnings, nodeId, { text, translations }) {
  const texts = [text, ...Object.values(translations || {})];
  return warnings.filter((w) => w.nodeId !== nodeId
    || texts.some((t) => mentionsBusinessName(t, w.matched)));
}

/** Short name for a node in lists: keyword (reply), field key (question), else its id. */
function nodeName(node) {
  return node.keyword || node.field_key || node.id;
}

/** Labels of a question node's authored choices (plain strings or { label }). */
function optionLabels(node) {
  if (node.is_computed || !Array.isArray(node.options)) return [];
  return node.options.map((o) => (typeof o === 'string' ? o : o?.label)).filter(Boolean);
}

/**
 * Where a node leads: a reply node's edges are its buttons / list rows (edge label),
 * any other node's edges are "what comes next" (no label).
 */
function nodeLinks(node, edges, byId) {
  return edges.filter((e) => e.from_node_id === node.id).map((e) => ({
    title: node.node_type === 'reply' ? (e.label || '(no label)') : null,
    next: nodeName(byId.get(e.to_node_id) || { id: e.to_node_id }),
  }));
}

/** Display-ready node rows. `translations` keeps every stored language so saves can merge. */
export function normalizeNodes(nodes = [], edges = []) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return nodes.map((n) => ({
    id: n.id,
    type: n.node_type || 'reply',
    name: nodeName(n),
    text: n.label || '',
    translations: n.label_translations || {},
    options: optionLabels(n),
    links: nodeLinks(n, edges, byId),
  }));
}

/** Translations map with hi/mr set from the form; blank languages are dropped. */
export function mergeTranslations(existing, { hi, mr }) {
  const merged = { ...(existing || {}), hi, mr };
  return Object.fromEntries(Object.entries(merged).filter(([, v]) => v && v.trim()));
}

/** Request body for PATCH node-texts: one node, empty translations sent as null. */
export function nodeTextsPayload(id, { text, translations }) {
  const hasAny = Object.keys(translations).length > 0;
  return { nodes: [{ id, label: text.trim(), labelTranslations: hasAny ? translations : null }] };
}

const WARNING_KEY = (id) => `categoryTemplateWarnings:${id}`;

/** Reads the new template's id and `warnings` out of a clone response. */
export function parseCloneResult(data) {
  return { id: data?._id || data?.id, warnings: data?.warnings || [] };
}

/** Remembers warnings for the detail page (an empty list forgets them). */
export function stashWarnings(id, warnings) {
  if (!id) return;
  try {
    if (!warnings || warnings.length === 0) sessionStorage.removeItem(WARNING_KEY(id));
    else sessionStorage.setItem(WARNING_KEY(id), JSON.stringify(warnings));
  } catch { /* storage off */ }
}

/** Warnings remembered by stashWarnings() for this template, or []. */
export function readStashedWarnings(id) {
  try { return JSON.parse(sessionStorage.getItem(WARNING_KEY(id))) || []; } catch { return []; }
}
