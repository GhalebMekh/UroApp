import { useEffect, useMemo, useState } from 'react';
import { PROCEDURES, type Procedure } from '@/data/procedures';
import { cn } from '@/lib/cn';
import { PageBody, PageHero } from '@/components/PageHero';
import { getJSON, setJSON } from '@/lib/storage';
import {
  REHEARSAL_STORAGE_KEY,
  dangerQuestions,
  dueForRefresh,
  isDue,
  nextStepQuestions,
  normalizeAttempts,
  progressFor,
  recordAttempt,
  type Attempt,
  type ChoiceQuestion,
  type RehearsalMode,
} from '@/lib/rehearsal';

const STORAGE_KEY = REHEARSAL_STORAGE_KEY;

/** Fisher–Yates shuffle of [0..n-1], guaranteed not to equal the identity for n>1. */
function makeShuffle(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  if (n > 1 && a.every((v, i) => v === i)) [a[0], a[1]] = [a[1]!, a[0]!];
  return a;
}

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** Every at-risk structure in the app — extra distractors for the danger-zone quiz. */
const STRUCTURE_POOL = [...new Set(PROCEDURES.flatMap((p) => (p.dangerZones ?? []).map((z) => z.structure)))];

function dangerQuiz(p: Procedure): ChoiceQuestion[] {
  return dangerQuestions(p.steps, p.dangerZones ?? [], STRUCTURE_POOL);
}

const MODES: { id: RehearsalMode; label: string }[] = [
  { id: 'order', label: 'Order the steps' },
  { id: 'next', label: 'What comes next?' },
  { id: 'danger', label: 'Danger zones' },
];

