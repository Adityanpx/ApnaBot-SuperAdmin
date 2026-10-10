// lib/api.js
// Axios instance with:
//   1. Base URL from .env.local
//   2. Request interceptor — attaches Bearer token to every request
//   3. Response interceptor — on 401, attempts silent token refresh
//      If refresh succeeds → retries original request automatically
//      If the refresh endpoint answers 401/403 → logs out and redirects to /login
//      If the refresh fails any other way (network, 5xx) → keeps the session

import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens } from '@/lib/auth';
import { API } from '@/lib/constants';

// ── Create instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 second timeout
});

// ── Request interceptor ────────────────────────────────────────────────────
// Attaches the current access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────────────────
// One shared in-flight refresh. Every 401 awaits the same promise, so the
// refresh token is sent once and no waiter can be stranded. It is cleared in
// its own finally, whether the refresh succeeds or fails.
let refreshPromise = null;

// A stalled refresh must not hang every waiter (or logout) forever
const REFRESH_TIMEOUT_MS = 15000;

async function performRefresh() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    const err = new Error('No refresh token');
    err.authRejected = true;
    throw err;
  }

  let response;
  try {
    // Call the refresh endpoint directly (no interceptor to avoid loops)
    response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}${API.REFRESH}`,
      { refreshToken },
      { timeout: REFRESH_TIMEOUT_MS }
    );
  } catch (err) {
    // Only an explicit 401/403 from the refresh endpoint means the session is
    // dead. Network errors, timeouts and 5xx leave the stored tokens alone.
    const status = err.response?.status;
    if (status === 401 || status === 403) err.authRejected = true;
    throw err;
  }

  const newAccessToken = response.data.data.accessToken;
  // Refresh tokens rotate: the server may return a new one and the old
  // one stops working after a short grace window. Persist it before any
  // retry. Absent → the old one is kept.
  const newRefreshToken = response.data.data.refreshToken;

  // Save new tokens to localStorage synchronously, before any await,
  // so nothing else can read the stale refresh token in between
  setTokens(newAccessToken, newRefreshToken);

  // Update the Zustand store + middleware cookie (dynamic import to avoid circular dep)
  const { default: useAuthStore } = await import('@/store/authStore');
  useAuthStore.getState().updateTokens(newAccessToken, newRefreshToken);

  return newAccessToken;
}

function refreshTokens() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

const normalizeError = (error) => ({
  ...error,
  userMessage:
    error.response?.data?.message ||
    error.response?.data?.errors ||
    error.message ||
    'Something went wrong',
});

api.interceptors.response.use(
  // ── Success — pass through ──
  (response) => response,

  // ── Error handler ──
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors that haven't been retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Mark as retried — prevents infinite loop
      originalRequest._retry = true;

      // Sent with an older access token than the current one? A refresh has
      // already landed since — retry with the current token, don't refresh.
      const currentToken = getAccessToken();
      const sentAuth = originalRequest.headers?.Authorization;
      if (currentToken && sentAuth && sentAuth !== `Bearer ${currentToken}`) {
        originalRequest.headers.Authorization = `Bearer ${currentToken}`;
        return api(originalRequest);
      }

      try {
        const newAccessToken = await refreshTokens();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        if (refreshError.authRejected) {
          // Refresh rejected — clear auth (store logout, so the middleware
          // cookie is cleared alongside localStorage) and redirect to login
          const { default: useAuthStore } = await import('@/store/authStore');
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
        // Network error / 5xx: keep the session, fail just this request
        return Promise.reject(normalizeError(refreshError));
      }
    }

    // For all other errors — normalize and re-throw
    return Promise.reject(normalizeError(error));
  }
);

// ── Best-effort server logout ──────────────────────────────────────────────
// Waits (briefly) for any in-flight refresh so the CURRENT, rotated refresh
// token is the one revoked, then tells the server. Uses bare axios, not the
// `api` instance: a 401 here must not trigger a refresh or a redirect. Never
// throws — the caller clears the local session regardless of the outcome.
const LOGOUT_TIMEOUT_MS = 3000;

export async function serverLogout() {
  try {
    if (refreshPromise) {
      await Promise.race([
        refreshPromise.catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, LOGOUT_TIMEOUT_MS)),
      ]);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) return;

    const accessToken = getAccessToken();
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}${API.LOGOUT}`,
      { refreshToken },
      {
        timeout: LOGOUT_TIMEOUT_MS,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      }
    );
  } catch {
    /* best effort — local logout proceeds anyway */
  }
}

export default api;
