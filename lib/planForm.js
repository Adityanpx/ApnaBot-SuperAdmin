// lib/planForm.js
// Shared plan form logic. The monthly price is the only base price; every longer
// tier total is computed from it (same maths as the server's planFields.js), so the
// card headline, the Pricing list and what customers are charged always agree.

export const DEFAULT_TIERS = [
  { months: 3, label: 'Quarterly', discount: 10 },
  { months: 6, label: 'Half-Yearly', discount: 20 },
  { months: 12, label: 'Yearly', discount: 30 },
];

export const MAX_FEATURES = 30;
export const MAX_FEATURE_LENGTH = 200;

const isDiscount = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100;

/** Total for `months` at a monthly `price` less `discount` %, rounded to the rupee. */
export function tierTotal(price, months, discount) {
  return Math.round(Number(price) * months * (1 - Number(discount) / 100));
}

/**
 * Tier definitions ({ months, label, discount }) for months > 1, from the stored
 * options when present, else the 10/20/30 defaults. Sorted by months.
 */
export function tierDefs(options) {
  const stored = new Map((Array.isArray(options) ? options : []).map((t) => [t.months, t]));
  const defaults = new Map(DEFAULT_TIERS.map((t) => [t.months, t]));
  const months = [...new Set([...defaults.keys(), ...stored.keys()])]
    .filter((m) => m > 1)
    .sort((a, b) => a - b);
  return months.map((m) => {
    const s = stored.get(m);
    const d = defaults.get(m);
    return {
      months: m,
      label: s?.label || d?.label || `${m} Months`,
      discount: isDiscount(s?.discount) ? s.discount : d?.discount ?? 0,
    };
  });
}

/** Full duration options (Monthly first) computed from the monthly price. */
export function buildDurationOptions(price, tiers) {
  const monthly = { months: 1, price: Number(price), label: 'Monthly', discount: 0 };
  const rest = tiers.map((t) => ({
    months: t.months,
    label: t.label,
    discount: Number(t.discount) || 0,
    price: tierTotal(price, t.months, Number(t.discount) || 0),
  }));
  return [monthly, ...rest];
}

/** Pricing list for a saved plan, always derived from plan.price. */
export function planPricing(plan) {
  return buildDurationOptions(plan.price ?? 0, tierDefs(plan.durationOptions));
}

/** Blank form state for Create. */
export function emptyPlanForm() {
  return {
    name: '', displayName: '', price: '',
    msgLimit: '', ruleLimit: '', customerLimit: '',
    imagesPerReply: '1', videoPerReply: false, carouselMaxCards: '3',
    storageLimitMb: '', sortOrder: '0',
    isActive: true, isPopular: false,
    bookingEnabled: false, paymentLinkEnabled: false,
    staffEnabled: false, maxStaff: '',
    features: [],
    tiers: tierDefs([]).map((t) => ({ ...t, discount: String(t.discount) })),
  };
}

/** Form state for Edit, from a saved plan. */
export function planToForm(plan) {
  const str = (v, fallback = '') => (v === null || v === undefined ? fallback : String(v));
  return {
    name: plan.name || '',
    displayName: plan.displayName || '',
    price: str(plan.price, '0'),
    msgLimit: str(plan.msgLimit, '0'),
    ruleLimit: str(plan.ruleLimit, '0'),
    customerLimit: str(plan.customerLimit, '0'),
    imagesPerReply: str(plan.imagesPerReply, '1'),
    videoPerReply: plan.videoPerReply ?? false,
    carouselMaxCards: str(plan.carouselMaxCards, '3'),
    storageLimitMb: str(plan.storageLimitMb),
    sortOrder: str(plan.sortOrder, '0'),
    isActive: plan.isActive ?? true,
    isPopular: plan.isPopular ?? false,
    bookingEnabled: plan.bookingEnabled ?? false,
    paymentLinkEnabled: plan.paymentLinkEnabled ?? false,
    staffEnabled: plan.staffEnabled ?? false,
    maxStaff: str(plan.maxStaff, '1'),
    features: Array.isArray(plan.features) ? [...plan.features] : [],
    tiers: tierDefs(plan.durationOptions).map((t) => ({ ...t, discount: String(t.discount) })),
  };
}

