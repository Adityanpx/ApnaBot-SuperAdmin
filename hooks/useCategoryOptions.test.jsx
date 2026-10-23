// hooks/useCategoryOptions.test.jsx

import { act } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { useCategoryOptions, invalidateCategoryOptions, resetCategoryOptionsCache } from '@/hooks/useCategoryOptions';
import { mount, flush } from '@/tests/helpers/dom';

jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));

const rows = [
  { value: 'salon', label: 'Salon', emoji: '💇', isEnabled: true },
  { value: 'cab', label: 'Cab', emoji: '', isEnabled: false },
];
const response = (categories) => ({ data: { data: { categories } } });

let latest;
function Probe() {
  latest = useCategoryOptions();
  return null;
}

describe('useCategoryOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCategoryOptionsCache();
  });

  it('loads every category (enabled or not) from the admin endpoint', async () => {
    api.get.mockResolvedValue(response(rows));
    const { unmount } = mount(<Probe />);
    expect(latest.loading).toBe(true);
    await flush();
    expect(api.get).toHaveBeenCalledWith(API.BUSINESS_CATEGORIES);
    expect(latest.categories.map((c) => c.value)).toEqual(['salon', 'cab']);
    expect(latest.loading).toBe(false);
    unmount();
  });

  it('shares one request between components and across remounts', async () => {
    api.get.mockResolvedValue(response(rows));
    const a = mount(<Probe />);
    const b = mount(<Probe />);
    await flush();
    a.unmount(); b.unmount();
    const c = mount(<Probe />);
    expect(latest.categories).toHaveLength(2);
    expect(latest.loading).toBe(false);
    await flush();
    expect(api.get).toHaveBeenCalledTimes(1);
    c.unmount();
  });

  it('labelOf / find work, and an empty emoji stays empty', async () => {
    api.get.mockResolvedValue(response(rows));
    const { unmount } = mount(<Probe />);
    await flush();
    expect(latest.labelOf('cab')).toBe('Cab');
    expect(latest.labelOf('unknown_value')).toBe('unknown_value');
    expect(latest.find('cab').emoji).toBe('');
    expect(latest.find('nope')).toBeUndefined();
    unmount();
  });

  it('falls back to the raw value while loading', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    const { unmount } = mount(<Probe />);
    expect(latest.categories).toEqual([]);
    expect(latest.labelOf('salon')).toBe('salon');
    unmount();
  });

  it('exposes the server message when loading fails, and retries after invalidation', async () => {
    api.get.mockRejectedValueOnce({ userMessage: 'Not allowed' });
    const { unmount } = mount(<Probe />);
    await flush();
    expect(latest.error).toBe('Not allowed');
    expect(latest.categories).toEqual([]);
    api.get.mockResolvedValue(response(rows));
    await act(async () => { invalidateCategoryOptions(); });
    await flush();
    expect(latest.error).toBeNull();
    expect(latest.categories).toHaveLength(2);
    unmount();
  });

  it('invalidation refetches for mounted consumers', async () => {
    api.get.mockResolvedValueOnce(response(rows));
    const { unmount } = mount(<Probe />);
    await flush();
    api.get.mockResolvedValueOnce(response([...rows, { value: 'pet_shop', label: 'Pet Shop', emoji: '🐶' }]));
    await act(async () => { invalidateCategoryOptions(); });
    await flush();
    expect(api.get).toHaveBeenCalledTimes(2);
    expect(latest.categories.map((c) => c.value)).toContain('pet_shop');
    unmount();
  });
});
