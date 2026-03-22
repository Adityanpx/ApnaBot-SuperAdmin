// lib/utils.js

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Merge Tailwind classes safely (resolves conflicts)
 * Usage: cn('px-4', condition && 'bg-blue-500', 'px-6') → 'bg-blue-500 px-6'
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupees
 * formatCurrency(1999) → "₹1,999"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/**
 * Format large numbers with K / L suffix
 * formatNumber(12500) → "12.5K"
 * formatNumber(150000) → "1.5L"
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
  if (num >= 1000)   return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

/**
 * Format a date string
 * formatDate('2024-01-15') → "Jan 15, 2024"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { return format(new Date(dateStr), 'MMM d, yyyy'); }
  catch { return '—'; }
}

/**
 * Relative time
 * formatRelative('2024-01-10') → "5 days ago"
 */
export function formatRelative(dateStr) {
  if (!dateStr) return '—';
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); }
  catch { return '—'; }
}

/**
 * Format API month key to a readable label
 * formatMonth('2024-01') → "Jan 2024"
 */
export function formatMonth(monthKey) {
  if (!monthKey) return '';
  try {
    const [year, month] = monthKey.split('-');
    return format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMM yyyy');
  } catch { return monthKey; }
}

/**
 * Get initials from a full name
 * getInitials('Priya Sharma') → "PS"
 */
export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('');
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a plan limit — -1 means unlimited
 * formatLimit(-1) → "Unlimited"
 * formatLimit(500) → "500"
 */
export function formatLimit(val) {
  if (val === -1 || val === null || val === undefined) return 'Unlimited';
  return formatNumber(val);
}

/**
 * Get badge variant for subscription status
 */
export function getSubStatusVariant(status) {
  const map = {
    active:    'success',
    trial:     'info',
    expired:   'danger',
    cancelled: 'neutral',
  };
  return map[status] || 'neutral';
}

/**
 * Get emoji for business type
 */
export function getBusinessEmoji(type) {
  const map = {
    tailor:   '🧵',
    salon:    '💇',
    garage:   '🔧',
    cab:      '🚖',
    coaching: '📚',
    gym:      '💪',
    medical:  '💊',
    general:  '🏪',
  };
  return map[type] || '🏢';
}

/**
 * Truncate string to n chars
 */
export function truncate(str, n = 40) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
}
