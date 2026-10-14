// components/plans/PriceChangeModal.test.jsx

import PriceChangeModal from '@/components/plans/PriceChangeModal';
import { mount, click, buttonByText } from '@/tests/helpers/dom';

const change = {
  oldMonthly: 399,
  newMonthly: 499,
  tiers: [{ months: 3, label: 'Quarterly', oldPrice: 1077, newPrice: 1347 }],
};

describe('PriceChangeModal', () => {
  it('shows the required warning and the old and new prices', () => {
    const { container, unmount } = mount(
      <PriceChangeModal open change={change} onClose={jest.fn()} onConfirm={jest.fn()} />
    );
    expect(container.textContent).toContain(
      'Existing subscribers keep their old price. New subscribers pay the new price.'
    );
    expect(container.textContent).toContain('₹399 → ₹499');
    expect(container.textContent).toContain('₹1,077 → ₹1,347');
    unmount();
  });

  it('confirms and cancels through its buttons', () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const { container, unmount } = mount(
      <PriceChangeModal open change={change} onClose={onClose} onConfirm={onConfirm} />
    );
    click(buttonByText(container, 'Yes, save'));
    click(buttonByText(container, 'Cancel'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('renders nothing without a change', () => {
    const { container, unmount } = mount(
      <PriceChangeModal open change={null} onClose={jest.fn()} onConfirm={jest.fn()} />
    );
    expect(container.textContent).toBe('');
    unmount();
  });
});
