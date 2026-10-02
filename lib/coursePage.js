// lib/coursePage.js
//
// The WhatsApp course page text — same format as ApnaBot-server
// utils/courseValidation.js#coursePageText (keep in step): built from the
// structured fields (Age / Duration / Fees / Mode / More details) when any is
// set, otherwise the old free-text `details`.

export const COURSE_MODE_LABELS = { online: 'Online', offline: 'Offline', both: 'Online and offline' };

const filled = (v) => typeof v === 'string' && v.trim() !== '';

export const hasStructuredDetails = (c) =>
  filled(c.ageGroup) || filled(c.duration) || filled(c.fees) || filled(c.moreDetails) || !!COURSE_MODE_LABELS[c.mode];

export function coursePageText(c) {
  const main = coursePageMain(c);
  // Batches (when any) follow the details; batches alone are not a page.
  const batches = (Array.isArray(c.batches) ? c.batches : []).filter(filled).map((b) => b.trim());
  if (batches.length === 0) return main;
  return main ? `${main}\n\n🗓 Batches:\n${batches.map((b) => `• ${b}`).join('\n')}` : null;
}

function coursePageMain(c) {
  if (!hasStructuredDetails(c)) return filled(c.details) ? c.details.trim() : null;
  const head = [`*${(c.name || '').trim()}*`, ...(filled(c.description) ? [c.description.trim()] : [])].join('\n');
  const facts = [
    filled(c.ageGroup) && `👦 Age: ${c.ageGroup.trim()}`,
    filled(c.duration) && `🕘 Duration: ${c.duration.trim()}`,
    filled(c.fees) && `💰 Fees: ${c.fees.trim()}`,
    COURSE_MODE_LABELS[c.mode] && `💻 Mode: ${COURSE_MODE_LABELS[c.mode]}`,
  ].filter(Boolean).join('\n');
  const body = [facts, filled(c.moreDetails) ? c.moreDetails.trim() : ''].filter(Boolean).join('\n\n');
  return body ? `${head}\n\n${body}` : head;
}
