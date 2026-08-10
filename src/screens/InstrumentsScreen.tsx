import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CitationNote } from '@/components/CitationNote';
import {
  INSTRUMENT_GROUPS,
  instrumentsIn,
  type InstrumentGroup,
} from '@/data/instruments';

export function InstrumentsScreen() {
  const [group, setGroup] = useState<InstrumentGroup>('cystoscope');
  const meta = INSTRUMENT_GROUPS.find((g) => g.id === group)!;
  const items = instrumentsIn(group);

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
        Instruments
      </div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        Know the kit before the case.
      </h2>
      <p className="max-w-xl text-[16.5px] text-muted">
        Sizes, optics and energy sources for endoscopic urology. Manufacturer figures differ
        between makes and models — confirm against the instrument in front of you.
      </p>

      {/* Group selector */}
      <div className="mt-8 flex flex-wrap gap-2">
        {INSTRUMENT_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroup(g.id)}
            className={cn(
              'min-h-[44px] rounded-[10px] border px-3.5 py-2 text-[13px] font-semibold transition-colors',
              g.id === group
                ? 'border-violet bg-violet/[0.18] text-violet-soft'
                : 'border-line bg-navy-2 text-muted hover:border-violet',
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-[13.5px] text-muted-2">{meta.blurb}</p>

      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <section key={item.id} className="rounded-[20px] border border-line bg-navy-2 p-6">
            <h3 className="font-display text-[21px] font-semibold">{item.name}</h3>
            <p className="mt-2 text-[14px] text-muted">{item.summary}</p>

            <dl className="mt-4 space-y-2">
              {item.specs.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-0.5 rounded-[10px] border border-line bg-navy px-3 py-2.5 sm:flex-row sm:items-baseline sm:gap-3"
                >
                  <dt className="shrink-0 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-2 sm:min-w-[168px]">
                    {s.label}
                  </dt>
                  <dd className="font-mono text-[13px] text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-teal">
                Used for
              </div>
              <ul className="space-y-1.5">
                {item.uses.map((u) => (
                  <li key={u} className="flex gap-2.5 text-[13.5px] text-muted">
                    <span aria-hidden="true" className="text-muted-2">
                      &middot;
                    </span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-amber">
                Watch out
              </div>
              <ul className="space-y-1.5">
                {item.pitfalls.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[13.5px] text-muted">
                    <span aria-hidden="true" className="text-amber">
                      &middot;
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <CitationNote citation={item.citation} />
          </section>
        ))}
      </div>
    </div>
  );
}
