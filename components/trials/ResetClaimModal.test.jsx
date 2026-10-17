// components/trials/ResetClaimModal.test.jsx

import { act } from 'react';
import ResetClaimModal from '@/components/trials/ResetClaimModal';
import { mount, click, buttonByText, flush } from '@/tests/helpers/dom';

const claim = { id: 'c1', phone: '+910000000001', businessName: 'Glow' };

function typeReason(container, value) {
  const area = container.querySelector('textarea');
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  act(() => {
    setter.call(area, value);
    area.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('ResetClaimModal', () => {
  it('cannot be confirmed without a reason', () => {
    const onConfirm = jest.fn();
    const { container, unmount } = mount(
      <ResetClaimModal open claim={claim} onClose={jest.fn()} onConfirm={onConfirm} />
    );
    expect(buttonByText(container, 'Reset claim').disabled).toBe(true);
    typeReason(container, ' a ');
    expect(buttonByText(container, 'Reset claim').disabled).toBe(true);
    unmount();
  });

  it('confirms with the claim id and the trimmed reason, then closes', async () => {
    const onConfirm = jest.fn().mockResolvedValue();
    const onClose = jest.fn();
    const { container, unmount } = mount(
      <ResetClaimModal open claim={claim} onClose={onClose} onConfirm={onConfirm} />
    );
    typeReason(container, ' Wrong number ');
    click(buttonByText(container, 'Reset claim'));
    await flush();
    expect(onConfirm).toHaveBeenCalledWith('c1', 'Wrong number');
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('stays open when the reset fails', async () => {
    const onClose = jest.fn();
    const { container, unmount } = mount(
      <ResetClaimModal open claim={claim} onClose={onClose}
        onConfirm={jest.fn().mockRejectedValue(new Error('x'))} />
    );
    typeReason(container, 'Because');
    click(buttonByText(container, 'Reset claim'));
    await flush();
    expect(onClose).not.toHaveBeenCalled();
    unmount();
  });
});