/** `initialProcedureId` preselects an operation, e.g. from the Home "due" list; read once on mount. */
export function OperativeRehearsalScreen({
  initialProcedureId,
  onInitialHandled,
}: {
  initialProcedureId?: string | null;
  onInitialHandled?: () => void;
}) {
  const [procedureId, setProcedureId] = useState(
    PROCEDURES.find((p) => p.id === initialProcedureId)?.id ?? PROCEDURES[0]?.id ?? '',
  );

  // Consume the link so a later visit opens the default operation.
  useEffect(() => {
    if (initialProcedureId) onInitialHandled?.();
  }, [initialProcedureId, onInitialHandled]);
  const proc = PROCEDURES.find((p) => p.id === procedureId) ?? PROCEDURES[0];
  const [mode, setMode] = useState<RehearsalMode>('order');
  const [history, setHistory] = useState<Attempt[]>([]);
  const [round, setRound] = useState(0); // bump to restart the current mode

  useEffect(() => {
    void getJSON<unknown>(STORAGE_KEY, []).then((raw) => setHistory(normalizeAttempts(raw)));
  }, []);

  function record(correct: number, total: number, timeMs?: number) {
    if (!proc || total <= 0) return;
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      procedureId: proc.id,
      mode,
      at: new Date().toISOString(),
      correct,
      total,
      ...(timeMs !== undefined ? { timeMs } : {}),
    };
    setHistory((h) => {
      const next = recordAttempt(h, attempt);
      void setJSON(STORAGE_KEY, next);
      return next;
    });
  }

  const now = new Date();
  const practised = useMemo(() => new Set(history.map((a) => a.procedureId)), [history]);
  const dueList = useMemo(() => {
    const due = new Set(dueForRefresh(history, PROCEDURES.map((p) => p.id), new Date()).map((d) => d.procedureId));
    return PROCEDURES.filter((p) => due.has(p.id));
  }, [history]);

  if (!proc) return null;
  const progress = progressFor(history, proc.id);
  const dangerReady = dangerQuiz(proc).length >= 2;

  const field =
    'min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[14px] text-ink outline-none focus:border-violet';

  return (
    <>
      <PageHero
        eyebrow="OR rehearsal"
        title="Operative rehearsal"
        lede="Rebuild the operation, quick-fire the next step, or test yourself on what is at risk. Steps, anatomy and danger zones come from each procedure’s cited source."
      />
      <PageBody narrow>

        <label className="block">
          <span className="mb-[7px] block text-[13px] font-semibold text-muted">Procedure</span>
          <select value={procedureId} onChange={(e) => setProcedureId(e.target.value)} className={field}>
            {PROCEDURES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {dueList.some((d) => d.id === p.id) ? ' · due' : ''}
              </option>
            ))}
          </select>
        </label>

        {/* Progress for this procedure */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Rounds" value={String(progress.attempts)} />
          <Stat label="Best" value={progress.bestPct === null ? '—' : `${progress.bestPct}%`} />
          <Stat label="Best perfect time" value={progress.bestTimeMs === null ? '—' : formatTime(progress.bestTimeMs)} />
          <Stat
            label="Last practised"
            value={progress.lastAt ? formatDay(progress.lastAt) : 'Never'}
            tone={isDue(progress, now) && progress.attempts > 0 ? 'text-amber' : undefined}
          />
        </div>

        {/* Mode */}
        <div className="flex gap-1.5 rounded-[11px] border border-line bg-navy p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setRound((r) => r + 1);
              }}
              className={cn(
                'min-h-[44px] flex-1 rounded-[8px] px-2 py-2 text-[12.5px] font-semibold transition-colors',
                mode === m.id ? 'bg-violet/[0.18] text-violet-soft' : 'text-muted hover:text-ink',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'order' && <OrderRound key={`${proc.id}-${round}`} proc={proc} onDone={record} />}
        {mode === 'next' && (
          <QuizRound
            key={`${proc.id}-next-${round}`}
            build={() => nextStepQuestions(proc.steps, 5)}
            ask="What is the next step after this one?"
            onDone={record}
            onRestart={() => setRound((r) => r + 1)}
          />
        )}
        {mode === 'danger' &&
          (dangerReady ? (
            <QuizRound
              key={`${proc.id}-danger-${round}`}
              build={() => dangerQuiz(proc)}
              ask="Which structure is most at risk at this step?"
              onDone={record}
              onRestart={() => setRound((r) => r + 1)}
            />
          ) : (
            <p className="rounded-[12px] border border-dashed border-line bg-navy px-4 py-5 text-center text-[13px] text-muted-2">
              Danger zones for this procedure are still being written from its source. Try one that
              shows them on its Procedures page.
            </p>
          ))}

        {/* Due for refresh across procedures */}
        {practised.size > 0 && (
          <div className="rounded-[14px] border border-line bg-navy-2 p-5">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-2">
              Your progress
            </div>
            <p className="text-[13px] text-muted">
              Practised {practised.size} of {PROCEDURES.length} procedures.{' '}
              {dueList.length === 0
                ? 'Nothing is due for a refresh.'
                : `Due for a refresh (last score under 80% or not practised for 2 weeks):`}
            </p>
            {dueList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {dueList.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProcedureId(p.id)}
                    className="min-h-[44px] rounded-[10px] border border-amber/40 bg-amber/[0.08] px-3 py-2 text-left text-[12.5px] text-ink hover:border-amber"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-[11.5px] text-muted-2">
          A rehearsal aid, not a substitute for supervised operating. Steps are summarised from each
          procedure’s cited operative source; confirm technique with the operating surgeon. Progress
          is kept on this device.
        </p>
      </PageBody>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-[12px] border border-line bg-navy-2 px-3 py-2.5">
      <div className={cn('font-mono text-[16px] font-semibold text-ink', tone)}>{value}</div>
      <div className="text-[11px] text-muted-2">{label}</div>
    </div>
  );
}

/** The original mode: tap the steps into order, optionally against the clock. */
function OrderRound({ proc, onDone }: { proc: Procedure; onDone: (c: number, t: number, ms?: number) => void }) {
  const n = proc.steps.length;
  const [shuffled, setShuffled] = useState<number[]>(() => makeShuffle(n));
  const [sequence, setSequence] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [timed, setTimed] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(0);
  const [frozen, setFrozen] = useState(0);
  const [showRef, setShowRef] = useState(false);

  useEffect(() => {
    if (!timed || startedAt === null || checked) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [timed, startedAt, checked]);

  const pool = useMemo(() => shuffled.filter((i) => !sequence.includes(i)), [shuffled, sequence]);
  const elapsed = checked ? frozen : timed && startedAt !== null ? Math.max(0, nowMs - startedAt) : 0;
  const correctCount = sequence.filter((idx, pos) => idx === pos).length;

  function reset() {
    setShuffled(makeShuffle(n));
    setSequence([]);
    setChecked(false);
    setStartedAt(null);
    setFrozen(0);
  }
  function check() {
    const ms = timed && startedAt !== null ? Date.now() - startedAt : undefined;
    setChecked(true);
    setFrozen(ms ?? 0);
    onDone(sequence.filter((idx, pos) => idx === pos).length, n, ms);
  }

  return (
    <div className="space-y-5">
      <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={timed}
          onChange={(e) => {
            setTimed(e.target.checked);
            if (!checked) reset();
          }}
          className="h-5 w-5 accent-violet"
        />
        <span className="text-[13px] text-muted">
          Timed challenge {timed && <span className="font-mono text-ink">· {formatTime(elapsed)}</span>}
        </span>
      </label>

      <div className="overflow-hidden rounded-[14px] border border-line bg-navy-2">
        <button
          type="button"
          onClick={() => setShowRef((v) => !v)}
          className="flex min-h-[44px] w-full items-center justify-between px-5 py-3 text-left text-[13px] font-semibold text-violet-soft"
        >
          Anatomy &amp; complications reference
          <span>{showRef ? '−' : '+'}</span>
        </button>
        {showRef && (
          <div className="space-y-4 border-t border-line px-5 py-4 text-[13px]">
            <RefList title="Anatomy" items={proc.anatomy} />
            <RefList title="Complications" items={proc.complications} />
          </div>
        )}
      </div>

      {!checked ? (
        <>
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-2">
              Your order ({sequence.length}/{n}) — tap to remove
            </div>
            {sequence.length === 0 ? (
              <p className="rounded-[12px] border border-dashed border-line bg-navy px-4 py-4 text-center text-[13px] text-muted-2">
                Tap a step below to begin.
              </p>
            ) : (
              <ol className="space-y-2">
                {sequence.map((idx, pos) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => setSequence((s) => s.filter((x) => x !== idx))}
                      className="flex min-h-[44px] w-full items-start gap-3 rounded-[10px] border border-violet/40 bg-violet/[0.10] px-3 py-2.5 text-left text-[13px] text-ink transition-colors hover:border-violet"
                    >
                      <span className="font-mono text-[12px] font-semibold text-violet-soft">{pos + 1}.</span>
                      <span>{proc.steps[idx]}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {pool.length > 0 && (
            <div>
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-2">
                Remaining steps — tap to add
              </div>
              <ul className="space-y-2">
                {pool.map((idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => {
                        if (timed && startedAt === null) setStartedAt(Date.now());
                        setSequence((s) => [...s, idx]);
                      }}
                      className="flex min-h-[44px] w-full items-start gap-2 rounded-[10px] border border-line bg-navy-2 px-3 py-2.5 text-left text-[13px] text-muted transition-colors hover:border-violet hover:text-ink"
                    >
                      <span className="text-violet-soft">+</span>
                      <span>{proc.steps[idx]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={check}
            disabled={sequence.length !== n}
            className="min-h-[44px] w-full rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
          >
            Check order
          </button>
        </>
      ) : (
        <>
          <div className="flex items-baseline justify-between rounded-[16px] border border-line bg-navy-2 p-5">
            <div>
              <div className="font-display text-[28px] font-semibold">
                {correctCount}
                <span className="text-[16px] text-muted-2"> / {n}</span>
              </div>
              <div className="text-[12px] text-muted-2">steps in the correct position</div>
            </div>
            {timed && (
              <div className="text-right">
                <div className="font-mono text-[20px] font-semibold text-ink">{formatTime(frozen)}</div>
                <div className="text-[12px] text-muted-2">time</div>
              </div>
            )}
          </div>
          <ol className="space-y-2">
            {proc.steps.map((step, pos) => {
              const ok = sequence[pos] === pos;
              return (
                <li
                  key={pos}
                  className={cn(
                    'flex items-start gap-3 rounded-[10px] border px-3 py-2.5 text-[13px]',
                    ok ? 'border-teal/40 bg-teal/[0.08]' : 'border-crimson/40 bg-crimson/[0.08]',
                  )}
                >
                  <span className={cn('font-mono text-[12px] font-semibold', ok ? 'text-teal' : 'text-crimson')}>
                    {ok ? '✓' : '✗'} {pos + 1}.
                  </span>
                  <span className="text-ink">{step}</span>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            onClick={reset}
            className="min-h-[44px] w-full rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}

function RefList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-2">{title}</div>
      <ul className="list-disc space-y-1 pl-5 text-muted">
        {items.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
    </div>
  );
}

/** Multiple-choice round shared by "What comes next?" and the danger-zone quiz. */
function QuizRound({
  build,
  ask,
  onDone,
  onRestart,
}: {
  build: () => ChoiceQuestion[];
  ask: string;
  onDone: (correct: number, total: number) => void;
  onRestart: () => void;
}) {
  const [questions] = useState(build);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) {
    return <p className="text-[13px] text-muted-2">This procedure has too few steps for this mode.</p>;
  }

  const q = questions[i]!;

  function choose(option: string) {
    if (picked) return;
    setPicked(option);
    if (option === q.answer) setScore((s) => s + 1);
  }
  function next() {
    if (i + 1 < questions.length) {
      setI(i + 1);
      setPicked(null);
    } else {
      setFinished(true);
      onDone(score, questions.length);
    }
  }

  if (finished) {
    return (
      <div className="space-y-4">
        <div className="rounded-[16px] border border-line bg-navy-2 p-5">
          <div className="font-display text-[28px] font-semibold">
            {score}
            <span className="text-[16px] text-muted-2"> / {questions.length}</span>
          </div>
          <div className="text-[12px] text-muted-2">correct</div>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="min-h-[44px] w-full rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          New round
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-2">
        Question {i + 1} of {questions.length} · {score} correct
      </div>
      <div className="rounded-[14px] border border-violet/40 bg-violet/[0.08] p-4 text-[13.5px] text-ink">{q.prompt}</div>
      <p className="text-[13px] font-semibold text-muted">{ask}</p>
      <ul className="space-y-2">
        {q.options.map((o) => {
          const isAnswer = o === q.answer;
          const state = !picked ? 'idle' : isAnswer ? 'right' : o === picked ? 'wrong' : 'other';
          return (
            <li key={o}>
              <button
                type="button"
                onClick={() => choose(o)}
                disabled={picked !== null}
                className={cn(
                  'flex min-h-[44px] w-full items-start gap-2 rounded-[10px] border px-3 py-2.5 text-left text-[13px] transition-colors',
                  state === 'idle' && 'border-line bg-navy-2 text-muted hover:border-violet hover:text-ink',
                  state === 'right' && 'border-teal/50 bg-teal/[0.10] text-ink',
                  state === 'wrong' && 'border-crimson/50 bg-crimson/[0.10] text-ink',
                  state === 'other' && 'border-line bg-navy-2 text-muted-2',
                )}
              >
                {o}
              </button>
            </li>
          );
        })}
      </ul>
      {picked && (
        <>
          {q.explanation && (
            <p className="rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[13px] text-muted">{q.explanation}</p>
          )}
          <button
            type="button"
            onClick={next}
            className="min-h-[44px] w-full rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {i + 1 < questions.length ? 'Next question' : 'See score'}
          </button>
        </>
      )}
    </div>
  );
}
