import { useState } from 'react';
import { SCENARIOS, type Scenario } from '@/data/scenarios';
import { cn } from '@/lib/cn';

type Status = 'playing' | 'failed' | 'complete';

export function IntraopScenariosScreen() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0]?.id ?? '');
  const scenario: Scenario | undefined =
    SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const [nodeIndex, setNodeIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [missteps, setMissteps] = useState(0);
  const [status, setStatus] = useState<Status>('playing');

  if (!scenario) return null;
  const node = scenario.nodes[nodeIndex];
  const lastNode = nodeIndex === scenario.nodes.length - 1;

  function restart() {
    setNodeIndex(0);
    setSelected(null);
    setMissteps(0);
    setStatus('playing');
  }

  function selectScenario(id: string) {
    setScenarioId(id);
    setNodeIndex(0);
    setSelected(null);
    setMissteps(0);
    setStatus('playing');
  }

  function choose(i: number) {
    if (selected !== null || !node) return;
    const choice = node.choices[i];
    if (!choice) return;
    setSelected(i);
    if (!choice.correct) setMissteps((m) => m + 1);
    if (choice.terminal) setStatus('failed');
  }

  function advance() {
    if (lastNode) {
      setStatus('complete');
    } else {
      setNodeIndex((n) => n + 1);
      setSelected(null);
    }
  }

  const field =
    'min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[14px] text-ink outline-none focus:border-violet';

  const chosen = selected !== null && node ? node.choices[selected] : null;

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            OR decisions
          </div>
          <h2 className="font-display text-[28px] font-semibold">Intra-op scenarios</h2>
          <p className="mt-3 text-[14px] text-muted">
            Work a case decision by decision. Each turn shows the situation; choose the next move and
            see the consequence. The preferred action is drawn from the cited guideline — a poor
            choice can end the case.
          </p>
        </header>

        {SCENARIOS.length > 1 && (
          <label className="block">
            <span className="mb-[7px] block text-[13px] font-semibold text-muted">Scenario</span>
            <select value={scenarioId} onChange={(e) => selectScenario(e.target.value)} className={field}>
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Case vignette */}
        <div className="rounded-[14px] border border-line bg-navy-2 p-5">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-violet-soft">
            {scenario.title}
          </div>
          <p className="text-[13px] leading-relaxed text-muted">{scenario.vignette}</p>
        </div>

        {status === 'complete' ? (
          <div className="space-y-4">
            <div className="rounded-[16px] border border-teal/50 bg-teal/[0.10] p-5">
              <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-teal">
                Case completed
              </div>
              <p className="text-[13px] text-muted">
                You worked the case to the end{' '}
                {missteps === 0 ? (
                  <span className="font-semibold text-teal">with no missteps.</span>
                ) : (
                  <>
                    with{' '}
                    <span className="font-semibold text-amber">
                      {missteps} misstep{missteps === 1 ? '' : 's'}
                    </span>{' '}
                    along the way.
                  </>
                )}
              </p>
            </div>
            <button type="button" onClick={restart} className={primaryBtn}>
              Restart scenario
            </button>
          </div>
        ) : status === 'failed' ? (
          <div className="space-y-4">
            {chosen && <OutcomeCard tone="bad" text={chosen.outcome} />}
            {node && <SourceLine label={node.source.label} url={node.source.url} />}
            <button type="button" onClick={restart} className={primaryBtn}>
              Restart scenario
            </button>
          </div>
        ) : (
          node && (
            <div className="space-y-4">
              <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-2">
                Decision {nodeIndex + 1} of {scenario.nodes.length}
              </div>

              <div className="rounded-[16px] border border-line bg-navy-2 p-5">
                <p className="mb-3 text-[13.5px] leading-relaxed text-ink">{node.situation}</p>
                <p className="text-[14px] font-semibold text-violet-soft">{node.question}</p>
              </div>

              <div className="space-y-2.5">
                {node.choices.map((c, i) => {
                  const isChosen = selected === i;
                  return (
                    <button
                      key={c.text}
                      type="button"
                      onClick={() => choose(i)}
                      disabled={selected !== null}
                      className={cn(
                        'flex min-h-[44px] w-full items-start gap-2 rounded-[10px] border px-3 py-2.5 text-left text-[13px] transition-colors',
                        selected === null
                          ? 'border-line bg-navy-2 text-muted hover:border-violet hover:text-ink'
                          : isChosen
                            ? c.correct
                              ? 'border-teal/60 bg-teal/[0.10] text-ink'
                              : 'border-crimson/60 bg-crimson/[0.10] text-ink'
                            : 'border-line bg-navy-2 text-muted-2 opacity-60',
                      )}
                    >
                      {selected !== null && isChosen && (
                        <span className={cn('font-semibold', c.correct ? 'text-teal' : 'text-crimson')}>
                          {c.correct ? '✓' : '✗'}
                        </span>
                      )}
                      <span>{c.text}</span>
                    </button>
                  );
                })}
              </div>

              {chosen && (
                <>
                  <OutcomeCard tone={chosen.correct ? 'good' : 'warn'} text={chosen.outcome} />
                  <SourceLine label={node.source.label} url={node.source.url} />
                  {chosen.correct ? (
                    <button type="button" onClick={advance} className={primaryBtn}>
                      {lastNode ? 'Finish case' : 'Continue'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="min-h-[44px] w-full rounded-[11px] border border-line bg-navy-2 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-violet"
                    >
                      Try again
                    </button>
                  )}
                </>
              )}
            </div>
          )
        )}

        <p className="text-[11.5px] text-muted-2">
          Education and decision support only — a teaching case, not a substitute for supervised
          operating or the treating team’s judgment. Guideline-preferred actions are summarised from
          the cited source.
        </p>
      </div>
    </div>
  );
}

const primaryBtn =
  'min-h-[44px] w-full rounded-[11px] bg-violet py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90';

function OutcomeCard({ tone, text }: { tone: 'good' | 'warn' | 'bad'; text: string }) {
  const styles: Record<typeof tone, string> = {
    good: 'border-teal/50 bg-teal/[0.10]',
    warn: 'border-amber/50 bg-amber/[0.10]',
    bad: 'border-crimson/50 bg-crimson/[0.10]',
  };
  return (
    <div className={cn('rounded-[12px] border px-4 py-3', styles[tone])}>
      <p className="text-[13px] leading-relaxed text-muted">{text}</p>
    </div>
  );
}

function SourceLine({ label, url }: { label: string; url: string }) {
  return (
    <p className="text-[11.5px] text-muted-2">
      Source:{' '}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-violet hover:text-violet-soft"
      >
        {label} ↗
      </a>
    </p>
  );
}
