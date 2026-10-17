// hooks/useTrials.test.jsx

import { act } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { useTrials } from '@/hooks/useTrials';
import { mount, flush } from '@/tests/helpers/dom';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const settings = { trialEnabled: true, trialDays: 7, trialPlanId: 'p1', trialPlanIsDefault: true };
const claims = [{ _id: 'c1', id: 'c1', phoneE164: '910000000001', businessName: 'Glow' }];

let latest;
function Probe({ search, page }) {
  latest = useTrials({ search, page });
  return null;
}

function mockLoad() {
  api.get.mockImplementation((url) => Promise.resolve({
    data: { data: url === API.TRIAL_SETTINGS ? settings : { claims, total: 61 } },
  }));
}

const claimCalls = () => api.get.mock.calls.filter(([url]) => url === API.TRIAL_CLAIMS);

describe('useTrials', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads settings and one page of claims with the total', async () => {
    mockLoad();
    const { unmount } = mount(<Probe search="" page={1} />);
    await flush();
    expect(latest.settings).toEqual(settings);
    expect(latest.claims).toEqual(claims);
    expect(latest.total).toBe(61);
    expect(claimCalls()[0][1]).toEqual({ params: { limit: 50, offset: 0 } });
    unmount();
  });

  it('searches on the server with search, limit and offset', async () => {
    mockLoad();
    const { unmount } = mount(<Probe search="glow" page={2} />);
    await flush();
    expect(claimCalls()[0][1]).toEqual({ params: { limit: 50, offset: 50, search: 'glow' } });
    unmount();
  });

  it('puts the given settings body and keeps the server answer', async () => {
    mockLoad();
    api.put.mockResolvedValue({ data: { data: { ...settings, trialDays: 30 } } });
    const { unmount } = mount(<Probe search="" page={1} />);
    await flush();
    await act(async () => { await latest.saveSettings({ trialEnabled: true, trialDays: 30 }); });
    expect(api.put).toHaveBeenCalledWith(API.TRIAL_SETTINGS, { trialEnabled: true, trialDays: 30 });
    expect(latest.settings.trialDays).toBe(30);
    unmount();
  });

  it('deletes a claim with the reason and reloads the claims', async () => {
    mockLoad();
    api.delete.mockResolvedValue({ data: {} });
    const { unmount } = mount(<Probe search="" page={1} />);
    await flush();
    await act(async () => { await latest.resetClaim('c1', 'Wrong number'); });
    expect(api.delete).toHaveBeenCalledWith(API.TRIAL_CLAIM_BY_ID('c1'), {
      data: { reason: 'Wrong number' },
    });
    expect(claimCalls()).toHaveLength(2);
    unmount();
  });

  it('exposes a load error', async () => {
    api.get.mockRejectedValue({ userMessage: 'Down' });
    const { unmount } = mount(<Probe search="" page={1} />);
    await flush();
    expect(latest.error).toBe('Down');
    unmount();
  });
});
