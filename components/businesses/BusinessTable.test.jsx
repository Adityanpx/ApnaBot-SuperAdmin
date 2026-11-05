// components/businesses/BusinessTable.test.jsx

import BusinessTable from '@/components/businesses/BusinessTable';
import { mount } from '@/tests/helpers/dom';

let mockMobile = false;
jest.mock('@/hooks/useMediaQuery', () => ({ useIsMobile: () => mockMobile }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/hooks/useCategoryOptions', () => ({
  useCategoryOptions: () => ({ labelOf: (v) => ({ cab: 'Cab', salon: 'Salon' }[v] || v) }),
}));

const base = {
  isActive: true, createdAt: '2026-10-01T00:00:00Z', ownerUserId: { name: 'Ravi', email: 'ravi@example.com' },
  ownerPhone: '+919284128827', subCategories: [],
};
const businesses = [
  {
    ...base, _id: 'b1', name: 'Sai Travels', businessCategory: 'travels', isWhatsappConnected: true,
    plan: { id: 'p1', name: 'pro', displayName: 'Pro' }, subscriptionStatus: 'active',
  },
  {
    ...base, _id: 'b2', name: 'Cafe Katta', businessCategory: 'general', requestedCategoryText: 'Hotel',
    isWhatsappConnected: false, plan: null, subscriptionStatus: null,
  },
  {
    ...base, _id: 'b3', name: 'Mix Co', businessCategory: 'multi_brand', subCategories: ['cab', 'salon'],
    isWhatsappConnected: false, plan: { id: 'p2', name: 'trial', displayName: null }, subscriptionStatus: 'trial',
  },
];

const setup = () => mount(<BusinessTable businesses={businesses} loading={false} onToggle={jest.fn()} onDelete={jest.fn()} />);

describe('BusinessTable', () => {
  beforeEach(() => { mockMobile = false; });

  it('has WhatsApp and Plan columns, and no separate Subscription column', () => {
    const { container, unmount } = setup();
    const heads = [...container.querySelectorAll('thead th')].map((th) => th.textContent);
    expect(heads).toEqual(expect.arrayContaining(['WhatsApp', 'Plan', 'Created', 'Actions']));
    expect(heads).not.toContain('Subscription');
    expect(heads).toHaveLength(9);
    unmount();
  });

  it('shows connection, plan and subscription status for a subscribed business', () => {
    const { container, unmount } = setup();
    const row = container.querySelectorAll('tbody tr')[0];
    expect(row.textContent).toContain('Connected');
    expect(row.textContent).not.toContain('Not connected');
    expect(row.textContent).toContain('Pro');
    expect(row.textContent).toContain('Active');
    unmount();
  });

  it('shows "-" for the plan when there is no live subscription', () => {
    const { container, unmount } = setup();
    const cells = [...container.querySelectorAll('tbody tr')[1].querySelectorAll('td')].map((td) => td.textContent);
    expect(cells).toContain('Not connected');
    expect(cells.filter((t) => t === '-')).toHaveLength(1);
    unmount();
  });

  it('falls back to the plan name and shows a Trial status', () => {
    const { container, unmount } = setup();
    const row = container.querySelectorAll('tbody tr')[2];
    expect(row.textContent).toContain('trial');
    expect(row.textContent).toContain('Trial');
    unmount();
  });

  it('shows the typed category under General and the sub-categories under Multi_brand', () => {
    const { container, unmount } = setup();
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).not.toContain('Hotel');
    expect(rows[1].textContent).toContain('Hotel');
    expect(rows[2].textContent).toContain('Cab, Salon');
    unmount();
  });

  it('on a phone shows the same facts on each card', () => {
    mockMobile = true;
    const { container, unmount } = setup();
    expect(container.querySelector('table')).toBeNull();
    const [first, second, third] = container.querySelectorAll('li');
    expect(first.textContent).toContain('Connected');
    expect(first.textContent).toContain('Pro');
    expect(second.textContent).toContain('Hotel');
    expect(second.textContent).toContain('Not connected');
    expect(third.textContent).toContain('Cab, Salon');
    unmount();
  });
});
