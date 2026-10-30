/// <reference types="vite/client" />

/** SHA-256 of the access passcode, injected at build time by vite.config.ts. */
declare const __PASSCODE_HASH__: string;

/** Short commit SHA the bundle was built from, injected by vite.config.ts. */
declare const __BUILD_COMMIT__: string;

/** ISO timestamp of the build, injected by vite.config.ts. */
declare const __BUILD_TIME__: string;

interface ImportMetaEnv {
  /** Supabase project URL — accounts and cloud backup stay off when unset. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase publishable (anon) key — safe in the app; never the service-role key. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Override where the live conference list is fetched from (defaults to the GitHub copy). */
  readonly VITE_CONFERENCES_FEED_URL?: string;
  /** `on` turns on Pro/Elite gating — only together with the RevenueCat key. */
  readonly VITE_PAYWALL?: string;
  /** RevenueCat public iOS SDK key (starts `appl_`). Safe in the app; purchases stay off when unset. */
  readonly VITE_REVENUECAT_IOS_KEY?: string;
  /** Published privacy policy, linked from the plans screen (guideline 3.1.2). */
  readonly VITE_PRIVACY_URL?: string;
  /** Published terms of use; defaults to Apple's Standard EULA. */
  readonly VITE_TERMS_URL?: string;
}
