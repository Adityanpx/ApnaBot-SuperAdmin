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

  // Saved flow versions — named snapshots of a business's chatbot flow
  BUSINESS_FLOW_SNAPSHOTS:         (id) => `/api/admin/businesses/${id}/flow-snapshots`,

  // Copy a business's / template's auto-reply flow + service form into a business
  // (POST, body { source, include, dryRun })
  BUSINESS_COPY_SETUP:             (id) => `/api/admin/businesses/${id}/copy-setup`,

  // Plans
  PLANS:       '/api/admin/plans',
  PLAN_BY_ID:  (id) => `/api/admin/plans/${id}`,

  // Vehicle Catalog
  VEHICLE_CATALOG:              '/api/admin/vehicle-catalog',
  VEHICLE_CATALOG_BY_ID:        (id) => `/api/admin/vehicle-catalog/${id}`,
  VEHICLE_CATALOG_UPLOAD_IMAGE: '/api/admin/vehicle-catalog/upload-image',

  // Course Catalog (coaching) — suggestions businesses copy into their own
  // course list; editing/deleting here never changes a business's copy
  COURSE_CATALOG:        '/api/admin/course-catalog',        // GET ?category=coaching
  COURSE_CATALOG_BY_ID:  (id) => `/api/admin/course-catalog/${id}`,

  // Category feature switches (e.g. coaching → Bot Builder & Courses);
  // apply to every business in the category immediately
  CATEGORY_FEATURES:        (category) => `/api/admin/category-features/${category}`,
  CATEGORY_FEATURE_TOGGLE:  (category, feature) => `/api/admin/category-features/${category}/${feature}`,
  // Per-business overrides of the category switches — { override: true | false | null }
  BUSINESS_FEATURES:        (id) => `/api/admin/businesses/${id}/features`,
  BUSINESS_FEATURE:         (id, feature) => `/api/admin/businesses/${id}/features/${feature}`,

  // Owner phone-app media backfill (after the 'owner_phone_media' switch is on)
  OWNER_MEDIA_BACKFILL_PREVIEW: (id) => `/api/admin/businesses/${id}/owner-media/backfill/preview`,
  OWNER_MEDIA_BACKFILL:         (id) => `/api/admin/businesses/${id}/owner-media/backfill`,
  OWNER_MEDIA_BACKFILL_STATUS:  (id) => `/api/admin/businesses/${id}/owner-media/backfill/status`,

  // Storage cleanup (superadmin only)
  STORAGE_SUMMARY:            '/api/admin/storage-cleanup/summary',
  STORAGE_PREVIEW:            '/api/admin/storage-cleanup/preview',
  STORAGE_RUNS:               '/api/admin/storage-cleanup/runs',
  STORAGE_RUN_CANCEL:         (id) => `/api/admin/storage-cleanup/runs/${id}/cancel`,
  STORAGE_RUN_CSV:            (id) => `/api/admin/storage-cleanup/runs/${id}/export.csv`,
  STORAGE_ORPHAN_SCAN:        '/api/admin/storage-cleanup/orphan-scan',
  STORAGE_SETTINGS:           '/api/admin/storage-cleanup/settings',
  STORAGE_BUSINESS_RETENTION: (id) => `/api/admin/storage-cleanup/businesses/${id}/retention`,
  APP_CONFIG:                 '/api/admin/app-config',

  // Category Templates — one rule set per business category, cloned from a business
  CATEGORY_TEMPLATES:              '/api/admin/category-templates',
  CATEGORY_TEMPLATE_CLONE:         '/api/admin/category-templates/clone-from-business',
  CATEGORY_TEMPLATE_BY_ID:         (id) => `/api/admin/category-templates/${id}`,
  CATEGORY_TEMPLATE_EXPORT:        (id) => `/api/admin/category-templates/${id}/export`,
  CATEGORY_TEMPLATE_IMPORT_JSON:   '/api/admin/category-templates/import-json',
  CATEGORY_TEMPLATE_SET_DEFAULT:   (id) => `/api/admin/category-templates/${id}/set-default`,
  CATEGORY_TEMPLATE_UNSET_DEFAULT: (id) => `/api/admin/category-templates/${id}/unset-default`,
  CATEGORY_TEMPLATE_NODE_TEXTS:    (id) => `/api/admin/category-templates/${id}/node-texts`,
  CATEGORY_TEMPLATE_TRANSLATE:     (id) => `/api/admin/category-templates/${id}/translate`,
  PUBLIC_LANGUAGES:                '/api/public/languages',

  // Free trials — settings (GET/PUT) and per-phone claims (GET list, DELETE resets one)
  TRIAL_SETTINGS:    '/api/admin/trial-settings',
  TRIAL_CLAIMS:      '/api/admin/trial-claims',
  TRIAL_CLAIM_BY_ID: (id) => `/api/admin/trial-claims/${id}`,

  // Business Category Templates — booking-form (flow_fields) starter templates
  // per category (travels/hotel/coaching), applied as-is to a business
  BUSINESS_CATEGORY_TEMPLATES:      '/api/admin/business-category-templates',
  BUSINESS_CATEGORY_TEMPLATE_APPLY: (category, businessId) =>
    `/api/admin/business-category-templates/${category}/apply/${businessId}`,

  // WhatsApp Flows — Meta Flow JSON definitions, published into a business
  WHATSAPP_FLOWS:         '/api/admin/whatsapp-flows',
  WHATSAPP_FLOW_BY_ID:    (id) => `/api/admin/whatsapp-flows/${id}`,
  WHATSAPP_FLOW_PUBLISH:  (id) => `/api/admin/whatsapp-flows/${id}/publish-to-business`,

  // Business Categories — which categories are offered at signup
  BUSINESS_CATEGORIES:        '/api/admin/business-categories',
  BUSINESS_CATEGORY_TOGGLE:   (value) => `/api/admin/business-categories/${value}/toggle`,
  BUSINESS_CATEGORY_BY_VALUE: (value) => `/api/admin/business-categories/${value}`,   // PUT (edit); create is POST BUSINESS_CATEGORIES

  // Business requests — owners who signed up for a business not in the category list
  BUSINESS_REQUESTS:          '/api/admin/business-requests',                         // GET ?status=&page=&limit=
  BUSINESS_REQUEST_BY_ID:     (id) => `/api/admin/business-requests/${id}`,           // PUT { status?, notes? }
  BUSINESS_CHANGE_CATEGORY:   (businessId) => `/api/admin/businesses/${businessId}/category`, // PUT { businessCategory }

  // Rate Cards (append-only — no update/delete)
  RATE_CARDS: '/api/admin/rate-cards',

  // Node Library — reusable reply/question nodes pulled from a business, category-tagged
  NODE_LIBRARY_BUSINESS_NODES: (businessId) => `/api/admin/node-library/businesses/${businessId}/nodes`,
  NODE_LIBRARY:                '/api/admin/node-library',
  NODE_LIBRARY_BY_ID:          (id) => `/api/admin/node-library/${id}`,
};

