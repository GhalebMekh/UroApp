/**
 * Operative rehearsal: question generation for the quick-fire modes, and
 * progress tracking. Pure logic — no clinical content lives here; the steps
 * and danger zones come from each procedure's cited source in data/procedures.
 */

export type RehearsalMode = 'order' | 'next' | 'danger';

export interface Attempt {
  id: string;
  procedureId: string;
  mode: RehearsalMode;
  /** ISO date-time. */
  at: string;
  correct: number;
  total: number;
  /** Only for timed ordering rounds. */
  timeMs?: number;
}

/** Keeps the stored history (and the synced document) small. */
export const MAX_ATTEMPTS = 600;

/** Not practised for this long → due for a refresh. */
export const REFRESH_AFTER_DAYS = 14;
/** Last score below this → due for a refresh. */
export const REFRESH_BELOW_PCT = 80;

export type Rng = () => number;

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export interface ChoiceQuestion {
  /** What the question is about (a step, for both modes). */
  prompt: string;
  options: string[];
  answer: string;
  /** Shown after answering (danger mode). */
  explanation?: string;
}

/**
 * "What comes next?": one question per consecutive pair of steps (or fewer),
 * three options each — the true next step and two other steps of the same
 * operation, so the distractors are plausible.
 */
export function nextStepQuestions(steps: readonly string[], count = 5, rng: Rng = Math.random): ChoiceQuestion[] {
  if (steps.length < 3) return [];
  const pairs = shuffle(
    Array.from({ length: steps.length - 1 }, (_, i) => i),
    rng,
  ).slice(0, Math.min(count, steps.length - 1));
  return pairs.map((i) => {
    const answer = steps[i + 1]!;
    const distractors = shuffle(
      steps.filter((_, k) => k !== i && k !== i + 1),
      rng,
    ).slice(0, 2);
    return { prompt: steps[i]!, options: shuffle([answer, ...distractors], rng), answer };
  });
}

export interface DangerZone {
  /** 0-based index into the procedure's steps. */
  step: number;
  /** The structure at risk, as a short noun phrase (also used as a quiz option). */
  structure: string;
  /** How it gets injured. */
  risk: string;
  /** What to do if it happens. */
  bailout: string;
}

/**
 * Danger-zone quiz: for each zone, "which structure is at risk at this step?"
 * Distractors are the procedure's other at-risk structures first, then the
 * shared pool. Needs at least three distinct structures in total.
 */
export function dangerQuestions(
  steps: readonly string[],
  zones: readonly DangerZone[],
  pool: readonly string[] = [],
  rng: Rng = Math.random,
): ChoiceQuestion[] {
  const questions: ChoiceQuestion[] = [];
  for (const z of shuffle(zones, rng)) {
    const step = steps[z.step];
    if (!step) continue;
    const own = [...new Set(zones.map((o) => o.structure))].filter((s) => s !== z.structure);
    const extra = [...new Set(pool)].filter((s) => s !== z.structure && !own.includes(s));
    const distractors = [...shuffle(own, rng), ...shuffle(extra, rng)].slice(0, 2);
    if (distractors.length < 2) continue;
    questions.push({
      prompt: step,
      options: shuffle([z.structure, ...distractors], rng),
      answer: z.structure,
      explanation: `${z.risk} If it happens: ${z.bailout}`,
    });
  }
  return questions;
}

export interface ProcedureProgress {
  attempts: number;
  lastAt: string | null;
  lastPct: number | null;
  bestPct: number | null;
  /** Fastest fully correct timed ordering round. */
  bestTimeMs: number | null;
}

const pct = (a: Attempt) => (a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0);

export function progressFor(attempts: readonly Attempt[], procedureId: string, mode?: RehearsalMode): ProcedureProgress {
  const mine = attempts
    .filter((a) => a.procedureId === procedureId && (!mode || a.mode === mode))
    .sort((x, y) => x.at.localeCompare(y.at));
  if (mine.length === 0) return { attempts: 0, lastAt: null, lastPct: null, bestPct: null, bestTimeMs: null };
  const last = mine[mine.length - 1]!;
  const perfectTimed = mine.filter((a) => a.mode === 'order' && a.timeMs != null && a.correct === a.total);
  return {
    attempts: mine.length,
    lastAt: last.at,
    lastPct: pct(last),
    bestPct: Math.max(...mine.map(pct)),
    bestTimeMs: perfectTimed.length ? Math.min(...perfectTimed.map((a) => a.timeMs!)) : null,
  };
}

/** Due when never practised, not practised for a while, or the last score was low. */
export function isDue(p: ProcedureProgress, now: Date): boolean {
  if (!p.lastAt || p.lastPct === null) return true;
  const days = (now.getTime() - new Date(p.lastAt).getTime()) / 86_400_000;
  return days >= REFRESH_AFTER_DAYS || p.lastPct < REFRESH_BELOW_PCT;
}

export function recordAttempt(history: readonly Attempt[], attempt: Attempt): Attempt[] {
  return [...history, attempt].slice(-MAX_ATTEMPTS);
}

export function normalizeAttempts(raw: unknown): Attempt[] {
  if (!Array.isArray(raw)) return [];
  const modes: RehearsalMode[] = ['order', 'next', 'danger'];
  return raw.filter((a): a is Attempt => {
    if (!a || typeof a !== 'object') return false;
    const r = a as Record<string, unknown>;
    return (
      typeof r.id === 'string' &&
      typeof r.procedureId === 'string' &&
      modes.includes(r.mode as RehearsalMode) &&
      typeof r.at === 'string' &&
      typeof r.correct === 'number' &&
      typeof r.total === 'number' &&
      r.correct >= 0 &&
      r.total > 0 &&
      r.correct <= r.total &&
      (r.timeMs === undefined || typeof r.timeMs === 'number')
    );
  });
}
