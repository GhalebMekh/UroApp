/**
 * Subscription tiers. Per CLAUDE.md, the real entitlement is owned by
 * RevenueCat — never local feature flags. components/PurchasesProvider
 * reads it from the SDK and provides it here; the rest of the app reads
 * the tier from this context only.
 */
import { createContext, useContext } from 'react';

export type Tier = 'resident' | 'pro' | 'elite';

/** Ordered low → high so we can compare with >=. */
export const TIER_RANK: Record<Tier, number> = {
  resident: 0,
  pro: 1,
  elite: 2,
};

export const TIER_LABEL: Record<Tier, string> = {
  resident: 'Resident',
  pro: 'Pro',
  elite: 'Elite',
};

export interface Entitlements {
  /** The user's current tier. Defaults to the free Resident tier. */
  tier: Tier;
  /** Development builds only (the tier switcher in More); a no-op in production. */
  setTier: (tier: Tier) => void;
}

export const EntitlementsContext = createContext<Entitlements>({
  tier: 'resident',
  setTier: () => {},
});

export function useEntitlements(): Entitlements {
  return useContext(EntitlementsContext);
}

/** True when the active tier meets or exceeds `required`. */
export function hasAccess(active: Tier, required: Tier): boolean {
  return TIER_RANK[active] >= TIER_RANK[required];
}
