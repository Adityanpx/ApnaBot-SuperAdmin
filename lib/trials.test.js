// lib/trials.test.js

import {
  claimRow, claimsParams, isValidReason, validateTrialSettings, settingsPatch,
} from '@/lib/trials';

describe('claimRow', () => {
  it('reads the server claim: adds + to the phone, flags a linked subscription', () => {
    const row = claimRow({
      _id: 'c1', id: 'c1', phoneE164: '910000000001', businessName: 'Glow Salon',
      claimedAt: '2026-10-01T00:00:00Z', subscriptionId: 's1',
    });
    expect(row).toEqual({
      id: 'c1', phone: '+910000000001', businessName: 'Glow Salon',
      claimedAt: '2026-10-01T00:00:00Z', hasSubscription: true,
    });
  });

  it('copes with a claim whose business was deleted', () => {
    const row = claimRow({ id: 'c2', phoneE164: '910000000002', businessName: null });
    expect(row).toMatchObject({ id: 'c2', businessName: '', hasSubscription: false });
  });
});

describe('claimsParams', () => {
  it('sends limit, offset from the page and a trimmed search', () => {
    expect(claimsParams({ search: ' glow ', page: 3 })).toEqual({
      limit: 50, offset: 100, search: 'glow',
    });
  });

  it('leaves a blank search out', () => {
    expect(claimsParams({ search: '  ', page: 1 })).toEqual({ limit: 50, offset: 0 });
  });
});

describe('isValidReason', () => {
  it('needs 3 characters after trimming', () => {
    expect(isValidReason('ab ')).toBe(false);
    expect(isValidReason(' abc ')).toBe(true);
    expect(isValidReason(undefined)).toBe(false);
  });
});

describe('validateTrialSettings', () => {
  it('accepts whole days from 1 to 365', () => {
    expect(validateTrialSettings({ trialDays: '14' })).toEqual({});
    expect(validateTrialSettings({ trialDays: 365 })).toEqual({});
  });

  it('rejects anything else', () => {
    for (const trialDays of [0, 1.5, 366, '', 'abc']) {
      expect(validateTrialSettings({ trialDays })).toHaveProperty('trialDays');
    }
  });
});

describe('settingsPatch', () => {
  const initial = { trialEnabled: true, trialDays: 7, trialPlanId: 'p1', trialPlanIsDefault: true };

  it('omits the plan when it did not change', () => {
    expect(settingsPatch(initial, { trialEnabled: false, trialDays: '10', trialPlanId: 'p1' }))
      .toEqual({ trialEnabled: false, trialDays: 10 });
  });

  it('includes the plan when another one is chosen', () => {
    expect(settingsPatch(initial, { trialEnabled: true, trialDays: '7', trialPlanId: 'p2' }))
      .toEqual({ trialEnabled: true, trialDays: 7, trialPlanId: 'p2' });
  });
});
