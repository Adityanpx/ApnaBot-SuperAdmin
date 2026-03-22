// lib/constants.js

// ── API Endpoint Paths ─────────────────────────────────────────────────────
// All paths — prefixed with NEXT_PUBLIC_API_URL by the Axios instance
export const API = {

  // Auth
  LOGIN:   '/api/auth/login',
  REFRESH: '/api/auth/refresh',
  LOGOUT:  '/api/auth/logout',

  // Dashboard
  STATS:   '/api/admin/stats',
  REVENUE: '/api/admin/revenue',         // ?months=6

  // Shops
  SHOPS:        '/api/admin/shops',              // GET list  (+ query params)
  SHOP_BY_ID:   (id) => `/api/admin/shops/${id}`,
  SHOP_TOGGLE:  (id) => `/api/admin/shops/${id}/toggle`,
  SHOP_PLAN:    (id) => `/api/admin/shops/${id}/plan`,
  SHOP_EXTEND:  (id) => `/api/admin/shops/${id}/extend`,

  // Plans
  PLANS:       '/api/admin/plans',
  PLAN_BY_ID:  (id) => `/api/admin/plans/${id}`,

  // Templates
  TEMPLATES:       '/api/admin/templates',
  TEMPLATE_BY_ID:  (id) => `/api/admin/templates/${id}`,
};

// ── Business Types ─────────────────────────────────────────────────────────
export const BUSINESS_TYPES = [
  { value: 'tailor',   label: 'Tailor / Boutique', emoji: '🧵' },
  { value: 'salon',    label: 'Salon / Parlour',   emoji: '💇' },
  { value: 'garage',   label: 'Garage / Mechanic', emoji: '🔧' },
  { value: 'cab',      label: 'Cab / Travel',      emoji: '🚖' },
  { value: 'coaching', label: 'Coaching / Classes',emoji: '📚' },
  { value: 'gym',      label: 'Gym / Fitness',     emoji: '💪' },
  { value: 'medical',  label: 'Medical / Pharmacy',emoji: '💊' },
  { value: 'general',  label: 'General Shop',      emoji: '🏪' },
];

// ── Plan Names (from seed) ────────────────────────────────────────────────
export const PLAN_NAMES = ['basic', 'pro', 'business'];

// ── Sidebar Nav Items ─────────────────────────────────────────────────────
// Used in Sidebar.jsx — imported instead of hardcoded
export const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/shops',      label: 'Shops',     icon: 'Store' },
  { href: '/plans',      label: 'Plans',     icon: 'CreditCard' },
  { href: '/templates',  label: 'Templates', icon: 'FileText' },
];
