import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration for the native wrap (Sprint 3 — see CLAUDE.md).
 *
 * The native projects are not generated yet. On a Mac with Xcode installed:
 *   npm i -D @capacitor/cli @capacitor/ios
 *   npm run build
 *   npx cap add ios
 *   npx cap sync ios
 *   npx cap run ios
 */
const config: CapacitorConfig = {
  appId: 'com.uroapp.clinical',
  appName: 'UroApp',
  webDir: 'dist',
  ios: {
    // Respect the safe-area insets the UI already accounts for.
    contentInset: 'always',
  },
};

export default config;
