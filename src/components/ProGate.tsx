import type { ReactNode } from 'react';
import { LockIcon } from './icons';
import { TIER_LABEL, hasAccess, useEntitlements } from '@/lib/entitlements';
import { FEATURE_LABEL, FEATURE_TIER, PAYWALL_ENABLED, type GatedFeature } from '@/lib/featureTiers';
import { usePurchases } from '@/lib/purchasesContext';

interface ProGateProps {
  /** Which feature this is; its tier comes from lib/featureTiers. */
  feature: GatedFeature;
  /** Compact card for a section inside a screen, rather than a whole screen. */
  inline?: boolean;
  children: ReactNode;
}

/**
 * Gates Pro/Elite features behind the active entitlement (CLAUDE.md).
 * The tier comes from the entitlement only. Until VITE_PAYWALL=on — i.e.
 * until a subscription can actually be bought — everything is shown, so no
 * one meets a paid feature with no way to pay for it.
 */
export function ProGate({ feature, inline = false, children }: ProGateProps) {
  const { tier } = useEntitlements();
  const { openPlans } = usePurchases();
  const required = FEATURE_TIER[feature];

  if (!PAYWALL_ENABLED || hasAccess(tier, required)) return <>{children}</>;

  return (
    <div className={inline ? 'mb-5' : 'mx-auto max-w-wrap px-6 py-12'}>
      <div className="rounded-card border border-line bg-ai-soft p-7 text-center">
        <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-[11px] bg-steel text-[20px] text-violet-soft">
          <LockIcon />
        </div>
        <h3 className="mb-2 font-display text-[18px] font-semibold">{TIER_LABEL[required]} feature</h3>
        <p className="mx-auto max-w-sm text-[14px] text-muted">
          {FEATURE_LABEL[feature]} is part of UroApp {TIER_LABEL[required]}. Subscriptions are
          managed through Apple.
        </p>
        <button
          type="button"
          onClick={() => openPlans(feature)}
          className="mt-5 min-h-[44px] rounded-[11px] bg-violet px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-violet-deep"
        >
          See plans
        </button>
      </div>
    </div>
  );
}
