import { describe, expect, it } from 'vitest';
import {
  GENERAL_ITEMS,
  caseItems,
  dayText,
  generalItems,
  knownAttendings,
  normalizePreop,
  openCount,
  procedureItems,
  purgeOld,
  sortCases,
  type PreopCase,
  type PreopStore,
} from './preop';
import { planPreopAlerts } from './notifications';

const kase = (over: Partial<PreopCase> = {}): PreopCase => ({
  id: 'a',
  label: 'AM',
  note: '',
  procedureId: '',
  operation: 'Botox bladder',
  date: '2026-11-16',
  attending: 'Dr Hassan',
  ticked: [],
  ...over,
});

const store = (over: Partial<PreopStore> = {}): PreopStore => ({ cases: [], custom: [], hidden: [], ...over });

describe('pre-op store', () => {
  it('drops malformed cases, unknown procedures and stray hidden ids', () => {
    const s = normalizePreop({
      cases: [kase(), { id: 'x' }, kase({ id: 'b', procedureId: 'not-a-procedure', date: '16/11/2026' })],
      custom: [{ id: 'c:1', text: 'Book ICU bed' }, { id: 'nope', text: 'x' }],
      hidden: ['g:fasting', 'g:unknown'],
    });
    expect(s.cases.map((c) => c.id)).toEqual(['a']);
    expect(s.custom).toEqual([{ id: 'c:1', text: 'Book ICU bed' }]);
    expect(s.hidden).toEqual(['g:fasting']);
    expect(normalizePreop(null)).toEqual(store());
  });

  it('deletes a case 2 days after its date, not before', () => {
    const s = store({ cases: [kase({ id: 'old', date: '2026-11-13' }), kase({ id: 'keep', date: '2026-11-14' })] });
    expect(purgeOld(s, '2026-11-16').cases.map((c) => c.id)).toEqual(['keep']);
    const fresh = store({ cases: [kase()] });
    expect(purgeOld(fresh, '2026-11-16')).toBe(fresh);
  });
});

describe('checklist items', () => {
  it('hides defaults and appends the user’s own', () => {
    const items = generalItems({ hidden: ['g:fasting'], custom: [{ id: 'c:1', text: 'Book ICU bed' }] });
    expect(items).toHaveLength(GENERAL_ITEMS.length);
    expect(items.some((i) => i.id === 'g:fasting')).toBe(false);
    expect(items[items.length - 1]?.text).toBe('Book ICU bed');
  });

  it('keeps anticoagulation as a plain task with no numbers', () => {
    const anticoag = GENERAL_ITEMS.find((g) => g.id === 'g:anticoag');
    expect(anticoag).toBeDefined();
    for (const g of GENERAL_ITEMS) expect(g.text, g.id).not.toMatch(/\d/);
  });

  it('adds a procedure’s cited workup and setup items', () => {
    const { items, source } = procedureItems('pcnl');
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.id.startsWith('p:'))).toBe(true);
    expect(source?.url).toMatch(/^https:\/\//);
    expect(procedureItems('').items).toEqual([]);
  });

  it('counts what is still open', () => {
    const s = store();
    const c = kase({ procedureId: 'pcnl', ticked: ['g:consent', 'p:w0'] });
    expect(openCount(c, s)).toBe(caseItems(c, s).length - 2);
    // A tick for an item that's since been hidden doesn't count against the list.
    const hidden = store({ hidden: ['g:consent'] });
    expect(openCount(c, hidden)).toBe(caseItems(c, hidden).length - 1);
  });
});

describe('attending', () => {
  it('keeps the attending and suggests past names, most recent first, once each', () => {
    expect(normalizePreop({ cases: [kase()] }).cases[0]?.attending).toBe('Dr Hassan');
    const cases = [
      kase({ id: '1', date: '2026-11-10', attending: 'Dr Saleh' }),
      kase({ id: '2', date: '2026-11-12', attending: 'dr hassan' }),
      kase({ id: '3', date: '2026-11-16', attending: 'Dr Hassan' }),
      kase({ id: '4', date: '2026-11-11', attending: '' }),
    ];
    expect(knownAttendings(cases)).toEqual(['Dr Hassan', 'Dr Saleh']);
  });
});

describe('ordering and labels', () => {
  it('lists upcoming soonest first and past most recent first', () => {
    const cases = [kase({ id: '3', date: '2026-11-18' }), kase({ id: '1', date: '2026-11-15' }), kase({ id: '2', date: '2026-11-16' }), kase({ id: '0', date: '2026-11-14' })];
    const { upcoming, past } = sortCases(cases, '2026-11-16');
    expect(upcoming.map((c) => c.id)).toEqual(['2', '3']);
    expect(past.map((c) => c.id)).toEqual(['1', '0']);
  });

  it('says today and tomorrow in words', () => {
    expect(dayText('2026-11-16', '2026-11-16')).toBe('Today');
    expect(dayText('2026-11-17', '2026-11-16')).toBe('Tomorrow');
    expect(dayText('2026-11-20', '2026-11-16')).toMatch(/20 Nov/);
  });
});

describe('pre-op reminder', () => {
  const now = new Date('2026-11-15T22:00:00');

  it('fires once per operating day at 06:00, counts only', () => {
    const s = store({
      cases: [kase({ id: 'a' }), kase({ id: 'b', label: 'KS', note: 'left side' }), kase({ id: 'c', date: '2026-11-17' })],
    });
    const alerts = planPreopAlerts(s, now);
    expect(alerts).toHaveLength(2);
    const [first] = alerts;
    expect(first?.at).toEqual(new Date('2026-11-16T06:00:00'));
    expect(first?.body).toMatch(/^Today: 2 cases with \d+ items still open\.$/);
    // Nothing identifying on the lock screen.
    for (const a of alerts) expect(`${a.title} ${a.body}`).not.toMatch(/AM|KS|left side|Botox|Hassan/);
    expect(first?.link).toEqual({ residency: { section: 'or', orTab: 'preop' } });
  });

  it('stays quiet when everything is ticked or the time has passed', () => {
    const all = caseItems(kase(), store()).map((i) => i.id);
    expect(planPreopAlerts(store({ cases: [kase({ ticked: all })] }), now)).toEqual([]);
    expect(planPreopAlerts(store({ cases: [kase()] }), new Date('2026-11-16T07:00:00'))).toEqual([]);
  });
});
