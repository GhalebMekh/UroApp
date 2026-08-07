import { useEffect, useMemo, useState } from 'react';
import { PROCEDURES } from '@/data/procedures';
import { cn } from '@/lib/cn';

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

export function OperativeRehearsalScreen() {
  const [procedureId, setProcedureId] = useState(PROCEDURES[0]?.id ?? '');
  const proc = PROCEDURES.find((p) => p.id === procedureId) ?? PROCEDURES[0];
  const n = proc?.steps.length ?? 0;

  const [shuffled, setShuffled] = useState<number[]>(() => makeShuffle(n));
  const [sequence, setSequence] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [showRef, setShowRef] = useState(false);

  const [timed, setTimed] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [frozenElapsed, setFrozenElapsed] = useState(0);

  // New round whenever the procedure changes.
  useEffect(() => {
    setShuffled(makeShuffle(n));
    setSequence([]);
    setChecked(false);
    setStartedAt(null);
    setFrozenElapsed(0);
  }, [procedureId, n]);

  // Live timer tick while a timed round is in progress.
  useEffect(() => {
    if (!timed || startedAt === null || checked) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [timed, startedAt, checked]);

  const pool = useMemo(
    () => shuffled.filter((i) => !sequence.includes(i)),
    [shuffled, sequence],
  );

  if (!proc) return null;

  const displayElapsed = checked
    ? frozenElapsed
    : timed && startedAt !== null
      ? Math.max(0, now - startedAt)
      : 0;

  const correctCount = sequence.filter((idx, pos) => idx === pos).length;

  function place(i: number) {
    if (checked) return;
    if (timed && startedAt === null) setStartedAt(Date.now());
    setSequence((s) => [...s, i]);
  }
  function unplace(i: number) {
    if (checked) return;
    setSequence((s) => s.filter((x) => x !== i));
  }
  function check() {
    setChecked(true);
    setFrozenElapsed(timed && startedAt !== null ? Date.now() - startedAt : 0);
  }
  function tryAgain() {
    setShuffled(makeShuffle(n));
    setSequence([]);
    setChecked(false);
    setStartedAt(null);
    setFrozenElapsed(0);
  }

  const field =
    'min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[14px] text-ink outline-none focus:border-violet';

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            OR rehearsal
          </div>
          <h2 className="font-display text-[28px] font-semibold">Operative rehearsal</h2>
          <p className="mt-3 text-[14px] text-muted">
            Rebuild the operation step by step. Tap the steps in the order you would perform them,
            then check yourself. Steps, anatomy and complications come from the app’s cited
            operative references.
          </p>
        </header>

        {/* Controls */}
        <div className="space-y-3">
          <label className="block">
            <span className="mb-[7px] block text-[13px] font-semibold text-muted">Procedure</span>
            <select value={procedureId} onChange={(e) => setProcedureId(e.target.value)} className={field}>
              {PROCEDURES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={timed}
              onChange={(e) => {
                setTimed(e.target.checked);
                if (!checked) tryAgain();
              }}
              className="h-5 w-5 accent-violet"
            />
            <span className="text-[13px] text-muted">
              Timed challenge{' '}
              {timed && <span className="font-mono text-ink">· {formatTime(displayElapsed)}</span>}
            </span>
          </label>
        </div>

        {/* Anatomy & complications reference */}
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
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-2">
                  Anatomy
                </div>
                <ul className="list-disc space-y-1 pl-5 text-muted">
                  {proc.anatomy.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-2">
                  Complications
                </div>
                <ul className="list-disc space-y-1 pl-5 text-muted">
                  {proc.complications.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {!checked ? (
          <>
            {/* Your sequence so far */}
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
                        onClick={() => unplace(idx)}
                        className="flex min-h-[44px] w-full items-start gap-3 rounded-[10px] border border-violet/40 bg-violet/[0.10] px-3 py-2.5 text-left text-[13px] text-ink transition-colors hover:border-violet"
                      >
                        <span className="font-mono text-[12px] font-semibold text-violet-soft">
                          {pos + 1}.
                        </span>
                        <span>{proc.steps[idx]}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Remaining steps to place */}
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
                        onClick={() => place(idx)}
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
            {/* Result */}
            <div className="rounded-[16px] border border-line bg-navy-2 p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-display text-[28px] font-semibold">
                    {correctCount}
                    <span className="text-[16px] text-muted-2"> / {n}</span>
                  </div>
                  <div className="text-[12px] text-muted-2">steps in the correct position</div>
                </div>
                {timed && (
                  <div className="text-right">
                    <div className="font-mono text-[20px] font-semibold text-ink">
                      {formatTime(frozenElapsed)}
                    </div>
                    <div className="text-[12px] text-muted-2">time</div>
                  </div>
                )}
              </div>
            </div>

            {/* Correct order, marked against the attempt */}
            <div>
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-2">
                Correct order
              </div>
              <ol className="space-y-2">
                {proc.steps.map((step, pos) => {
                  const ok = sequence[pos] === pos;
                  return (
                    <li
                      key={pos}
                      className={cn(
                        'flex items-start gap-3 rounded-[10px] border px-3 py-2.5 text-[13px]',
                        ok
                          ? 'border-teal/40 bg-teal/[0.08]'
                          : 'border-crimson/40 bg-crimson/[0.08]',
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
            </div>

            <button
              type="button"
              onClick={tryAgain}
              className="min-h-[44px] w-full rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Try again
            </button>
          </>
        )}

        <p className="text-[11.5px] text-muted-2">
          A rehearsal aid, not a substitute for supervised operating. Steps are summarised from each
          procedure’s cited operative source; confirm technique with the operating surgeon.
        </p>
      </div>
    </div>
  );
}