// Business categories are data-driven: see hooks/useCategoryOptions.js and lib/categoryOptions.js.

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

// ── Business Settings tabs per category ─────────────────────────────────
// Which settings tabs /business-settings/[category] shows. Categories not
// listed here show "No settings yet". The vehicle catalog is one global
// list (vehicle_type_catalog has no category column), so Travels and Cab
// both show — and edit — the same vehicle types.
export const CATEGORY_SETTINGS_TABS = {
  travels:  [{ key: 'vehicle-types', label: 'Vehicle types' }],
  cab:      [{ key: 'vehicle-types', label: 'Vehicle types' }],
  coaching: [{ key: 'courses',       label: 'Courses' }, { key: 'features', label: 'Features' }],
};

// Course text limits — mirror ApnaBot-server's course_catalog check
// constraints + WhatsApp list limits (src/utils/courseValidation.js).
export const COURSE_LIMITS = { NAME: 24, DESCRIPTION: 72, DETAILS: 1024, GROUP: 24, LINE: 100, MORE_DETAILS: 800, BATCHES: 10, BATCH: 72 };

// ── Sidebar Nav Items ─────────────────────────────────────────────────────
// Used in Sidebar.jsx — imported instead of hardcoded
export const NAV_ITEMS = [
  { href: '/dashboard',        label: 'Dashboard',       icon: 'LayoutDashboard' },
  { href: '/businesses',       label: 'Business',        icon: 'Store' },
  { href: '/plans',            label: 'Plans',           icon: 'CreditCard' },
  { href: '/trials',           label: 'Trials',          icon: 'Gift' },
  { href: '/category-templates', label: 'Category Templates', icon: 'FolderKanban' },
  { href: '/business-category-templates', label: 'Booking Form Templates', icon: 'ClipboardList' },
  { href: '/whatsapp-flows',   label: 'WhatsApp Flows',  icon: 'MessageSquareCode' },
  { href: '/business-categories', label: 'Business Categories', icon: 'Tag' },
  { href: '/node-library',     label: 'Node Library',    icon: 'Library' },
  { href: '/business-settings', label: 'Business Settings', icon: 'SlidersHorizontal' },
  { href: '/rate-cards',       label: 'Rate Cards',      icon: 'IndianRupee' },
  { href: '/storage',          label: 'Storage',         icon: 'HardDrive' },
  { href: '/business-requests', label: 'Business Requests', icon: 'Inbox', badge: 'newRequests' },
  { href: '/app-release',      label: 'App Release',     icon: 'Smartphone' },
];
