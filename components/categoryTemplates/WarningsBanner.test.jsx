// components/categoryTemplates/WarningsBanner.test.jsx

import WarningsBanner from '@/components/categoryTemplates/WarningsBanner';
import { mount, click, flush } from '@/tests/helpers/dom';

const warnings = [
  { nodeId: 'n1', key: 'welcome', matched: 'Glow Salon' },
  { nodeId: 'n2', key: 'bye', matched: 'Glow Salon' },
];

describe('WarningsBanner', () => {
  it('names the matched business and replaces one node by its id', async () => {
    const onReplace = jest.fn().mockResolvedValue();
    const { container, unmount } = mount(<WarningsBanner warnings={warnings} onReplace={onReplace} />);
    expect(container.textContent).toContain(
      'These replies mention Glow Salon. Replace with {{businessName}}'
    );
    expect(container.textContent).toContain('welcome');
    click(container.querySelectorAll('button')[1]);
    await flush();
    expect(onReplace).toHaveBeenCalledWith('n2');
    unmount();
  });

  it('renders nothing without warnings', () => {
    const { container, unmount } = mount(<WarningsBanner warnings={[]} onReplace={jest.fn()} />);
    expect(container.textContent).toBe('');
    unmount();
  });
});
