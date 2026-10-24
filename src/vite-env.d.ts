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
}
