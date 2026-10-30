import { createContext, useContext } from 'react';
import type { Tier } from './entitlements';
import type { GatedFeature } from './featureTiers';
import type { Plan, Subscription } from './plans';

export interface PurchasesState {
  /**
   * `unavailable`: not the iOS app, or no RevenueCat key in this build.
   * `error`: the App Store didn't return the plans (offline, or products not live yet).
   */
  status: 'unavailable' | 'loading' | 'ready' | 'error';
  plans: Plan[];
  subscription: Subscription | null;
  /** Development browser build showing sample prices, so the screen can be laid out. */
  sample: boolean;
  reloadPlans: () => Promise<void>;
  /** True when bought; false when the person closed Apple's sheet. Throws with a readable message. */
  purchase: (plan: Plan) => Promise<boolean>;
  /** The tier after restoring. Throws with a readable message. */
  restore: () => Promise<Tier>;
  /** Show the plans screen, optionally saying which locked feature led there. */
  openPlans: (feature?: GatedFeature) => void;
}

const off = async (): Promise<never> => {
  throw new Error('Purchases are not available in this build.');
};

export const PurchasesContext = createContext<PurchasesState>({
  status: 'unavailable',
  plans: [],
  subscription: null,
  sample: false,
  reloadPlans: async () => {},
  purchase: off,
  restore: off,
  openPlans: () => {},
});

export function usePurchases(): PurchasesState {
  return useContext(PurchasesContext);
}
