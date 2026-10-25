import { describe, expect, it } from 'vitest';
import {
  MAX_ATTEMPTS,
  dangerQuestions,
  isDue,
  nextStepQuestions,
  normalizeAttempts,
  progressFor,
  recordAttempt,
  type Attempt,
  type DangerZone,
} from './rehearsal';

/** Deterministic pseudo-random sequence for repeatable tests. */
function seeded(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STEPS = ['A', 'B', 'C', 'D', 'E', 'F'];

describe('nextStepQuestions', () => {
  it('asks for the true next step with two other steps as options', () => {
    const qs = nextStepQuestions(STEPS, 5, seeded(3));
    expect(qs).toHaveLength(5);
    for (const q of qs) {
      const i = STEPS.indexOf(q.prompt);
      expect(q.answer).toBe(STEPS[i + 1]);
      expect(q.options).toHaveLength(3);
      expect(new Set(q.options).size).toBe(3);
      expect(q.options).toContain(q.answer);
      expect(q.options).not.toContain(q.prompt);
    }
  });

  it('never asks about the last step and caps at the number of pairs', () => {
    const qs = nextStepQuestions(['A', 'B', 'C'], 10, seeded(5));
    expect(qs).toHaveLength(2);
    expect(qs.map((q) => q.prompt)).not.toContain('C');
  });

  it('needs at least three steps', () => {
    expect(nextStepQuestions(['A', 'B'])).toEqual([]);
  });
});

describe('dangerQuestions', () => {
  const zones: DangerZone[] = [
    { step: 0, structure: 'Vas', risk: 'Cut with the sac.', bailout: 'Repair.' },
    { step: 2, structure: 'Testicular vessels', risk: 'Torn by traction.', bailout: 'Stop traction.' },
  ];

  it('builds one question per zone, topping up distractors from the pool', () => {
    const qs = dangerQuestions(STEPS, zones, ['Ilioinguinal nerve', 'Vas'], seeded(7));
    expect(qs).toHaveLength(2);
    for (const q of qs) {
      expect(q.options).toHaveLength(3);
      expect(new Set(q.options).size).toBe(3);
      expect(q.options).toContain(q.answer);
      expect(q.explanation).toMatch(/If it happens/);
    }
  });

  it('skips questions it cannot fill with two distractors', () => {
    expect(dangerQuestions(STEPS, zones, [], seeded(1))).toHaveLength(0);
  });

  it('ignores zones pointing past the last step', () => {
    const bad: DangerZone[] = [{ step: 99, structure: 'X', risk: 'r', bailout: 'b' }];
    expect(dangerQuestions(STEPS, bad, ['Y', 'Z'])).toHaveLength(0);
  });
});

describe('progress', () => {
  const a = (o: Partial<Attempt>): Attempt => ({
    id: Math.random().toString(36),
    procedureId: 'turp',
    mode: 'order',
    at: '2026-10-01T10:00:00Z',
    correct: 5,
    total: 10,
    ...o,
  });

  it('summarises attempts, best score and fastest perfect timed round', () => {
    const history = [
      a({ at: '2026-10-01T10:00:00Z', correct: 5 }),
      a({ at: '2026-10-02T10:00:00Z', correct: 10, timeMs: 90_000 }),
      a({ at: '2026-10-03T10:00:00Z', correct: 10, timeMs: 70_000 }),
      a({ at: '2026-10-04T10:00:00Z', correct: 8, timeMs: 40_000 }),
      a({ procedureId: 'pcnl', correct: 10 }),
    ];
    const p = progressFor(history, 'turp');
    expect(p.attempts).toBe(4);
    expect(p.lastPct).toBe(80);
    expect(p.bestPct).toBe(100);
    expect(p.bestTimeMs).toBe(70_000);
  });

  it('is due when never done, stale, or last score low', () => {
    const now = new Date('2026-10-20T10:00:00Z');
    expect(isDue(progressFor([], 'turp'), now)).toBe(true);
    expect(isDue(progressFor([a({ at: '2026-10-19T10:00:00Z', correct: 10 })], 'turp'), now)).toBe(false);
    expect(isDue(progressFor([a({ at: '2026-10-01T10:00:00Z', correct: 10 })], 'turp'), now)).toBe(true);
    expect(isDue(progressFor([a({ at: '2026-10-19T10:00:00Z', correct: 7 })], 'turp'), now)).toBe(true);
  });

  it('caps stored history and drops malformed records', () => {
    let h: Attempt[] = [];
    for (let i = 0; i < MAX_ATTEMPTS + 5; i++) h = recordAttempt(h, a({ id: String(i) }));
    expect(h).toHaveLength(MAX_ATTEMPTS);
    expect(h[0]!.id).toBe('5');
    expect(normalizeAttempts([a({}), { id: 1 }, null, a({ correct: 11 })])).toHaveLength(1);
  });
});
