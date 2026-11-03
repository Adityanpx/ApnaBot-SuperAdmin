// components/businesses/BusinessFilters.test.jsx

import { act } from 'react';
import BusinessFilters from '@/components/businesses/BusinessFilters';
import { mount, click, buttonByText } from '@/tests/helpers/dom';

const filtersButton = (root) => [...root.querySelectorAll('button')].find((b) => b.textContent.startsWith('Filters'));

let mockMobile = false;
jest.mock('@/hooks/useMediaQuery', () => ({ useIsMobile: () => mockMobile }));
jest.mock('@/hooks/useCategoryOptions', () => ({
  useCategoryOptions: () => ({ categories: [{ value: 'salon', label: 'Salon', emoji: '' }] }),
}));

function choose(select, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  act(() => {
    setter.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function setup(props = {}) {
  const handlers = {
    onSearchChange: jest.fn(), onActiveChange: jest.fn(), onTypeChange: jest.fn(), onConnectedChange: jest.fn(),
  };
  const view = mount(
    <BusinessFilters search="" isActive="" businessType="" connected="" totalBusinesses={3} {...handlers} {...props} />
  );
  return { ...view, ...handlers };
}

describe('BusinessFilters WhatsApp filter', () => {
  beforeEach(() => { mockMobile = false; });

  it('offers all / connected / not connected and reports the choice', () => {
    const { container, onConnectedChange, unmount } = setup();
    const select = container.querySelector('select[aria-label="WhatsApp connection"]');
    expect([...select.options].map((o) => o.value)).toEqual(['', 'true', 'false']);
    choose(select, 'false');
    expect(onConnectedChange).toHaveBeenCalledWith('false');
    unmount();
  });

  it('shows the current choice', () => {
    const { container, unmount } = setup({ connected: 'true' });
    expect(container.querySelector('select[aria-label="WhatsApp connection"]').value).toBe('true');
    unmount();
  });

  it('on a phone the sheet applies the WhatsApp choice with the other filters', () => {
    mockMobile = true;
    const { container, onConnectedChange, unmount } = setup();
    click(filtersButton(container));
    // The sheet's select is the WhatsApp one that is not the always-mounted desktop select
    const select = [...container.querySelectorAll('select:not([aria-label])')].find((el) => [...el.options].some((o) => o.text === 'Not connected'));
    choose(select, 'false');
    click(buttonByText(container, 'Apply'));
    expect(onConnectedChange).toHaveBeenCalledWith('false');
    unmount();
  });

  it('counts an active WhatsApp filter on the phone Filters button', () => {
    mockMobile = true;
    const { container, unmount } = setup({ connected: 'true' });
    expect(filtersButton(container).textContent).toBe('Filters1· 3');
    unmount();
  });
});
