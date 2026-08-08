import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { createHash } from 'node:crypto';

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

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __PASSCODE_HASH__: JSON.stringify(passcodeHash),
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
