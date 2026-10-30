import { createContext, useContext } from 'react';
import { EMPTY_PROFILE, type Profile } from './profile';

export type AccountStatus = 'disabled' | 'loading' | 'signedOut' | 'signedIn';

export interface SyncState {
  phase: 'idle' | 'syncing' | 'error';
  lastSyncedAt: number | null;
  error: string | null;
}

export interface AccountState {
  status: AccountStatus;
  /** Supabase user id while signed in; also the RevenueCat app user id. */
  userId: string | null;
  email: string | null;
  profile: Profile;
  sync: SyncState;
  /** Bumped when sync changed this device's data, so screens re-read storage. */
  dataVersion: number;
  signIn: (email: string, password: string) => Promise<void>;
  /** Sends a 6-digit code; finish with verifySignUp. */
  signUp: (email: string, password: string) => Promise<void>;
  verifySignUp: (email: string, code: string) => Promise<void>;
  /** Sends a 6-digit code; finish with resetPassword. */
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  saveProfile: (p: Profile) => Promise<void>;
  syncNow: () => Promise<void>;
  signOut: (removeLocalData: boolean) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const off = async () => {
  throw new Error('Accounts are not available in this build.');
};

export const AccountContext = createContext<AccountState>({
  status: 'disabled',
  userId: null,
  email: null,
  profile: EMPTY_PROFILE,
  sync: { phase: 'idle', lastSyncedAt: null, error: null },
  dataVersion: 0,
  signIn: off,
  signUp: off,
  verifySignUp: off,
  requestPasswordReset: off,
  resetPassword: off,
  saveProfile: off,
  syncNow: off,
  signOut: off,
  deleteAccount: off,
});

export function useAccount(): AccountState {
  return useContext(AccountContext);
}

/** At least 8 characters with a letter and a digit — matched by the Supabase setting in docs. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Use at least one letter and one number.';
  return null;
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
