/**
 * DEVELOPMENT ONLY — sample plans so the plans screen can be laid out in a
 * browser, where the App Store isn't reachable. Loaded behind
 * `import.meta.env.DEV`, so production bundles never contain it. The prices
 * are the planned US tiers (docs/PUBLISHING.md B); the real screen shows
 * whatever the App Store returns.
 */
import type { PurchasesIntroPrice, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { PRODUCTS, type Plan } from './plans';

const PRICE: Record<string, number> = {
  'com.uroapp.clinical.pro.monthly': 4.99,
  'com.uroapp.clinical.pro.yearly': 39.99,
  'com.uroapp.clinical.elite.monthly': 9.99,
  'com.uroapp.clinical.elite.yearly': 79.99,
};

const WEEK_TRIAL: PurchasesIntroPrice = {
  price: 0,
  priceString: '$0.00',
  cycles: 1,
  period: 'P1W',
  periodUnit: 'WEEK',
  periodNumberOfUnits: 1,
};

export const SAMPLE_PLANS: Plan[] = Object.entries(PRODUCTS).map(([productId, { tier, period }]) => {
  const price = PRICE[productId]!;
  return {
    productId,
    tier,
    period,
    price: `$${price.toFixed(2)}`,
    perMonth: period === 'yearly' ? `$${(price / 12).toFixed(2)}` : null,
    intro: period === 'yearly' ? WEEK_TRIAL : null,
    pkg: { identifier: productId } as PurchasesPackage,
  };
});
