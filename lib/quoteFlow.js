// lib/quoteFlow.js
// Pure helpers for BusinessQuoteFlowCard: the travel quote-flow readiness checklist and Enable / Disable for one business
// (ApnaBot-server: GET /api/admin/businesses/:id/quote-readiness, POST .../quote-flow/enable|disable; a refusal carries
// errors { code, readiness, blockers }).

export const QUOTE_CATEGORIES = ['travels', 'cab'];
export const DEFAULT_KEYWORD = 'quote';

const RANK = { block: 0, warn: 1, ok: 2 };

export const isQuoteCategory = (category) => QUOTE_CATEGORIES.includes(category);

/** Blocking first, then warnings, then ok; the server's order inside a group. */
export function sortedItems(items = []) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => (RANK[a.item.status] - RANK[b.item.status]) || (a.index - b.index))
    .map((x) => x.item);
}

/**
 * The server's installed.state: 'installed' (live), 'dormant' (quote steps installed but the switch is off and there is
 * no "Get a quote" button yet; Enable activates it), 'not_installed', or a future state we do not know.
 * Always returns a label, so an unknown or missing state shows a safe fallback instead of breaking the card.
 */
export function installStatus(readiness) {
  const state = readiness?.installed?.state;
  switch (state) {
    case 'installed': return { state, label: 'Installed', variant: 'success', hasSteps: true };
    case 'dormant': return { state, label: 'Installed, not active yet', variant: 'neutral', hasSteps: true };
    case 'not_installed': return { state, label: 'Not installed', variant: 'neutral', hasSteps: false };
    default: return { state: state || null, label: 'Install status unknown', variant: 'neutral', hasSteps: false };
  }
}

/** Search cab AI (and any business the server marks "managed by hand"): never enabled or disabled from here. */
export const isProtected = (readiness) => (readiness?.items || []).some((i) => i.key === 'not_protected' && i.status === 'block');

/** The "switch is on" item only warns now: Enable is what turns it on. Everything else that blocks stops Enable. */
export const blockersOf = (readiness) => (readiness?.items || []).filter((i) => i.status === 'block');

export const requiredAcknowledgement = (readiness) =>
  readiness?.installed?.state === 'installed' ? null : (readiness?.acknowledgements || []).find((a) => a.required) || null;

export function canEnable(readiness, acknowledged) {
  if (!readiness || isProtected(readiness) || readiness.enabled) return false;
  return readiness.ready === true && (!requiredAcknowledgement(readiness) || !!acknowledged);
}

/** Body of POST .../quote-flow/enable: only the allowed fields; the keyword only while nothing is installed. */
export function enableBody(readiness, keyword, acknowledged) {
  const body = {};
  if (readiness?.installed?.state !== 'installed') body.keyword = String(keyword || DEFAULT_KEYWORD).trim().toLowerCase();
  if (requiredAcknowledgement(readiness) && acknowledged) body.acknowledgeRoundTripTeam = true;
  return body;
}

/** { message, code, readiness } out of an axios error from enable / disable (readiness is null when the server sent none). */
export function switchError(err) {
  const errors = err?.response?.data?.errors;
  return {
    message: err?.response?.data?.message || err?.message || 'Something went wrong',
    code: errors && typeof errors.code === 'string' ? errors.code : null,
    readiness: errors && errors.readiness && Array.isArray(errors.readiness.items) ? errors.readiness : null,
  };
}