const isWhole = (s) => s !== '' && Number.isInteger(Number(s));

function validateFeatures(features) {
  const kept = features.map((f) => f.trim()).filter(Boolean);
  if (kept.length > MAX_FEATURES) return `Up to ${MAX_FEATURES} features are allowed`;
  if (kept.some((f) => f.length > MAX_FEATURE_LENGTH)) {
    return `Each feature must be ${MAX_FEATURE_LENGTH} characters or fewer`;
  }
  return null;
}

/** Returns the first validation error message for the form, or null when valid. */
export function validatePlanForm(form, { isEdit }) {
  const name = form.name.trim().toLowerCase();
  if (!isEdit && !/^[a-z0-9_-]+$/.test(name)) {
    return 'Internal ID needs letters, numbers, - or _ only (no spaces)';
  }
  if (!form.displayName.trim()) return 'Display name is required';
  if (form.price === '' || !(Number(form.price) >= 0)) return 'Enter a monthly price of 0 or more';
  const photos = Number(form.imagesPerReply);
  if (!Number.isInteger(photos) || photos < 1 || photos > 10) {
    return 'Photos per reply must be a whole number from 1 to 10';
  }
  const cards = Number(form.carouselMaxCards);
  if (form.carouselMaxCards === '' || !Number.isInteger(cards) || cards < 2 || cards > 10) {
    return 'Carousel cards per reply must be a whole number from 2 to 10';
  }
  if (form.tiers.some((t) => !isDiscount(Number(t.discount)))) {
    return 'Discount must be between 0 and 100';
  }
  if (!isWhole(form.sortOrder)) return 'Display order must be a whole number';
  if (form.storageLimitMb !== '' && (!isWhole(form.storageLimitMb) || Number(form.storageLimitMb) < 0)) {
    return 'Storage limit must be a whole number of MB, 0 or more';
  }
  return validateFeatures(form.features);
}

/** API payload for create (isEdit false) or update (isEdit true). */
export function formToPayload(form, { isEdit }) {
  const payload = {
    displayName: form.displayName.trim(),
    price: Number(form.price),
    msgLimit: Number(form.msgLimit) || 0,
    ruleLimit: Number(form.ruleLimit) || 0,
    customerLimit: Number(form.customerLimit) || 0,
    imagesPerReply: Number(form.imagesPerReply),
    videoPerReply: form.videoPerReply,
    carouselMaxCards: Number(form.carouselMaxCards),
    sortOrder: Number(form.sortOrder),
    isActive: form.isActive,
    isPopular: form.isPopular,
    bookingEnabled: form.bookingEnabled,
    paymentLinkEnabled: form.paymentLinkEnabled,
    staffEnabled: form.staffEnabled,
    maxStaff: form.staffEnabled ? Number(form.maxStaff) || 1 : 0,
    features: form.features.map((f) => f.trim()).filter(Boolean),
    durationOptions: buildDurationOptions(form.price, form.tiers),
  };
  if (form.storageLimitMb !== '') payload.storageLimitMb = Number(form.storageLimitMb);
  if (!isEdit) payload.name = form.name.trim().toLowerCase();
  return payload;
}

/**
 * What an edit changes in pricing. Returns null when the monthly price and every
 * discount are unchanged, else { oldMonthly, newMonthly, tiers: [{ months, label,
 * oldPrice, newPrice }] } for the confirm dialog.
 */
export function pricingChange(plan, form) {
  const before = planPricing(plan);
  const after = buildDurationOptions(form.price, form.tiers);
  const changed = after.some((opt, i) => (
    opt.price !== before[i].price || opt.discount !== before[i].discount
  ));
  if (!changed) return null;
  return {
    oldMonthly: before[0].price,
    newMonthly: after[0].price,
    tiers: after.slice(1).map((opt, i) => ({
      months: opt.months,
      label: opt.label,
      oldPrice: before[i + 1].price,
      newPrice: opt.price,
    })),
  };
}

/** Copy of `list` with the item at `from` moved to `to` (no-op if out of range). */
export function moveItem(list, from, to) {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
