/**
 * Supabase client for optional accounts and cloud backup.
 *
 * Null until VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set at
 * build time, so builds without them have no account UI at all and never make
 * a network call. The publishable key is designed to ship inside apps; the
 * database's row-level security (supabase/migrations) is what protects data.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getItem, removeItem, setItem } from './storage';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          // Session lives in Capacitor Preferences, like all app state (CLAUDE.md).
          storage: { getItem, setItem, removeItem },
          storageKey: 'uroapp.auth.v1',
          persistSession: true,
          autoRefreshToken: true,
          // Codes, not links: sign-up and password reset never need a deep link.
          detectSessionInUrl: false,
        },
      })
    : null;

export const accountsEnabled = supabase !== null;
