// lib/whatsappDiagnostics.js
// Helpers for the WhatsApp diagnostics page (GET /api/super-admin/whatsapp-diagnostics).

/** What a missing webhook field breaks, in plain words. Order is the display order. */
export const WEBHOOK_FIELDS = [
  { field: 'messages', breaks: 'Incoming customer messages and delivery status updates never arrive, so the bot cannot reply.' },
  { field: 'account_update', breaks: 'Connect events (a number added or removed) are missed, so a new connection may not finish.' },
  { field: 'history', breaks: 'Chat history from the WhatsApp Business app is not imported after connecting.' },
  { field: 'smb_app_state_sync', breaks: 'Contacts from the WhatsApp Business app are not synced.' },
  { field: 'smb_message_echoes', breaks: 'Messages the owner sends from the phone app are not seen, so the bot cannot pause itself when the owner replies.' },
];

/** Meta's expires_at is unix seconds; 0 or missing means the token does not expire. */
export function formatTokenExpiry(expiresAt) {
  if (!expiresAt) return 'Never expires';
  return new Date(expiresAt * 1000).toLocaleString();
}

/** A flat value for display: booleans as yes/no, missing as a dash. */
export function displayValue(v) {
  if (v === undefined || v === null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}

/** Pretty-printed JSON of a connect attempt section, for the monospace box and Copy. */
export function toJsonText(value) {
  try {
    return JSON.stringify(value ?? [], null, 2);
  } catch {
    return String(value);
  }
}
