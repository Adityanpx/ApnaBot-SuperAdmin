// lib/auth.js
// Token helpers — all reads/writes go through here
// SSR guard: typeof window check prevents crash during server rendering

const ACCESS_KEY  = 'apnabot_access_token';
const REFRESH_KEY = 'apnabot_refresh_token';
const USER_KEY    = 'apnabot_user';

// ── Access Token ───────────────────────────────────────────────────────────
export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function setAccessToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, token);
}

export function removeAccessToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
}

// ── Refresh Token ──────────────────────────────────────────────────────────
export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setRefreshToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_KEY, token);
}

export function removeRefreshToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(REFRESH_KEY);
}

// ── User Object ───────────────────────────────────────────────────────────
export function getSavedUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

// ── Clear Everything ──────────────────────────────────────────────────────
export function clearAuth() {
  removeAccessToken();
  removeRefreshToken();
  removeUser();
}

// ── Check if logged in ────────────────────────────────────────────────────
export function isAuthenticated() {
  return !!getAccessToken();
}
