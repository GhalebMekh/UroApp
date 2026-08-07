import { useState } from 'react';
import { CitationNote } from '@/components/CitationNote';
import { PROCEDURES } from '@/data/procedures';

export function ProceduresScreen() {
  const [id, setId] = useState(PROCEDURES[0]!.id);
  const proc = PROCEDURES.find((p) => p.id === id)!;

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
        Procedures
      </div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        Anatomy, steps & complications.
      </h2>
      <p className="max-w-xl text-[16.5px] text-muted">
        Operative reference for the OR and viva — the relevant anatomy, the steps of the procedure,
        and the complications to watch for. Summarised from the cited source.
      </p>

      <div className="mt-8 max-w-md">
        <label className="mb-[7px] block text-[13px] font-semibold text-muted">Procedure</label>
        <select
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="min-h-[44px] w-full rounded-[10px] border border-line bg-navy px-3 py-[11px] text-[14px] text-ink outline-none focus:border-violet"
        >
          {PROCEDURES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.category}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 rounded-[20px] border border-line bg-navy-2 p-6">
        <h3 className="font-display text-[22px] font-semibold">{proc.name}</h3>
        <p className="mt-2 text-[14px] text-muted">{proc.summary}</p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Section title="Anatomy" tone="text-violet-soft" items={proc.anatomy} />
          <Section title="Operative steps" tone="text-teal" items={proc.steps} ordered />
          <Section title="Post-op complications" tone="text-crimson" items={proc.complications} />
        </div>

        <p className="mt-6 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
          Summarised in UroApp's own words — not a verbatim reproduction. Confirm technique against
          the operating surgeon and the primary source.
        </p>
        <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-2">
          Operative source
        </div>
        <CitationNote citation={proc.citation} />
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
