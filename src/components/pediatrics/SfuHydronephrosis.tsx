import { CalcCard, type RiskBand } from '@/components/calculators/primitives';
import { CITATIONS } from '@/data/citations';
import { cn } from '@/lib/cn';

interface Grade {
  code: string;
  band: RiskBand;
  finding: string;
}

// Summarised SFU ultrasound grades (Fernbach 1993) — our wording.
const GRADES: Grade[] = [
  { code: '0', band: 'low', finding: 'No hydronephrosis — intact central renal complex.' },
  { code: '1', band: 'low', finding: 'Renal pelvis only is visualised (mild).' },
  { code: '2', band: 'moderate', finding: 'Renal pelvis plus a few (not all) calyces.' },
  { code: '3', band: 'moderate', finding: 'Renal pelvis and virtually all calyces dilated; parenchyma preserved.' },
  { code: '4', band: 'high', finding: 'As grade 3 but with parenchymal thinning vs. the normal side.' },
];

const BADGE: Record<RiskBand, string> = {
  none: 'bg-steel text-muted border-line',
  low: 'bg-teal/[0.16] text-teal border-teal/40',
  moderate: 'bg-amber/[0.16] text-amber border-amber/40',
  high: 'bg-crimson/[0.16] text-crimson border-crimson/40',
};

/** SFU hydronephrosis grading reference (Fernbach 1993). */
export function SfuHydronephrosis() {
  return (
    <CalcCard
      title="SFU hydronephrosis grade"
      subtitle="Society for Fetal Urology ultrasound grading (0–4)"
      citation={CITATIONS.sfuHydro}
    >
      <div className="space-y-2.5">
        {GRADES.map((g) => (
          <article key={g.code} className="flex items-center gap-3 rounded-[14px] border border-line bg-navy p-4">
            <span className={cn('grid h-9 min-w-[36px] place-items-center rounded-[9px] border font-mono text-[15px] font-semibold', BADGE[g.band])}>
              {g.code}
            </span>
            <p className="text-[13.5px] text-muted">{g.finding}</p>
          </article>
        ))}
      </div>
      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Grade and its trajectory on serial ultrasound guide follow-up and the need for pediatric
        urology referral / further imaging (e.g. VCUG, MAG3) per local protocol.
      </p>
    </CalcCard>
  );
}
