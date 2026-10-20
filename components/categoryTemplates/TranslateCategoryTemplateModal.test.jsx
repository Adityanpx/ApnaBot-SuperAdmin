// components/categoryTemplates/TranslateCategoryTemplateModal.test.jsx

import { act } from 'react';
import api from '@/lib/api';
import TranslateCategoryTemplateModal from '@/components/categoryTemplates/TranslateCategoryTemplateModal';
import { mount, click, flush, buttonByText } from '@/tests/helpers/dom';

jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));

const languages = [
  { code: 'en', name: 'English', englishName: 'English' },
  { code: 'hi', name: 'हिंदी', englishName: 'Hindi' },
];
const template = { _id: 't1', name: 'Salon kit' };

describe('TranslateCategoryTemplateModal', () => {
  beforeEach(() => api.get.mockResolvedValue({ data: { data: { languages } } }));

  it('lists catalog languages without English and shows the translate result', async () => {
    const translateTemplate = jest.fn().mockResolvedValue({
      language: 'hi', translated: 5, alreadyTranslated: 2, charged: 120,
      skipped: [{ slot: 'node1.label', reason: 'too long' }], warnings: [],
    });
    const { unmount } = mount(
      <TranslateCategoryTemplateModal open template={template} onClose={jest.fn()} translateTemplate={translateTemplate} />
    );
    await flush();
    const select = document.body.querySelector('select');
    const values = [...select.options].map((o) => o.value);
    expect(values).toContain('hi');
    expect(values).not.toContain('en');

    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    act(() => { setter.call(select, 'hi'); select.dispatchEvent(new Event('change', { bubbles: true })); });
    click(buttonByText(document.body, 'Translate'));
    await flush();
    expect(translateTemplate).toHaveBeenCalledWith('t1', 'hi');
    const text = document.body.textContent;
    expect(text).toContain('5 translated, 2 already translated, 1 skipped');
    expect(text).toContain('120 characters charged');
    expect(text).toContain('node1.label: too long');
    unmount();
  });
});
