// components/ui/Switch.test.jsx

import Switch from '@/components/ui/Switch';
import { mount, click } from '@/tests/helpers/dom';

describe('Switch', () => {
  it('reflects the checked state and name', () => {
    const { container, unmount } = mount(
      <Switch checked label="Force update" onChange={() => {}} />
    );
    const el = container.querySelector('[role="switch"]');
    expect(el.getAttribute('aria-checked')).toBe('true');
    expect(el.getAttribute('aria-label')).toBe('Force update');
    unmount();
  });

  it('calls onChange with the opposite value when clicked', () => {
    const onChange = jest.fn();
    const { container, unmount } = mount(<Switch checked={false} label="x" onChange={onChange} />);
    click(container.querySelector('button'));
    expect(onChange).toHaveBeenCalledWith(true);
    unmount();
  });

  it('does not fire while disabled', () => {
    const onChange = jest.fn();
    const { container, unmount } = mount(<Switch checked label="x" disabled onChange={onChange} />);
    click(container.querySelector('button'));
    expect(onChange).not.toHaveBeenCalled();
    unmount();
  });
});
