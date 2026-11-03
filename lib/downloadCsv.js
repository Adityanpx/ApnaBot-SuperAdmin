// lib/downloadCsv.js
import api from '@/lib/api';

// A UTF-8 byte order mark makes Excel read Hindi / Marathi names correctly
const BOM = '﻿';
const EXPORT_TIMEOUT_MS = 60000; // exports read every row, so they get more than the usual 15 s

/**
 * Fetches a CSV from the API (with the session's auth header) and saves it as `filename`.
 * Rejects with the request error so the caller can toast it.
 */
export async function downloadCsv(url, params, filename) {
  const res = await api.get(url, { params, responseType: 'blob', timeout: EXPORT_TIMEOUT_MS });
  const blob = new Blob([BOM, res.data], { type: 'text/csv;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}
