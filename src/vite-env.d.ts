/// <reference types="vite/client" />

/** SHA-256 of the access passcode, injected at build time by vite.config.ts. */
declare const __PASSCODE_HASH__: string;

interface ImportMetaEnv {
  /** Supabase project URL — accounts and cloud backup stay off when unset. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase publishable (anon) key — safe in the app; never the service-role key. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
