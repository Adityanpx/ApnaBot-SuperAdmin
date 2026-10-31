import {
  ownerPhoneOf,
  ownerNameOf,
  ownerEmailOf,
  phoneDigits,
  waLink,
  telLink,
} from './ownerContact';

describe('ownerContact', () => {
  it('prefers the flat ownerPhone over the nested one', () => {
    expect(ownerPhoneOf({ ownerPhone: '+919876543210', ownerUserId: { phone: '+911111111111' } }))
      .toBe('+919876543210');
  });

  it('falls back to ownerUserId.phone, then empty', () => {
    expect(ownerPhoneOf({ ownerPhone: null, ownerUserId: { phone: '+911111111111' } })).toBe('+911111111111');
    expect(ownerPhoneOf({ ownerPhone: null, ownerUserId: 'some-id' })).toBe('');
    expect(ownerPhoneOf(null)).toBe('');
  });

  it('falls back to the nested owner for name and email', () => {
    const b = { ownerUserId: { name: 'Asha', email: 'a@x.com' } };
    expect(ownerNameOf(b)).toBe('Asha');
    expect(ownerEmailOf(b)).toBe('a@x.com');
    expect(ownerNameOf({ ownerName: 'Flat', ownerUserId: { name: 'Asha' } })).toBe('Flat');
  });

  it('builds wa.me and tel links from digits, null when empty', () => {
    expect(phoneDigits('+91 98765-43210')).toBe('919876543210');
    expect(waLink('+919876543210')).toBe('https://wa.me/919876543210');
    expect(telLink('+919876543210')).toBe('tel:+919876543210');
    expect(waLink('')).toBeNull();
    expect(telLink(null)).toBeNull();
  });
});
