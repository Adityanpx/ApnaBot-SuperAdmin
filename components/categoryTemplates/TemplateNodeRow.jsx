// components/categoryTemplates/TemplateNodeRow.jsx
'use client';

import { useState } from 'react';
import { ArrowRight, Pencil } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { mergeTranslations } from '@/lib/categoryTemplates';

/** One labelled textarea used for the reply text and its translations. */
function TextArea({ label, value, onChange }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <textarea
        className="input-field w-full min-h-[72px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

/** Edit form for the reply text and the Hindi / Marathi translations. */
function NodeEditor({ node, onSave, onCancel }) {
  const [draft, setDraft] = useState({
    text: node.text, hi: node.translations.hi || '', mr: node.translations.mr || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (field) => (value) => setDraft((d) => ({ ...d, [field]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await onSave(node.id, {
        text: draft.text,
        translations: mergeTranslations(node.translations, draft),
      });
      onCancel();
    } catch {
      // already toasted by the hook — keep editing
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <TextArea label="Text" value={draft.text} onChange={set('text')} />
      <TextArea label="Hindi (हिंदी)" value={draft.hi} onChange={set('hi')} />
      <TextArea label="Marathi (मराठी)" value={draft.mr} onChange={set('mr')} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button size="sm" loading={saving} disabled={!draft.text.trim()} onClick={save}>
          Save text
        </Button>
      </div>
    </div>
  );
}

/** Read-only view of the text, translations, choices and where the node leads. */
function NodeReadOnly({ node }) {
  const chips = [
    ...node.links.map((l) => (l.title ? `${l.title} → ${l.next}` : `next → ${l.next}`)),
    ...node.options.map((o) => `option: ${o}`),
  ];
  return (
    <div className="space-y-2 text-sm">
      <p className="whitespace-pre-wrap text-text-primary">{node.text || '—'}</p>
      {['hi', 'mr'].map((lang) => node.translations[lang] && (
        <p key={lang} className="whitespace-pre-wrap text-text-secondary">
          <span className="uppercase text-xs text-text-tertiary mr-2">{lang}</span>
          {node.translations[lang]}
        </p>
      ))}
      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1">
          {chips.map((chip, i) => (
            <li key={i} className="inline-flex items-center gap-1 text-xs badge badge-neutral">
              <ArrowRight className="w-3 h-3" />
              {chip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * TemplateNodeRow — one node of a template: keyword / field key, type, text, where it leads,
 * with inline editing of the text and Hindi / Marathi translations.
 * Props: node (from normalizeNodes), flagged (bool), onSave fn(id, { text, translations })
 */
export default function TemplateNodeRow({ node, flagged, onSave }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-text-primary truncate">{node.name}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {flagged && <Badge variant="warning">Mentions business name</Badge>}
          <Badge variant="info">{node.type}</Badge>
          {!editing && (
            <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setEditing(true)}>
              Edit text
            </Button>
          )}
        </div>
      </div>
      {editing
        ? <NodeEditor node={node} onSave={onSave} onCancel={() => setEditing(false)} />
        : <NodeReadOnly node={node} />}
    </div>
  );
}
