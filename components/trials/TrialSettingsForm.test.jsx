// components/trials/TrialSettingsForm.test.jsx

import TrialSettingsForm from '@/components/trials/TrialSettingsForm';
import { mount, click, type, buttonByText, flush } from '@/tests/helpers/dom';

const plans = [
  { _id: 'p1', displayName: 'Basic', isActive: true },
  { _id: 'p2', displayName: 'Pro', isActive: true },
  { _id: 'p3', displayName: 'Retired', isActive: false },
];
const settings = { trialEnabled: true, trialDays: 7, trialPlanId: 'p1', trialPlanIsDefault: true };

describe('TrialSettingsForm', () => {
  it('sends only the switch and days when the plan is unchanged', async () => {
    const onSave = jest.fn().mockResolvedValue();
    const { container, unmount } = mount(
      <TrialSettingsForm settings={settings} plans={plans} onSave={onSave} />
    );
    expect(container.textContent).toContain('Pro');
    expect(container.textContent).not.toContain('Retired');
    type(container.querySelector('input[type="number"]'), '30');
    click(buttonByText(container, 'Save settings'));
    await flush();
    expect(onSave).toHaveBeenCalledWith({ trialEnabled: true, trialDays: 30 });
    unmount();
  });

  it('blocks saving invalid days and shows the message', async () => {
    const onSave = jest.fn();
    const { container, unmount } = mount(
      <TrialSettingsForm settings={settings} plans={plans} onSave={onSave} />
    );
    type(container.querySelector('input[type="number"]'), '0');
    click(buttonByText(container, 'Save settings'));
    await flush();
    expect(onSave).not.toHaveBeenCalled();
    expect(container.textContent).toContain('whole number of days');
    unmount();
  });
});
