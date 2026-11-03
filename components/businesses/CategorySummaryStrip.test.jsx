// components/businesses/CategorySummaryStrip.test.jsx

import CategorySummaryStrip from '@/components/businesses/CategorySummaryStrip';
import { mount, click, buttonByText } from '@/tests/helpers/dom';

const categories = [
  { value: 'travels', label: 'Travels', count: 4 },
  { value: 'salon', label: 'Salon', count: 2 },
];

function setup(props = {}) {
  const onSelect = jest.fn();
  const view = mount(
    <CategorySummaryStrip total={6} categories={categories} selected="" onSelect={onSelect} {...props} />
  );
  return { ...view, onSelect };
}

describe('CategorySummaryStrip', () => {
  it('shows the total and one chip per category with its count', () => {
    const { container, unmount } = setup();
    expect(container.textContent).toContain('All 6');
    expect(container.textContent).toContain('Travels 4');
    expect(container.textContent).toContain('Salon 2');
    unmount();
  });

  it('renders nothing while there are no categories', () => {
    const { container, unmount } = setup({ categories: [], total: 0 });
    expect(container.querySelector('[role="group"]')).toBeNull();
    unmount();
  });

  it('filters to the clicked category', () => {
    const { container, onSelect, unmount } = setup();
    click(buttonByText(container, 'Salon 2'));
    expect(onSelect).toHaveBeenCalledWith('salon');
    unmount();
  });

  it('marks the selected chip and clears the filter when it is clicked again or All is', () => {
    const { container, onSelect, unmount } = setup({ selected: 'salon' });
    expect(buttonByText(container, 'Salon 2').getAttribute('aria-pressed')).toBe('true');
    expect(buttonByText(container, 'Travels 4').getAttribute('aria-pressed')).toBe('false');
    click(buttonByText(container, 'Salon 2'));
    expect(onSelect).toHaveBeenLastCalledWith('');
    click(buttonByText(container, 'All 6'));
    expect(onSelect).toHaveBeenLastCalledWith('');
    unmount();
  });
});
