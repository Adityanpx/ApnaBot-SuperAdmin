// lib/api.js
// Axios instance with:
//   1. Base URL from .env.local
//   2. Request interceptor — attaches Bearer token to every request
//   3. Response interceptor — on 401, attempts silent token refresh
//      If refresh succeeds → retries original request automatically
//      If refresh fails → logs out user and redirects to /login

import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, clearAuth } from '@/lib/auth';
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
// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue = [];  // requests waiting while refresh is in progress

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  // ── Success — pass through ──
  (response) => response,

  // ── Error handler ──
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors that haven't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing — queue this request until refresh finishes
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark as retried — prevents infinite loop
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token — hard logout
        isRefreshing = false;
        clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Call the refresh endpoint directly (no interceptor to avoid loops)
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}${API.REFRESH}`,
          { refreshToken }
        );

        const newAccessToken = response.data.data.accessToken;

        // Save new token
        setAccessToken(newAccessToken);

        // Update the Zustand store (dynamic import to avoid circular dep)
        const { default: useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().updateAccessToken(newAccessToken);

        // Retry all queued requests with new token
        processQueue(null, newAccessToken);

        // Retry the original failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed — clear auth and redirect to login
        processQueue(refreshError, null);
        clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors — normalize and re-throw
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors ||
      error.message ||
      'Something went wrong';

    return Promise.reject({ ...error, userMessage: message });
  }
);

export default api;
