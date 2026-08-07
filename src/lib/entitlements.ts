/**
 * Subscription tiers. Per CLAUDE.md, the real entitlement is owned by
 * RevenueCat (wired in Sprint 4) — never local feature flags. This module
 * is the single source of truth the rest of the app reads from, so swapping
 * the stub below for the RevenueCat SDK is a one-file change.
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
  /** Dev/preview affordance only — RevenueCat replaces this in Sprint 4. */
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
