// store/authStore.js
// Zustand store — holds auth state in memory
// localStorage is the persistent layer (via lib/auth.js)
// This store is the in-memory truth for components

import { create } from 'zustand';
import {
  getAccessToken,
  getSavedUser,
  setAccessToken,
  setRefreshToken,
  saveUser,
  clearAuth,
} from '@/lib/auth';

// Helper to set/clear the middleware cookie
function setAuthCookie(token) {
  if (typeof document === 'undefined') return;
  if (token) {
    // Expires in 15 minutes — matches JWT_EXPIRY
    const expires = new Date(Date.now() + 15 * 60 * 1000).toUTCString();
    document.cookie = `apnabot_token=${token}; path=/; expires=${expires}; SameSite=Strict`;
  } else {
    // Clear cookie by setting past expiry
    document.cookie = 'apnabot_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

const useAuthStore = create((set, get) => ({

  // ── State ────────────────────────────────────────────────────────────────
  user:        getSavedUser(),      // hydrate from localStorage on startup
  token:       getAccessToken(),    // hydrate from localStorage on startup
  isLoggedIn:  !!getAccessToken(),
  isLoading:   false,

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Called after successful login API response
   * Saves tokens to localStorage AND updates in-memory state
   * Also sets cookie for middleware
   */
  loginSuccess: (user, accessToken, refreshToken) => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    saveUser(user);
    setAuthCookie(accessToken);         // ← NEW: set cookie for middleware
    set({ user, token: accessToken, isLoggedIn: true });
  },

  /**
   * Called after token refresh — only access token changes
   * Also refreshes the middleware cookie
   */
  updateAccessToken: (accessToken) => {
    setAccessToken(accessToken);
    setAuthCookie(accessToken);         // ← NEW: refresh cookie too
    set({ token: accessToken });
  },

  /**
   * Called on logout — clears everything
   * Also clears the middleware cookie
   */
  logout: () => {
    clearAuth();
    setAuthCookie(null);                // ← NEW: clear cookie on logout
    set({ user: null, token: null, isLoggedIn: false });
  },

  /**
   * Loading state helpers — used by login form
   */
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
