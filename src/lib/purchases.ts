/**
 * RevenueCat SDK calls (CLAUDE.md: the tier comes from RevenueCat entitlements,
 * never a local flag). Only the iOS app with a key can buy: the plugin's web
 * version throws, so nothing here runs in a browser build.
 */
import { Capacitor } from '@capacitor/core';
import { Purchases, type CustomerInfo } from '@revenuecat/purchases-capacitor';
import { isIntroEligible, plansFromOffering, type Plan } from './plans';

const API_KEY = import.meta.env.VITE_REVENUECAT_IOS_KEY?.trim() ?? '';

/** True in the iOS app built with a RevenueCat public key. */
export const purchasesSupported = Capacitor.getPlatform() === 'ios' && API_KEY.length > 0;

/**
 * Start the SDK. A signed-in account passes its user id, so a subscription
 * follows the person to their iPad (and a manual lifetime grant in RevenueCat
 * can be attached to that id); otherwise RevenueCat uses an anonymous id.
 */
export async function configurePurchases(appUserID: string | null): Promise<CustomerInfo> {
  await Purchases.configure({ apiKey: API_KEY, appUserID });
  const { customerInfo } = await Purchases.getCustomerInfo();
  return customerInfo;
}

/** Called with fresh customer info on renewals, expiries and purchases made elsewhere. */
export async function watchCustomerInfo(onChange: (info: CustomerInfo) => void): Promise<void> {
  await Purchases.addCustomerInfoUpdateListener(onChange);
}

/** The current offering's plans, with intro offers removed where this Apple ID has used them. */
export async function loadPlans(): Promise<Plan[]> {
  const offerings = await Purchases.getOfferings();
  const plans = plansFromOffering(offerings.current);
  if (plans.length === 0) return plans;
  const eligibility = await Purchases.checkTrialOrIntroductoryPriceEligibility({
    productIdentifiers: plans.map((p) => p.productId),
  }).catch(() => ({}) as Awaited<ReturnType<typeof Purchases.checkTrialOrIntroductoryPriceEligibility>>);
  return plans.map((p) => (isIntroEligible(eligibility[p.productId]) ? p : { ...p, intro: null }));
}

/** Opens Apple's purchase sheet. Rejects on cancel too — see plans.isCancelled. */
export async function buyPlan(plan: Plan): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: plan.pkg });
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.restorePurchases();
  return customerInfo;
}

/** Signing in switches RevenueCat to the account's id; signing out back to an anonymous one. */
export async function switchUser(appUserID: string | null): Promise<CustomerInfo> {
  if (appUserID) return (await Purchases.logIn({ appUserID })).customerInfo;
  return (await Purchases.logOut()).customerInfo;
}

/** Apple's own page for managing subscriptions, when RevenueCat doesn't give a more specific one. */
export const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
