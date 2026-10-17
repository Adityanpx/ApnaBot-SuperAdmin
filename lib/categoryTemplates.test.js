// lib/categoryTemplates.test.js

import {
  defaultFor, filterByCategory, noDefaultNotice, categoriesMissingDefault,
  replaceBusinessName, mentionsBusinessName, replaceMatchedNames, remainingWarnings,
  normalizeNodes, mergeTranslations, nodeTextsPayload,
  parseCloneResult, stashWarnings, readStashedWarnings,
} from '@/lib/categoryTemplates';

const templates = [
  { _id: 'a', category: 'salon', isDefault: true },
  { _id: 'b', category: 'salon', isDefault: false },
  { _id: 'c', category: 'gym', isDefault: false },
];

describe('category template defaults', () => {
  it('finds the default of a category', () => {
    expect(defaultFor(templates, 'salon')._id).toBe('a');
    expect(defaultFor(templates, 'gym')).toBeUndefined();
  });

  it('filters by category and keeps everything for an empty filter', () => {
    expect(filterByCategory(templates, 'salon')).toHaveLength(2);
    expect(filterByCategory(templates, '')).toHaveLength(3);
  });

  it('explains a missing default, with its own wording for General', () => {
    expect(noDefaultNotice(templates, 'gym', 'Gym / Fitness')).toBe(
      'No default is set for Gym / Fitness. New businesses get the General default.'
    );
    expect(noDefaultNotice(templates, 'general', 'General Shop')).toContain('empty flow');
    expect(noDefaultNotice(templates, 'salon', 'Salon')).toBeNull();
    expect(noDefaultNotice(templates, '', '')).toBeNull();
  });

  it('lists categories with templates but no default, skipping General', () => {
    const list = [...templates, { _id: 'd', category: 'general', isDefault: false }];
    expect(categoriesMissingDefault(list)).toEqual(['gym']);
  });
});

describe('business name replacement', () => {
  it('replaces every occurrence ignoring case and regex characters', () => {
    expect(replaceBusinessName('Hi from Glow (Pune)! glow (pune) rocks', 'Glow (Pune)')).toBe(
      'Hi from {{businessName}}! {{businessName}} rocks'
    );
  });

  it('leaves text alone without a matched name', () => {
    expect(replaceBusinessName('Hello', '')).toBe('Hello');
    expect(replaceBusinessName(undefined, 'X')).toBeUndefined();
  });

  it('detects a mention', () => {
    expect(mentionsBusinessName('Welcome to GLOW', 'glow')).toBe(true);
    expect(mentionsBusinessName('Welcome', 'glow')).toBe(false);
  });

  it('replaces the matched name in the text and in every translation', () => {
    const out = replaceMatchedNames(
      { text: 'Welcome to Glow', translations: { hi: 'Glow में स्वागत', gu: 'x' } },
      ['Glow']
    );
    expect(out).toEqual({
      text: 'Welcome to {{businessName}}',
      translations: { hi: '{{businessName}} में स्वागत', gu: 'x' },
    });
  });

  it('keeps a warning only while the saved texts still mention the matched name', () => {
    const warnings = [
      { nodeId: 'n1', key: 'hi', matched: 'Glow' },
      { nodeId: 'n2', key: 'bye', matched: 'Glow' },
    ];
    const saved = { text: 'Hi {{businessName}}', translations: { hi: 'Glow फिर' } };
    expect(remainingWarnings(warnings, 'n1', saved).map((w) => w.nodeId)).toEqual(['n1', 'n2']);
    const clean = { text: 'Hi {{businessName}}', translations: {} };
    expect(remainingWarnings(warnings, 'n1', clean).map((w) => w.nodeId)).toEqual(['n2']);
  });
});

describe('normalizeNodes', () => {
  const nodes = [
    { id: 'r1', node_type: 'reply', keyword: 'hi', label: 'Hello', label_translations: { hi: 'नमस्ते' } },
    { id: 'r2', node_type: 'reply', keyword: 'prices', label: 'Prices' },
    {
      id: 'q1', node_type: 'question', field_key: 'date', label: 'When?',
      options: [{ label: 'Today' }, 'Tomorrow'],
    },
  ];
  const edges = [
    { id: 'e1', from_node_id: 'r1', to_node_id: 'r2', label: 'See prices' },
    { id: 'e2', from_node_id: 'r2', to_node_id: 'q1' },
  ];

  it('maps raw snake_case rows to display rows', () => {
    const [hi] = normalizeNodes(nodes, edges);
    expect(hi).toMatchObject({
      id: 'r1', type: 'reply', name: 'hi', text: 'Hello', translations: { hi: 'नमस्ते' },
    });
  });

  it('turns a reply node edge into a titled button and other edges into "next"', () => {
    const rows = normalizeNodes(nodes, edges);
    expect(rows[0].links).toEqual([{ title: 'See prices', next: 'prices' }]);
    expect(rows[1].links).toEqual([{ title: '(no label)', next: 'date' }]);
  });

  it('lists a question node choices and falls back to the field key as name', () => {
    const [, , q] = normalizeNodes(nodes, edges);
    expect(q.name).toBe('date');
    expect(q.options).toEqual(['Today', 'Tomorrow']);
  });
});

describe('node-texts payload', () => {
  it('keeps other languages, sets hi/mr and drops blank ones', () => {
    expect(mergeTranslations({ hi: 'old', gu: 'ગુ' }, { hi: 'नया', mr: '  ' }))
      .toEqual({ hi: 'नया', gu: 'ગુ' });
  });

  it('is keyed by node id with label and labelTranslations', () => {
    expect(nodeTextsPayload('n1', { text: ' Hi ', translations: { hi: 'नमस्ते' } })).toEqual({
      nodes: [{ id: 'n1', label: 'Hi', labelTranslations: { hi: 'नमस्ते' } }],
    });
  });

  it('sends null when no translation is left', () => {
    expect(nodeTextsPayload('n1', { text: 'Hi', translations: {} }).nodes[0].labelTranslations)
      .toBeNull();
  });
});

describe('clone warnings', () => {
  const warning = { nodeId: 'n1', key: 'hi', matched: 'Glow' };

  it('reads id and warnings from a clone response', () => {
    expect(parseCloneResult({ _id: 't1', id: 't1', warnings: [warning] }))
      .toEqual({ id: 't1', warnings: [warning] });
    expect(parseCloneResult({ id: 't2' })).toEqual({ id: 't2', warnings: [] });
  });

  it('stashes warnings per template and forgets them when emptied', () => {
    stashWarnings('t1', [warning]);
    expect(readStashedWarnings('t1')).toEqual([warning]);
    expect(readStashedWarnings('other')).toEqual([]);
    stashWarnings('t1', []);
    expect(readStashedWarnings('t1')).toEqual([]);
  });
});
