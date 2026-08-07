import type { ReactNode } from 'react';
import { LockIcon } from './icons';
import { TIER_LABEL, type Tier, hasAccess, useEntitlements } from '@/lib/entitlements';

interface ProGateProps {
  /** Minimum tier required to view the children. */
  required: Exclude<Tier, 'resident'>;
  /** What this gated feature is, for the upsell card. */
  feature: string;
  children: ReactNode;
}

/**
 * Gates Pro/Elite features behind the active entitlement (CLAUDE.md).
 * When access is denied it shows an upsell instead of the feature — it never
 * relies on a local flag for the grant itself; that comes from RevenueCat.
 */
export function ProGate({ required, feature, children }: ProGateProps) {
  const { tier } = useEntitlements();

  if (hasAccess(tier, required)) return <>{children}</>;

  return (
    <div className="rounded-card border border-line bg-ai-soft p-7 text-center">
      <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-[11px] bg-steel text-[20px] text-violet-soft">
        <LockIcon />
      </div>
      <h3 className="mb-2 font-display text-[18px] font-semibold">
        {TIER_LABEL[required]} feature
      </h3>
      <p className="mx-auto max-w-sm text-[14px] text-muted">
        {feature} is part of UroApp {TIER_LABEL[required]}. Subscriptions are
        managed through Apple — upgrade from the App Store listing when the beta
        opens.
      </p>
    </div>
  );
}
