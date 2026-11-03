// lib/registrations.test.js

import {
  REGISTRATIONS_PAGE_SIZE, filterParams, listParams, registrationRow, daysLabel,
} from '@/lib/registrations';

describe('filterParams', () => {
  it('leaves out a blank search and switches that are off', () => {
    expect(filterParams({ search: '  ', includeInactive: false, unverifiedOnly: false })).toEqual({});
    expect(filterParams({})).toEqual({});
  });

  it('sends a trimmed search and the switches that are on, as the server expects them', () => {
    expect(filterParams({ search: ' ravi ', includeInactive: true, unverifiedOnly: true }))
      .toEqual({ search: 'ravi', includeInactive: 'true', unverifiedOnly: 'true' });
  });
});

describe('listParams', () => {
  it('adds page and the page size to the filters', () => {
    expect(listParams({ page: 3, search: 'a', unverifiedOnly: true }))
      .toEqual({ page: 3, limit: REGISTRATIONS_PAGE_SIZE, search: 'a', unverifiedOnly: 'true' });
  });

  it('defaults to page 1', () => {
    expect(listParams({})).toEqual({ page: 1, limit: REGISTRATIONS_PAGE_SIZE });
  });
});

describe('registrationRow', () => {
  it('maps the server row', () => {
    expect(registrationRow({
      id: 'u1', name: 'Ravi', email: 'r@example.com', phone: '+919876543210', verified: true,
      isActive: true, registeredAt: '2026-10-01T00:00:00Z', daysSince: 5, lastLoginAt: '2026-11-01T00:00:00Z',
    })).toEqual({
      id: 'u1', name: 'Ravi', email: 'r@example.com', phone: '+919876543210', verified: true,
      isActive: true, registeredAt: '2026-10-01T00:00:00Z', daysSince: 5, lastLogin: '2026-11-01T00:00:00Z',
    });
  });

  it('gives an empty phone, no last login and unverified for missing values', () => {
    const row = registrationRow({ id: 'u2', phone: null, verified: false, lastLoginAt: null, daysSince: 0 });
    expect(row.phone).toBe('');
    expect(row.lastLogin).toBeNull();
    expect(row.verified).toBe(false);
    expect(row.daysSince).toBe(0);
  });

  it('treats a missing isActive as active and a missing daysSince as unknown', () => {
    const row = registrationRow({ id: 'u3' });
    expect(row.isActive).toBe(true);
    expect(row.daysSince).toBeNull();
  });
});

describe('daysLabel', () => {
  it('words 0, 1 and many days, and a dash when unknown', () => {
    expect(daysLabel(0)).toBe('today');
    expect(daysLabel(1)).toBe('1 day');
    expect(daysLabel(12)).toBe('12 days');
    expect(daysLabel(null)).toBe('-');
  });
});
