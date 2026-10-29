import { useState } from 'react';
import { CitationNote } from '@/components/CitationNote';
import { HeroChips, PageBody, PageHero } from '@/components/PageHero';
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
    <>
      <PageHero
        eyebrow="Instruments"
        title="Know the kit before the case."
        lede="Sizes, optics and energy sources for endoscopic urology. Manufacturer figures differ between makes and models — confirm against the instrument in front of you."
      >
        <HeroChips
          value={group}
          onChange={setGroup}
          items={INSTRUMENT_GROUPS.map((g) => ({ id: g.id, label: g.label }))}
        />
      </PageHero>

      <PageBody>
        <p className="text-[13.5px] text-muted-2">{meta.blurb}</p>

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
      </PageBody>
    </>
  );
}
