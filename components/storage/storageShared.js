// components/storage/storageShared.js
// Labels and small helpers shared by the Storage page components.

export const ALL_BUSINESSES_PHRASE = 'DELETE ALL BUSINESSES MEDIA';
export const MIN_RETENTION_DAYS = 7;

export const NOT_ON_PHONES_NOTE =
  'Deleted files are removed from ApnaBot only — WhatsApp chats on phones are not affected.';

export const KIND_LABELS = {
  chat_inbound:    'Customer chat media',
  chat_echo:       "Owner's phone-app media",
  library:         'Media library',
  template_header: 'Template header images',
  bot_node_image:  'Bot step images',
  payment_qr:      'Payment QR codes',
  logo:            'Business logos',
  vehicle_photo:   'Vehicle photos',
  course_image:    'Course images',
  orphan:          'Unlinked files',
};

export const CHAT_KINDS = ['chat_inbound', 'chat_echo'];

export const kindLabel = (kind) => KIND_LABELS[kind] || kind;

// Kinds an admin can pick in the wizard ('orphan' has its own tab)
export const PICKABLE_KINDS = Object.keys(KIND_LABELS).filter((k) => k !== 'orphan');

export const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url || '');

export const fileExt = (url) => {
  const m = (url || '').match(/\.([a-z0-9]{2,5})(\?|$)/i);
  return m ? m[1].toUpperCase() : 'FILE';
};

/** Who/what a run came from, in plain words. */
export const runOrigin = (run, myId) => {
  if (run.is_automatic) return 'Automatic';
  if (run.created_by && myId && run.created_by === myId) return 'Manual · you';
  return run.created_by ? 'Manual · another admin' : 'Manual';
};

/** One-line description of a run's filters. */
export const describeFilters = (f = {}, businessNames = {}) => {
  const parts = [];
  if (f.orphan_mode) parts.push('Unlinked (orphan) files');
  else parts.push(f.kinds && f.kinds.length ? f.kinds.map(kindLabel).join(', ') : 'All file types');
  parts.push(f.business_id === 'all' ? 'all businesses' : (businessNames[f.business_id] || 'one business'));
  if (f.from || f.to) parts.push(`${f.from || 'start'} → ${f.to || 'today'}`);
  if (f.min_bytes) parts.push(`≥ ${Math.round(f.min_bytes / 1048576 * 10) / 10} MB`);
  if (f.include_in_use) parts.push('includes in-use files');
  return parts.join(' · ');
};

/** "in 5h 12m" / "any moment" for a pending run's purge time. */
export const countdown = (iso, now = Date.now()) => {
  const ms = new Date(iso).getTime() - now;
  if (!Number.isFinite(ms)) return '';
  if (ms <= 60000) return 'any moment now';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
};
