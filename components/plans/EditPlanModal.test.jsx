// components/plans/EditPlanModal.test.jsx

import EditPlanModal from '@/components/plans/EditPlanModal';
import api from '@/lib/api';
import { mount, click, type, flush, buttonByText } from '@/tests/helpers/dom';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { put: jest.fn() } }));

const plan = {
  _id: 'p1', name: 'pro', displayName: 'Pro', price: 399, isActive: true, isPopular: false,
  msgLimit: 2000, ruleLimit: 50, customerLimit: 500, imagesPerReply: 1, storageLimitMb: 300,
  sortOrder: 0, features: [],
  durationOptions: [
    { months: 1, price: 399, label: 'Monthly', discount: 0 },
    { months: 3, price: 1077, label: 'Quarterly', discount: 10 },
    { months: 6, price: 1915, label: 'Half-Yearly', discount: 20 },
    { months: 12, price: 3352, label: 'Yearly', discount: 30 },
  ],
};

const WARNING = 'Existing subscribers keep their old price. New subscribers pay the new price.';
const field = (c, label) => [...c.querySelectorAll('label')]
  .find((l) => l.textContent.startsWith(label)).parentElement.querySelector('input');

function setup() {
  const onSuccess = jest.fn();
  const view = mount(<EditPlanModal open plan={plan} onClose={jest.fn()} onSuccess={onSuccess} />);
  return { ...view, onSuccess };
}

describe('EditPlanModal', () => {
  beforeEach(() => api.put.mockReset().mockResolvedValue({}));

  it('asks to confirm a monthly price change and saves only after Yes', async () => {
    const { container, onSuccess, unmount } = setup();
    type(field(container, 'Monthly Price'), '499');
    click(buttonByText(container, 'Save Changes'));
    await flush();

    expect(container.textContent).toContain(WARNING);
    expect(container.textContent).toContain('₹399 → ₹499');
    expect(api.put).not.toHaveBeenCalled();

    click(buttonByText(container, 'Yes, save'));
    await flush();
    const [url, payload] = api.put.mock.calls[0];
    expect(url).toBe('/api/admin/plans/p1');
    expect(payload.price).toBe(499);
    expect(payload.durationOptions[1].price).toBe(1347);
    expect(onSuccess).toHaveBeenCalled();
    unmount();
  });

  it('asks to confirm when only a discount changes, and Cancel does not save', async () => {
    const { container, unmount } = setup();
    type(container.querySelector('[aria-label="Yearly discount %"]'), '35');
    click(buttonByText(container, 'Save Changes'));
    await flush();
    expect(container.textContent).toContain(WARNING);
    const cancels = [...container.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Cancel');
    click(cancels[cancels.length - 1]);
    await flush();
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(container.textContent).not.toContain(WARNING);
    expect(api.put).not.toHaveBeenCalled();
    unmount();
  });

  it('saves straight away, without a dialog, when pricing is unchanged', async () => {
    const { container, unmount } = setup();
    type(field(container, 'Display Name'), 'Pro Max');
    click(buttonByText(container, 'Save Changes'));
    await flush();
    expect(container.textContent).not.toContain(WARNING);
    expect(api.put).toHaveBeenCalledTimes(1);
    expect(api.put.mock.calls[0][1].displayName).toBe('Pro Max');
    unmount();
  });
});
