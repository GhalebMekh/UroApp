/**
 * What can be bought, and what the store says about it. Pure helpers around
 * RevenueCat's data shapes; lib/purchases.ts makes the SDK calls.
 *
 * Prices are never written here: they come from the App Store per storefront
 * (SAR in Saudi Arabia, USD elsewhere), so the screen shows only what Apple
 * will actually charge.
 */
import {
  INTRO_ELIGIBILITY_STATUS,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type IntroEligibility,
  type PurchasesIntroPrice,
  type PurchasesOffering,
  type PurchasesPackage,
} from '@revenuecat/purchases-capacitor';
import { TIER_LABEL, TIER_RANK, type Tier } from './entitlements';

export type PaidTier = Exclude<Tier, 'resident'>;
export type Period = 'monthly' | 'yearly';

/** The four App Store products (docs/PUBLISHING.md B), one subscription group. */
export const PRODUCTS: Record<string, { tier: PaidTier; period: Period }> = {
  'com.uroapp.clinical.pro.monthly': { tier: 'pro', period: 'monthly' },
  'com.uroapp.clinical.pro.yearly': { tier: 'pro', period: 'yearly' },
  'com.uroapp.clinical.elite.monthly': { tier: 'elite', period: 'monthly' },
  'com.uroapp.clinical.elite.yearly': { tier: 'elite', period: 'yearly' },
};

/** RevenueCat entitlement identifiers. Elite products unlock `elite` (and may also unlock `pro`). */
export const ENTITLEMENT: Record<PaidTier, string> = { pro: 'pro', elite: 'elite' };

export interface Plan {
  productId: string;
  tier: PaidTier;
  period: Period;
  /** The amount billed each period, as the App Store formats it, e.g. "SAR 149.99". */
  price: string;
  /** Yearly plans only: the monthly equivalent, shown smaller than the billed amount. */
  perMonth: string | null;
  intro: PurchasesIntroPrice | null;
  pkg: PurchasesPackage;
}

const TIER_ORDER: Record<PaidTier, number> = { pro: 0, elite: 1 };
const PERIOD_ORDER: Record<Period, number> = { monthly: 0, yearly: 1 };

/** The offering's packages that are UroApp plans, matched by product id (package ids can be anything). */
export function plansFromOffering(offering: PurchasesOffering | null): Plan[] {
  if (!offering) return [];
  const seen = new Set<string>();
  const plans: Plan[] = [];
  for (const pkg of offering.availablePackages) {
    const productId = pkg.product.identifier;
    const known = PRODUCTS[productId];
    if (!known || seen.has(productId)) continue;
    seen.add(productId);
    plans.push({
      productId,
      ...known,
      price: pkg.product.priceString,
      perMonth: known.period === 'yearly' ? pkg.product.pricePerMonthString : null,
      intro: pkg.product.introPrice,
      pkg,
    });
  }
  return plans.sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || PERIOD_ORDER[a.period] - PERIOD_ORDER[b.period]);
}

/** The highest tier with an active entitlement. */
export function tierFromCustomerInfo(info: Pick<CustomerInfo, 'entitlements'>): Tier {
  const active = info.entitlements.active;
  if (active[ENTITLEMENT.elite]?.isActive) return 'elite';
  if (active[ENTITLEMENT.pro]?.isActive) return 'pro';
  return 'resident';
}

export interface Subscription {
  tier: PaidTier;
  productId: string;
  willRenew: boolean;
  /** ISO date the current period ends; null for a lifetime grant. */
  expiresAt: string | null;
  /** Apple's manage-subscription page for this purchase, when RevenueCat has one. */
  managementUrl: string | null;
}

/** What the active subscription is, for "Current plan" and the renewal line. */
export function subscriptionFromCustomerInfo(info: Pick<CustomerInfo, 'entitlements' | 'managementURL'>): Subscription | null {
  const tier = tierFromCustomerInfo(info);
  if (tier === 'resident') return null;
  const ent = info.entitlements.active[ENTITLEMENT[tier]]!;
  return {
    tier,
    productId: ent.productIdentifier,
    willRenew: ent.willRenew,
    expiresAt: ent.expirationDate,
    managementUrl: info.managementURL,
  };
}

