// components/businesses/OwnerPhone.test.jsx

import OwnerPhone from '@/components/businesses/OwnerPhone';
import { mount } from '@/tests/helpers/dom';

describe('OwnerPhone', () => {
  it('shows a dash and no links when there is no phone', () => {
    const { container, unmount } = mount(<OwnerPhone phone="" />);
    expect(container.textContent).toBe('-');
    expect(container.querySelectorAll('a')).toHaveLength(0);
    unmount();
  });

  it('links the number to tel: and a WhatsApp chat', () => {
    const { container, unmount } = mount(<OwnerPhone phone="+919284128827" />);
    const [call, chat] = container.querySelectorAll('a');
    expect(call.getAttribute('href')).toBe('tel:+919284128827');
    expect(call.textContent).toBe('+919284128827');
    expect(chat.getAttribute('href')).toBe('https://wa.me/919284128827');
    expect(chat.getAttribute('target')).toBe('_blank');
    expect(chat.getAttribute('rel')).toContain('noopener');
    unmount();
  });
});
