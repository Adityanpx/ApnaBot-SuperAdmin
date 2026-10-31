// components/whatsappDiagnostics/BusinessDiagnostics.jsx
'use client';

import { useState } from 'react';
import { Check, ChevronDown, Copy } from 'lucide-react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { displayValue, toJsonText } from '@/lib/whatsappDiagnostics';
import { ReadError } from '@/components/whatsappDiagnostics/MetaSections';

const PHONE_FIELDS = ['is_on_biz_app', 'platform_type', 'status', 'code_verification_status', 'name_status'];
const WABA_FIELDS = ['id', 'name', 'account_review_status', 'business_verification_status'];

function FieldList({ title, read, keys }) {
  return (
    <section className="card p-5">
      <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
      {!read?.ok ? (
        <ReadError error={read?.error} />
      ) : (
        <dl>
          {keys.map((k) => (
            <div key={k} className="flex items-center justify-between gap-3 py-2 border-b border-border-subtle last:border-0">
              <dt className="text-sm text-text-secondary font-mono">{k}</dt>
              <dd className="text-sm text-text-primary text-right break-words min-w-0">{displayValue(read.result?.[k])}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function JsonBox({ label, value }) {
  const [copied, setCopied] = useState(false);
  const text = toJsonText(value);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy - select the text and copy it by hand');
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-text-secondary">{label}</p>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary">
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="font-mono text-xs bg-bg-subtle rounded-lg p-3 overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap break-words">{text}</pre>
    </div>
  );
}

function AttemptRow({ attempt }) {
  const [open, setOpen] = useState(false);
  const entries = attempt.entries || [];
  const steps = attempt.server_steps || [];
  return (
    <li className="border border-border-subtle rounded-xl">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <ChevronDown className={cn('w-4 h-4 text-text-tertiary flex-shrink-0 transition-transform', open && 'rotate-180')} />
        <span className="text-sm text-text-primary">{new Date(attempt.created_at).toLocaleString()}</span>
        <Badge variant="neutral" className="ml-auto">{displayValue(attempt.outcome)}</Badge>
      </button>
      {open && (
        <div className="p-3 pt-0 space-y-3">
          <JsonBox label={`Client entries (${entries.length})`} value={entries} />
          <JsonBox label={`Server steps (${steps.length})`} value={steps} />
        </div>
      )}
    </li>
  );
}

/** Phone node, WABA and connect attempts for the chosen business. */
export default function BusinessDiagnostics({ business, attempts, attemptsError }) {
  return (
    <div className="space-y-4">
      {business?.error ? (
        <p className="text-sm text-danger-text" role="alert">{business.error}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldList title="Phone number" read={business?.phoneNode} keys={PHONE_FIELDS} />
          <FieldList title="WhatsApp Business Account" read={business?.waba} keys={WABA_FIELDS} />
        </div>
      )}
      <section className="card p-5">
        <h3 className="text-base font-semibold text-text-primary mb-3">Connect attempts</h3>
        {attemptsError ? (
          <p className="text-sm text-danger-text" role="alert">{attemptsError}</p>
        ) : attempts.length === 0 ? (
          <p className="text-sm text-text-tertiary">No connect attempts recorded for this business.</p>
        ) : (
          <ul className="space-y-2">
            {attempts.map((a) => <AttemptRow key={a.id} attempt={a} />)}
          </ul>
        )}
      </section>
    </div>
  );
}