/** Show an intro offer only when Apple says this Apple ID can still use it (RevenueCat: unknown → don't). */
export function isIntroEligible(e: IntroEligibility | undefined): boolean {
  return e?.status === INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
}

const UNIT: Record<string, string> = { DAY: 'day', WEEK: 'week', MONTH: 'month', YEAR: 'year' };

function span(count: number, unit: string, hyphen = false): string {
  const word = UNIT[unit] ?? unit.toLowerCase();
  if (hyphen) return `${count}-${word}`;
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

/**
 * The intro offer in words, e.g. "1-week free trial" or "SAR 9.99/month for the
 * first 3 months". Null when there is no offer.
 */
export function introText(intro: PurchasesIntroPrice | null): string | null {
  if (!intro) return null;
  const { periodNumberOfUnits: n, periodUnit: unit, cycles } = intro;
  const total = n * Math.max(1, cycles);
  if (intro.price === 0) return `${span(total, unit, true)} free trial`;
  if (cycles > 1) {
    const each = n === 1 ? UNIT[unit] ?? unit.toLowerCase() : span(n, unit);
    return `${intro.priceString}/${each} for the first ${span(total, unit)}`;
  }
  return `${intro.priceString} for the first ${span(total, unit)}`;
}

export function isFreeTrial(intro: PurchasesIntroPrice | null): boolean {
  return intro !== null && intro.price === 0;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "Renews 12 Nov 2027", "Ends …", or "Complimentary access" for a grant made in RevenueCat. */
export function renewalText(sub: Subscription, formatDate: (iso: string) => string = shortDate): string {
  const date = sub.expiresAt ? formatDate(sub.expiresAt) : null;
  if (!PRODUCTS[sub.productId]) return date ? `Complimentary access until ${date}` : 'Complimentary access';
  if (!date) return 'Active';
  return sub.willRenew ? `Renews ${date}` : `Ends ${date}, won’t renew`;
}

/**
 * The button on a plan card, given what the person already has. Downgrades
 * aren't offered here: Apple applies them at renewal, from Manage subscription.
 */
export function planAction(
  tier: PaidTier,
  plan: Plan | undefined,
  active: Tier,
  sub: Subscription | null,
): { label: string; enabled: boolean } {
  const label = TIER_LABEL[tier];
  if (sub && plan && sub.productId === plan.productId) return { label: 'Current plan', enabled: false };
  if (TIER_RANK[active] > TIER_RANK[tier]) return { label: `Included in ${TIER_LABEL[active]}`, enabled: false };
  if (active === tier) {
    // Same tier, other billing period: Apple switches it (a crossgrade). A grant can't be switched.
    if (!sub || !PRODUCTS[sub.productId] || !plan) return { label: 'Current plan', enabled: false };
    return { label: `Switch to ${plan.period}`, enabled: true };
  }
  if (active !== 'resident') return { label: `Upgrade to ${label}`, enabled: plan !== undefined };
  if (!plan) return { label: `Subscribe to ${label}`, enabled: false };
  return { label: isFreeTrial(plan.intro) ? 'Start free trial' : `Subscribe to ${label}`, enabled: true };
}

/** True when the person closed Apple's purchase sheet themselves — not an error to show. */
export function isCancelled(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const err = e as { code?: unknown; userCancelled?: unknown };
  return err.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || err.userCancelled === true;
}

/** A sentence for a failed purchase or restore. */
export function purchaseErrorText(e: unknown): string {
  const code = e && typeof e === 'object' ? (e as { code?: unknown }).code : undefined;
  switch (code) {
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
      return 'Can’t reach the App Store. Check your connection and try again.';
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return 'The purchase is waiting for approval (for example Ask to Buy). The plan unlocks once it is approved.';
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
      return 'Purchases are turned off on this device (Settings → Screen Time → Content & Privacy Restrictions).';
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
      return 'This Apple ID already has this plan. Tap Restore Purchases.';
    case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
      return 'The App Store had a problem. Please try again in a moment.';
    default:
      return e instanceof Error && e.message ? e.message : 'Something went wrong. Please try again.';
  }
}
