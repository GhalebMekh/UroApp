import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

/**
 * Access passcode, hashed at build time so the passphrase itself never enters
 * the bundle — only its SHA-256. Set VITE_APP_PASSCODE in the host's
 * environment; leave it unset (local dev) and the gate is disabled.
 *
 * This is a lock on the front door of a public building: it keeps out anyone
 * who merely has the URL, but the bundle is downloadable, so the hash can be
 * attacked offline. Use a long passphrase, and don't treat it as protection
 * for identifiable data.
 */
const passcode = process.env.VITE_APP_PASSCODE?.trim();
const passcodeHash = passcode ? createHash('sha256').update(passcode).digest('hex') : '';

/**
 * Anything built on Render is the public website, which is a preview of the
 * App Store release. Default preview mode on there, whichever directory the
 * host builds from — otherwise a missing variable or a changed root directory
 * silently publishes the complete product. Builds on a developer machine,
 * including the one `npx cap sync ios` ships, are untouched. An explicit
 * VITE_PREVIEW_MODE (true or false) always wins.
 *
 * Set before Vite resolves env, which happens after this file is evaluated.
 */
const onRender = Boolean(
  process.env.RENDER || process.env.RENDER_GIT_COMMIT || process.env.RENDER_SERVICE_ID,
);
if (onRender && process.env.VITE_PREVIEW_MODE === undefined) {
  process.env.VITE_PREVIEW_MODE = 'true';
}

/**
 * Which commit this bundle was built from, so a deployed copy can say what it
 * is. Render exposes RENDER_GIT_COMMIT during builds; elsewhere ask git, and
 * fall back to "dev" outside a checkout.
 */
function resolveCommit(): string {
  const fromHost = process.env.RENDER_GIT_COMMIT;
  if (fromHost) return fromHost.slice(0, 7);
  try {
    return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'dev';
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __PASSCODE_HASH__: JSON.stringify(passcodeHash),
    __BUILD_COMMIT__: JSON.stringify(resolveCommit()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
