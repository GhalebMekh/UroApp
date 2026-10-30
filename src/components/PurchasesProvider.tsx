import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CustomerInfo } from '@revenuecat/purchases-capacitor';
import { useAccount } from '@/lib/accountContext';
import { EntitlementsContext, type Tier } from '@/lib/entitlements';
import type { GatedFeature } from '@/lib/featureTiers';
import {
  isCancelled,
  purchaseErrorText,
  subscriptionFromCustomerInfo,
  tierFromCustomerInfo,
  type Plan,
} from '@/lib/plans';
import {
  buyPlan,
  configurePurchases,
  loadPlans,
  purchasesSupported,
  restorePurchases,
  switchUser,
  watchCustomerInfo,
} from '@/lib/purchases';
import { PurchasesContext, type PurchasesState } from '@/lib/purchasesContext';

/** A browser dev build lays the plans screen out with sample prices; purchases just switch the tier. */
const SAMPLE = import.meta.env.DEV && !purchasesSupported;

/**
 * Owns the subscription: starts RevenueCat once the account state is known,
 * follows sign-in and sign-out, and provides the tier to the whole app
 * (EntitlementsContext). Outside the iOS app everyone is on Resident.
 */
export function PurchasesProvider({
  onOpenPlans,
  children,
}: {
  onOpenPlans: (feature?: GatedFeature) => void;
  children: ReactNode;
}) {
  const account = useAccount();
  const accountStatus = account.status;
  const userId = account.userId;

  const [info, setInfo] = useState<CustomerInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planStatus, setPlanStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  /** Development-only tier override (the switcher in More); ignored in production builds. */
  const [devTier, setDevTier] = useState<Tier | null>(null);

  const started = useRef<Promise<void> | null>(null);
  const identity = useRef<string | null>(null);

  const reloadPlans = useCallback(async () => {
    if (SAMPLE) {
      const { SAMPLE_PLANS } = await import('@/lib/plans.sample');
      setPlans(SAMPLE_PLANS);
      setPlanStatus('ready');
      return;
    }
    if (!started.current) return;
    setPlanStatus('loading');
    try {
      await started.current;
      const next = await loadPlans();
      setPlans(next);
      setPlanStatus(next.length > 0 ? 'ready' : 'error');
    } catch {
      setPlanStatus('error');
    }
  }, []);

  // Start once we know whether someone is signed in, then follow account changes.
  useEffect(() => {
    if (!purchasesSupported || accountStatus === 'loading') return;
    if (!started.current) {
      identity.current = userId;
      started.current = configurePurchases(userId).then((ci) => {
        setInfo(ci);
        return watchCustomerInfo(setInfo);
      });
      void reloadPlans();
      return;
    }
    if (identity.current === userId) return;
    identity.current = userId;
    void started.current
      .then(() => switchUser(userId))
      .then(setInfo)
      .catch(() => undefined); // keeps the previous status; RevenueCat retries on the next call
  }, [accountStatus, userId, reloadPlans]);

  useEffect(() => {
    if (SAMPLE) void reloadPlans();
  }, [reloadPlans]);

  const storeTier: Tier = info ? tierFromCustomerInfo(info) : 'resident';
  const tier: Tier = import.meta.env.DEV && devTier ? devTier : storeTier;

  const value = useMemo<PurchasesState>(
    () => ({
      status: SAMPLE ? planStatus : purchasesSupported ? planStatus : 'unavailable',
      plans,
      subscription: info ? subscriptionFromCustomerInfo(info) : null,
      sample: SAMPLE,
      reloadPlans,
      purchase: async (plan) => {
        if (SAMPLE) {
          setDevTier(plan.tier);
          return true;
        }
        try {
          setInfo(await buyPlan(plan));
          return true;
        } catch (e) {
          if (isCancelled(e)) return false;
          throw new Error(purchaseErrorText(e));
        }
      },
      restore: async () => {
        if (SAMPLE) return tier;
        try {
          const ci = await restorePurchases();
          setInfo(ci);
          return tierFromCustomerInfo(ci);
        } catch (e) {
          throw new Error(purchaseErrorText(e));
        }
      },
      openPlans: onOpenPlans,
    }),
    [planStatus, plans, info, reloadPlans, tier, onOpenPlans],
  );

  const entitlements = useMemo(
    () => ({ tier, setTier: import.meta.env.DEV ? setDevTier : () => {} }),
    [tier],
  );

  return (
    <EntitlementsContext.Provider value={entitlements}>
      <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>
    </EntitlementsContext.Provider>
  );
}
