import { useState, type ReactNode } from 'react';
import { HeroTabs, PageBody, PageHero } from '@/components/PageHero';
import { CheckIcon } from '@/components/icons';
import { TIER_LABEL, hasAccess, useEntitlements, type Tier } from '@/lib/entitlements';
import { FEATURE_LABEL, FEATURE_TIER, featureName, featuresOf, type GatedFeature } from '@/lib/featureTiers';
import {
  PRODUCTS,
  introText,
  planAction,
  renewalText,
  type PaidTier,
  type Period,
  type Plan,
  type Subscription,
} from '@/lib/plans';
import { APPLE_SUBSCRIPTIONS_URL } from '@/lib/purchases';
import { usePurchases, type PurchasesState } from '@/lib/purchasesContext';
import { PRIVACY_URL, TERMS_URL } from '@/lib/legal';
import { cn } from '@/lib/cn';

/** What stays free for everyone — the bedside and on-call tools (featureTiers.test enforces it). */
const FREE_FEATURES = [
  'Calculators and risk scores',
  'On-call emergency pathways',
  'Imaging classifications',
  'Guideline summaries',
  'Drug interactions',
  'Paediatric tools',
  'Procedure guides',
  'Instruments',
  'Conferences',
];

const PERIODS: { id: Period; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

const UNIT: Record<Period, string> = { monthly: 'month', yearly: 'year' };

const secondary =
  'min-h-[44px] rounded-[11px] border border-line bg-navy-2 px-4 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:border-violet disabled:opacity-50';

type Note = { tone: 'ok' | 'warn'; text: string };

/**
 * Pro / Elite plans, sold through Apple (guideline 3.1.1) with what 3.1.2
 * asks of a subscription screen: each plan's name, length, the billed price
 * as the most prominent figure, trial terms, Restore Purchases, and links to
 * the Terms of Use and privacy policy.
 */
export function PlansScreen({ feature, onDone }: { feature: GatedFeature | null; onDone: () => void }) {
  const { tier } = useEntitlements();
  const purchases = usePurchases();
  const { status, plans, subscription, sample } = purchases;
  const [period, setPeriod] = useState<Period>(() =>
    subscription && PRODUCTS[subscription.productId] ? PRODUCTS[subscription.productId]!.period : 'yearly',
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);

  const wanted = feature ? FEATURE_TIER[feature] : null;
  const planFor = (t: PaidTier) => plans.find((p) => p.tier === t && p.period === period);

  async function buy(plan: Plan) {
    setBusy(plan.productId);
    setNote(null);
    try {
      if (!(await purchases.purchase(plan))) return;
      // Bought from a locked screen: go straight back to it, now open.
      if (feature && hasAccess(plan.tier, FEATURE_TIER[feature])) return onDone();
      setNote({ tone: 'ok', text: `UroApp ${TIER_LABEL[plan.tier]} is active. Thank you.` });
    } catch (e) {
      setNote({ tone: 'warn', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  async function restore() {
    setBusy('restore');
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
      setBusy(null);
    }
  }

  const lede = feature && wanted
    ? `${FEATURE_LABEL[feature]} is part of UroApp ${TIER_LABEL[wanted]}. Bedside and on-call tools stay free for everyone.`
    : 'Bedside and on-call tools stay free for everyone. Pro adds the resident’s daily workflow; Elite adds consultant tools.';

  return (
    <>
      <PageHero eyebrow="Subscription" title="Plans" lede={lede}>
        <HeroTabs items={PERIODS} value={period} onChange={setPeriod} className="max-w-xs" />
      </PageHero>
      <PageBody>
        <div className="mx-auto max-w-5xl space-y-5">
          <StatusLine status={status} sample={sample} onRetry={() => void purchases.reloadPlans()} />

          {subscription && (
            <p className="rounded-[14px] border border-line bg-navy-2 px-4 py-3 text-[13.5px] text-muted">
              You have <span className="font-semibold text-ink">UroApp {TIER_LABEL[subscription.tier]}</span>
              {PRODUCTS[subscription.productId] && ` (${PRODUCTS[subscription.productId]!.period})`} ·{' '}
              {renewalText(subscription)}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <FreeCard current={tier === 'resident'} />
            {(['pro', 'elite'] as const).map((t) => (
              <PaidCard
                key={t}
                tier={t}
                period={period}
                plan={planFor(t)}
                status={status}
                active={tier}
                subscription={subscription}
                feature={wanted === t ? feature : null}
                busy={busy}
                onBuy={buy}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void restore()}
              disabled={busy !== null || status === 'unavailable'}
              className={secondary}
            >
              {busy === 'restore' ? 'Restoring…' : 'Restore Purchases'}
            </button>
            {subscription && PRODUCTS[subscription.productId] && (
              <a
                href={subscription.managementUrl ?? APPLE_SUBSCRIPTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(secondary, 'inline-flex items-center')}
              >
                Manage subscription
              </a>
            )}
          </div>

          {note && (
            <p role={note.tone === 'warn' ? 'alert' : 'status'} className={cn('text-[13.5px]', note.tone === 'warn' ? 'text-amber' : 'text-violet-soft')}>
              {note.text}
            </p>
          )}

          <FinePrint />
        </div>
      </PageBody>
    </>
  );
}

function StatusLine({ status, sample, onRetry }: { status: PurchasesState['status']; sample: boolean; onRetry: () => void }) {
  if (sample) {
    return <Banner>Development build: sample US prices. The app shows the App Store’s prices for each country.</Banner>;
  }
  if (status === 'unavailable') return <Banner>Subscriptions are bought in the UroApp app for iPhone and iPad.</Banner>;
  if (status === 'loading') return <Banner>Loading prices from the App Store…</Banner>;
  if (status === 'error') {
    return (
      <Banner>
        Prices couldn’t be loaded from the App Store. Check your connection.{' '}
        <button type="button" onClick={onRetry} className="-my-3 min-h-[44px] font-semibold text-violet-soft hover:text-ink">
          Try again
        </button>
      </Banner>
    );
  }
  return null;
}

function Banner({ children }: { children: ReactNode }) {
  return <p className="rounded-[14px] border border-line bg-ai-soft px-4 py-3 text-[13.5px] text-muted">{children}</p>;
}

function CardShell({ highlight, className, children }: { highlight?: boolean; className?: string; children: ReactNode }) {
  return (
    <section
      className={cn(
        'flex flex-col rounded-card border bg-navy-2 p-5',
        highlight ? 'border-violet ring-1 ring-violet/40' : 'border-line',
        className,
      )}
    >
      {children}
    </section>
  );
}

function Included({ items, strong }: { items: string[]; strong?: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className={cn('flex gap-2.5 text-[13.5px]', item === strong ? 'font-semibold text-ink' : 'text-muted')}>
          <CheckIcon className="mt-0.5 shrink-0 text-[16px] text-violet-soft" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function CurrentBadge() {
  return (
    <span className="rounded-full bg-violet/[0.18] px-2.5 py-0.5 text-[11px] font-semibold text-violet-soft">Current plan</span>
  );
}

/** Last on a phone, so the paid plans come first; first in the row on iPad. */
function FreeCard({ current }: { current: boolean }) {
  return (
    <CardShell className="order-last md:order-none">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="font-display text-[19px] font-bold">Resident</h2>
        {current && <CurrentBadge />}
      </div>
      <p className="mb-4 font-display text-[28px] font-bold leading-tight">Free</p>
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-2">Always included</p>
      <Included items={FREE_FEATURES} />
    </CardShell>
  );
}

function PaidCard({
  tier,
  period,
  plan,
  status,
  active,
  subscription,
  feature,
  busy,
  onBuy,
}: {
  tier: PaidTier;
  period: Period;
  plan: Plan | undefined;
  status: PurchasesState['status'];
  active: Tier;
  subscription: Subscription | null;
  /** The locked feature that led here, when this plan unlocks it: outlined, and the feature in bold. */
  feature: GatedFeature | null;
  busy: string | null;
  onBuy: (plan: Plan) => void;
}) {
  const action = planAction(tier, plan, active, subscription);
  // Apple gives intro offers only to people who have never subscribed in the group.
  const subscribed = subscription !== null && PRODUCTS[subscription.productId] !== undefined;
  const intro = plan && !subscribed ? introText(plan.intro) : null;
  const isCurrent = active === tier;

  return (
    <CardShell highlight={feature !== null}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="font-display text-[19px] font-bold">UroApp {TIER_LABEL[tier]}</h2>
        {isCurrent && <CurrentBadge />}
      </div>

      {/* The billed amount is the largest price on the card (guideline 3.1.2(c)). */}
      <div className="mb-4 min-h-[78px]">
        {plan ? (
          <>
            <p className="font-display leading-tight">
              <span className="text-[28px] font-bold">{plan.price}</span>
              <span className="text-[14px] text-muted"> / {UNIT[period]}</span>
            </p>
            <p className="mt-0.5 text-[12.5px] text-muted-2">
              Auto-renews every {UNIT[period]}
              {plan.perMonth && ` · ${plan.perMonth} a month`}
            </p>
            {intro && (
              <p className="mt-1.5 text-[13px] font-semibold text-violet-soft">
                {intro}, then {plan.price} / {UNIT[period]}
              </p>
            )}
          </>
        ) : (
          <p className="pt-2 text-[14px] text-muted-2">
            {status === 'loading' ? 'Loading price…' : 'Price shown in the App Store'}
          </p>
        )}
      </div>

      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-2">
        Everything in {tier === 'pro' ? 'Resident' : 'Pro'}, plus
      </p>
      {/* Grows so the buttons line up when the cards sit side by side (iPad). */}
      <div className="flex-1">
        <Included items={featuresOf(tier).map(featureName)} strong={feature ? featureName(feature) : undefined} />
      </div>

      <button
        type="button"
        onClick={() => plan && onBuy(plan)}
        disabled={!action.enabled || busy !== null}
        className={cn(
          'mt-5 min-h-[48px] w-full rounded-[12px] px-4 py-3 text-[14.5px] font-semibold transition',
          action.enabled
            ? 'bg-violet text-white hover:bg-violet-deep disabled:opacity-60'
            : 'border border-line bg-navy text-muted-2',
        )}
      >
        {plan && busy === plan.productId ? 'Opening the App Store…' : action.label}
      </button>
    </CardShell>
  );
}

/** Auto-renewal terms and the two required links (guideline 3.1.2). */
function FinePrint() {
  return (
    <div className="space-y-2 border-t border-line pt-5 text-[12.5px] leading-relaxed text-muted-2">
      <p>
        Payment is charged to your Apple ID when you confirm the purchase. A subscription renews automatically at
        the same price and length unless it is cancelled at least 24 hours before the end of the current period;
        renewal is charged within the 24 hours before the period ends. A free trial, where offered, becomes a paid
        subscription unless cancelled at least 24 hours before it ends, and any unused part of it ends when you
        buy a subscription. Manage or cancel in Settings → your name → Subscriptions.
      </p>
      <p className="flex flex-wrap gap-x-4">
        <a href={TERMS_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center font-semibold text-violet-soft hover:text-ink">
          Terms of Use (EULA)
        </a>
        {PRIVACY_URL && (
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center font-semibold text-violet-soft hover:text-ink">
            Privacy Policy
          </a>
        )}
      </p>
    </div>
  );
}
