import { describe, expect, it } from 'vitest';
import { GLANS, MEATUS, SHAFT, gmsSeverity, gmsTotal } from './gms';
import { torsionRiskByHours } from './scrotalPain';
import { udtPlan, type UdtInput } from './udt';
import { classifyEnuresis } from './enuresis';

describe('GMS score', () => {
  it('sums three 1–4 components (3–12)', () => {
    expect(gmsTotal(1, 1, 1)).toBe(3);
    expect(gmsTotal(4, 4, 4)).toBe(12);
  });

  it('bands mild 3–6, moderate 7–9, severe 10–12', () => {
    expect(gmsSeverity(6)).toBe('mild');
    expect(gmsSeverity(7)).toBe('moderate');
    expect(gmsSeverity(9)).toBe('moderate');
    expect(gmsSeverity(10)).toBe('severe');
  });

  it('describes all four levels of each component', () => {
    for (const table of [GLANS, MEATUS, SHAFT]) expect(Object.keys(table)).toEqual(['1', '2', '3', '4']);
  });
});

describe('torsionRiskByHours (Visser & Heyns, via Campbell ch 44)', () => {
  it('maps hours to the pooled orchiectomy risk', () => {
    expect(torsionRiskByHours(3)?.orchiectomyPct).toBe(5);
    expect(torsionRiskByHours(6)?.orchiectomyPct).toBe(5);
    expect(torsionRiskByHours(7)?.orchiectomyPct).toBe(20);
    expect(torsionRiskByHours(18)?.orchiectomyPct).toBe(40);
    expect(torsionRiskByHours(24)?.orchiectomyPct).toBe(60);
    expect(torsionRiskByHours(30)?.orchiectomyPct).toBe(80);
    expect(torsionRiskByHours(72)?.orchiectomyPct).toBe(90);
  });

  it('rejects invalid input', () => {
    expect(torsionRiskByHours(-1)).toBeNull();
    expect(torsionRiskByHours(Number.NaN)).toBeNull();
  });
});

describe('udtPlan', () => {
  const base: UdtInput = { correctedAgeMonths: 3, palpability: 'palpable', bilateral: false, hypospadias: 'none', acquired: false };
  const text = (i: UdtInput) => udtPlan(i).map((s) => s.text).join(' ');

  it('observes before 6 months and refers after', () => {
    expect(text(base)).toMatch(/observe/i);
    expect(text({ ...base, correctedAgeMonths: 8 })).toMatch(/preferably by 12 months/);
  });

  it('flags bilateral nonpalpable and proximal hypospadias as urgent', () => {
    expect(udtPlan({ ...base, bilateral: true, palpability: 'nonpalpable' })[0]?.tone).toBe('urgent');
    expect(udtPlan({ ...base, hypospadias: 'proximal' })[0]?.tone).toBe('urgent');
    expect(udtPlan(base).some((s) => s.tone === 'urgent')).toBe(false);
  });

  it('sends nonpalpable testes to laparoscopy and never to imaging', () => {
    const t = text({ ...base, palpability: 'nonpalpable', correctedAgeMonths: 9 });
    expect(t).toMatch(/laparoscopy/);
    expect(t).toMatch(/Do not request ultrasound/);
  });

  it('refers an acquired testis regardless of age', () => {
    expect(text({ ...base, correctedAgeMonths: 60, acquired: true })).toMatch(/Acquired/);
  });
});

describe('classifyEnuresis (Campbell ch 35)', () => {
  it('requires age 5 or more', () => {
    expect(classifyEnuresis({ ageYears: 4, daytimeSymptoms: false, previouslyDry: false })).toBe('too-young');
  });

  it('splits mono/nonmonosymptomatic and primary/secondary', () => {
    expect(classifyEnuresis({ ageYears: 7, daytimeSymptoms: false, previouslyDry: false })).toBe('primary-mse');
    expect(classifyEnuresis({ ageYears: 7, daytimeSymptoms: true, previouslyDry: false })).toBe('primary-nmse');
    expect(classifyEnuresis({ ageYears: 9, daytimeSymptoms: false, previouslyDry: true })).toBe('secondary-mse');
    expect(classifyEnuresis({ ageYears: 9, daytimeSymptoms: true, previouslyDry: true })).toBe('secondary-nmse');
  });
});
