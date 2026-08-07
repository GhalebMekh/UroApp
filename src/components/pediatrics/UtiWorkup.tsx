import { CalcCard } from '@/components/calculators/primitives';
import { CITATIONS } from '@/data/citations';

interface Row {
  k: string;
  v: string;
}
interface Sec {
  title: string;
  rows: Row[];
}

// Summarised from the SPIDS 2021 CA-UTI guideline (our wording, not verbatim).
const SECTIONS: Sec[] = [
  {
    title: 'Significant bacteriuria',
    rows: [
      { k: 'Suprapubic aspirate', v: 'any growth of a uropathogen' },
      { k: 'Catheter', v: '> 50,000 CFU/mL (or > 10,000 if fever + pyuria)' },
      { k: 'Clean-voided', v: '> 100,000 CFU/mL (or > 10,000 if fever + pyuria)' },
      { k: 'Pyuria', v: 'positive LE, ≥ 5 WBC/hpf (centrifuged), or ≥ 10/mm³' },
    ],
  },
  {
    title: 'Empiric therapy',
    rows: [
      { k: 'Oral · 1st-line', v: 'amoxicillin-clavulanate, cephalexin, cefuroxime or cefprozil (alt: cefixime)' },
      { k: 'IV · 1st-line', v: 'ceftriaxone ± gentamicin (gentamicin if prior ESBL / recent cephalosporin)' },
      { k: 'Avoid empirically', v: 'ampicillin & co-trimoxazole — high local resistance (~70% / ~60%)' },
      { k: 'Duration', v: 'cystitis 3–7 days · pyelonephritis 7–14 days' },
    ],
  },
  {
    title: 'Imaging',
    rows: [
      { k: 'RBUS', v: '1st febrile UTI < 3 yr; or recurrent, family hx VUR, non-E. coli, or complicated. Timing 2–6 wk after (early if severely ill).' },
      { k: 'VCUG', v: 'not routine after 1st febrile UTI; do if recurrent, complicated, abnormal RBUS, non-E. coli, or family hx VUR. Timing early.' },
      { k: 'DMSA', v: 'not routine; do if febrile UTI with severe VUR (IV–V) or renal-impairment concern. Timing 4–6 mo after.' },
    ],
  },
  {
    title: 'Prophylaxis',
    rows: [
      { k: 'Indicated', v: 'VUR grade III–IV; uncircumcised males with any VUR; bladder-bowel dysfunction with any VUR' },
      { k: 'Not for', v: 'normal urinary tract or mild VUR (grade I–II)' },
      { k: 'Agents', v: 'nitrofurantoin or co-trimoxazole, single daily dose (see Antibiotic dosing)' },
    ],
  },
];

/** Community-acquired UTI workup pathway (SPIDS 2021), children ≥ 3 months. */
export function UtiWorkup() {
  return (
    <CalcCard
      title="UTI workup pathway"
      subtitle="Community-acquired UTI, children ≥ 3 months (SPIDS)"
      citation={CITATIONS.spidsUti}
    >
      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-violet-soft">
              {s.title}
            </div>
            <ul className="space-y-1.5">
              {s.rows.map((r) => (
                <li key={r.k} className="text-[13px] text-muted">
                  <span className="font-semibold text-ink">{r.k}</span> — {r.v}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Summary of the SPIDS recommendations in UroApp's own words. Scope excludes neonates/infants
        &lt; 3 months and complicated UTI — manage those individually.
      </p>
    </CalcCard>
  );
}
