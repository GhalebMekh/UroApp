import { describe, expect, it } from 'vitest';
import { EMERGENCIES } from './oncall';

/**
 * OnCallScreen renders its embedded tools by matching an emergency id:
 *   torsion          -> TwistScore
 *   obstructed-kidney -> UrosepsisFirstHour
 *   gu-trauma        -> AastTraumaGrading
 * Renaming an id silently hides the tool with no type error, so pin them here.
 */
const IDS_WITH_TOOLS = ['torsion', 'obstructed-kidney', 'gu-trauma'] as const;

describe('on-call emergencies', () => {
  it('has unique ids', () => {
    const ids = EMERGENCIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the ids that OnCallScreen attaches tools to', () => {
    for (const id of IDS_WITH_TOOLS) {
      expect(EMERGENCIES.some((e) => e.id === id), `missing emergency id "${id}"`).toBe(true);
    }
  });

  it('gives every emergency a pathway, red flags and a cited source', () => {
    for (const e of EMERGENCIES) {
      expect(e.name.trim()).not.toBe('');
      expect(e.oneLiner.trim()).not.toBe('');
      expect(e.clock.trim()).not.toBe('');
      expect(e.immediate.length).toBeGreaterThan(0);
      expect(e.redFlags.length).toBeGreaterThan(0);
      expect(e.citation.url).toMatch(/^https:\/\//);
    }
  });

  it('warns against blind catheterisation in the GU trauma pathway', () => {
    // AUA Urotrauma statement 19: blind catheter passage before RUG must be avoided.
    const trauma = EMERGENCIES.find((e) => e.id === 'gu-trauma')!;
    const all = [...trauma.immediate, ...trauma.redFlags].join(' ');
    expect(all).toMatch(/retrograde urethrogram|RUG/i);
    expect(all).toMatch(/blind/i);
  });
});
