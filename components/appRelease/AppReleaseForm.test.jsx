// components/appRelease/AppReleaseForm.test.jsx

import { act } from 'react';
import AppReleaseForm from '@/components/appRelease/AppReleaseForm';
import { mount, click, type, flush, buttonByText } from '@/tests/helpers/dom';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const data = {
  androidMinVersion: '1.0.0',
  androidLatestVersion: '1.5.0',
  forceUpdate: false,
  maintenanceMode: false,
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.apnabot.app',
  translateMonthlyCharCap: 20000,
  translateGlobalMonthlyCap: 1800000,
  supportWhatsappNumber: '',
  supportMessage: 'Hi, I need help with ApnaBot. Business: {{businessName}}, email: {{email}}',
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

  it('saves an edited translate cap as a number', async () => {
    const { container, onSave, unmount } = setup();
    type(inputs(container)[3], '50000');
    click(saveButton(container));
    await flush();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      translateMonthlyCharCap: 50000, translateGlobalMonthlyCap: 1800000,
    }));
    unmount();
  });

  it('rejects a non-numeric translate cap', () => {
    const { container, unmount } = setup();
    type(inputs(container)[4], '12.5');
    expect(container.textContent).toContain('Whole number');
    expect(saveButton(container).disabled).toBe(true);
    unmount();
  });

  it('saves the support number as digits with country code, and shows a test link', async () => {
    const { container, onSave, unmount } = setup();
    expect(container.textContent).toContain('Enter a valid number');
    type(inputs(container)[5], '+91 98765 43210');
    const link = [...container.querySelectorAll('a')].find((a) => a.textContent.includes('Test link'));
    expect(link.getAttribute('href').startsWith('https://wa.me/919876543210?text=')).toBe(true);
    expect(decodeURIComponent(link.getAttribute('href'))).toContain('Business: Test Business, email: test@example.com');
    click(saveButton(container));
    await flush();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ supportWhatsappNumber: '919876543210' }));
    unmount();
  });

  it('rejects a bad support number and a blank support message', () => {
    const { container, unmount } = setup();
    type(inputs(container)[5], '12345');
    expect(container.textContent).toContain('10 digits');
    expect(saveButton(container).disabled).toBe(true);
    type(inputs(container)[5], '');
    const area = container.querySelector('textarea');
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    act(() => { setter.call(area, '   '); area.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(container.textContent).toContain('1 to 500 characters');
    expect(saveButton(container).disabled).toBe(true);
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
