// lib/businessRequests.test.js

import {
  requestParams, requestRow, whatsappLink, categoryChoices, validateNotes, requestChanges, NOTES_MAX,
} from '@/lib/businessRequests';

const row = (over = {}) => requestRow({
  _id: 'r1', businessId: 'b1', businessName: 'Rangoli Studio', businessCategory: 'general',
  requestedText: 'Rangoli artist', contactPhone: '919876543210', ownerName: 'Asha',
  ownerEmail: 'asha@example.com', status: 'new', notes: null, createdAt: '2026-10-01T00:00:00Z', ...over,
});

describe('requestParams', () => {
  it('sends page and limit, and status only when one is chosen', () => {
    expect(requestParams({ status: '', page: 2 })).toEqual({ page: 2, limit: 20 });
    expect(requestParams({ status: 'new', page: 1 })).toEqual({ page: 1, limit: 20, status: 'new' });
  });
});

describe('requestRow', () => {
  it('shows the contact phone with a +', () => {
    expect(row().phone).toBe('+919876543210');
    expect(row({ contactPhone: null }).phone).toBe('');
  });

  it('turns null fields into empty strings', () => {
    expect(row().notes).toBe('');
    expect(row({ businessName: null }).businessName).toBe('');
  });
});

describe('whatsappLink', () => {
  it('opens wa.me/<contact phone> with the team greeting', () => {
    const link = whatsappLink('919876543210', 'Rangoli Studio');
    expect(link.startsWith('https://wa.me/919876543210?text=')).toBe(true);
    expect(decodeURIComponent(link.split('text=')[1]))
      .toBe('Hi, this is ApnaBot team about your Rangoli Studio setup');
  });

  it('is null without a phone', () => {
    expect(whatsappLink('', 'X')).toBeNull();
    expect(whatsappLink(null, 'X')).toBeNull();
  });
});

describe('categoryChoices', () => {
  it('drops multi_brand, which the server rejects', () => {
    const list = [{ value: 'salon' }, { value: 'multi_brand' }, { value: 'tailor' }];
    expect(categoryChoices(list).map((c) => c.value)).toEqual(['salon', 'tailor']);
  });
});

describe('validateNotes', () => {
  it('allows up to the server limit', () => {
    expect(validateNotes('x'.repeat(NOTES_MAX))).toBeNull();
    expect(validateNotes('x'.repeat(NOTES_MAX + 1))).toMatch(/Max 2000/);
  });
});

describe('requestChanges', () => {
  it('is null when nothing changed', () => {
    expect(requestChanges(row(), { status: 'new', notes: '' })).toBeNull();
  });

  it('sends only what changed, trimming notes and clearing them with null', () => {
    expect(requestChanges(row(), { status: 'contacted', notes: '' })).toEqual({ status: 'contacted' });
    expect(requestChanges(row(), { status: 'new', notes: ' called ' })).toEqual({ notes: 'called' });
    expect(requestChanges(row({ notes: 'called' }), { status: 'new', notes: '  ' })).toEqual({ notes: null });
  });
});
