// components/plans/PlanForm.test.jsx

import { useState } from 'react';
import PlanForm from '@/components/plans/PlanForm';
import { emptyPlanForm } from '@/lib/planForm';
import { mount, click, type } from '@/tests/helpers/dom';

let latest;

function Harness({ isEdit = false, initial }) {
  const [form, setForm] = useState(initial || emptyPlanForm());
  latest = form;
  return <PlanForm form={form} onChange={setForm} isEdit={isEdit} />;
}

const byLabel = (c, text) => c.querySelector(`[aria-label="${text}"]`);
const total = (c, months) => c.querySelector(`[data-testid="tier-total-${months}"]`).textContent;
const featureInputs = (c) => [...c.querySelectorAll('input[aria-label^="Feature "]')];

describe('PlanForm', () => {
  it('has no editable tier price: totals are text and follow the monthly price', () => {
    const { container, unmount } = mount(<Harness />);
    const price = [...container.querySelectorAll('input')].find((i) => i.placeholder === '0' && i.min === '0' && i.required);
    type(price, '100');
    expect(total(container, 1)).toBe('₹100');
    expect(total(container, 3)).toBe('₹270');
    expect(total(container, 12)).toBe('₹840');
    expect(byLabel(container, 'Quarterly discount %')).not.toBeNull();
    unmount();
  });

  it('recomputes a tier total when its discount changes', () => {
    const { container, unmount } = mount(<Harness initial={{ ...emptyPlanForm(), price: '100' }} />);
    type(byLabel(container, 'Quarterly discount %'), '20');
    expect(total(container, 3)).toBe('₹240');
    expect(latest.tiers[0].discount).toBe('20');
    unmount();
  });

  it('exposes popular, active, display order and storage limit', () => {
    const { container, unmount } = mount(<Harness />);
    const text = container.textContent;
    ['Popular badge', 'Active (visible to customers)', 'Display order', 'Media storage (MB)']
      .forEach((label) => expect(text).toContain(label));
    click(byLabel(container, 'Popular badge'));
    expect(latest.isPopular).toBe(true);
    unmount();
  });

  it('adds, edits, reorders and removes features', () => {
    const { container, unmount } = mount(<Harness />);
    const add = () => click([...container.querySelectorAll('button')].find((b) => b.textContent.includes('Add feature')));
    add(); add();
    type(featureInputs(container)[0], 'First');
    type(featureInputs(container)[1], 'Second');
    click(byLabel(container, 'Move feature 2 up'));
    expect(latest.features).toEqual(['Second', 'First']);
    click(byLabel(container, 'Remove feature 1'));
    expect(latest.features).toEqual(['First']);
    unmount();
  });

  it('locks the Internal ID when editing', () => {
    const { container, unmount } = mount(<Harness isEdit initial={{ ...emptyPlanForm(), name: 'pro' }} />);
    expect(container.querySelector('input[value="pro"]').disabled).toBe(true);
    unmount();
  });

  it('shows the broadcast limit and server error, and drops the legacy inputs', () => {
    const { container, unmount } = mount(<PlanForm form={emptyPlanForm()} onChange={() => {}} broadcastError="nope" />);
    const text = container.textContent;
    ['Broadcast recipients per broadcast', 'nope', 'Messages/month', 'Media storage (MB)']
      .forEach((label) => expect(text).toContain(label));
    ['Chatbot Rules', 'Customers', 'Payment link'].forEach((label) => expect(text).not.toContain(label));
    unmount();
  });

  it('shows Max Staff only when staff management is on', () => {
    const { container, unmount } = mount(<Harness />);
    expect(container.textContent).not.toContain('Staff accounts');
    click(byLabel(container, 'Staff management'));
    expect(container.textContent).toContain('Staff accounts');
    unmount();
  });
});
