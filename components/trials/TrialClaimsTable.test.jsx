// components/trials/TrialClaimsTable.test.jsx

import TrialClaimsTable from '@/components/trials/TrialClaimsTable';
import { mount, click, type } from '@/tests/helpers/dom';

const claims = [
  { _id: 'c1', id: 'c1', phoneE164: '910000000001', businessName: 'Glow Salon', subscriptionId: 's1' },
  { _id: 'c2', id: 'c2', phoneE164: '910000000002', businessName: null, subscriptionId: null },
];

function setup(props = {}) {
  const handlers = { onSearch: jest.fn(), onPage: jest.fn(), onReset: jest.fn() };
  const view = mount(
    <TrialClaimsTable
      claims={claims} total={2} loading={false} search="" page={1} {...handlers} {...props}
    />
  );
  return { ...view, ...handlers };
}

describe('TrialClaimsTable', () => {
  it('lists phone with +, business and subscription link state', () => {
    const { container, unmount } = setup();
    expect(container.textContent).toContain('+910000000001');
    expect(container.textContent).toContain('Glow Salon');
    expect(container.textContent).toContain('Linked');
    expect(container.textContent).toContain('None');
    unmount();
  });

  it('reports typed search text instead of filtering locally', () => {
    const { container, onSearch, unmount } = setup();
    type(container.querySelector('input'), 'glow');
    expect(onSearch).toHaveBeenCalledWith('glow');
    expect(container.textContent).toContain('+910000000002');
    unmount();
  });

  it('passes the display row of the clicked claim to onReset', () => {
    const { container, onReset, unmount } = setup();
    click(container.querySelectorAll('tbody button')[1]);
    expect(onReset).toHaveBeenCalledWith(expect.objectContaining({ id: 'c2' }));
    unmount();
  });

  it('shows a search-specific empty state', () => {
    const { container, unmount } = setup({ claims: [], total: 0, search: 'zzz' });
    expect(container.textContent).toContain('No claims match your search');
    unmount();
  });
});
