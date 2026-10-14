// components/plans/Toggle.test.jsx

import Toggle from '@/components/plans/Toggle';
import { mount, click } from '@/tests/helpers/dom';

describe('Toggle', () => {
  it('shows its label and state and reports the flipped value on click', () => {
    const onChange = jest.fn();
    const { container, unmount } = mount(<Toggle label="Popular badge" checked={false} onChange={onChange} />);
    const sw = container.querySelector('[role="switch"]');
    expect(container.textContent).toContain('Popular badge');
    expect(sw.getAttribute('aria-checked')).toBe('false');
    click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
    unmount();
  });
});
