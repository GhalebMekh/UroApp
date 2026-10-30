import { useState } from 'react';
import { TIER_LABEL, useEntitlements } from '@/lib/entitlements';
import { PRODUCTS, renewalText } from '@/lib/plans';
import { APPLE_SUBSCRIPTIONS_URL } from '@/lib/purchases';
import { usePurchases } from '@/lib/purchasesContext';
import { cn } from '@/lib/cn';

const secondary =
  'min-h-[44px] flex-1 rounded-[11px] border border-line bg-navy px-3 py-2.5 text-center text-[13px] font-semibold text-ink transition-colors hover:border-violet disabled:opacity-50';

/**
 * The plan, the way to the plans screen, Restore Purchases (visible whenever
 * something can be bought — CLAUDE.md, guideline 3.1.1) and Apple's manage page.
 */
export function SubscriptionSettings() {
  const { tier } = useEntitlements();
  const purchases = usePurchases();
  const { subscription, status } = purchases;
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);

  async function restore() {
    setBusy(true);
    setNote(null);
    try {
      const restored = await purchases.restore();
      setNote(
        restored === 'resident'
          ? { tone: 'warn', text: 'No active subscription was found for this Apple ID.' }
          : { tone: 'ok', text: `Restored. UroApp ${TIER_LABEL[restored]} is active.` },
      );
    } catch (e) {
      setNote({ tone: 'warn', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-[16px] border border-line bg-navy-2 p-5">
      <h3 className="text-[15px] font-semibold">Subscription</h3>
      <p className="mb-4 mt-1 text-[13px] text-muted">
        {subscription ? (
          <>
            UroApp {TIER_LABEL[subscription.tier]} · {renewalText(subscription)}
          </>
        ) : (
          `UroApp ${TIER_LABEL[tier]}${tier === 'resident' ? ' (free)' : ''}`
        )}
      </p>
      <button
        type="button"
        onClick={() => purchases.openPlans()}
        className="mb-2.5 min-h-[44px] w-full rounded-[11px] bg-violet px-3 py-3 text-[14px] font-semibold text-white transition hover:bg-violet-deep"
      >
        {tier === 'resident' ? 'See plans' : 'Change plan'}
      </button>
      <div className="flex gap-2.5">
        <button type="button" onClick={() => void restore()} disabled={busy || status === 'unavailable'} className={secondary}>
          {busy ? 'Restoring…' : 'Restore Purchases'}
        </button>
        {subscription && PRODUCTS[subscription.productId] && (
          <a
            href={subscription.managementUrl ?? APPLE_SUBSCRIPTIONS_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(secondary, 'inline-flex items-center justify-center')}
          >
            Manage
          </a>
        )}
      </div>
      {note && (
        <p role={note.tone === 'warn' ? 'alert' : 'status'} className={cn('mt-3 text-[13px]', note.tone === 'warn' ? 'text-amber' : 'text-violet-soft')}>
          {note.text}
        </p>
      )}
    </section>
  );
}
