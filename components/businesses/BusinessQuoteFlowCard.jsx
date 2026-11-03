// components/businesses/BusinessQuoteFlowCard.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import {
  DEFAULT_KEYWORD, canEnable, enableBody, isProtected, isQuoteCategory, requiredAcknowledgement, sortedItems, switchError,
} from '@/lib/quoteFlow';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const MARK = {
  ok: { symbol: '✓', className: 'text-success-text', label: 'Done' },
  warn: { symbol: '!', className: 'text-warning-text', label: 'Worth a look' },
  block: { symbol: '✕', className: 'text-danger-text', label: 'Blocks enabling' },
};

/**
 * BusinessQuoteFlowCard — Businesses → <business> → Travel quote flow.
 * The same readiness checklist the owner sees (Settings → Travel quotes), and Enable / Disable for this business:
 * Enable turns the travel_quotes override on AND installs the quote flow (restore point first, nothing existing is changed;
 * a failed install puts the override back); Disable removes the quote steps and turns the override off. Search cab AI is
 * refused by the server by id. Enabling is a one-time cutover for that business: its customers get the entry at once.
 * Renders nothing for businesses that are not travels / cab.
 */
export default function BusinessQuoteFlowCard({ businessId, businessName, category }) {
  const [readiness, setReadiness] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [keyword, setKeyword] = useState(DEFAULT_KEYWORD);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'enable' | 'disable'
  const [error, setError] = useState('');

  const applies = isQuoteCategory(category);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const res = await api.get(API.BUSINESS_QUOTE_READINESS(businessId));
      setReadiness(res.data.data);
    } catch (err) {
      setLoadError(err.userMessage || 'Failed to load the quote checklist');
    }
  }, [businessId]);

  useEffect(() => { if (applies) load(); }, [applies, load]);

  if (!applies) return null;

  const run = async (action) => {
    setError('');
    try {
      const body = action === 'enable' ? enableBody(readiness, keyword, acknowledged) : {};
      const res = await api.post(API.BUSINESS_QUOTE_FLOW(businessId, action), body);
      setReadiness(res.data.data.readiness);
      toast.success(res.data.message || 'Done');
      return true;
    } catch (err) {
      const info = switchError(err);
      setError(info.message);
      if (info.readiness) setReadiness(info.readiness);
      toast.error(info.message);
      return false;
    }
  };

  const protectedBusiness = isProtected(readiness);
  const installed = readiness?.installed?.state === 'installed';
  const acknowledgement = readiness ? requiredAcknowledgement(readiness) : null;

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-text-primary tracking-tight">Travel quote flow</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            The owner&apos;s own &ldquo;Enable quotes&rdquo; checklist for this business. Enable switches Travel quotes on and
            adds the quote steps to its WhatsApp bot (nothing existing is changed); Disable removes them.
          </p>
        </div>
        {readiness && <Badge variant={readiness.enabled ? 'success' : 'neutral'}>{readiness.enabled ? 'On' : 'Off'}</Badge>}
      </div>

      {loadError && (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-danger-text">{loadError}</p>
          <Button variant="outline" size="sm" onClick={load}>Try again</Button>
        </div>
      )}
      {!readiness && !loadError && <p className="mt-3 text-sm text-text-tertiary">Loading…</p>}

      {readiness && (
        <>
          {protectedBusiness && (
            <p className="mt-3 text-sm text-warning-text">
              This is a live production bot that is managed by hand. The quote flow is never enabled or disabled for it from here.
            </p>
          )}

          <ul className="mt-4 space-y-2.5">
            {sortedItems(readiness.items).map((item) => {
              const mark = MARK[item.status];
              return (
                <li key={item.key} className="flex gap-2.5 text-sm">
                  <span className={`mt-0.5 w-4 flex-shrink-0 text-center font-bold ${mark.className}`} aria-hidden>{mark.symbol}</span>
                  <span className="min-w-0">
                    <span className="sr-only">{mark.label}: </span>
                    <span className="font-medium text-text-primary">{item.title}</span>
                    <span className="block text-xs text-text-tertiary">{item.detail}</span>
                  </span>
                </li>
              );
            })}
          </ul>

          {!protectedBusiness && !installed && !readiness.enabled && (
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="quote-keyword" className="block text-xs font-semibold text-text-secondary mb-1">Keyword</label>
                <input
                  id="quote-keyword"
                  className="input-field w-full"
                  value={keyword}
                  maxLength={40}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <p className="text-xs text-text-tertiary mt-1">The word customers type to start a quote. If another reply already uses it, Enable is refused and says so.</p>
              </div>
              {acknowledgement && (
                <label className="flex items-start gap-2 text-sm text-text-secondary">
                  <input type="checkbox" className="mt-0.5" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
                  <span>{acknowledgement.text} — Round Trip customers are handed to the owner&apos;s team until a route can be priced.</span>
                </label>
              )}
            </div>
          )}

          {error && <p className="mt-3 text-sm text-danger-text">{error}</p>}

          {!protectedBusiness && (
            <div className="mt-4 flex flex-wrap gap-2">
              {!readiness.enabled && (
                <Button variant="primary" size="sm" disabled={!canEnable(readiness, acknowledged)} onClick={() => setConfirm('enable')}>
                  Enable quote flow
                </Button>
              )}
              {(readiness.enabled || installed) && (
                <Button variant="danger" size="sm" onClick={() => setConfirm('disable')}>Disable quote flow</Button>
              )}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={confirm === 'enable'}
        onClose={() => setConfirm(null)}
        title="Enable the quote flow?"
        subject={businessName ?? 'this business'}
        confirmLabel="Yes, enable"
        danger={false}
        onConfirm={() => run('enable')}
      >
        <p>
          Travel quotes will be switched on for <strong>{businessName ?? 'this business'}</strong> and the quote steps added to its
          WhatsApp bot. A restore point is saved first and nothing existing is changed. Its customers get the new entry
          straight away.
        </p>
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm === 'disable'}
        onClose={() => setConfirm(null)}
        title="Disable the quote flow?"
        subject={businessName ?? 'this business'}
        confirmLabel="Yes, disable"
        onConfirm={() => run('disable')}
      >
        <p>
          The quote steps are removed from <strong>{businessName ?? 'this business'}</strong>&apos;s bot and Travel quotes are
          switched off for it. Its routes, rates and saved quotes are kept.
        </p>
      </ConfirmDialog>
    </div>
  );
}
