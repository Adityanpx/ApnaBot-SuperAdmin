// hooks/useBusinessRequests.test.jsx

import { act } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { useBusinessRequests } from '@/hooks/useBusinessRequests';
import { useNewRequestCount, notifyRequestsChanged } from '@/hooks/useNewRequestCount';
import { mount, flush } from '@/tests/helpers/dom';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}));

const requests = [{ id: 'r1', _id: 'r1', businessId: 'b1', status: 'new' }];

let latest;
function Probe({ status, page }) {
  latest = useBusinessRequests({ status, page });
  return null;
}

let badge;
function BadgeProbe() {
  badge = useNewRequestCount();
  return null;
}

describe('useBusinessRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: { requests, pagination: { total: 41 } } } });
  });

  it('loads a page with the status filter and the pagination total', async () => {
    const { unmount } = mount(<Probe status="new" page={2} />);
    await flush();
    expect(api.get).toHaveBeenCalledWith(API.BUSINESS_REQUESTS, { params: { page: 2, limit: 20, status: 'new' } });
    expect(latest.requests).toEqual(requests);
    expect(latest.total).toBe(41);
    unmount();
  });

  it('exposes the server message when loading fails', async () => {
    api.get.mockRejectedValue({ userMessage: 'Not allowed' });
    const { unmount } = mount(<Probe status="" page={1} />);
    await flush();
    expect(latest.error).toBe('Not allowed');
    unmount();
  });

  it('updateRequest PUTs the body and refetches', async () => {
    api.put.mockResolvedValue({ data: { data: {} } });
    const { unmount } = mount(<Probe status="" page={1} />);
    await flush();
    await act(async () => { await latest.updateRequest('r1', { status: 'contacted' }); });
    expect(api.put).toHaveBeenCalledWith(API.BUSINESS_REQUEST_BY_ID('r1'), { status: 'contacted' });
    expect(api.get).toHaveBeenCalledTimes(2);
    unmount();
  });

  it('changeCategory PUTs { businessCategory } to the business and returns the result', async () => {
    api.put.mockResolvedValue({ data: { data: { businessCategory: 'salon' } } });
    const { unmount } = mount(<Probe status="" page={1} />);
    await flush();
    let result;
    await act(async () => { result = await latest.changeCategory('b1', 'salon'); });
    expect(api.put).toHaveBeenCalledWith(API.BUSINESS_CHANGE_CATEGORY('b1'), { businessCategory: 'salon' });
    expect(result).toEqual({ businessCategory: 'salon' });
    unmount();
  });

  it('rethrows a failed update so the dialog can stay open', async () => {
    api.put.mockRejectedValue(new Error('boom'));
    const { unmount } = mount(<Probe status="" page={1} />);
    await flush();
    await expect(latest.updateRequest('r1', { status: 'set_up' })).rejects.toThrow('boom');
    await expect(latest.changeCategory('b1', 'salon')).rejects.toThrow('boom');
    unmount();
  });
});

describe('useNewRequestCount', () => {
  beforeEach(() => jest.clearAllMocks());

  it('counts requests with status new and refetches when notified', async () => {
    api.get.mockResolvedValue({ data: { data: { requests: [], pagination: { total: 3 } } } });
    const { unmount } = mount(<BadgeProbe />);
    await flush();
    expect(api.get).toHaveBeenCalledWith(API.BUSINESS_REQUESTS, { params: { status: 'new', page: 1, limit: 1 } });
    expect(badge).toBe(3);

    api.get.mockResolvedValue({ data: { data: { requests: [], pagination: { total: 2 } } } });
    act(() => notifyRequestsChanged());
    await flush();
    expect(badge).toBe(2);
    unmount();
  });

  it('keeps the last count when a read fails', async () => {
    api.get.mockRejectedValue(new Error('down'));
    const { unmount } = mount(<BadgeProbe />);
    await flush();
    expect(badge).toBe(0);
    unmount();
  });
});
