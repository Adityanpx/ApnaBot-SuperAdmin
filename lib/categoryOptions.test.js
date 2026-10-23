// lib/categoryOptions.test.js

import {
  suggestValue, validateCategoryForm, categoryPayload, emptyCategoryForm, categoryToForm,
  toCategoryOption, categoryLabel, categoryText, withAny, VALUE_PATTERN,
} from '@/lib/categoryOptions';

const valid = { ...emptyCategoryForm(), value: 'pet_shop', label: 'Pet Shop' };

describe('suggestValue', () => {
  it('slugifies a label', () => {
    expect(suggestValue('Pet Shop')).toBe('pet_shop');
    expect(suggestValue("Men's Wear")).toBe('mens_wear');
    expect(suggestValue('  Software & IT  ')).toBe('software_it');
  });
  it('always starts with a letter and stays within 40 characters', () => {
    expect(suggestValue('123 Gym')).toBe('gym');
    expect(suggestValue('a'.repeat(60)).length).toBe(40);
    expect(suggestValue('')).toBe('');
  });
  it('suggestions that are long enough satisfy the pattern', () => {
    expect(VALUE_PATTERN.test(suggestValue('Pet Shop'))).toBe(true);
  });
});

describe('validateCategoryForm', () => {
  it('accepts a valid new category', () => {
    expect(validateCategoryForm(valid, false)).toEqual({});
  });
  it.each(['ab', 'Pet', '1pet', 'pet-shop', 'pet shop', 'a'.repeat(41)])('rejects value %p on create', (value) => {
    expect(validateCategoryForm({ ...valid, value }, false).value).toBeDefined();
  });
  it('accepts the 3 and 40 character boundaries', () => {
    expect(validateCategoryForm({ ...valid, value: 'abc' }, false)).toEqual({});
    expect(validateCategoryForm({ ...valid, value: 'a'.repeat(40) }, false)).toEqual({});
  });
  it('does not check the value on edit', () => {
    expect(validateCategoryForm({ ...valid, value: 'Legacy-Value' }, true)).toEqual({});
  });
  it('requires the English label', () => {
    expect(validateCategoryForm({ ...valid, label: '  ' }, false).label).toBeDefined();
  });
  it('enforces the server length limits', () => {
    expect(validateCategoryForm({ ...valid, label: 'x'.repeat(41) }, false).label).toBeDefined();
    expect(validateCategoryForm({ ...valid, label: 'x'.repeat(40) }, false)).toEqual({});
    expect(validateCategoryForm({ ...valid, labelHi: 'x'.repeat(41) }, false).labelHi).toBeDefined();
    expect(validateCategoryForm({ ...valid, labelMr: 'x'.repeat(41) }, false).labelMr).toBeDefined();
    expect(validateCategoryForm({ ...valid, icon: 'x'.repeat(41) }, false).icon).toBeDefined();
    expect(validateCategoryForm({ ...valid, emoji: '🐶'.repeat(8) }, false)).toEqual({});
    expect(validateCategoryForm({ ...valid, emoji: '🐶'.repeat(9) }, false).emoji).toBeDefined();
  });
  it('display order must be a whole number >= 0 when given', () => {
    expect(validateCategoryForm({ ...valid, displayOrder: '' }, false)).toEqual({});
    expect(validateCategoryForm({ ...valid, displayOrder: '0' }, false)).toEqual({});
    expect(validateCategoryForm({ ...valid, displayOrder: '12' }, false)).toEqual({});
    expect(validateCategoryForm({ ...valid, displayOrder: '100000' }, false)).toEqual({});
    expect(validateCategoryForm({ ...valid, displayOrder: '100001' }, false).displayOrder).toBeDefined();
    expect(validateCategoryForm({ ...valid, displayOrder: '-1' }, false).displayOrder).toBeDefined();
    expect(validateCategoryForm({ ...valid, displayOrder: '1.5' }, false).displayOrder).toBeDefined();
    expect(validateCategoryForm({ ...valid, displayOrder: 'x' }, false).displayOrder).toBeDefined();
  });
});

describe('categoryPayload', () => {
  it('create sends value, trimmed labels, translations and defaults to disabled', () => {
    const body = categoryPayload({ ...valid, label: ' Pet Shop ', labelHi: ' पेट ', emoji: '🐶' }, false);
    expect(body).toEqual({
      value: 'pet_shop', label: 'Pet Shop', labelTranslations: { hi: 'पेट', mr: '' },
      emoji: '🐶', icon: '', isEnabled: false,
    });
  });
  it('edit omits value; displayOrder is numeric and only sent when set', () => {
    const body = categoryPayload({ ...valid, displayOrder: '7', isEnabled: true }, true);
    expect(body).not.toHaveProperty('value');
    expect(body.displayOrder).toBe(7);
    expect(body.isEnabled).toBe(true);
    expect(categoryPayload(valid, true)).not.toHaveProperty('displayOrder');
  });
});

describe('categoryToForm', () => {
  it('round-trips a server row, tolerating missing optional fields', () => {
    expect(categoryToForm({ value: 'salon', label: 'Salon', isEnabled: true, displayOrder: 0 })).toEqual({
      value: 'salon', label: 'Salon', labelHi: '', labelMr: '', emoji: '', icon: '',
      displayOrder: 0, isEnabled: true,
    });
    expect(categoryToForm({ value: 'x', label: 'X', labelTranslations: { hi: 'ए', mr: 'बी' }, emoji: '💇' }))
      .toMatchObject({ labelHi: 'ए', labelMr: 'बी', emoji: '💇', isEnabled: false });
  });
});

describe('display helpers', () => {
  const list = [
    toCategoryOption({ value: 'salon', label: 'Salon', emoji: '💇' }),
    toCategoryOption({ value: 'cab', label: 'Cab' }),
  ];
  it('a category without an emoji gets an empty one', () => {
    expect(list[1].emoji).toBe('');
  });
  it('categoryText omits the emoji when empty and falls back for unknown values', () => {
    expect(categoryText(list[0])).toBe('💇 Salon');
    expect(categoryText(list[1])).toBe('Cab');
    expect(categoryText(undefined, 'ghost')).toBe('ghost');
  });
  it('categoryLabel falls back to the raw value', () => {
    expect(categoryLabel(list, 'cab')).toBe('Cab');
    expect(categoryLabel(list, 'gone')).toBe('gone');
  });
  it('withAny prepends any without mutating the list', () => {
    expect(withAny(list).map((c) => c.value)).toEqual(['any', 'salon', 'cab']);
    expect(list).toHaveLength(2);
  });
});
