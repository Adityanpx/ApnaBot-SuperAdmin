// components/businessRequests/BusinessRequestsTable.test.jsx

import BusinessRequestsTable from '@/components/businessRequests/BusinessRequestsTable';
import { mount, click, buttonByText } from '@/tests/helpers/dom';

const requests = [
  {
    id: 'r1', _id: 'r1', businessId: 'b1', businessName: 'Rangoli Studio', businessCategory: 'general',
    requestedText: 'Rangoli artist', contactPhone: '919876543210', ownerName: 'Asha',
    ownerEmail: 'asha@example.com', status: 'new', notes: 'call after 5', createdAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'r2', _id: 'r2', businessId: 'b2', businessName: 'Petal Co', businessCategory: 'general',
    requestedText: 'Florist', contactPhone: null, ownerName: 'Ravi',
    ownerEmail: 'ravi@example.com', status: 'set_up', notes: null, createdAt: '2026-10-02T00:00:00Z',
  },
];

function setup(props = {}) {
  const handlers = { onEdit: jest.fn(), onChangeCategory: jest.fn(), onPage: jest.fn() };
  const view = mount(
    <BusinessRequestsTable
      requests={requests} total={2} loading={false} filtered={false} page={1} {...handlers} {...props}
    />,
  );
  return { ...view, ...handlers };
}

describe('BusinessRequestsTable', () => {
  beforeEach(() => { window.open = jest.fn(); });

  it('shows the contact phone, requested text, notes and status', () => {
    const { container, unmount } = setup();
    expect(container.textContent).toContain('+919876543210');
    expect(container.textContent).toContain('Rangoli artist');
    expect(container.textContent).toContain('call after 5');
    expect(container.textContent).toContain('New');
    expect(container.textContent).toContain('Set up');
    unmount();
  });

  it('opens WhatsApp on the contact phone with the greeting', () => {
    const { container, unmount } = setup();
    click(buttonByText(container, 'WhatsApp'));
    const [url] = window.open.mock.calls[0];
    expect(url.startsWith('https://wa.me/919876543210?text=')).toBe(true);
    expect(decodeURIComponent(url)).toContain('about your Rangoli Studio setup');
    unmount();
  });

  it('disables WhatsApp for a request without a phone', () => {
    const { container, unmount } = setup();
    const buttons = [...container.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'WhatsApp');
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[1].disabled).toBe(true);
    unmount();
  });

  it('passes the row to Edit and Change category', () => {
    const { container, onEdit, onChangeCategory, unmount } = setup();
    click(container.querySelector('tbody tr button:nth-of-type(2)'));
    click(container.querySelector('tbody tr button:nth-of-type(3)'));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1', businessId: 'b1' }));
    expect(onChangeCategory).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
    unmount();
  });

  it('says why it is empty', () => {
    const a = setup({ requests: [] });
    expect(a.container.textContent).toContain('No business requests yet');
    a.unmount();
    const b = setup({ requests: [], filtered: true });
    expect(b.container.textContent).toContain('No requests with this status');
    b.unmount();
  });
});
