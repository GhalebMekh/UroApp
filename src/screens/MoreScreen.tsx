import { TIER_LABEL, type Tier, useEntitlements } from '@/lib/entitlements';
import { cn } from '@/lib/cn';
import { lockApp, passcodeEnabled } from '@/lib/passcode';
import { AppLockSettings } from '@/components/AppLockSettings';
import { AccountSettings } from '@/components/AccountSettings';
import { previewMode } from '@/lib/preview';
import { PageBody, PageHero } from '@/components/PageHero';

/** e.g. "24 Oct 2026, 10:30" — readable without a timezone lookup. */
const builtAt = new Date(__BUILD_TIME__).toLocaleString('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const TIERS: Tier[] = ['resident', 'pro', 'elite'];

/** Settings / about — houses the medical disclaimer and Restore Purchases.
 *  (Workspaces now live under the Clinical and Academic hubs.) */
export function MoreScreen() {
  const { tier, setTier } = useEntitlements();

  return (
    <>
      <PageHero
        eyebrow="UroApp"
        title="More"
        lede="Your account and backup, app lock, purchases and the medical disclaimer."
      />
      <PageBody narrow>
        {/* First, so the profile button on Home lands on it. */}
        <AccountSettings />

        {/* Medical disclaimer — required visible (CLAUDE.md) */}
        <section className="rounded-[16px] border border-line bg-navy-2 p-5">
          <h3 className="mb-2 text-[15px] font-semibold">Medical disclaimer</h3>
          <p className="text-[13px] text-muted">
            UroApp is an educational and decision-support tool for licensed
            healthcare professionals. It stores no patient-identifiable data;
            calculator inputs stay on your device. Every score and summary must
            be verified against primary sources and local protocols.
            Clinical responsibility remains with the treating physician.
          </p>
        </section>

        <AppLockSettings />

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

        {/* Restore Purchases — must stay visible (CLAUDE.md). Wired to
            RevenueCat in Sprint 4; inert in the web preview. */}
        <button
          type="button"
          className="w-full rounded-[11px] border border-line bg-navy-2 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-violet"
        >
          Restore Purchases
        </button>

        {/* Development-only tier switcher, so gated screens can be previewed.
            Stripped from production builds: in the App Store build it would
            unlock paid tiers without in-app purchase (guideline 3.1.1).
            RevenueCat owns the real entitlement. */}
        {import.meta.env.DEV && (
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
        )}

        {/* Which build this is. A deployed copy otherwise gives no way to tell
            whether the latest commit has gone live. */}
        <p className="text-center font-mono text-[11px] text-muted-2">
          {previewMode ? 'Web preview' : 'Build'} {__BUILD_COMMIT__} · {builtAt}
        </p>
      </PageBody>
    </>
  );
}
