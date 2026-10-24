/// <reference types="vite/client" />

/** SHA-256 of the access passcode, injected at build time by vite.config.ts. */
declare const __PASSCODE_HASH__: string;

/** Short commit SHA the bundle was built from, injected by vite.config.ts. */
declare const __BUILD_COMMIT__: string;

/** ISO timestamp of the build, injected by vite.config.ts. */
declare const __BUILD_TIME__: string;
