import { TIER_LABEL, type Tier, useEntitlements } from '@/lib/entitlements';
import { cn } from '@/lib/cn';
import { lockApp, passcodeEnabled } from '@/lib/passcode';

const TIERS: Tier[] = ['resident', 'pro', 'elite'];

/** Settings / about — houses the medical disclaimer and Restore Purchases.
 *  (Workspaces now live under the Clinical and Academic hubs.) */
export function MoreScreen() {
  const { tier, setTier } = useEntitlements();

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            UroApp
          </div>
          <h2 className="font-display text-[28px] font-semibold">More</h2>
        </header>

        {/* Medical disclaimer — required visible (CLAUDE.md) */}
        <section className="rounded-[16px] border border-line bg-navy-2 p-5">
          <h3 className="mb-2 text-[15px] font-semibold">Medical disclaimer</h3>
          <p className="text-[13px] text-muted">
            UroApp is an educational and decision-support tool for licensed
            healthcare professionals. It stores no patient-identifiable data;
            calculator inputs stay on your device. Every score, summary and AI
            output must be verified against primary sources and local protocols.
            Clinical responsibility remains with the treating physician.
          </p>
        </section>

        {/* Lets a shared or borrowed device be handed over locked. Hidden when
            no passcode is configured, where the button would do nothing. */}
        {passcodeEnabled && (
          <section className="rounded-[16px] border border-line bg-navy-2 p-5">
            <h3 className="text-[15px] font-semibold">Access</h3>
            <p className="mb-3 text-[12px] text-muted-2">
              Locking clears this device’s unlock; the passcode is needed again.
            </p>
            <button
              type="button"
              onClick={() => void lockApp()}
              className="min-h-[44px] w-full rounded-[11px] border border-line bg-navy py-3 text-[14px] font-semibold text-ink transition-colors hover:border-violet"
            >
              Lock this device
            </button>
          </section>
        )}

        {/* Status of features that are announced but not yet shipped, so the
            app never implies something is available when it isn't. */}
        <section className="rounded-[16px] border border-line bg-navy-2 p-5">
          <h3 className="mb-3 text-[15px] font-semibold">In development</h3>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold">Evidence AI</div>
              <p className="mt-1 text-[13px] text-muted">
                A cited evidence assistant for clinical questions. Not available
                yet — every tool in the app today is offline and sourced.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-line bg-steel px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              Soon
            </span>
          </div>
        </section>

        {/* Restore Purchases — must stay visible (CLAUDE.md). Wired to
            RevenueCat in Sprint 4; inert in the web preview. */}
        <button
          type="button"
          className="w-full rounded-[11px] border border-line bg-navy-2 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-violet"
        >
          Restore Purchases
        </button>

        {/* Preview-only tier switcher. RevenueCat owns the real entitlement. */}
        <section className="rounded-[16px] border border-line bg-navy-2 p-5">
          <h3 className="text-[15px] font-semibold">Subscription tier</h3>
          <p className="mb-3 text-[12px] text-muted-2">
            Preview only — the live entitlement comes from RevenueCat (Sprint 4).
          </p>
          <div className="flex gap-2">
            {TIERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={cn(
                  'min-h-[44px] flex-1 rounded-[10px] border px-3 py-2.5 text-[13px] transition-colors',
                  t === tier
                    ? 'border-violet bg-violet/[0.18] font-semibold text-violet-soft'
                    : 'border-line bg-navy text-muted hover:border-violet',
                )}
              >
                {TIER_LABEL[t]}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
