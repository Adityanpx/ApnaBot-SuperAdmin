// components/plans/CreatePlanModal.test.jsx

import CreatePlanModal from '@/components/plans/CreatePlanModal';
import api from '@/lib/api';
import { mount, click, type, flush, buttonByText } from '@/tests/helpers/dom';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { post: jest.fn() } }));

const field = (c, label) => [...c.querySelectorAll('label')]
  .find((l) => l.textContent.startsWith(label)).parentElement.querySelector('input');

function setup() {
  const onSuccess = jest.fn();
  const onClose = jest.fn();
  const view = mount(<CreatePlanModal open onClose={onClose} onSuccess={onSuccess} />);
  return { ...view, onSuccess, onClose };
}

describe('CreatePlanModal', () => {
  beforeEach(() => api.post.mockReset().mockResolvedValue({}));

  it('honours the Active toggle and sends the new fields', async () => {
    const { container, onSuccess, unmount } = setup();
    type(field(container, 'Internal ID'), 'Gold');
    type(field(container, 'Display Name'), 'Gold');
    type(field(container, 'Monthly Price'), '200');
    type(field(container, 'Display order'), '3');
    type(field(container, 'Media storage'), '500');
    click(container.querySelector('[aria-label="Active (visible to customers)"]'));
    click(container.querySelector('[aria-label="Popular badge"]'));
    click(buttonByText(container, 'Create Plan'));
    await flush();

    const [, payload] = api.post.mock.calls[0];
    expect(payload).toMatchObject({
      name: 'gold', price: 200, isActive: false, isPopular: true, sortOrder: 3, storageLimitMb: 500,
    });
    expect(payload.durationOptions.map((o) => o.price)).toEqual([200, 540, 960, 1680]);
    expect(onSuccess).toHaveBeenCalled();
    unmount();
  });

  it('shows the server broadcast-limit message inline, not as a toast', async () => {
    const message = 'broadcastRecipientLimit must be a whole number from 1, or -1 for unlimited';
    api.post.mockRejectedValue({ userMessage: message });
    const { container, unmount } = setup();
    type(field(container, 'Internal ID'), 'gold');
    type(field(container, 'Display Name'), 'Gold');
    type(field(container, 'Monthly Price'), '200');
    type(field(container, 'Broadcast recipients'), '50');
    click(buttonByText(container, 'Create Plan'));
    await flush();
    expect(container.textContent).toContain(message);
    unmount();
  });

  it('does not call the API when the form is invalid', async () => {
    const { container, unmount } = setup();
    click(buttonByText(container, 'Create Plan'));
    await flush();
    expect(api.post).not.toHaveBeenCalled();
    unmount();
  });
});
