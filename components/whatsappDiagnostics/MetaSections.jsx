// components/whatsappDiagnostics/MetaSections.jsx
'use client';

import Badge from '@/components/ui/Badge';
import { WEBHOOK_FIELDS, formatTokenExpiry, displayValue } from '@/lib/whatsappDiagnostics';

/** A section's own failure (the Meta read failed): the server sends { ok: false, error: { message } }. */
export function ReadError({ error }) {
  const status = error?.httpStatus ? ` (HTTP ${error.httpStatus})` : '';
  return (
    <p className="text-sm text-danger-text" role="alert">
      {error?.message || 'This check failed.'}{status}
    </p>
  );
}

function OnOff({ on }) {
  return <Badge variant={on ? 'success' : 'neutral'} dot>{on ? 'On' : 'Off'}</Badge>;
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border-subtle last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm text-text-primary text-right min-w-0 break-words">{children}</span>
    </div>
  );
}

export function MetaAppCard({ config }) {
  return (
    <section className="card p-5">
      <h2 className="text-base font-semibold text-text-primary mb-2">Meta app</h2>
      <Row label="App ID"><span className="font-mono text-xs">{displayValue(config?.META_APP_ID)}</span></Row>
      <Row label="Config ID"><span className="font-mono text-xs">{displayValue(config?.META_CONFIG_ID)}</span></Row>
      <Row label="Graph version">{displayValue(config?.GRAPH_API_VERSION)}</Row>
      <Row label="COEXISTENCE_SYNC_ENABLED"><OnOff on={!!config?.COEXISTENCE_SYNC_ENABLED} /></Row>
      <Row label="ECHO_AUTO_PAUSE"><OnOff on={!!config?.ECHO_AUTO_PAUSE} /></Row>
    </section>
  );
}

export function WebhookChecklist({ subscriptions }) {
  const passed = new Set(
    (subscriptions?.required || []).filter((r) => r.status === 'pass').map((r) => r.field),
  );
  return (
    <section className="card p-5">
      <h2 className="text-base font-semibold text-text-primary mb-1">Webhook subscription</h2>
      <p className="text-xs text-text-tertiary mb-3">Fields the app must be subscribed to on whatsapp_business_account.</p>
      {!subscriptions?.ok ? (
        <ReadError error={subscriptions?.error} />
      ) : (
        <>
          {!subscriptions.objectSubscribed && (
            <p className="text-sm text-danger-text mb-2">The app has no whatsapp_business_account webhook subscription at all.</p>
          )}
          <ul className="space-y-3">
            {WEBHOOK_FIELDS.map(({ field, breaks }) => {
              const ok = passed.has(field);
              return (
                <li key={field} className="flex items-start gap-3">
                  <Badge variant={ok ? 'success' : 'danger'} dot className="mt-0.5 flex-shrink-0">{ok ? 'Subscribed' : 'Missing'}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-mono text-text-primary">{field}</p>
                    {!ok && <p className="text-xs text-text-secondary mt-0.5">{breaks}</p>}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

export function SystemTokenCard({ token }) {
  return (
    <section className="card p-5">
      <h2 className="text-base font-semibold text-text-primary mb-2">System-user token</h2>
      {!token?.ok ? (
        <ReadError error={token?.error} />
      ) : (
        <>
          <Row label="Status">
            <Badge variant={token.isValid ? 'success' : 'danger'} dot>{token.isValid ? 'Valid' : 'Not valid'}</Badge>
          </Row>
          <Row label="Type">{displayValue(token.type)}</Row>
          <Row label="Expires">{formatTokenExpiry(token.expiresAt)}</Row>
          <div className="pt-2">
            <p className="text-sm text-text-secondary mb-1.5">Scopes</p>
            {token.scopes?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {token.scopes.map((s) => <Badge key={s} variant="neutral" className="font-mono">{s}</Badge>)}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary">None reported</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
