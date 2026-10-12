// hooks/useAppConfig.test.jsx

import { act } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { useAppConfig } from '@/hooks/useAppConfig';
import { mount, flush } from '@/tests/helpers/dom';

jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn(), put: jest.fn() } }));

const config = {
  androidMinVersion: '1.0.0',
  androidLatestVersion: '1.1.0',
  forceUpdate: false,
  maintenanceMode: false,
  playStoreUrl: 'https://play.google.com/store/apps/details?id=a.b',
  updatedAt: null,
  updatedBy: null,
};

let latest;
function Probe() {
  latest = useAppConfig();
  return null;
}

describe('useAppConfig', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads the config on mount', async () => {
    api.get.mockResolvedValue({ data: { success: true, data: config } });
    const { unmount } = mount(<Probe />);
    await flush();
    expect(api.get).toHaveBeenCalledWith(API.APP_CONFIG);
    expect(latest.data).toEqual(config);
    expect(latest.loading).toBe(false);
    unmount();
  });

  it('exposes the server message when loading fails', async () => {
    api.get.mockRejectedValue({ userMessage: 'Not allowed' });
    const { unmount } = mount(<Probe />);
    await flush();
    expect(latest.error).toBe('Not allowed');
    expect(latest.data).toBeNull();
    unmount();
  });

  it('save sends only editable fields and stores the response', async () => {
    api.get.mockResolvedValue({ data: { data: config } });
    const stamp = { updatedAt: '2026-10-12T10:00:00Z', updatedBy: 'Sam' };
    const updated = { ...config, forceUpdate: true, ...stamp };
    api.put.mockResolvedValue({ data: { data: updated } });
    const { unmount } = mount(<Probe />);
    await flush();
    await act(async () => { await latest.save({ ...config, forceUpdate: true }); });
    const body = api.put.mock.calls[0][1];
    expect(api.put.mock.calls[0][0]).toBe(API.APP_CONFIG);
    expect(body).not.toHaveProperty('updatedAt');
    expect(body.forceUpdate).toBe(true);
    expect(latest.data.updatedBy).toBe('Sam');
    unmount();
  });

  it('save rethrows so the caller can react', async () => {
    api.get.mockResolvedValue({ data: { data: config } });
    api.put.mockRejectedValue(new Error('boom'));
    const { unmount } = mount(<Probe />);
    await flush();
    await expect(latest.save(config)).rejects.toThrow('boom');
    unmount();
  });
});
