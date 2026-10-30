import { describe, expect, it } from 'vitest';
import type { CustomerInfo, PurchasesIntroPrice, PurchasesOffering, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import {
  PRODUCTS,
  introText,
  isCancelled,
  isIntroEligible,
  planAction,
  plansFromOffering,
  purchaseErrorText,
  renewalText,
  subscriptionFromCustomerInfo,
  tierFromCustomerInfo,
  type Plan,
  type Subscription,
} from './plans';
import { SAMPLE_PLANS } from './plans.sample';

function pkg(productId: string, priceString = '$1.00', perMonth: string | null = null): PurchasesPackage {
  return {
    identifier: productId,
    product: { identifier: productId, priceString, pricePerMonthString: perMonth, introPrice: null },
  } as unknown as PurchasesPackage;
}

function offering(packages: PurchasesPackage[]): PurchasesOffering {
  return { identifier: 'default', availablePackages: packages } as unknown as PurchasesOffering;
}

function info(active: Record<string, { productIdentifier: string; willRenew?: boolean; expirationDate?: string | null }>): CustomerInfo {
  const entitlements = Object.fromEntries(
    Object.entries(active).map(([id, e]) => [
      id,
      { identifier: id, isActive: true, willRenew: e.willRenew ?? true, expirationDate: e.expirationDate ?? null, productIdentifier: e.productIdentifier },
    ]),
  );
  return { entitlements: { active: entitlements, all: entitlements }, managementURL: null } as unknown as CustomerInfo;
}

const intro = (over: Partial<PurchasesIntroPrice>): PurchasesIntroPrice => ({
  price: 0,
  priceString: '$0.00',
  cycles: 1,
  period: 'P1W',
  periodUnit: 'WEEK',
  periodNumberOfUnits: 1,
  ...over,
});

describe('plansFromOffering', () => {
  it('keeps only the four UroApp products, ordered Pro then Elite, monthly then yearly', () => {
    const plans = plansFromOffering(
      offering([
        pkg('com.uroapp.clinical.elite.yearly', '$79.99', '$6.67'),
        pkg('something.else'),
        pkg('com.uroapp.clinical.pro.monthly', '$4.99', '$4.99'),
        pkg('com.uroapp.clinical.pro.yearly', '$39.99', '$3.33'),
        pkg('com.uroapp.clinical.elite.monthly', '$9.99'),
      ]),
    );
    expect(plans.map((p) => p.productId)).toEqual([
      'com.uroapp.clinical.pro.monthly',
      'com.uroapp.clinical.pro.yearly',
      'com.uroapp.clinical.elite.monthly',
      'com.uroapp.clinical.elite.yearly',
    ]);
  });

  it('shows a monthly equivalent only on yearly plans', () => {
    const [monthly, yearly] = plansFromOffering(
      offering([pkg('com.uroapp.clinical.pro.monthly', '$4.99', '$4.99'), pkg('com.uroapp.clinical.pro.yearly', '$39.99', '$3.33')]),
    );
    expect(monthly!.perMonth).toBeNull();
    expect(yearly!.perMonth).toBe('$3.33');
    expect(yearly!.price).toBe('$39.99');
  });

  it('drops a product listed twice and copes with no offering', () => {
    expect(plansFromOffering(offering([pkg('com.uroapp.clinical.pro.monthly'), pkg('com.uroapp.clinical.pro.monthly')]))).toHaveLength(1);
    expect(plansFromOffering(null)).toEqual([]);
  });
});

describe('tier from entitlements', () => {
  it('takes the highest active entitlement', () => {
    expect(tierFromCustomerInfo(info({}))).toBe('resident');
    expect(tierFromCustomerInfo(info({ pro: { productIdentifier: 'com.uroapp.clinical.pro.yearly' } }))).toBe('pro');
    expect(
      tierFromCustomerInfo(
        info({
          pro: { productIdentifier: 'com.uroapp.clinical.elite.yearly' },
          elite: { productIdentifier: 'com.uroapp.clinical.elite.yearly' },
        }),
      ),
    ).toBe('elite');
    expect(tierFromCustomerInfo(info({ elite: { productIdentifier: 'com.uroapp.clinical.elite.monthly' } }))).toBe('elite');
  });

  it('ignores entitlements with other names', () => {
    expect(tierFromCustomerInfo(info({ premium: { productIdentifier: 'x' } }))).toBe('resident');
  });

  it('describes the active subscription', () => {
    expect(subscriptionFromCustomerInfo(info({}))).toBeNull();
    expect(
      subscriptionFromCustomerInfo(
        info({ pro: { productIdentifier: 'com.uroapp.clinical.pro.yearly', willRenew: false, expirationDate: '2027-11-12T00:00:00Z' } }),
      ),
    ).toEqual({
      tier: 'pro',
      productId: 'com.uroapp.clinical.pro.yearly',
      willRenew: false,
      expiresAt: '2027-11-12T00:00:00Z',
      managementUrl: null,
    });
  });
});

describe('renewalText', () => {
  const fmt = (iso: string) => iso.slice(0, 10);
  const sub = (over: Partial<Subscription>): Subscription => ({
    tier: 'pro',
    productId: 'com.uroapp.clinical.pro.yearly',
    willRenew: true,
    expiresAt: '2027-11-12T00:00:00Z',
    managementUrl: null,
    ...over,
  });

  it('says when it renews or ends', () => {
    expect(renewalText(sub({}), fmt)).toBe('Renews 2027-11-12');
    expect(renewalText(sub({ willRenew: false }), fmt)).toBe('Ends 2027-11-12, won’t renew');
  });

  it('calls a grant made in RevenueCat complimentary', () => {
    expect(renewalText(sub({ productId: 'rc_promo_pro_lifetime', expiresAt: null }), fmt)).toBe('Complimentary access');
    expect(renewalText(sub({ productId: 'rc_promo_pro_yearly' }), fmt)).toBe('Complimentary access until 2027-11-12');
  });
});

describe('introText', () => {
  it('words free trials', () => {
    expect(introText(intro({}))).toBe('1-week free trial');
    expect(introText(intro({ periodUnit: 'DAY', periodNumberOfUnits: 3 }))).toBe('3-day free trial');
    expect(introText(intro({ periodUnit: 'MONTH' }))).toBe('1-month free trial');
  });

  it('words paid intro offers', () => {
    expect(introText(intro({ price: 0.99, priceString: '$0.99', periodUnit: 'MONTH', cycles: 3 }))).toBe(
      '$0.99/month for the first 3 months',
    );
    expect(introText(intro({ price: 9.99, priceString: '$9.99', periodUnit: 'MONTH', periodNumberOfUnits: 3 }))).toBe(
      '$9.99 for the first 3 months',
    );
  });

  it('is null without an offer', () => {
    expect(introText(null)).toBeNull();
  });

  it('shows an offer only when Apple says this Apple ID is eligible', () => {
    expect(isIntroEligible({ status: 2, description: '' })).toBe(true);
    expect(isIntroEligible({ status: 0, description: '' })).toBe(false); // unknown
    expect(isIntroEligible({ status: 1, description: '' })).toBe(false);
    expect(isIntroEligible(undefined)).toBe(false);
  });
});

describe('planAction', () => {
  const plan = (productId: string, over: Partial<Plan> = {}): Plan => ({
    productId,
    ...PRODUCTS[productId]!,
    price: '$1',
    perMonth: null,
    intro: null,
    pkg: {} as PurchasesPackage,
    ...over,
  });
  const proYearly = plan('com.uroapp.clinical.pro.yearly');
  const proMonthly = plan('com.uroapp.clinical.pro.monthly');
  const eliteYearly = plan('com.uroapp.clinical.elite.yearly');
  const sub = (productId: string, tier: 'pro' | 'elite'): Subscription => ({
    tier,
    productId,
    willRenew: true,
    expiresAt: null,
    managementUrl: null,
  });

  it('offers a subscription, or a free trial when there is one', () => {
    expect(planAction('pro', proYearly, 'resident', null)).toEqual({ label: 'Subscribe to Pro', enabled: true });
    expect(planAction('pro', { ...proYearly, intro: intro({}) }, 'resident', null)).toEqual({
      label: 'Start free trial',
      enabled: true,
    });
  });

  it('cannot buy before the price has loaded', () => {
    expect(planAction('pro', undefined, 'resident', null).enabled).toBe(false);
  });

  it('marks the current plan, offers the other period, upgrades and never downgrades', () => {
    const pro = sub('com.uroapp.clinical.pro.yearly', 'pro');
    expect(planAction('pro', proYearly, 'pro', pro)).toEqual({ label: 'Current plan', enabled: false });
    expect(planAction('pro', proMonthly, 'pro', pro)).toEqual({ label: 'Switch to monthly', enabled: true });
    expect(planAction('elite', eliteYearly, 'pro', pro)).toEqual({ label: 'Upgrade to Elite', enabled: true });
    const elite = sub('com.uroapp.clinical.elite.yearly', 'elite');
    expect(planAction('pro', proYearly, 'elite', elite)).toEqual({ label: 'Included in Elite', enabled: false });
  });

  it('does not offer to switch a complimentary grant', () => {
    expect(planAction('pro', proMonthly, 'pro', sub('rc_promo_pro_lifetime', 'pro'))).toEqual({
      label: 'Current plan',
      enabled: false,
    });
  });
});

describe('errors', () => {
  it('treats closing the sheet as a cancel, not an error', () => {
    expect(isCancelled({ code: '1' })).toBe(true);
    expect(isCancelled({ userCancelled: true })).toBe(true);
    expect(isCancelled({ code: '10' })).toBe(false);
    expect(isCancelled(null)).toBe(false);
  });

  it('explains the common store failures', () => {
    expect(purchaseErrorText({ code: '10' })).toMatch(/connection/);
    expect(purchaseErrorText({ code: '20' })).toMatch(/approval/);
    expect(purchaseErrorText(new Error('Odd'))).toBe('Odd');
    expect(purchaseErrorText(42)).toMatch(/try again/);
  });
});

describe('sample plans (development only)', () => {
  it('covers each product exactly once', () => {
    expect(SAMPLE_PLANS.map((p) => p.productId).sort()).toEqual(Object.keys(PRODUCTS).sort());
  });
});
