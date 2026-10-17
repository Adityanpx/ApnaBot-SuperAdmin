// lib/trials.js
// Pure helpers for the Trials page. Shapes come from ApnaBot-server (trial.controller.js):
//   GET/PUT /trial-settings -> { trialEnabled, trialDays, trialPlanId, trialPlanIsDefault }
//   GET /trial-claims?search=&limit=&offset= -> { claims: [{ id, _id, phoneE164, businessId,
//     businessName, subscriptionId, claimedAt, ... }], total }
//   DELETE /trial-claims/:id  body { reason } (3+ characters)

export const MAX_TRIAL_DAYS = 365;
export const MIN_REASON_LENGTH = 3;
export const CLAIMS_PAGE_SIZE = 50;

/** Display-ready claim row. phoneE164 has no "+", so it is added for reading. */
export function claimRow(claim) {
  return {
    id: claim._id || claim.id,
    phone: claim.phoneE164 ? `+${claim.phoneE164}` : '',
    businessName: claim.businessName || '',
    claimedAt: claim.claimedAt || null,
    hasSubscription: !!claim.subscriptionId,
  };
}

/** Query params for GET /trial-claims; a blank search is left out. */
export function claimsParams({ search, page }) {
  const params = { limit: CLAIMS_PAGE_SIZE, offset: (page - 1) * CLAIMS_PAGE_SIZE };
  if (search && search.trim()) params.search = search.trim();
  return params;
}

/** True when the reason is long enough for the server to accept it. */
export function isValidReason(reason) {
  return typeof reason === 'string' && reason.trim().length >= MIN_REASON_LENGTH;
}

/** Returns `{ field: message }` for invalid trial settings (empty object when valid). */
export function validateTrialSettings({ trialDays }) {
  const errors = {};
  const days = Number(trialDays);
  if (trialDays === '' || !Number.isInteger(days) || days < 1 || days > MAX_TRIAL_DAYS) {
    errors.trialDays = `Enter a whole number of days from 1 to ${MAX_TRIAL_DAYS}.`;
  }
  return errors;
}

/**
 * PUT body: always the switch and the days; the plan only when it changed, so saving
 * other fields never turns the default plan into an explicitly chosen one.
 */
export function settingsPatch(initial, values) {
  const body = { trialEnabled: values.trialEnabled, trialDays: Number(values.trialDays) };
  if (values.trialPlanId && values.trialPlanId !== initial.trialPlanId) {
    body.trialPlanId = values.trialPlanId;
  }
  return body;
}
