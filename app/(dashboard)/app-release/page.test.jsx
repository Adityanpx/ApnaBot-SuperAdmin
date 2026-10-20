// app/(dashboard)/app-release/page.test.jsx

import AppReleasePage from '@/app/(dashboard)/app-release/page';
import { useAppConfig } from '@/hooks/useAppConfig';
import { mount } from '@/tests/helpers/dom';

jest.mock('@/hooks/useAppConfig', () => ({ useAppConfig: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const config = {
  androidMinVersion: '1.0.0',
  androidLatestVersion: '1.5.0',
  forceUpdate: false,
  maintenanceMode: false,
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.apnabot.app',
  translateMonthlyCharCap: 20000,
  translateGlobalMonthlyCap: 1800000,
  updatedAt: null,
  updatedBy: null,
};

const hook = (over) => ({
  data: null, loading: false, error: null, refetch: jest.fn(), save: jest.fn(), ...over,
});

describe('AppReleasePage', () => {
  it('says "Never changed" when the server has no update time', () => {
    useAppConfig.mockReturnValue(hook({ data: config }));
    const { container, unmount } = mount(<AppReleasePage />);
    expect(container.textContent).toContain('Never changed');
    expect(container.querySelector('input').value).toBe('1.0.0');
    unmount();
  });

  it('shows when and by whom it was last changed', () => {
    const stamped = { ...config, updatedAt: '2026-10-12T10:00:00Z', updatedBy: 'Sam' };
    useAppConfig.mockReturnValue(hook({ data: stamped }));
    const { container, unmount } = mount(<AppReleasePage />);
    expect(container.textContent).toMatch(/Last updated .*2026.* by Sam/);
    unmount();
  });

  it('shows an error state with the message when loading failed', () => {
    useAppConfig.mockReturnValue(hook({ error: 'Not allowed' }));
    const { container, unmount } = mount(<AppReleasePage />);
    expect(container.textContent).toContain('Not allowed');
    expect(container.querySelector('input')).toBeNull();
    unmount();
  });

  it('shows no form while loading', () => {
    useAppConfig.mockReturnValue(hook({ loading: true }));
    const { container, unmount } = mount(<AppReleasePage />);
    expect(container.querySelector('input')).toBeNull();
    unmount();
  });
});
