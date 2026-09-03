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

  // Businesses
  BUSINESSES:       '/api/admin/businesses',              // GET list  (+ query params)
  BUSINESS_BY_ID:   (id) => `/api/admin/businesses/${id}`,
  BUSINESS_TOGGLE:  (id) => `/api/admin/businesses/${id}/toggle`,
  BUSINESS_PLAN:    (id) => `/api/admin/businesses/${id}/plan`,
  BUSINESS_EXTEND:  (id) => `/api/admin/businesses/${id}/extend`,

  // Manual subscription grants (superadmin override — bypasses payment)
  BUSINESS_GRANT_SUBSCRIPTION:    (id) => `/api/admin/businesses/${id}/grant-subscription`,
  BUSINESS_SUBSCRIPTION_HISTORY:  (id) => `/api/admin/businesses/${id}/subscription-history`,

  // Manual preview-credit grants (additive — tops up the purchased balance)
  BUSINESS_PREVIEW_CREDITS:       (id) => `/api/admin/businesses/${id}/preview-credits`,

  // Plans
  PLANS:       '/api/admin/plans',
  PLAN_BY_ID:  (id) => `/api/admin/plans/${id}`,

  // Vehicle Catalog
  VEHICLE_CATALOG:              '/api/admin/vehicle-catalog',
  VEHICLE_CATALOG_BY_ID:        (id) => `/api/admin/vehicle-catalog/${id}`,
  VEHICLE_CATALOG_UPLOAD_IMAGE: '/api/admin/vehicle-catalog/upload-image',

  // Category Templates — one rule set per business category, cloned from a business
  CATEGORY_TEMPLATES:              '/api/admin/category-templates',
  CATEGORY_TEMPLATE_CLONE:         '/api/admin/category-templates/clone-from-business',
  CATEGORY_TEMPLATE_BY_ID:         (id) => `/api/admin/category-templates/${id}`,

  // Rate Cards (append-only — no update/delete)
  RATE_CARDS: '/api/admin/rate-cards',

  // Node Library — reusable reply/question nodes pulled from a business, category-tagged
  NODE_LIBRARY_BUSINESS_NODES: (businessId) => `/api/admin/node-library/businesses/${businessId}/nodes`,
  NODE_LIBRARY:                '/api/admin/node-library',
  NODE_LIBRARY_BY_ID:          (id) => `/api/admin/node-library/${id}`,
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
  { value: 'software_it', label: 'Software & IT',   emoji: '💻' },
];

// ── Flow Pack Categories ─────────────────────────────────────────────────
// Matches the FlowPack.category enum in the backend exactly (src/models/FlowPack.js).
// This is a superset of BUSINESS_TYPES — keep the two lists independent;
// BUSINESS_TYPES stays as-is for businesses/templates.
export const FLOW_PACK_CATEGORIES = [
  { value: 'any',                 label: 'Any Category',      emoji: '✨' },
  { value: 'tailor',              label: 'Tailor',             emoji: '🧵' },
  { value: 'salon',               label: 'Salon / Parlour',    emoji: '💇' },
  { value: 'garage',              label: 'Garage / Mechanic',  emoji: '🔧' },
  { value: 'cab',                 label: 'Cab',                emoji: '🚖' },
  { value: 'coaching',            label: 'Coaching / Classes', emoji: '📚' },
  { value: 'gym',                 label: 'Gym / Fitness',      emoji: '💪' },
  { value: 'medical',             label: 'Medical / Pharmacy', emoji: '💊' },
  { value: 'general',             label: 'General Shop',       emoji: '🏪' },
  { value: 'photographer',        label: 'Photographer',       emoji: '📷' },
  { value: 'caterer',             label: 'Caterer',            emoji: '🍽️' },
  { value: 'tutor',               label: 'Tutor',              emoji: '👨‍🏫' },
  { value: 'jeweller',            label: 'Jeweller',           emoji: '💍' },
  { value: 'boutique',            label: 'Boutique',           emoji: '👗' },
  { value: 'grocery',             label: 'Grocery',            emoji: '🛒' },
  { value: 'bakery',              label: 'Bakery',              emoji: '🍞' },
  { value: 'electronics_repair',  label: 'Electronics Repair', emoji: '🔌' },
  { value: 'real_estate',         label: 'Real Estate',        emoji: '🏠' },
  { value: 'driving_school',      label: 'Driving School',     emoji: '🚗' },
  { value: 'travels',             label: 'Travels',            emoji: '✈️' },
  { value: 'software_it',         label: 'Software & IT',      emoji: '💻' },
];

// ── Category Template Categories ─────────────────────────────────────────
// Matches VALID_CATEGORIES in categoryTemplate.controller.js — one template
// per category, so 'any' (valid for flow packs) doesn't apply here.
export const CATEGORY_TEMPLATE_CATEGORIES = FLOW_PACK_CATEGORIES.filter(
  (c) => c.value !== 'any'
);

// ── Plan Names (from seed) ────────────────────────────────────────────────
export const PLAN_NAMES = ['basic', 'pro', 'business'];

// ── Rate Card Categories ───────────────────────────────────────────────────
// Matches the rate_cards.category check constraint exactly (see
// ApnaBot-server supabase/migrations/20260826060000_rate_cards.sql).
export const RATE_CARD_CATEGORIES = [
  { value: 'marketing',            label: 'Marketing' },
  { value: 'utility',              label: 'Utility' },
  { value: 'authentication',       label: 'Authentication' },
  { value: 'service',              label: 'Service' },
  { value: 'meta_business_agent',  label: 'Meta Business Agent' },
];

// ── Vehicle Catalog Types ──────────────────────────────────────────────────
export const VEHICLE_TYPES = [
  { value: 'hatchback',       label: 'Hatchback' },
  { value: 'sedan',           label: 'Sedan' },
  { value: 'suv',             label: 'SUV' },
  { value: 'tempo_traveller', label: 'Tempo Traveller' },
  { value: 'mini_bus',        label: 'Mini Bus' },
  { value: 'bus',             label: 'Bus' },
  { value: 'other',           label: 'Other' },
];

// ── Non-English Languages ──────────────────────────────────────────────────
// Matches the server's LANGUAGE_CATALOG (src/utils/languageCatalog.js) minus
// 'en' — booking-field translations are only collected for these.
export const NON_ENGLISH_LANGUAGES = [
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
];

// ── Sidebar Nav Items ─────────────────────────────────────────────────────
// Used in Sidebar.jsx — imported instead of hardcoded
export const NAV_ITEMS = [
  { href: '/dashboard',        label: 'Dashboard',       icon: 'LayoutDashboard' },
  { href: '/businesses',       label: 'Business',        icon: 'Store' },
  { href: '/plans',            label: 'Plans',           icon: 'CreditCard' },
  { href: '/category-templates', label: 'Category Templates', icon: 'FolderKanban' },
  { href: '/node-library',     label: 'Node Library',    icon: 'Library' },
  { href: '/vehicle-catalog',  label: 'Vehicle Catalog', icon: 'Car' },
  { href: '/rate-cards',       label: 'Rate Cards',      icon: 'IndianRupee' },
];
