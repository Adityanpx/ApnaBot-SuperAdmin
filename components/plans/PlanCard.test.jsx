// components/plans/PlanCard.test.jsx

import PlanCard from '@/components/plans/PlanCard';
import { mount } from '@/tests/helpers/dom';

const base = {
  _id: 'p1', name: 'basic', displayName: 'Basic', price: 100, isActive: true,
  msgLimit: 500, ruleLimit: 10, customerLimit: 100, imagesPerReply: 1,
  storageLimitMb: 150, features: ['Unlimited chats'],
  durationOptions: [
    { months: 1, price: 999, label: 'Monthly', discount: 0 },
    { months: 3, price: 1, label: 'Quarterly', discount: 10 },
  ],
};

const render = (plan) => mount(<PlanCard plan={plan} onEdit={jest.fn()} onDelete={jest.fn()} />);

describe('PlanCard', () => {
  it('headline and Pricing list agree even when stored amounts are stale', () => {
    const { container, unmount } = render(base);
    const text = container.textContent;
    expect(text).toContain('₹100/mo');
    expect(text).toContain('Monthly₹100');
    expect(text).toContain('Quarterly₹270-10%');
    expect(text).toContain('Yearly₹840-30%');
    expect(text).not.toContain('₹999');
    unmount();
  });

  it('shows the Popular badge from isPopular, not from the plan name', () => {
    const popular = render({ ...base, isPopular: true });
    expect(popular.container.textContent).toContain('Popular');
    popular.unmount();
    const pro = render({ ...base, name: 'pro', isPopular: false });
    expect(pro.container.textContent).not.toContain('Popular');
    pro.unmount();
  });

  it('shows features and the storage limit', () => {
    const { container, unmount } = render(base);
    expect(container.textContent).toContain('Unlimited chats');
    expect(container.textContent).toContain('150 MB');
    unmount();
  });
});
