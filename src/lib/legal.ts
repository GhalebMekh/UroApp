/**
 * Links the plans screen must carry (App Store guideline 3.1.2): Terms of Use
 * and the privacy policy. Drafts live in docs/legal/; set the published URLs
 * as build settings once the pages are online.
 */

/** Apple's Standard EULA, which our own terms page defers to. */
export const APPLE_STANDARD_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export const TERMS_URL = import.meta.env.VITE_TERMS_URL?.trim() || APPLE_STANDARD_EULA_URL;

/** Null until the policy is published; a paywall build must set it (codemagic.yaml checks). */
export const PRIVACY_URL = import.meta.env.VITE_PRIVACY_URL?.trim() || null;
