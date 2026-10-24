import { createContext, useContext } from 'react';
import { LOCK_OFF, type LockSettings } from './appLock';

export type UnlockResult = { status: 'ok' } | { status: 'wrong' | 'blocked'; waitMs: number };

export interface AppLockState {
  settings: LockSettings;
  /** False until the saved settings are read — gates render nothing meanwhile. */
  loaded: boolean;
  /** Private sections are open for this session (until the app is left for a while). */
  unlocked: boolean;
  /** "Face ID" / "Touch ID" when available on this device, else null. */
  biometry: string | null;
  turnOn: (pin: string, biometrics: boolean) => Promise<void>;
  turnOff: (pin: string) => Promise<UnlockResult>;
  setBiometrics: (on: boolean) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<UnlockResult>;
  unlockWithBiometrics: () => Promise<boolean>;
  lockNow: () => void;
  forgotPin: () => Promise<void>;
}

const noop = async () => {};

export const AppLockContext = createContext<AppLockState>({
  settings: LOCK_OFF,
  loaded: true,
  unlocked: true,
  biometry: null,
  turnOn: noop,
  turnOff: async () => ({ status: 'ok' }),
  setBiometrics: noop,
  unlockWithPin: async () => ({ status: 'ok' }),
  unlockWithBiometrics: async () => false,
  lockNow: () => {},
  forgotPin: noop,
});

export function useAppLock(): AppLockState {
  return useContext(AppLockContext);
}
