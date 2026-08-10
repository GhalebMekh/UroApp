import { describe, expect, it } from 'vitest';
import { INSTRUMENTS, INSTRUMENT_GROUPS, instrumentsIn } from './instruments';

describe('instrument reference', () => {
  it('has unique ids', () => {
    const ids = INSTRUMENTS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers the four groups the screen offers, each non-empty', () => {
    expect(INSTRUMENT_GROUPS.map((g) => g.id)).toEqual([
      'cystoscope',
      'semirigid',
      'flexible',
      'laser',
      'accessory',
      'drainage',
      'turp',
      'pcnl',
      'electrosurgery',
    ]);
    for (const g of INSTRUMENT_GROUPS) {
      expect(instrumentsIn(g.id).length, `no instruments in "${g.id}"`).toBeGreaterThan(0);
    }
  });

  it('every instrument belongs to a declared group', () => {
    const known = new Set(INSTRUMENT_GROUPS.map((g) => g.id));
    for (const i of INSTRUMENTS) {
      expect(known.has(i.group), `${i.id} has unknown group "${i.group}"`).toBe(true);
    }
  });

  it('gives every instrument specs, uses, pitfalls and a citation', () => {
    for (const i of INSTRUMENTS) {
      expect(i.summary.trim(), i.id).not.toBe('');
      expect(i.specs.length, i.id).toBeGreaterThan(0);
      expect(i.uses.length, i.id).toBeGreaterThan(0);
      expect(i.pitfalls.length, i.id).toBeGreaterThan(0);
      expect(i.citation.url, i.id).toMatch(/^https:\/\//);
      for (const s of i.specs) {
        expect(s.label.trim(), i.id).not.toBe('');
        expect(s.value.trim(), i.id).not.toBe('');
      }
    }
  });

  it('cites the instrumentation text for scopes and Campbell Ch19 for lasers', () => {
    for (const i of INSTRUMENTS) {
      if (i.group === 'laser') {
        expect(i.citation.year, i.id).toBe(2025);
        expect(i.citation.journal, i.id).toContain('Campbell');
      } else {
        expect(i.citation.year, i.id).toBe(2016);
      }
    }
  });

  it('keeps the laser wavelengths as read from the source', () => {
    const spec = (id: string, label: string) =>
      INSTRUMENTS.find((i) => i.id === id)!.specs.find((s) => s.label === label)!.value;
    // Campbell Ch19: TFL 1.9 µm is more highly absorbed in water than
    // Tm:YAG 2.0 µm or Ho:YAG 2.1 µm.
    expect(spec('laser-hoyag', 'Wavelength')).toBe('2.1 µm');
    expect(spec('laser-tfl', 'Wavelength')).toBe('1.9 µm');
    expect(spec('laser-others', 'Tm:YAG')).toContain('2.0 µm');
  });

  it('records the make-dependent semi-rigid sizing trap', () => {
    const sizing = INSTRUMENTS.find((i) => i.id === 'semirigid-sizing')!;
    const text = sizing.pitfalls.join(' ');
    expect(text).toMatch(/Wolf/);
    expect(text).toMatch(/Storz/);
  });

  it('defines JJ stent length as the straight segment, not tip to tip', () => {
    // The commonest sizing error: measuring tip to tip overestimates the stent.
    const stent = INSTRUMENTS.find((i) => i.id === 'accessory-djstent')!;
    const def = stent.specs.find((s) => s.label === 'Length definition')!.value;
    expect(def).toMatch(/straight/i);
    expect(def).toMatch(/not.*tip to tip/i);
  });

  it('keeps the access-sheath pressure figure that justifies using one', () => {
    const sheath = INSTRUMENTS.find((i) => i.id === 'accessory-sheath')!;
    const p = sheath.specs.find((s) => s.label === 'Intrapelvic pressure')!.value;
    expect(p).toContain('20 cm H₂O');
    expect(p).toContain('200 cm H₂O');
  });

  it('records access-sheath lengths including the paediatric shortest', () => {
    const sheath = INSTRUMENTS.find((i) => i.id === 'accessory-sheath')!;
    const len = sheath.specs.find((s) => s.label === 'Length range')!.value;
    expect(len).toMatch(/13 cm/);
    expect(len).toMatch(/55 cm/);
  });

  it('keeps the Foley colour code consistent with the tracker sizes', () => {
    // The colour sits at the balloon port and denotes external diameter.
    const foley = INSTRUMENTS.find((i) => i.id === 'drainage-foley')!;
    const byFr = Object.fromEntries(foley.specs.map((s) => [s.label, s.value]));
    expect(byFr['16 Fr']).toContain('Orange');
    expect(byFr['18 Fr']).toContain('Red');
    expect(byFr['22 Fr']).toContain('Purple');
    // Every entry carries colour, balloon volume and length.
    for (const s of foley.specs) expect(s.value.split('·').length).toBe(3);
  });

  it('keeps the TURP loop-angle rule, which prevents uncut tags', () => {
    const loops = INSTRUMENTS.find((i) => i.id === 'turp-loops')!;
    const text = [...loops.uses, ...loops.pitfalls].join(' ');
    expect(text).toMatch(/never sit at more than a right angle/i);
    expect(text).toMatch(/less than 1 mm/i);
  });

  it('flags the PCNL 21 G claim as unproven rather than stating it as fact', () => {
    const pcnl = INSTRUMENTS.find((i) => i.id === 'pcnl-access')!;
    expect(pcnl.pitfalls.join(' ')).toMatch(/not actually been proven/i);
  });

  it('records both flexible-scope deflection conventions', () => {
    const d = INSTRUMENTS.find((i) => i.id === 'flexible-deflection')!;
    const labels = d.specs.map((s) => s.label).join(' ');
    expect(labels).toMatch(/Logic type/);
    expect(labels).toMatch(/Anti-logic type/);
  });
});
