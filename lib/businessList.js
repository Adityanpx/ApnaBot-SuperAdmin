// lib/businessList.js
// Pure helpers for the Business list page. Shapes come from ApnaBot-server (admin.controller.js getBusinesses):
//   GET /api/admin/businesses?page=&limit=&search=&isActive=&businessCategory=&connected=
//     -> { businesses: [{ ..., isWhatsappConnected, requestedCategoryText, subCategories,
//          plan: { id, name, displayName } | null, subscriptionStatus: 'active'|'trial'|null }], pagination }
//   GET /api/admin/businesses/category-summary -> { total, categories: [{ value, label, count }] }
//   GET /api/admin/businesses/export.csv takes the same filters (no page / limit)

/** Filter params shared by the list and the CSV export; empty filters are left out. */
export function filterParams({ search, isActive, businessType, connected }) {
  const params = {};
  if (search && search.trim()) params.search = search.trim();
  if (isActive) params.isActive = isActive;
  if (businessType) params.businessCategory = businessType;
  if (connected) params.connected = connected;
  return params;
}

/** Query params for the list: page and limit plus the filters. */
export function listParams({ page, limit, ...filters }) {
  return { page, limit, ...filterParams(filters) };
}

/**
 * The line under the category: what the owner typed for a "general" business, the sub-categories of a
 * "multi_brand" one, '' for every other category. `labelOf` turns a category value into its label.
 */
export function categoryDetail(business, labelOf = (v) => v) {
  if (business.businessCategory === 'general') return business.requestedCategoryText || '';
  if (business.businessCategory === 'multi_brand') {
    return (business.subCategories || []).map(labelOf).join(', ');
  }
  return '';
}

/** Plan name for the list, or "-" when the business has no active / trial subscription. */
export function planText(business) {
  return business.plan?.displayName || business.plan?.name || '-';
}

/** Subscription status for the list ("Active" / "Trial"), or "-" when there is none. */
export function subscriptionText(business) {
  const status = business.subscriptionStatus;
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
}
