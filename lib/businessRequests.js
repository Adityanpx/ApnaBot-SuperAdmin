// lib/businessRequests.js
// Pure helpers for the Business requests page. Shapes come from ApnaBot-server
// (businessRequest.controller.js, admin.controller.js changeBusinessCategory):
//   GET /api/admin/business-requests?status=&page=&limit= -> { requests: [{ id, _id, businessId,
//     requestedText, contactPhone, ownerName, ownerEmail, status, notes, createdAt, updatedAt,
//     businessName, businessCategory }], pagination: { total, totalPages, ... } }
//   PUT /api/admin/business-requests/:id  body { status?, notes? } -> the updated request
//   PUT /api/admin/businesses/:id/category  body { businessCategory } ('multi_brand' is rejected)

export const REQUEST_STATUSES = ['new', 'contacted', 'set_up'];
export const STATUS_LABELS = { new: 'New', contacted: 'Contacted', set_up: 'Set up' };
export const STATUS_VARIANTS = { new: 'warning', contacted: 'info', set_up: 'success' };
export const NOTES_MAX = 2000;
export const REQUESTS_PAGE_SIZE = 20;

/** The server refuses this category on a category change (it needs sub-categories). */
export const EXCLUDED_CATEGORY = 'multi_brand';

/** Query params for GET business-requests; an empty status ("All") is left out. */
export function requestParams({ status, page }) {
  const params = { page, limit: REQUESTS_PAGE_SIZE };
  if (status) params.status = status;
  return params;
}

/** Display-ready row. The phone is digits with country code, so "+" is added for reading. */
export function requestRow(r) {
  return {
    id: r._id || r.id,
    businessId: r.businessId,
    businessName: r.businessName || '',
    businessCategory: r.businessCategory || '',
    requestedText: r.requestedText || '',
    ownerName: r.ownerName || '',
    ownerEmail: r.ownerEmail || '',
    phone: r.contactPhone ? `+${r.contactPhone}` : '',
    contactPhone: r.contactPhone || '',
    status: r.status,
    notes: r.notes || '',
    createdAt: r.createdAt,
  };
}

/** wa.me link to the request's contact phone, or null when it has none. */
export function whatsappLink(contactPhone, businessName) {
  const digits = String(contactPhone || '').replace(/\D/g, '');
  if (!digits) return null;
  const text = `Hi, this is ApnaBot team about your ${businessName || 'business'} setup`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Categories offered by "Change category": everything except multi_brand. */
export function categoryChoices(categories) {
  return categories.filter((c) => c.value !== EXCLUDED_CATEGORY);
}

/** Error message for a notes value that the server would reject, or null. */
export function validateNotes(notes) {
  return notes.length > NOTES_MAX ? `Max ${NOTES_MAX} characters` : null;
}

/** Body for PUT business-requests/:id with only what changed; null when nothing did. */
export function requestChanges(row, { status, notes }) {
  const body = {};
  if (status !== row.status) body.status = status;
  if (notes.trim() !== row.notes) body.notes = notes.trim() === '' ? null : notes.trim();
  return Object.keys(body).length ? body : null;
}
