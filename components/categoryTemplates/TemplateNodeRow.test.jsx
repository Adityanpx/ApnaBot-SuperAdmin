// components/categoryTemplates/TemplateNodeRow.test.jsx

import { act } from 'react';
import TemplateNodeRow from '@/components/categoryTemplates/TemplateNodeRow';
import { mount, click, buttonByText, flush } from '@/tests/helpers/dom';

const node = {
  id: 'n1',
  type: 'reply',
  name: 'hi',
  text: 'Welcome',
  translations: { hi: 'नमस्ते', gu: 'ગુ' },
  options: [],
  links: [{ title: 'Prices', next: 'prices' }],
};

function typeInto(el, value) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  act(() => {
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('TemplateNodeRow', () => {
  it('shows the node read-only with its button and where it leads', () => {
    const { container, unmount } = mount(<TemplateNodeRow node={node} onSave={jest.fn()} />);
    expect(container.textContent).toContain('Welcome');
    expect(container.textContent).toContain('नमस्ते');
    expect(container.textContent).toContain('Prices → prices');
    unmount();
  });

  it('saves by node id, keeping translations in other languages', async () => {
    const onSave = jest.fn().mockResolvedValue();
    const { container, unmount } = mount(<TemplateNodeRow node={node} onSave={onSave} />);
    click(buttonByText(container, 'Edit text'));
    const [text, , mr] = container.querySelectorAll('textarea');
    typeInto(text, 'Hi {{businessName}}');
    typeInto(mr, 'नमस्कार');
    click(buttonByText(container, 'Save text'));
    await flush();
    expect(onSave).toHaveBeenCalledWith('n1', {
      text: 'Hi {{businessName}}',
      translations: { hi: 'नमस्ते', gu: 'ગુ', mr: 'नमस्कार' },
    });
    expect(container.querySelector('textarea')).toBeNull();
    unmount();
  });

  it('cannot save an empty text (the server requires one)', () => {
    const { container, unmount } = mount(<TemplateNodeRow node={node} onSave={jest.fn()} />);
    click(buttonByText(container, 'Edit text'));
    typeInto(container.querySelector('textarea'), '  ');
    expect(buttonByText(container, 'Save text').disabled).toBe(true);
    unmount();
  });
});
