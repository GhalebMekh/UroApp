import { useMemo, useState } from 'react';
import { CitationNote } from '@/components/CitationNote';
import { PROCEDURES, type Procedure } from '@/data/procedures';
import { cn } from '@/lib/cn';
import { SPECIALTY, specialtyOfProcedureCategory } from '@/lib/specialty';

/** Procedures grouped by category, keeping the order they first appear in. */
function byCategory(list: Procedure[]): [string, Procedure[]][] {
  const groups = new Map<string, Procedure[]>();
  for (const p of list) groups.set(p.category, [...(groups.get(p.category) ?? []), p]);
  return [...groups.entries()];
}

/** `initialId` opens one procedure directly, e.g. from search. */
export function ProceduresScreen({ initialId }: { initialId?: string }) {
  const [id, setId] = useState(
    PROCEDURES.some((p) => p.id === initialId) ? initialId! : PROCEDURES[0]!.id,
  );
  const proc = PROCEDURES.find((p) => p.id === id)!;
  const groups = useMemo(() => byCategory(PROCEDURES), []);

  return (
    // The heading lives in the Residency header (ResidencyScreen).
    <div className="mx-auto max-w-wrap px-4 pb-12 pt-6 sm:px-6">
      <div className="max-w-md">
        <label className="mb-[7px] block text-[13px] font-semibold text-muted">Procedure</label>
        <select
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[14px] text-ink outline-none focus:border-violet"
        >
          {groups.map(([category, procs]) => (
            <optgroup key={category} label={category}>
              {procs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-[20px] border border-line bg-navy-2 p-6">
        <span
          className={cn(
            'mb-2 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]',
            SPECIALTY[specialtyOfProcedureCategory(proc.category)].chip,
          )}
        >
          {proc.category}
        </span>
        <h3 className="font-display text-[22px] font-semibold">{proc.name}</h3>
        <p className="mt-2 text-[14px] text-muted">{proc.summary}</p>

        {proc.preop && (
          <div className="mt-6 rounded-[14px] border border-line bg-navy p-5">
            <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-violet-soft">
              Before theatre
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Section title="Indications" tone="text-muted" items={proc.preop.indications} />
              <Section title="Work-up" tone="text-muted" items={proc.preop.workup} />
              <Section title="Setup & prophylaxis" tone="text-muted" items={proc.preop.setup} />
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Section title="Anatomy" tone="text-violet-soft" items={proc.anatomy} />
          <Section title="Operative steps" tone="text-teal" items={proc.steps} ordered />
          <Section title="Post-op complications" tone="text-crimson" items={proc.complications} />
        </div>

        {proc.dangerZones && proc.dangerZones.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-amber">
              Danger zones & bail-outs
            </div>
            <ul className="space-y-2.5">
              {proc.dangerZones.map((z) => (
                <li key={`${z.step}-${z.structure}`} className="rounded-[12px] border border-amber/30 bg-amber/[0.06] p-4">
                  <div className="text-[13.5px] font-semibold text-ink">
                    <span className="mr-2 font-mono text-[12px] text-amber">Step {z.step + 1}</span>
                    {z.structure}
                  </div>
                  <p className="mt-1 text-[13px] text-muted">{z.risk}</p>
                  <p className="mt-1.5 text-[13px] text-ink">
                    <span className="font-semibold text-amber">If it happens: </span>
                    {z.bailout}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {proc.postop && proc.postop.length > 0 && (
          <div className="mt-6 rounded-[14px] border border-line bg-navy p-5">
            <Section title="After theatre" tone="text-teal" items={proc.postop} />
          </div>
        )}

        <p className="mt-6 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
          Summarised in UroApp's own words — not a verbatim reproduction. Confirm technique against
          the operating surgeon and the primary source.
        </p>
        <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-2">
          Operative source
        </div>
        <CitationNote citation={proc.citation} />
        {proc.extrasSource && (
          <>
            <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-2">
              Before / after theatre & danger zones
            </div>
            <CitationNote citation={proc.extrasSource} />
          </>
        )}
        {proc.guideline && (
          <>
            <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-2">
              Society guideline
            </div>
            <CitationNote citation={proc.guideline} />
          </>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  tone,
  items,
  ordered,
}: {
  title: string;
  tone: string;
  items: string[];
  ordered?: boolean;
}) {
  return (
    <div>
      <div className={`mb-3 text-[12px] font-semibold uppercase tracking-[0.1em] ${tone}`}>{title}</div>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-[13.5px] text-muted">
            <span className={`shrink-0 font-mono text-[12px] ${ordered ? tone : 'text-muted-2'}`}>
              {ordered ? `${i + 1}.` : '•'}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
