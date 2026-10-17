// components/categoryTemplates/CategoryTemplateTable.test.jsx

import CategoryTemplateTable from '@/components/categoryTemplates/CategoryTemplateTable';
import { mount, click } from '@/tests/helpers/dom';

const templates = [
  { _id: 'a', category: 'salon', name: 'Salon A', isDefault: true },
  { _id: 'b', category: 'salon', name: 'Salon B', isDefault: false },
];

function setup() {
  const handlers = {
    onDelete: jest.fn(), onExport: jest.fn(), onSetDefault: jest.fn(), onUnsetDefault: jest.fn(),
  };
  const view = mount(<CategoryTemplateTable templates={templates} loading={false} {...handlers} />);
  return { ...view, ...handlers };
}

describe('CategoryTemplateTable defaults', () => {
  it('badges only the default template and links names to the detail page', () => {
    const { container, unmount } = setup();
    expect(container.textContent.match(/Default/g)).toHaveLength(1);
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/category-templates/a', '/category-templates/b']);
    unmount();
  });

  it('offers Remove default on the default row and Set as default on the others', () => {
    const { container, onSetDefault, onUnsetDefault, unmount } = setup();
    click(container.querySelector('button[title="Remove default"]'));
    click(container.querySelector('button[title="Set as default"]'));
    expect(onUnsetDefault).toHaveBeenCalledWith(templates[0]);
    expect(onSetDefault).toHaveBeenCalledWith(templates[1]);
    unmount();
  });
});
