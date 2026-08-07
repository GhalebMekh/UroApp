import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CitationNote } from '@/components/CitationNote';
import { TwistScore } from '@/components/oncall/TwistScore';
import { EMERGENCIES } from '@/data/oncall';

export function OnCallScreen() {
  const [id, setId] = useState(EMERGENCIES[0]!.id);
  const em = EMERGENCIES.find((e) => e.id === id)!;

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-crimson">
        On-call
      </div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        The next 30 minutes.
      </h2>
      <p className="max-w-xl text-[16.5px] text-muted">
        Immediate management of the commonest urological emergencies. Decision-support only —
        escalate to your senior and follow local protocol.
      </p>

      {/* Emergency selector */}
      <div className="mt-8 flex flex-wrap gap-2">
        {EMERGENCIES.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setId(e.id)}
            className={cn(
              'rounded-[10px] border px-3.5 py-2 text-[13px] font-semibold transition-colors',
              e.id === id
                ? 'border-crimson bg-crimson/[0.16] text-crimson'
                : 'border-line bg-navy-2 text-muted hover:border-crimson/60',
            )}
          >
            {e.name}
          </button>
        ))}
      </div>

      <section className="mt-6 rounded-[20px] border border-line bg-navy-2 p-6">
        <h3 className="font-display text-[22px] font-semibold">{em.name}</h3>
        <p className="mt-2 text-[14px] text-muted">{em.oneLiner}</p>

        <div className="mt-4 flex items-start gap-2 rounded-[12px] border border-crimson/40 bg-crimson/[0.08] px-4 py-3 text-[13px] text-crimson">
          <span aria-hidden="true">⏱</span>
          <span>{em.clock}</span>
        </div>

        <div className="mt-5">
          <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-teal">
            In the next 30 minutes
          </div>
          <ol className="space-y-2.5">
            {em.immediate.map((step, i) => (
              <li key={i} className="flex gap-3 text-[14px] text-ink">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-steel font-mono text-[12px] text-violet-soft">
                  {i + 1}
                </span>
                <span className="text-muted">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-amber">
            Don't miss
          </div>
          <ul className="flex flex-wrap gap-2">
            {em.redFlags.map((r) => (
              <li key={r} className="rounded-full border border-amber/40 bg-amber/[0.1] px-3 py-1 text-[12px] text-amber">
                {r}
              </li>
            ))}
          </ul>
        </div>

        <CitationNote citation={em.citation} />
      </section>

      {em.id === 'torsion' && (
        <div className="mt-5 lg:max-w-lg">
          <TwistScore />
        </div>
      )}
    </div>
  );
}
