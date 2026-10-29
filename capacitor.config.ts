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
    // Edge to edge: the page headers run under the status bar, and the CSS
    // handles the insets itself (viewport-fit=cover + env(safe-area-inset-*)
    // on the top bar, bottom nav and headers). 'always' would inset the web
    // view as well and zero those env() values.
    contentInset: 'never',
    // Navy behind the web view, so loading and overscroll never flash white.
    backgroundColor: '#0A1628',
  },
};

export default config;
