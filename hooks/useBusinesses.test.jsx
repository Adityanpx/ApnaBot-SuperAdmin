// hooks/useBusinesses.test.jsx

import { act } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { useBusinesses } from '@/hooks/useBusinesses';
import { mount, flush } from '@/tests/helpers/dom';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn(), put: jest.fn(), delete: jest.fn() } }));

let latest;
function Probe() {
  latest = useBusinesses();
  return null;
}

const lastParams = () => api.get.mock.calls[api.get.mock.calls.length - 1][1].params;

describe('useBusinesses filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: { businesses: [], pagination: { total: 0, page: 1, pages: 1 } } } });
  });

  it('first asks for page 1 with no filters', async () => {
    const { unmount } = mount(<Probe />);
    await flush();
    expect(api.get.mock.calls[0][0]).toBe(API.BUSINESSES);
    expect(lastParams()).toEqual({ page: 1, limit: 15 });
    expect(latest.connected).toBe('');
    unmount();
  });

  it('sends the WhatsApp filter as connected and goes back to page 1', async () => {
    const { unmount } = mount(<Probe />);
    await flush();
    await act(async () => { latest.handlePageChange(3); });
    await flush();
    await act(async () => { latest.handleConnectedChange('false'); });
    await flush();
    expect(lastParams()).toEqual({ page: 1, limit: 15, connected: 'false' });
    unmount();
  });

  it('sends every filter together under the names the server expects', async () => {
    const { unmount } = mount(<Probe />);
    await flush();
    await act(async () => {
      latest.handleSearchChange('ravi');
      latest.handleActiveChange('true');
      latest.handleTypeChange('salon');
      latest.handleConnectedChange('true');
    });
    await flush();
    expect(lastParams()).toEqual({
      page: 1, limit: 15, search: 'ravi', isActive: 'true', businessCategory: 'salon', connected: 'true',
    });
    unmount();
  });
});
