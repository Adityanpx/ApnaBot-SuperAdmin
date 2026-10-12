// components/appRelease/SaveWarningModal.test.jsx

import SaveWarningModal from '@/components/appRelease/SaveWarningModal';
import { mount, click, buttonByText } from '@/tests/helpers/dom';

const base = {
  open: true, onClose: () => {}, onConfirm: () => {}, loading: false,
  minVersion: '2.0.0', blocksOldVersions: false, maintenance: false,
};

describe('SaveWarningModal', () => {
  it('names the minimum version when old versions will be blocked', () => {
    const { unmount } = mount(<SaveWarningModal {...base} blocksOldVersions />);
    expect(document.body.textContent).toContain('Users below 2.0.0 will be blocked');
    expect(document.body.textContent).not.toContain('Maintenance mode is on');
    unmount();
  });

  it('warns everyone when maintenance is turned on', () => {
    const { unmount } = mount(<SaveWarningModal {...base} maintenance />);
    expect(document.body.textContent).toContain('all users');
    expect(document.body.textContent).not.toContain('will be blocked');
    unmount();
  });

  it('confirms and cancels through its buttons', () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    const props = { ...base, blocksOldVersions: true, onConfirm, onClose };
    const { unmount } = mount(<SaveWarningModal {...props} />);
    click(buttonByText(document.body, 'Yes, save'));
    click(buttonByText(document.body, 'Cancel'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('renders nothing when closed', () => {
    const { unmount } = mount(<SaveWarningModal {...base} open={false} />);
    expect(document.body.textContent).not.toContain('Save these changes?');
    unmount();
  });
});
