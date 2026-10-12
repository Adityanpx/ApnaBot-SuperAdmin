// components/appRelease/AppReleaseForm.test.jsx

import AppReleaseForm from '@/components/appRelease/AppReleaseForm';
import { mount, click, type, flush, buttonByText } from '@/tests/helpers/dom';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const data = {
  androidMinVersion: '1.0.0',
  androidLatestVersion: '1.5.0',
  forceUpdate: false,
  maintenanceMode: false,
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.apnabot.app',
  updatedAt: null,
  updatedBy: null,
};

const inputs = (c) => c.querySelectorAll('input');
const saveButton = (c) => buttonByText(c, 'Save');

function setup(onSave = jest.fn().mockResolvedValue({})) {
  const view = mount(<AppReleaseForm data={data} onSave={onSave} />);
  return { ...view, onSave };
}

describe('AppReleaseForm', () => {
  it('starts with Save disabled because nothing changed', () => {
    const { container, unmount } = setup();
    expect(saveButton(container).disabled).toBe(true);
    unmount();
  });

  it('shows an inline error and keeps Save disabled for a bad version', () => {
    const { container, unmount } = setup();
    type(inputs(container)[0], '1.0');
    expect(container.textContent).toContain('Use x.y.z');
    expect(saveButton(container).disabled).toBe(true);
    unmount();
  });

  it('rejects a minimum above the latest version', () => {
    const { container, unmount } = setup();
    type(inputs(container)[0], '2.0.0');
    expect(container.textContent).toContain('Cannot be higher than the latest');
    unmount();
  });

  it('saves a plain change without the dialog', async () => {
    const { container, onSave, unmount } = setup();
    type(inputs(container)[1], '1.6.0');
    click(saveButton(container));
    await flush();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ androidLatestVersion: '1.6.0' }));
    expect(document.body.textContent).not.toContain('Save these changes?');
    unmount();
  });

  it('asks first when force update is turned on, and saves only after confirming', async () => {
    const { container, onSave, unmount } = setup();
    click(container.querySelector('[aria-label="Force update"]'));
    click(saveButton(container));
    expect(onSave).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain('Users below 1.0.0 will be blocked');
    click(buttonByText(document.body, 'Yes, save'));
    await flush();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ forceUpdate: true }));
    unmount();
  });

  it('asks first when maintenance mode is turned on', () => {
    const { container, onSave, unmount } = setup();
    click(container.querySelector('[aria-label="Maintenance mode"]'));
    click(saveButton(container));
    expect(document.body.textContent).toContain('all users');
    expect(onSave).not.toHaveBeenCalled();
    unmount();
  });
});
