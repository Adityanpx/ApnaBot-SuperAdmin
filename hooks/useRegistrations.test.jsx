// hooks/useRegistrations.test.jsx

import { act } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { useRegistrations } from '@/hooks/useRegistrations';
import { mount, flush } from '@/tests/helpers/dom';

jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));

const rows = [{ id: 'u1', name: 'Ravi' }];
const reply = (registrations, total) => ({ data: { data: { registrations, pagination: { total } } } });

let latest;
function Probe(props) {
  latest = useRegistrations(props);
  return null;
}

describe('useRegistrations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads one page of registrations with the total from the pagination', async () => {
    api.get.mockResolvedValue(reply(rows, 41));
    const { unmount } = mount(<Probe />);
    await flush();
    expect(latest.registrations).toEqual(rows);
    expect(latest.total).toBe(41);
    expect(latest.loading).toBe(false);
    expect(api.get).toHaveBeenCalledWith(API.REGISTRATIONS_NO_BUSINESS, { params: { page: 1, limit: 20 } });
    unmount();
  });

  it('sends search, page and the two switches', async () => {
    api.get.mockResolvedValue(reply([], 0));
    const { unmount } = mount(<Probe search="ravi" page={2} includeInactive unverifiedOnly />);
    await flush();
    expect(api.get.mock.calls[0][1]).toEqual({
      params: { page: 2, limit: 20, search: 'ravi', includeInactive: 'true', unverifiedOnly: 'true' },
    });
    unmount();
  });

  it('keeps the server message when the load fails', async () => {
    api.get.mockRejectedValue({ userMessage: 'Forbidden' });
    const { unmount } = mount(<Probe />);
    await flush();
    expect(latest.error).toBe('Forbidden');
    expect(latest.loading).toBe(false);
    unmount();
  });

  it('refetch loads again', async () => {
    api.get.mockResolvedValue(reply(rows, 1));
    const { unmount } = mount(<Probe />);
    await flush();
    await act(async () => { await latest.refetch(); });
    expect(api.get).toHaveBeenCalledTimes(2);
    unmount();
  });

  it('ignores an older response that arrives after a newer one', async () => {
    let resolveOld;
    api.get
      .mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce(reply([{ id: 'new' }], 1));
    const { unmount } = mount(<Probe search="a" />);
    await act(async () => { await latest.refetch(); });
    await act(async () => { resolveOld(reply([{ id: 'old' }], 9)); });
    expect(latest.registrations).toEqual([{ id: 'new' }]);
    expect(latest.total).toBe(1);
    unmount();
  });
});
