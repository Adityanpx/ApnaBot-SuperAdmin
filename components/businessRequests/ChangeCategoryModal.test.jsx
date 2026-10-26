// components/businessRequests/ChangeCategoryModal.test.jsx

import { act } from 'react';
import ChangeCategoryModal from '@/components/businessRequests/ChangeCategoryModal';
import { mount, click, flush, buttonByText } from '@/tests/helpers/dom';

const row = { id: 'r1', businessId: 'b1', businessName: 'Rangoli Studio', businessCategory: 'general' };
const categories = [
  { value: 'general', label: 'General', emoji: '' },
  { value: 'salon', label: 'Salon', emoji: '' },
  { value: 'multi_brand', label: 'Multi brand', emoji: '' },
];

function setup(onConfirm = jest.fn().mockResolvedValue({})) {
  const onChanged = jest.fn();
  const onClose = jest.fn();
  const view = mount(
    <ChangeCategoryModal
      open row={row} categories={categories} onClose={onClose} onConfirm={onConfirm} onChanged={onChanged}
    />,
  );
  return { ...view, onConfirm, onChanged, onClose };
}

const pick = (value) => {
  const select = document.body.querySelector('select');
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
  act(() => {
    setter.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

describe('ChangeCategoryModal', () => {
  it('does not offer multi_brand', () => {
    const { unmount } = setup();
    const values = [...document.body.querySelectorAll('option')].map((o) => o.value);
    expect(values).toContain('salon');
    expect(values).not.toContain('multi_brand');
    unmount();
  });

  it('keeps the button disabled until a different category is picked', () => {
    const { unmount } = setup();
    const button = () => buttonByText(document.body, 'Change category');
    expect(button().disabled).toBe(true);
    pick('general');
    expect(button().disabled).toBe(true);
    pick('salon');
    expect(button().disabled).toBe(false);
    unmount();
  });

  it('changes the business category and reports it', async () => {
    const { onConfirm, onChanged, unmount } = setup();
    pick('salon');
    click(buttonByText(document.body, 'Change category'));
    await flush();
    expect(onConfirm).toHaveBeenCalledWith('b1', 'salon');
    expect(onChanged).toHaveBeenCalledWith(row, 'salon');
    unmount();
  });

  it('does not report a change when it fails', async () => {
    const { onChanged, unmount } = setup(jest.fn().mockRejectedValue(new Error('no')));
    pick('salon');
    click(buttonByText(document.body, 'Change category'));
    await flush();
    expect(onChanged).not.toHaveBeenCalled();
    unmount();
  });
});
