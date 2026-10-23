/**
 * Which features need which subscription tier — the single source of truth.
 *
 * Owner's split (2026-10): everything a clinician needs at the bedside or on
 * call stays FREE (calculators, on-call, imaging, guidelines, drugs,
 * paediatrics, instruments). Pro = the resident's daily workflow plus
 * continually updated content; Elite = consultant tools. Apple 3.1.2(a):
 * a subscription must "provide ongoing value", hence weekly reads in Pro.
 *
 * ENFORCEMENT: gating only bites when VITE_PAYWALL=on. Until RevenueCat can
 * actually sell the subscription, locking these screens would leave users
 * (and App Review) facing paid features with no way to buy them. Turning
 * the flag on never GRANTS access — the tier itself still comes only from
 * the entitlement (CLAUDE.md: RevenueCat, never a local flag).
 */
import type { Tier } from './entitlements';

export type GatedFeature =
  | 'inpatient'
  | 'logbook'
  | 'consent'
  | 'surveillance'
  | 'rehearsal'
  | 'scenarios'
  | 'articles'
  | 'mdt'
  | 'cme'
  | 'audit';

export const FEATURE_TIER: Record<GatedFeature, Exclude<Tier, 'resident'>> = {
  inpatient: 'pro',
  logbook: 'pro',
  consent: 'pro',
  surveillance: 'pro',
  rehearsal: 'pro',
  scenarios: 'pro',
  articles: 'pro',
  mdt: 'elite',
  cme: 'elite',
  audit: 'elite',
};

export const FEATURE_LABEL: Record<GatedFeature, string> = {
  inpatient: 'The inpatient tracker',
  logbook: 'The operative logbook',
  consent: 'The bilingual consent generator',
  surveillance: 'Surveillance schedules',
  rehearsal: 'Operative rehearsal',
  scenarios: 'Intra-op scenarios',
  articles: 'Weekly reads',
  mdt: 'MDT case sheets',
  cme: 'The CME / CPD tracker',
  audit: 'Your surgical audit',
};

export const PAYWALL_ENABLED = import.meta.env.VITE_PAYWALL === 'on';
