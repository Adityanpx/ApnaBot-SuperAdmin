// components/businessRequests/EditRequestModal.test.jsx

import { act } from 'react';
import EditRequestModal from '@/components/businessRequests/EditRequestModal';
import { mount, click, flush, buttonByText } from '@/tests/helpers/dom';

const row = {
  id: 'r1', businessId: 'b1', businessName: 'Rangoli Studio', requestedText: 'Rangoli artist',
  status: 'new', notes: '',
};

function setup() {
  const onSave = jest.fn().mockResolvedValue();
  const onClose = jest.fn();
  const view = mount(<EditRequestModal open row={row} onClose={onClose} onSave={onSave} />);
  return { ...view, onSave, onClose };
}

const set = (el, proto, value, event) => {
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  act(() => { setter.call(el, value); el.dispatchEvent(new Event(event, { bubbles: true })); });
};

describe('EditRequestModal', () => {
  it('keeps Save disabled until something changes', () => {
    const { unmount } = setup();
    expect(buttonByText(document.body, 'Save').disabled).toBe(true);
    unmount();
  });

  it('saves only the changed status and closes', async () => {
    const { onSave, onClose, unmount } = setup();
    set(document.body.querySelector('select'), HTMLSelectElement.prototype, 'contacted', 'change');
    click(buttonByText(document.body, 'Save'));
    await flush();
    expect(onSave).toHaveBeenCalledWith('r1', { status: 'contacted' });
    expect(onClose).toHaveBeenCalled();
    unmount();
  });

  it('saves trimmed notes', async () => {
    const { onSave, unmount } = setup();
    set(document.body.querySelector('textarea'), HTMLTextAreaElement.prototype, '  called  ', 'input');
    click(buttonByText(document.body, 'Save'));
    await flush();
    expect(onSave).toHaveBeenCalledWith('r1', { notes: 'called' });
    unmount();
  });

  it('blocks notes over the server limit', () => {
    const { unmount } = setup();
    set(document.body.querySelector('textarea'), HTMLTextAreaElement.prototype, 'x'.repeat(2001), 'input');
    expect(document.body.textContent).toContain('Max 2000');
    expect(buttonByText(document.body, 'Save').disabled).toBe(true);
    unmount();
  });
});
