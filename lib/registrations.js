// lib/registrations.js
// Pure helpers for the "Registered, no business" page. Shapes come from ApnaBot-server
// (adminRegistrations.controller.js):
//   GET /api/admin/registrations/no-business?page=&limit=&search=&includeInactive=&unverifiedOnly=
//     -> { registrations: [{ id, name, email, phone|null, verified, isActive, registeredAt,
//          daysSince, lastLoginAt|null }], pagination: { total, ... } }
//   GET .../no-business/export.csv with the same filters (no page / limit) -> CSV text

export const REGISTRATIONS_PAGE_SIZE = 20;

/** Filter params shared by the list and the CSV export; blank search and false switches are left out. */
export function filterParams({ search, includeInactive, unverifiedOnly }) {
  const params = {};
  if (search && search.trim()) params.search = search.trim();
  if (includeInactive) params.includeInactive = 'true';
  if (unverifiedOnly) params.unverifiedOnly = 'true';
  return params;
}

/** Query params for the list: the filters plus page and limit. */
export function listParams({ page = 1, ...filters }) {
  return { page, limit: REGISTRATIONS_PAGE_SIZE, ...filterParams(filters) };
}

/** Display-ready row: phone '' and lastLogin null when missing (the table shows "-" and "Never"). */
export function registrationRow(r) {
  return {
    id: r.id,
    name: r.name || '',
    email: r.email || '',
    phone: r.phone || '',
    verified: r.verified === true,
    isActive: r.isActive !== false,
    registeredAt: r.registeredAt || null,
    daysSince: Number.isFinite(r.daysSince) ? r.daysSince : null,
    lastLogin: r.lastLoginAt || null,
  };
}

/** "today", "1 day" or "N days" for the days-since column; "-" when unknown. */
export function daysLabel(days) {
  if (days === null || days === undefined) return '-';
  if (days === 0) return 'today';
  return days === 1 ? '1 day' : `${days} days`;
}
