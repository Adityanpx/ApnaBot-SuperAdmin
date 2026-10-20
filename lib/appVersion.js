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
