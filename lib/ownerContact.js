// lib/ownerContact.js — owner contact fields from the admin businesses APIs

const nested = (business) =>
  business?.ownerUserId && typeof business.ownerUserId === 'object' ? business.ownerUserId : null;

/** Flat ownerPhone first, then the nested owner's phone; '' when none. */
export function ownerPhoneOf(business) {
  return business?.ownerPhone || nested(business)?.phone || '';
}

export function ownerNameOf(business) {
  return business?.ownerName || nested(business)?.name || '';
}

export function ownerEmailOf(business) {
  return business?.ownerEmail || nested(business)?.email || '';
}

/** Digits only (country code included, "+" stripped), or '' when there are none. */
export function phoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

/** wa.me link for a stored "+91…" phone, or null when it has no digits. */
export function waLink(phone) {
  const digits = phoneDigits(phone);
  return digits ? `https://wa.me/${digits}` : null;
}

/** tel: link for a stored phone, or null when it has no digits. */
export function telLink(phone) {
  const digits = phoneDigits(phone);
  return digits ? `tel:+${digits}` : null;
}
