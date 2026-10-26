// lib/appVersion.js
// Pure helpers for the App Release page: x.y.z checks, ordering, field
// validation and the "does this save need a warning?" rule.

const VERSION_RE = /^\d+\.\d+\.\d+$/;

export const PLAY_STORE_PREFIX = 'https://play.google.com/store/apps/details?id=';

/** Auto-translate character caps (server: whole number, 0 to 999999999). */
export const CAP_FIELDS = ['translateMonthlyCharCap', 'translateGlobalMonthlyCap'];

/**
 * True for a whole number 0 to 999999999 (a number, as the server requires).
 * @param {*} value
 * @returns {boolean}
 */
export function isValidCap(value) {
  return Number.isInteger(value) && value >= 0 && value <= 999999999;
}

/**
 * True for a strict x.y.z version (digits only, three parts).
 * @param {string} value
 * @returns {boolean}
 */
export function isValidVersion(value) {
  return typeof value === 'string' && VERSION_RE.test(value.trim());
}

/**
 * Compare two x.y.z versions numerically (1.10.0 is above 1.9.0).
 * @param {string} a
 * @param {string} b
 * @returns {number} negative if a < b, 0 if equal, positive if a > b
 */
export function compareVersions(a, b) {
  const pa = a.trim().split('.').map(Number);
  const pb = b.trim().split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

/**
 * True for a Play Store app URL with a non-empty package id.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidPlayStoreUrl(value) {
  if (typeof value !== 'string') return false;
  const url = value.trim();
  return url.startsWith(PLAY_STORE_PREFIX) && url.length > PLAY_STORE_PREFIX.length;
}

/**
 * Validate the editable fields.
 * @param {{androidMinVersion: string, androidLatestVersion: string, playStoreUrl: string}} v
 * @returns {Object<string, string>} field name → message; empty when valid
 */
export function validateAppConfig(v) {
  const errors = {};
  if (!isValidVersion(v.androidMinVersion)) errors.androidMinVersion = 'Use x.y.z, e.g. 1.0.0';
  if (!isValidVersion(v.androidLatestVersion)) {
    errors.androidLatestVersion = 'Use x.y.z, e.g. 1.0.0';
  }
  if (!isValidPlayStoreUrl(v.playStoreUrl)) {
    errors.playStoreUrl = `Must start with ${PLAY_STORE_PREFIX}`;
  }
  if (!errors.androidMinVersion && !errors.androidLatestVersion
      && compareVersions(v.androidMinVersion, v.androidLatestVersion) > 0) {
    errors.androidMinVersion = 'Cannot be higher than the latest version';
  }
  for (const f of CAP_FIELDS) {
    if (!isValidCap(v[f])) errors[f] = 'Whole number from 0 to 999999999';
  }
  if (v.supportWhatsappNumber !== undefined && normalizeSupportNumber(v.supportWhatsappNumber) === null) {
    errors.supportWhatsappNumber = '10 digits, or 11-15 digits with the country code; empty hides the button';
  }
  if (v.supportMessage !== undefined
      && !(v.supportMessage.trim() && v.supportMessage.length <= SUPPORT_MESSAGE_MAX)) {
    errors.supportMessage = `1 to ${SUPPORT_MESSAGE_MAX} characters`;
  }
  return errors;
}

/**
 * Decide whether saving `next` over `saved` needs a confirmation dialog:
 * force update or maintenance being turned on, or the minimum version being
 * raised while force update is on.
 * @param {object} saved - the config as last loaded from the server
 * @param {object} next - the values about to be saved
 * @returns {{blocksOldVersions: boolean, maintenance: boolean}}
 */
export function warningFlags(saved, next) {
  const forceTurnedOn = next.forceUpdate && !saved.forceUpdate;
  const minRaised = next.forceUpdate && isValidVersion(next.androidMinVersion)
    && isValidVersion(saved.androidMinVersion)
    && compareVersions(next.androidMinVersion, saved.androidMinVersion) > 0;
  return {
    blocksOldVersions: Boolean(forceTurnedOn || minRaised),
    maintenance: Boolean(next.maintenanceMode && !saved.maintenanceMode),
  };
}

// ── Support WhatsApp ────────────────────────────────────────────────────────

/** Server limit for the support message (appConfig.service.js SUPPORT_MESSAGE_MAX). */
export const SUPPORT_MESSAGE_MAX = 500;

/**
 * A support number typed by a person → digits with country code (no "+"), as the server stores it:
 * separators and a leading "+" are dropped, 10 digits get 91 in front, 11-15 digits are kept.
 * '' stays '' (no support button). Anything else returns null.
 * @param {string} raw
 * @returns {string|null}
 */
export function normalizeSupportNumber(raw) {
  const text = String(raw ?? '').trim();
  if (text === '') return '';
  if (!/^\+?[\d\s\-().]+$/.test(text)) return null;
  const digits = text.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits.length >= 11 && digits.length <= 15 ? digits : null;
}

/**
 * wa.me link that sends the support message to the support number, for the "Test link".
 * The {{businessName}} / {{email}} marks are filled with sample values, as the apps fill them
 * with the visitor's. Null when the number is empty or invalid.
 * @param {string} number
 * @param {string} message
 * @returns {string|null}
 */
export function supportTestLink(number, message) {
  const digits = normalizeSupportNumber(number);
  if (!digits) return null;
  const text = String(message ?? '')
    .replace(/\{\{businessName\}\}/g, 'Test Business')
    .replace(/\{\{email\}\}/g, 'test@example.com');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
