// hooks/useCategorySummary.test.jsx

import api from '@/lib/api';
import { API } from '@/lib/constants';
import { useCategorySummary } from '@/hooks/useCategorySummary';
import { mount, flush } from '@/tests/helpers/dom';

jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));

let latest;
function Probe() {
  latest = useCategorySummary();
  return null;
}

describe('useCategorySummary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads the total and the per-category counts', async () => {
    const categories = [{ value: 'travels', label: 'Travels', count: 4 }];
    api.get.mockResolvedValue({ data: { data: { total: 6, categories } } });
    const { unmount } = mount(<Probe />);
    await flush();
    expect(api.get).toHaveBeenCalledWith(API.BUSINESSES_CATEGORY_SUMMARY);
    expect(latest.total).toBe(6);
    expect(latest.categories).toEqual(categories);
    expect(latest.loading).toBe(false);
    unmount();
  });

  it('stays empty (no throw) when the request fails', async () => {
    api.get.mockRejectedValue(new Error('down'));
    const { unmount } = mount(<Probe />);
    await flush();
    expect(latest.total).toBe(0);
    expect(latest.categories).toEqual([]);
    expect(latest.loading).toBe(false);
    unmount();
  });
});
