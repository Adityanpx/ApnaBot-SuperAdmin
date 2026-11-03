// components/registrations/RegistrationsTable.test.jsx

import RegistrationsTable from '@/components/registrations/RegistrationsTable';
import { mount, click, type } from '@/tests/helpers/dom';

let mockMobile = false;
jest.mock('@/hooks/useMediaQuery', () => ({ useIsMobile: () => mockMobile }));

const registrations = [
  {
    id: 'u1', name: 'Ravi', email: 'ravi@example.com', phone: '+919284128827', verified: true, isActive: true,
    registeredAt: '2026-10-01T00:00:00Z', daysSince: 33, lastLoginAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'u2', name: 'Asha', email: 'asha@example.com', phone: null, verified: false, isActive: false,
    registeredAt: '2026-11-03T00:00:00Z', daysSince: 0, lastLoginAt: null,
  },
];

function setup(props = {}) {
  const handlers = {
    onSearch: jest.fn(), onIncludeInactive: jest.fn(), onUnverifiedOnly: jest.fn(), onPage: jest.fn(),
  };
  const view = mount(
    <RegistrationsTable
      registrations={registrations} total={2} loading={false} search="" includeInactive={false}
      unverifiedOnly={false} page={1} {...handlers} {...props}
    />
  );
  return { ...view, ...handlers };
}

describe('RegistrationsTable', () => {
  beforeEach(() => { mockMobile = false; });

  it('on a phone shows one card per registration with the same facts and contact links', () => {
    mockMobile = true;
    const { container, unmount } = setup();
    expect(container.querySelector('table')).toBeNull();
    const [first, second] = container.querySelectorAll('li');
    expect(first.textContent).toContain('ravi@example.com');
    expect(first.textContent).toContain('33 days');
    expect(first.querySelector('a[href="https://wa.me/919284128827"]')).not.toBeNull();
    expect(second.textContent).toContain('Never');
    expect(second.textContent).toContain('Inactive');
    unmount();
  });

  it('lists name, email, verified, days since and last login', () => {
    const { container, unmount } = setup();
    const [first, second] = container.querySelectorAll('tbody tr');
    expect(first.textContent).toContain('Ravi');
    expect(first.textContent).toContain('ravi@example.com');
    expect(first.textContent).toContain('Yes');
    expect(first.textContent).toContain('33 days');
    expect(first.textContent).not.toContain('Never');
    expect(second.textContent).toContain('No');
    expect(second.textContent).toContain('today');
    expect(second.textContent).toContain('Never');
    unmount();
  });

  it('gives a phone a call link and a WhatsApp link, and a dash when there is none', () => {
    const { container, unmount } = setup();
    const [first, second] = container.querySelectorAll('tbody tr');
    expect(first.querySelector('a[href="tel:+919284128827"]')).not.toBeNull();
    expect(first.querySelector('a[href="https://wa.me/919284128827"]')).not.toBeNull();
    expect(second.querySelectorAll('a')).toHaveLength(0);
    expect(second.textContent).toContain('-');
    unmount();
  });

  it('marks a deactivated account as Inactive', () => {
    const { container, unmount } = setup();
    const [first, second] = container.querySelectorAll('tbody tr');
    expect(first.textContent).not.toContain('Inactive');
    expect(second.textContent).toContain('Inactive');
    unmount();
  });

  it('reports typed search text and the two switches', () => {
    const { container, onSearch, onUnverifiedOnly, onIncludeInactive, unmount } = setup();
    type(container.querySelector('input'), 'ravi');
    expect(onSearch).toHaveBeenCalledWith('ravi');
    click(container.querySelector('button[aria-label="Unverified only"]'));
    expect(onUnverifiedOnly).toHaveBeenCalledWith(true);
    click(container.querySelector('button[aria-label="Show inactive"]'));
    expect(onIncludeInactive).toHaveBeenCalledWith(true);
    unmount();
  });

  it('shows the switches as on when the filters are on, and turns them off again', () => {
    const { container, onUnverifiedOnly, unmount } = setup({ unverifiedOnly: true });
    const sw = container.querySelector('button[aria-label="Unverified only"]');
    expect(sw.getAttribute('aria-checked')).toBe('true');
    click(sw);
    expect(onUnverifiedOnly).toHaveBeenCalledWith(false);
    unmount();
  });

  it('shows the actions node (Export CSV) next to the filters', () => {
    const { container, unmount } = setup({ actions: <button type="button">Export CSV</button> });
    expect(container.textContent).toContain('Export CSV');
    unmount();
  });

  it('shows one empty state without filters and another with them', () => {
    const plain = setup({ registrations: [], total: 0 });
    expect(plain.container.textContent).toContain('Everyone who registered has a business');
    plain.unmount();
    const filtered = setup({ registrations: [], total: 0, search: 'zzz' });
    expect(filtered.container.textContent).toContain('No registrations match your filters');
    filtered.unmount();
  });

  it('pages through the results', () => {
    const { container, onPage, unmount } = setup({ total: 45 });
    expect(container.textContent).toContain('of 45 results');
    const next = [...container.querySelectorAll('button')].filter((b) => b.textContent.trim() === '2')[0];
    click(next);
    expect(onPage).toHaveBeenCalledWith(2);
    unmount();
  });
});
