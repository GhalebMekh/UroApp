import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CitationNote } from '@/components/CitationNote';
import { RAD_SYSTEMS, type RadRisk } from '@/data/radiology';

/** Colour coding per CLAUDE.md: low=teal, moderate=amber, high=crimson. */
const RISK_BADGE: Record<RadRisk, string> = {
  low: 'bg-teal/[0.16] text-teal border-teal/40',
  moderate: 'bg-amber/[0.16] text-amber border-amber/40',
  high: 'bg-crimson/[0.16] text-crimson border-crimson/40',
};
const RISK_LABEL: Record<RadRisk, string> = {
  low: 'Low risk',
  moderate: 'Intermediate',
  high: 'High risk',
};

/** Interactive browser for the radiology reporting systems. */
export function RadiologyReference() {
  const [systemId, setSystemId] = useState(RAD_SYSTEMS[0]!.id);
  const system = RAD_SYSTEMS.find((s) => s.id === systemId)!;

  return (
    <section className="rounded-[20px] border border-line bg-navy-2 p-6">
      {/* System selector */}
      <div className="mb-5 grid grid-cols-3 gap-1.5 rounded-[12px] border border-line bg-navy p-1">
        {RAD_SYSTEMS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSystemId(s.id)}
            className={cn(
              'min-h-[44px] rounded-[9px] px-2 py-2 text-[12.5px] font-semibold transition-colors',
              s.id === systemId ? 'bg-violet/[0.18] text-violet-soft' : 'text-muted hover:text-ink',
            )}
          >
            {s.short}
          </button>
        ))}
      </div>

      <h3 className="font-display text-[21px] font-semibold">{system.name}</h3>
      <p className="text-[13px] text-muted-2">{system.modality}</p>
      <p className="mt-2 text-[13.5px] text-muted">{system.outcome}</p>

      <div className="mt-4 space-y-2.5">
        {system.categories.map((c) => (
          <article key={c.code} className="rounded-[14px] border border-line bg-navy p-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'grid h-9 min-w-[36px] place-items-center rounded-[9px] border px-2 font-mono text-[15px] font-semibold',
                  RISK_BADGE[c.risk],
                )}
              >
                {c.code}
              </span>
              <div>
                <div className="text-[15px] font-semibold">{c.label}</div>
                <div className={cn('text-[11px] font-semibold uppercase tracking-[0.06em]', RISK_BADGE[c.risk].split(' ')[1])}>
                  {RISK_LABEL[c.risk]}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[13.5px] text-muted">{c.criteria}</p>
            <p className="mt-2 text-[13px]">
              <span className="font-semibold text-violet-soft">Management · </span>
              <span className="text-muted">{c.management}</span>
            </p>
          </article>
        ))}
      </div>

      <p className="mt-4 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Criteria summarised in UroApp's own words — not a verbatim reproduction of the
        source tables. For reporting, use the full published system.
      </p>
      <CitationNote citation={system.citation} />
    </section>
  );
}
