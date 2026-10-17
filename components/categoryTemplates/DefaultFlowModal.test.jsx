// components/categoryTemplates/DefaultFlowModal.test.jsx

import DefaultFlowModal from '@/components/categoryTemplates/DefaultFlowModal';
import { mount, click, buttonByText, flush } from '@/tests/helpers/dom';

const template = { _id: 't1', name: 'Salon starter', category: 'salon' };

describe('DefaultFlowModal', () => {
  it('tells the admin what setting a default does and confirms with the template', async () => {
    const onConfirm = jest.fn().mockResolvedValue();
    const onClose = jest.fn();
    const { container, unmount } = mount(
      <DefaultFlowModal open mode="set" template={template} categoryLabel="Salon / Parlour"
        replacing={{ name: 'Old flow' }} onClose={onClose} onConfirm={onConfirm} />
    );
    expect(container.textContent).toContain(
      'New businesses in Salon / Parlour will start with this flow.'
    );
    expect(container.textContent).toContain('Old flow');
    click(buttonByText(container, 'Yes, set default'));
    await flush();
    expect(onConfirm).toHaveBeenCalledWith(template);
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('explains removal and stays open when it fails', async () => {
    const onConfirm = jest.fn().mockRejectedValue(new Error('x'));
    const onClose = jest.fn();
    const { container, unmount } = mount(
      <DefaultFlowModal open mode="unset" template={template} categoryLabel="Salon"
        onClose={onClose} onConfirm={onConfirm} />
    );
    expect(container.textContent).toContain('get the General default instead');
    click(buttonByText(container, 'Yes, remove default'));
    await flush();
    expect(onClose).not.toHaveBeenCalled();
    unmount();
  });
});
