// hooks/useCategoryTemplate.test.jsx

import { act } from 'react';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { useCategoryTemplate } from '@/hooks/useCategoryTemplate';
import { stashWarnings } from '@/lib/categoryTemplates';
import { mount, flush } from '@/tests/helpers/dom';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn(), patch: jest.fn() } }));

// GET /:id returns the template fields (camelCase) plus raw snake_case nodes and edges.
const detail = {
  id: 't1', _id: 't1', category: 'salon', name: 'Salon', isDefault: false,
  nodes: [{
    id: 'n1', node_type: 'reply', keyword: 'hi', label: 'Welcome to Glow',
    label_translations: { hi: 'Glow में स्वागत' },
  }],
  edges: [],
};
const warning = { nodeId: 'n1', key: 'hi', matched: 'Glow' };

let latest;
function Probe() {
  latest = useCategoryTemplate('t1');
  return null;
}

describe('useCategoryTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    stashWarnings('t1', [warning]);
    api.get.mockResolvedValue({ data: { data: detail } });
  });

  it('loads the template, its display nodes and the remembered clone warnings', async () => {
    const { unmount } = mount(<Probe />);
    await flush();
    expect(api.get).toHaveBeenCalledWith(API.CATEGORY_TEMPLATE_BY_ID('t1'));
    expect(latest.template).toMatchObject({ id: 't1', name: 'Salon' });
    expect(latest.template.nodes).toBeUndefined();
    expect(latest.nodes[0]).toMatchObject({ id: 'n1', name: 'hi', text: 'Welcome to Glow' });
    expect(latest.warnings).toEqual([warning]);
    unmount();
  });

  it('patches by node id and clears the warning once the name is gone', async () => {
    api.patch.mockResolvedValue({ data: { data: { id: 't1', updated: 1 } } });
    const { unmount } = mount(<Probe />);
    await flush();
    await act(async () => {
      await latest.saveNodeTexts('n1', {
        text: 'Welcome to {{businessName}}', translations: { hi: '{{businessName}} में स्वागत' },
      });
    });
    expect(api.patch).toHaveBeenCalledWith(API.CATEGORY_TEMPLATE_NODE_TEXTS('t1'), {
      nodes: [{
        id: 'n1',
        label: 'Welcome to {{businessName}}',
        labelTranslations: { hi: '{{businessName}} में स्वागत' },
      }],
    });
    expect(latest.nodes[0].text).toBe('Welcome to {{businessName}}');
    expect(latest.warnings).toEqual([]);
    unmount();
  });

  it('keeps the warning when the saved text still mentions the name', async () => {
    api.patch.mockResolvedValue({ data: {} });
    const { unmount } = mount(<Probe />);
    await flush();
    await act(async () => {
      await latest.saveNodeTexts('n1', { text: 'Still Glow', translations: {} });
    });
    expect(latest.warnings).toEqual([warning]);
    unmount();
  });

  it('exposes the load error', async () => {
    api.get.mockRejectedValue({ userMessage: 'Nope' });
    const { unmount } = mount(<Probe />);
    await flush();
    expect(latest.error).toBe('Nope');
    unmount();
  });
});
