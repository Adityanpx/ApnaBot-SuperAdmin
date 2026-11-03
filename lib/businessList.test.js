// lib/businessList.test.js

import {
  filterParams, listParams, categoryDetail, planText, subscriptionText,
} from '@/lib/businessList';

describe('filterParams', () => {
  it('leaves out empty filters', () => {
    expect(filterParams({ search: ' ', isActive: '', businessType: '', connected: '' })).toEqual({});
  });

  it('maps the business type to businessCategory and keeps the connected flag as the server expects it', () => {
    expect(filterParams({ search: ' ravi ', isActive: 'true', businessType: 'salon', connected: 'false' }))
      .toEqual({ search: 'ravi', isActive: 'true', businessCategory: 'salon', connected: 'false' });
  });
});

describe('listParams', () => {
  it('puts page and limit in front of the filters', () => {
    expect(listParams({ page: 2, limit: 15, search: 'a', connected: 'true' }))
      .toEqual({ page: 2, limit: 15, search: 'a', connected: 'true' });
  });
});

describe('categoryDetail', () => {
  const labelOf = (v) => ({ cab: 'Cab', salon: 'Salon' }[v] || v);

  it('is the typed category for a general business', () => {
    expect(categoryDetail({ businessCategory: 'general', requestedCategoryText: 'Hotel' })).toBe('Hotel');
    expect(categoryDetail({ businessCategory: 'general', requestedCategoryText: null })).toBe('');
  });

  it('is the labelled sub-categories for a multi_brand business', () => {
    const b = { businessCategory: 'multi_brand', subCategories: ['cab', 'salon', 'old'] };
    expect(categoryDetail(b, labelOf)).toBe('Cab, Salon, old');
    expect(categoryDetail({ businessCategory: 'multi_brand' })).toBe('');
  });

  it('is empty for every other category, even if a requested text is set', () => {
    expect(categoryDetail({ businessCategory: 'salon', requestedCategoryText: 'x' })).toBe('');
  });
});

describe('planText / subscriptionText', () => {
  it('show the plan display name (or name) and a capitalised status', () => {
    expect(planText({ plan: { name: 'pro', displayName: 'Pro' } })).toBe('Pro');
    expect(planText({ plan: { name: 'trial', displayName: null } })).toBe('trial');
    expect(subscriptionText({ subscriptionStatus: 'active' })).toBe('Active');
    expect(subscriptionText({ subscriptionStatus: 'trial' })).toBe('Trial');
  });

  it('show a dash when there is no subscription', () => {
    expect(planText({ plan: null })).toBe('-');
    expect(planText({})).toBe('-');
    expect(subscriptionText({ subscriptionStatus: null })).toBe('-');
    expect(subscriptionText({})).toBe('-');
  });
});
