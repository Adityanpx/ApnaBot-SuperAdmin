// components/categoryTemplates/CreateDefaultFlowModal.test.jsx

import CreateDefaultFlowModal from '@/components/categoryTemplates/CreateDefaultFlowModal';
import { mount, click, buttonByText, flush } from '@/tests/helpers/dom';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/components/categoryTemplates/BusinessPicker', () => ({
  __esModule: true,
  default: ({ onChange }) => (
    <button onClick={() => onChange({ _id: 'b1', name: 'Glow', businessCategory: 'salon' })}>
      pick-glow
    </button>
  ),
}));

describe('CreateDefaultFlowModal', () => {
  it('clones the picked business, then sets the new template as default', async () => {
    const cloneFromBusiness = jest.fn().mockResolvedValue({
      _id: 't9', id: 't9', warnings: [{ nodeId: 'n1', key: 'welcome', matched: 'Glow' }],
    });
    const setDefault = jest.fn().mockResolvedValue();
    const onClose = jest.fn();
    const { container, unmount } = mount(
      <CreateDefaultFlowModal
        open
        onClose={onClose}
        cloneFromBusiness={cloneFromBusiness}
        setDefault={setDefault}
      />
    );
    expect(buttonByText(container, 'Clone as template').disabled).toBe(true);
    click(buttonByText(container, 'pick-glow'));
    click(buttonByText(container, 'Clone as template'));
    await flush();
    expect(cloneFromBusiness).toHaveBeenCalledWith({
      businessId: 'b1', category: 'salon', name: 'Salon / Parlour default',
    });
    expect(container.textContent).toContain('1 reply node(s) mention the business name');
    expect(container.textContent).toContain('New businesses in Salon / Parlour will start');
    click(buttonByText(container, 'Yes, set as default'));
    await flush();
    expect(setDefault).toHaveBeenCalledWith('t9');
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('stays on step 1 when cloning fails', async () => {
    const cloneFromBusiness = jest.fn().mockRejectedValue(new Error('x'));
    const { container, unmount } = mount(
      <CreateDefaultFlowModal
        open
        onClose={jest.fn()}
        cloneFromBusiness={cloneFromBusiness}
        setDefault={jest.fn()}
      />
    );
    click(buttonByText(container, 'pick-glow'));
    click(buttonByText(container, 'Clone as template'));
    await flush();
    expect(container.textContent).toContain('Step 1 of 2');
    unmount();
  });
});
