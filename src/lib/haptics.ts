/**
 * Tactile feedback (iPhone Taptic Engine) via @capacitor/haptics. A no-op on
 * the web. Fire-and-forget: never await the plugin object itself (see
 * notifications.ts), only the promise its method returns.
 */
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/** A firm tap, e.g. when a long press opens a menu. */
export function tapFeedback(): void {
  if (!Capacitor.isNativePlatform()) return;
  Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {
    /* no Taptic Engine — nothing to do */
  });
}

/** A light tick, e.g. when a swipe passes the point where it opens. */
export function tickFeedback(): void {
  if (!Capacitor.isNativePlatform()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
    /* no Taptic Engine — nothing to do */
  });
}
