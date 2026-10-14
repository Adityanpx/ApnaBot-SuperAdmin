// lib/planForm.test.js

import {
  tierTotal, tierDefs, buildDurationOptions, planPricing, emptyPlanForm, planToForm,
  validatePlanForm, formToPayload, pricingChange, moveItem,
} from '@/lib/planForm';

const plan = {
  _id: 'p1', name: 'pro', displayName: 'Pro', price: 399,
  msgLimit: 2000, ruleLimit: 50, customerLimit: 500, imagesPerReply: 3, videoPerReply: true,
  storageLimitMb: 300, sortOrder: 2, isActive: true, isPopular: true,
  bookingEnabled: true, paymentLinkEnabled: false, staffEnabled: true, maxStaff: 4,
  features: ['Unlimited chats', 'Priority support'],
  durationOptions: [
    { months: 1, price: 399, label: 'Monthly', discount: 0 },
    { months: 3, price: 1077, label: 'Quarterly', discount: 10 },
    { months: 6, price: 1915, label: 'Half-Yearly', discount: 20 },
    { months: 12, price: 3352, label: 'Yearly', discount: 30 },
  ],
};

const validForm = () => ({ ...emptyPlanForm(), name: 'gold', displayName: 'Gold', price: '100' });

describe('tier maths', () => {
  it('computes totals from the monthly price and discount, rounded to the rupee', () => {
    expect(tierTotal(399, 3, 10)).toBe(1077);
    expect(tierTotal(199, 12, 30)).toBe(1672);
  });

  it('builds Monthly first, equal to the price, then 3/6/12 totals', () => {
    const options = buildDurationOptions('100', tierDefs([]));
    expect(options.map((o) => [o.months, o.price, o.discount])).toEqual([
      [1, 100, 0], [3, 270, 10], [6, 480, 20], [12, 840, 30],
    ]);
  });

  it('keeps a custom discount and an extra tier from stored options', () => {
    const tiers = tierDefs([{ months: 3, discount: 5, label: 'Q' }, { months: 2, discount: 0 }]);
    expect(tiers.map((t) => [t.months, t.discount, t.label])).toEqual([
      [2, 0, '2 Months'], [3, 5, 'Q'], [6, 20, 'Half-Yearly'], [12, 30, 'Yearly'],
    ]);
  });

  it('planPricing ignores stale stored amounts and follows plan.price', () => {
    const stale = { ...plan, price: 500 };
    const pricing = planPricing(stale);
    expect(pricing[0].price).toBe(500);
    expect(pricing[1].price).toBe(1350);
  });
});

describe('planToForm / formToPayload', () => {
  it('round-trips every editable field', () => {
    const payload = formToPayload(planToForm(plan), { isEdit: true });
    expect(payload).toMatchObject({
      displayName: 'Pro', price: 399, sortOrder: 2, isPopular: true, isActive: true,
      storageLimitMb: 300, imagesPerReply: 3, videoPerReply: true, maxStaff: 4,
      features: ['Unlimited chats', 'Priority support'],
    });
    expect(payload.name).toBeUndefined();
  });

  it('sends the lower-cased name on create and omits an empty storage limit', () => {
    const payload = formToPayload({ ...validForm(), name: ' Gold ' }, { isEdit: false });
    expect(payload.name).toBe('gold');
    expect('storageLimitMb' in payload).toBe(false);
    expect(payload.isActive).toBe(true);
    expect(payload.durationOptions[0]).toMatchObject({ months: 1, price: 100 });
  });

  it('drops blank features and sends Active=false when switched off', () => {
    const form = { ...validForm(), features: [' A ', '  ', 'B'], isActive: false };
    const payload = formToPayload(form, { isEdit: false });
    expect(payload.features).toEqual(['A', 'B']);
    expect(payload.isActive).toBe(false);
  });
});

describe('validatePlanForm', () => {
  it('accepts a valid form', () => {
    expect(validatePlanForm(validForm(), { isEdit: false })).toBeNull();
  });

  it.each([
    [{ name: 'has space' }, 'Internal ID'],
    [{ displayName: ' ' }, 'Display name'],
    [{ price: '' }, 'monthly price'],
    [{ imagesPerReply: '11' }, 'Photos per reply'],
    [{ sortOrder: '1.5' }, 'Display order'],
    [{ storageLimitMb: '-5' }, 'Storage limit'],
    [{ features: Array(31).fill('x') }, 'Up to 30'],
    [{ features: ['y'.repeat(201)] }, '200 characters'],
  ])('rejects %j', (patch, message) => {
    expect(validatePlanForm({ ...validForm(), ...patch }, { isEdit: false })).toContain(message);
  });

  it('rejects a discount over 100', () => {
    const form = validForm();
    form.tiers[0].discount = '120';
    expect(validatePlanForm(form, { isEdit: false })).toContain('Discount');
  });
});

describe('pricingChange', () => {
  it('is null when price and discounts are unchanged', () => {
    expect(pricingChange(plan, planToForm(plan))).toBeNull();
  });

  it('is null when only a non-price field changes', () => {
    expect(pricingChange(plan, { ...planToForm(plan), displayName: 'Pro Max' })).toBeNull();
  });

  it('reports old and new totals when the monthly price changes', () => {
    const change = pricingChange(plan, { ...planToForm(plan), price: '499' });
    expect(change.oldMonthly).toBe(399);
    expect(change.newMonthly).toBe(499);
    expect(change.tiers[0]).toMatchObject({ months: 3, oldPrice: 1077, newPrice: 1347 });
  });

  it('reports a change when only a discount changes', () => {
    const form = planToForm(plan);
    form.tiers[2].discount = '35';
    const change = pricingChange(plan, form);
    expect(change.oldMonthly).toBe(change.newMonthly);
    expect(change.tiers[2]).toMatchObject({ months: 12, oldPrice: 3352, newPrice: 3112 });
  });
});

describe('moveItem', () => {
  it('moves an item and leaves the input untouched', () => {
    const list = ['a', 'b', 'c'];
    expect(moveItem(list, 0, 1)).toEqual(['b', 'a', 'c']);
    expect(list).toEqual(['a', 'b', 'c']);
  });

  it('ignores moves outside the list', () => {
    const list = ['a', 'b'];
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(moveItem(list, 1, 2)).toBe(list);
  });
});
