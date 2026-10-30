import { describe, expect, it } from 'vitest';
import { FEATURE_LABEL, FEATURE_TIER, PAYWALL_ENABLED, featureName, featuresOf } from './featureTiers';

describe('tier map', () => {
  it('matches the agreed split', () => {
    expect(FEATURE_TIER).toEqual({
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
    });
  });

  it('never gates a bedside or on-call tool', () => {
    // These must stay free: paywalling emergency and safety tools is not acceptable.
    const gated = Object.keys(FEATURE_TIER);
    for (const free of ['calculators', 'oncall', 'imaging', 'guidelines', 'drugs', 'pediatrics', 'instruments']) {
      expect(gated, free).not.toContain(free);
    }
  });

  it('labels every gated feature', () => {
    expect(Object.keys(FEATURE_LABEL).sort()).toEqual(Object.keys(FEATURE_TIER).sort());
  });

  it('names features for the plan cards', () => {
    expect(featureName('inpatient')).toBe('Inpatient tracker');
    expect(featureName('audit')).toBe('Surgical audit');
    expect(featureName('mdt')).toBe('MDT case sheets');
    expect(featuresOf('elite')).toEqual(['mdt', 'cme', 'audit']);
    expect([...featuresOf('pro'), ...featuresOf('elite')].sort()).toEqual(Object.keys(FEATURE_TIER).sort());
  });

  it('is off unless explicitly enabled — no locks before purchases exist', () => {
    expect(PAYWALL_ENABLED).toBe(false);
  });
});
