// lib/categoryOptions.js
// Pure helpers over the admin category list (GET /api/admin/business-categories —
// every category, enabled or not). Shared by the useCategoryOptions hook and the
// category form.

/** 'any' is valid for flow packs / the node library only; those components prepend it. */
export const ANY_CATEGORY = { value: 'any', label: 'Any Category', emoji: '✨' };

/** Server row → option for <Select>; a missing emoji becomes '' so nothing renders for it. */
export function toCategoryOption(row) {
  return { ...row, value: row.value, label: row.label || row.value, emoji: row.emoji || '' };
}

export const withAny = (categories) => [ANY_CATEGORY, ...categories];

export const findCategory = (categories, value) => categories.find((c) => c.value === value);

/** Display label for a stored category value; falls back to the raw value while loading or if deleted. */
export const categoryLabel = (categories, value) => findCategory(categories, value)?.label || value;

/** "🧵 Tailor" — or just "Tailor" when the category has no emoji. */
export function categoryText(category, fallback = '') {
  if (!category) return fallback;
  return category.emoji ? `${category.emoji} ${category.label}` : category.label;
}

// ── Form ────────────────────────────────────────────────────────────────────

// Server limits (businessCategoryAdmin.controller.js); emoji counts characters, not UTF-16 units.
export const LABEL_MAX = 40;
export const EMOJI_MAX = 8;
export const ICON_MAX = 40;
export const DISPLAY_ORDER_MAX = 100000;

export const VALUE_PATTERN = /^[a-z][a-z0-9_]{2,39}$/;

/** Slug suggested from an English label: "Men's Wear" → "mens_wear". */
export function suggestValue(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^[^a-z]+/, '')
    .replace(/_+$/, '')
    .slice(0, 40)
    .replace(/_+$/, '');
}

export function emptyCategoryForm() {
  return {
    value: '', label: '', labelHi: '', labelMr: '', emoji: '', icon: '',
    displayOrder: '', isEnabled: false,
  };
}

export function categoryToForm(category) {
  return {
    value: category.value,
    label: category.label || '',
    labelHi: category.labelTranslations?.hi || '',
    labelMr: category.labelTranslations?.mr || '',
    emoji: category.emoji || '',
    icon: category.icon || '',
    displayOrder: category.displayOrder ?? '',
    isEnabled: !!category.isEnabled,
  };
}

/** Field → message map; empty when valid. `isEdit` skips the (immutable) value. */
export function validateCategoryForm(form, isEdit) {
  const errors = {};
  if (!isEdit && !VALUE_PATTERN.test(form.value)) {
    errors.value = 'Lowercase letters, digits and _ only; start with a letter; 3–40 characters';
  }
  if (!form.label.trim()) errors.label = 'English label is required';
  else if (form.label.trim().length > LABEL_MAX) errors.label = `Max ${LABEL_MAX} characters`;
  if (form.labelHi.trim().length > LABEL_MAX) errors.labelHi = `Max ${LABEL_MAX} characters`;
  if (form.labelMr.trim().length > LABEL_MAX) errors.labelMr = `Max ${LABEL_MAX} characters`;
  if (Array.from(form.emoji.trim()).length > EMOJI_MAX) errors.emoji = `Max ${EMOJI_MAX} characters`;
  if (form.icon.trim().length > ICON_MAX) errors.icon = `Max ${ICON_MAX} characters`;
  const order = Number(form.displayOrder);
  if (form.displayOrder !== '' && !(Number.isInteger(order) && order >= 0 && order <= DISPLAY_ORDER_MAX)) {
    errors.displayOrder = `Whole number from 0 to ${DISPLAY_ORDER_MAX}`;
  }
  return errors;
}

/** Request body for POST / PUT. `value` is sent on create only. */
export function categoryPayload(form, isEdit) {
  const trim = (s) => s.trim();
  const body = {
    label: trim(form.label),
    labelTranslations: { hi: trim(form.labelHi), mr: trim(form.labelMr) },
    emoji: trim(form.emoji),
    icon: trim(form.icon),
    isEnabled: !!form.isEnabled,
  };
  if (form.displayOrder !== '') body.displayOrder = Number(form.displayOrder);
  if (!isEdit) body.value = form.value;
  return body;
}
