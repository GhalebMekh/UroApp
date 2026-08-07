import { useState } from 'react';
import { NumberField } from '@/components/calculators/primitives';
import { CitationNote } from '@/components/CitationNote';
import { CITATIONS } from '@/data/citations';
import { PED_ABX, type AbxCategory, type PedAbxDose } from '@/data/pediatricAbx';

const GROUPS: { category: AbxCategory; label: string }[] = [
  { category: 'oral', label: 'Oral — SPIDS Table 4' },
  { category: 'iv', label: 'Intravenous — SPIDS Table 5' },
  { category: 'prophylaxis', label: 'Prophylaxis — single daily dose' },
];

function fmt(n: number): string {
  return n >= 10 ? String(Math.round(n)) : String(Math.round(n * 10) / 10);
}
function range(lo: number, hi: number): string {
  return lo === hi ? fmt(lo) : `${fmt(lo)}–${fmt(hi)}`;
}
function mgkg(d: PedAbxDose): string {
  const v = d.mgPerKgPerDay;
  return Array.isArray(v) ? `${v[0]}–${v[1]}` : `${v}`;
}

function DoseRow({ d, w }: { d: PedAbxDose; w: number | null }) {
  const v = d.mgPerKgPerDay;
  const lo = Array.isArray(v) ? v[0] : v;
  const hi = Array.isArray(v) ? v[1] : v;

  return (
    <article className="rounded-[12px] border border-line bg-navy p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[15px] font-semibold">{d.drug}</span>
        <span className="shrink-0 text-[12px] text-muted-2">{d.route} · {d.frequency}</span>
      </div>
      <div className="mt-0.5 text-[12.5px] text-muted">{d.indication}</div>
      <div className="mt-2 font-mono text-[13px] text-ink">
        {mgkg(d)} mg/kg/day{d.basis ? <span className="text-muted-2"> ({d.basis})</span> : null}
      </div>

      {w !== null && (
        <div className="mt-1.5 rounded-[8px] bg-steel px-2.5 py-2 font-mono text-[13px] text-violet-soft">
          → {range(lo * w, hi * w)} mg/day
          {d.dosesPerDay > 1 && (
            <span className="text-muted">
              {' '}· {range((lo * w) / d.dosesPerDay, (hi * w) / d.dosesPerDay)} mg/dose × {d.dosesPerDay}
            </span>
          )}
        </div>
      )}

      {d.note && <div className="mt-1.5 text-[12px] text-amber">{d.note}</div>}
      <div className="mt-1.5 text-[11px] text-muted-2">Source: {d.source}</div>
    </article>
  );
}

/** Weight-based paediatric UTI antibiotic doses (SPIDS 2021). */
export function PediatricAntibiotics() {
  const [weight, setWeight] = useState('');
  const w = parseFloat(weight);
  const weightKg = Number.isFinite(w) && w > 0 ? w : null;

  return (
    <section className="rounded-[20px] border border-line bg-navy-2 p-6">
      <h3 className="font-display text-[21px] font-semibold">Antibiotic dosing (UTI)</h3>
      <p className="mb-4 text-[13px] text-muted-2">
        Weight-based doses for community-acquired UTI, children ≥ 3 months, if susceptible
      </p>

      <NumberField label="Weight" value={weight} onChange={setWeight} unit="kg" step="0.5" min="0" placeholder="e.g. 14" />

      {GROUPS.map((g) => {
        const items = PED_ABX.filter((d) => d.category === g.category);
        if (items.length === 0) return null;
        return (
          <div key={g.category} className="mb-4">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-2">
              {g.label}
            </div>
            <div className="space-y-2.5">
              {items.map((d) => (
                <DoseRow key={`${d.drug}-${d.indication}`} d={d} w={weightKg} />
              ))}
            </div>
          </div>
        );
      })}

      <p className="mt-1 rounded-[10px] border border-amber/40 bg-amber/[0.08] px-3 py-2.5 text-[12px] text-muted">
        Scope: community-acquired UTI, children ≥ 3 months, susceptible isolate — not neonates/infants
        &lt; 3 months or complicated UTI. The guideline lists no per-dose maxima; cap at adult doses and
        verify before prescribing.
      </p>
      <CitationNote citation={CITATIONS.spidsUti} />
    </section>
  );
}
