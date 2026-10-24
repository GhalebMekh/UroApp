/**
 * Face ID / Touch ID through @capgo/capacitor-native-biometric — native only.
 * The plugin's web fallback reports biometrics as available and always
 * "verifies", so offering it in a browser would open the lock for anyone.
 */
import { Capacitor } from '@capacitor/core';
import { BiometryType, NativeBiometric } from '@capgo/capacitor-native-biometric';

/** "Face ID" / "Touch ID" when usable on this device, otherwise null. */
export async function biometryLabel(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const r = await NativeBiometric.isAvailable({ useFallback: false });
    if (!r.isAvailable) return null;
    if (r.biometryType === BiometryType.FACE_ID) return 'Face ID';
    if (r.biometryType === BiometryType.TOUCH_ID) return 'Touch ID';
    return 'Biometrics';
  } catch {
    return null;
  }
}

/** Prompts for Face ID / Touch ID; resolves false on cancel, failure or no hardware. */
export async function verifyBiometric(reason: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await NativeBiometric.verifyIdentity({ reason, title: 'Unlock UroApp', useFallback: false });
    return true;
  } catch {
    return false;
  }
}
