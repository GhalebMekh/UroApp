import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration for the native wrap (Sprint 3 — see CLAUDE.md).
 *
 * The iOS project lives in ios/ (Swift Package Manager, not CocoaPods) and was
 * generated on Windows. It is built in the cloud by codemagic.yaml, so no local
 * Mac is required. After changing web code or plugins:
 *   npm run build
 *   npx cap sync ios
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
