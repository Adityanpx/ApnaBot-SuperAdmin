// components/businesses/BusinessQuoteFlowCard.test.jsx

import BusinessQuoteFlowCard from '@/components/businesses/BusinessQuoteFlowCard';
import api from '@/lib/api';
import { mount, flush, buttonByText } from '@/tests/helpers/dom';

jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const readiness = (installed, extra = {}) => ({
  ready: true,
  enabled: false,
  installed,
  acknowledgements: [],
  items: [{ key: 'category', status: 'ok', title: 'Category is travels', detail: 'ok' }],
  ...extra,
});

async function render(r) {
  api.get.mockResolvedValue({ data: { data: r } });
  const view = mount(<BusinessQuoteFlowCard businessId="b1" businessName="Biz" category="travels" />);
  await flush();
  return view;
}

describe('BusinessQuoteFlowCard install state', () => {
  it('dormant: neutral "Installed, not active yet" badge, Enable and Disable, checklist, no error', async () => {
    const { container, unmount } = await render(readiness({ state: 'dormant' }));
    expect(container.textContent).toContain('Installed, not active yet');
    expect(container.textContent).toContain('Category is travels');
    expect(buttonByText(container, 'Enable quote flow')).toBeTruthy();
    expect(buttonByText(container, 'Enable quote flow').disabled).toBe(false);
    expect(buttonByText(container, 'Disable quote flow')).toBeTruthy();
    expect(container.textContent).not.toContain('Failed');
    unmount();
  });

  it('unknown state: safe fallback badge, checklist still shown, no Disable', async () => {
    const { container, unmount } = await render(readiness({ state: 'brand_new_state' }));
    expect(container.textContent).toContain('Install status unknown');
    expect(container.textContent).toContain('Category is travels');
    expect(buttonByText(container, 'Enable quote flow')).toBeTruthy();
    expect(buttonByText(container, 'Disable quote flow')).toBeUndefined();
    unmount();
  });
});
