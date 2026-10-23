// components/businessCategories/BusinessCategoryFormModal.test.jsx

import BusinessCategoryFormModal from '@/components/businessCategories/BusinessCategoryFormModal';
import { mount, click, type, buttonByText, flush } from '@/tests/helpers/dom';

const input = (c, label) => {
  const el = [...c.querySelectorAll('label')].find((l) => l.textContent.replace('*', '').trim() === label);
  return el.parentElement.querySelector('input');
};

describe('BusinessCategoryFormModal', () => {
  it('suggests the slug from the label until the slug is edited by hand', () => {
    const { container, unmount } = mount(<BusinessCategoryFormModal open onClose={() => {}} onSave={jest.fn()} />);
    type(input(container, 'English label'), 'Pet Shop');
    expect(input(container, 'Value (slug)').value).toBe('pet_shop');
    type(input(container, 'Value (slug)'), 'pets');
    type(input(container, 'English label'), 'Pet Store');
    expect(input(container, 'Value (slug)').value).toBe('pets');
    unmount();
  });

  it('blocks an invalid slug and does not call onSave', async () => {
    const onSave = jest.fn();
    const { container, unmount } = mount(<BusinessCategoryFormModal open onClose={() => {}} onSave={onSave} />);
    type(input(container, 'English label'), 'Pet Shop');
    type(input(container, 'Value (slug)'), 'Pet-Shop');
    click(buttonByText(container, 'Add category'));
    await flush();
    expect(onSave).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Lowercase letters, digits and _ only');
    unmount();
  });

  it('creates a disabled category by default and closes on success', async () => {
    const onSave = jest.fn().mockResolvedValue({});
    const onClose = jest.fn();
    const { container, unmount } = mount(<BusinessCategoryFormModal open onClose={onClose} onSave={onSave} />);
    type(input(container, 'English label'), 'Pet Shop');
    click(buttonByText(container, 'Add category'));
    await flush();
    expect(onSave).toHaveBeenCalledWith(null, expect.objectContaining({ value: 'pet_shop', isEnabled: false }));
    expect(onClose).toHaveBeenCalled();
    unmount();
  });

  it('shows a server error (409) inline and stays open', async () => {
    const onSave = jest.fn().mockRejectedValue({ userMessage: 'Category "pet_shop" already exists' });
    const onClose = jest.fn();
    const { container, unmount } = mount(<BusinessCategoryFormModal open onClose={onClose} onSave={onSave} />);
    type(input(container, 'English label'), 'Pet Shop');
    click(buttonByText(container, 'Add category'));
    await flush();
    expect(container.querySelector('[role="alert"]').textContent).toContain('already exists');
    expect(onClose).not.toHaveBeenCalled();
    unmount();
  });

  it('edit locks the value and sends no value in the body', async () => {
    const onSave = jest.fn().mockResolvedValue({});
    const category = { value: 'salon', label: 'Salon', emoji: '', isEnabled: true, displayOrder: 2 };
    const { container, unmount } = mount(
      <BusinessCategoryFormModal open onClose={() => {}} category={category} onSave={onSave} />
    );
    expect(input(container, 'Value (slug)').disabled).toBe(true);
    type(input(container, 'English label'), 'Salon & Spa');
    expect(input(container, 'Value (slug)').value).toBe('salon');
    click(buttonByText(container, 'Save changes'));
    await flush();
    const [value, body] = onSave.mock.calls[0];
    expect(value).toBe('salon');
    expect(body).not.toHaveProperty('value');
    expect(body.label).toBe('Salon & Spa');
    unmount();
  });
});
