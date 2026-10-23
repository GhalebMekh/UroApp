import { describe, expect, it } from 'vitest';
import { CD_GRADES, cdBand, cdLabel, gradeFromAnswers, type CdAnswers } from './clavienDindo';
import { normalizeEntry, procedureKey, rate, summariseByProcedure, type LogEntry } from './oplog';

const none: CdAnswers = {
  died: false,
  icu: false,
  multiOrgan: false,
  intervention: false,
  generalAnaesthesia: false,
  otherDrugs: false,
};

describe('Clavien–Dindo gradeFromAnswers (Dindo 2004)', () => {
  it('is grade I when nothing beyond the allowed basics was needed', () => {
    expect(gradeFromAnswers(none)).toBe('I');
  });

  it('is grade II for other drugs, transfusion or TPN', () => {
    expect(gradeFromAnswers({ ...none, otherDrugs: true })).toBe('II');
  });

  it('splits III on general anaesthesia', () => {
    expect(gradeFromAnswers({ ...none, intervention: true })).toBe('IIIa');
    expect(gradeFromAnswers({ ...none, intervention: true, generalAnaesthesia: true })).toBe('IIIb');
  });

  it('splits IV on single versus multi-organ dysfunction', () => {
    expect(gradeFromAnswers({ ...none, icu: true })).toBe('IVa');
    expect(gradeFromAnswers({ ...none, icu: true, multiOrgan: true })).toBe('IVb');
  });

  it('takes the most severe treatment when several apply', () => {
    // A re-look under GA (IIIb) after antibiotics (II) is IIIb, not II.
    expect(gradeFromAnswers({ ...none, otherDrugs: true, intervention: true, generalAnaesthesia: true })).toBe('IIIb');
    expect(gradeFromAnswers({ ...none, intervention: true, icu: true })).toBe('IVa');
    expect(gradeFromAnswers({ ...none, icu: true, died: true })).toBe('V');
  });

  it('has the seven grades of the 2004 classification, in order', () => {
    expect(CD_GRADES).toEqual(['I', 'II', 'IIIa', 'IIIb', 'IVa', 'IVb', 'V']);
  });

  it('appends the "d" suffix for disability at discharge', () => {
    expect(cdLabel('IIIb', true)).toBe('IIIb-d');
    expect(cdLabel('II', false)).toBe('II');
  });

  it('bands I–II low, III moderate, IV–V high', () => {
    expect(CD_GRADES.map(cdBand)).toEqual(['low', 'low', 'moderate', 'moderate', 'high', 'high', 'high']);
  });
});

const entry = (over: Partial<LogEntry>): LogEntry => ({
  id: Math.random().toString(36).slice(2),
  date: '2026-10-01',
  gender: 'male',
  procedure: 'TURP',
  role: 'lead',
  cdGrade: '',
  cdDisability: false,
  complicationNote: '',
  ...over,
});

describe('normalizeEntry', () => {
  it('loads entries saved before complications existed', () => {
    const legacy = { id: 'a', date: '2026-01-01', gender: 'female', procedure: 'PCNL', role: 'first' };
    expect(normalizeEntry(legacy)).toEqual({ ...legacy, cdGrade: '', cdDisability: false, complicationNote: '' });
  });

  it('drops an unknown grade rather than trusting it', () => {
    expect(normalizeEntry({ id: 'a', procedure: 'x', cdGrade: 'VI' })?.cdGrade).toBe('');
  });

  it('rejects junk', () => {
    expect(normalizeEntry(null)).toBeNull();
    expect(normalizeEntry({ id: 'a' })).toBeNull();
  });
});

describe('summariseByProcedure', () => {
  it('groups spelling variants of the same procedure', () => {
    expect(procedureKey('  Turp ')).toBe(procedureKey('TURP'));
    const s = summariseByProcedure([entry({ procedure: 'TURP' }), entry({ procedure: 'turp ' })]);
    expect(s).toHaveLength(1);
    expect(s[0]!.cases).toBe(2);
  });

  it('counts cases, lead cases, complications and the highest grade', () => {
    const s = summariseByProcedure([
      entry({ procedure: 'PCNL', role: 'lead', cdGrade: 'II' }),
      entry({ procedure: 'PCNL', role: 'first', cdGrade: 'IIIa' }),
      entry({ procedure: 'PCNL', role: 'lead' }),
      entry({ procedure: 'TURBT' }),
    ]);
    const pcnl = s.find((x) => x.procedure === 'PCNL')!;
    expect(pcnl).toMatchObject({ cases: 3, asLead: 2, withComplication: 2, highest: 'IIIa' });
    expect(pcnl.byGrade).toEqual({ II: 1, IIIa: 1 });
    expect(s[0]!.procedure).toBe('PCNL'); // most cases first
  });
});

describe('rate', () => {
  it('is a one-decimal percentage and safe on zero', () => {
    expect(rate(1, 3)).toBe(33.3);
    expect(rate(0, 0)).toBe(0);
  });
});
