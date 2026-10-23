import { CalcCard, type RiskBand } from '@/components/calculators/primitives';
import { CITATIONS } from '@/data/citations';
import { cn } from '@/lib/cn';

interface Grade {
  code: string;
  band: RiskBand;
  finding: string;
}

/**
 * International Reflux Study grades of VUR on VCUG.
 *
 * System: Lebowitz et al., Pediatr Radiol 1985 (PMID 3975102), graded on the
 * extent of filling and dilatation of the ureter, renal pelvis and calyces.
 * Wording is our own summary, taken from Campbell-Walsh-Wein ch. 122 (VUR).
 *
 * Colour bands follow the 3-tier grouping Campbell gives for radionuclide
 * cystography — low (I), intermediate (II–III), high (IV–V) — rather than a
 * cut-off invented here.
 */
const GRADES: Grade[] = [
  { code: 'I', band: 'low', finding: 'Reflux into a non-dilated ureter only.' },
  { code: 'II', band: 'moderate', finding: 'Reaches the renal pelvis and calyces, without dilatation.' },
  {
    code: 'III',
    band: 'moderate',
    finding: 'Mild to moderate dilatation of the ureter, renal pelvis and calyces; minimal blunting of the fornices.',
  },
  {
    code: 'IV',
    band: 'high',
    finding: 'Moderate ureteral tortuosity, with moderate dilatation of the renal pelvis and calyces.',
  },
  {
    code: 'V',
    band: 'high',
    finding: 'Severe ureteral tortuosity and severe dilatation of the pelvis and calyces; papillary impressions lost.',
  },
];

const BADGE: Record<RiskBand, string> = {
  none: 'bg-steel text-muted border-line',
  low: 'bg-teal/[0.16] text-teal border-teal/40',
  moderate: 'bg-amber/[0.16] text-amber border-amber/40',
  high: 'bg-crimson/[0.16] text-crimson border-crimson/40',
};

/** VUR grading reference (International Reflux Study, I–V). */
export function VurGrading() {
  return (
    <CalcCard
      title="VUR grade"
      subtitle="International Reflux Study grading on voiding cystourethrogram (I–V)"
      citation={CITATIONS.vurIrs}
    >
      <div className="space-y-2.5">
        {GRADES.map((g) => (
          <article key={g.code} className="flex items-center gap-3 rounded-[14px] border border-line bg-navy p-4">
            <span
              className={cn(
                'grid h-9 min-w-[36px] place-items-center rounded-[9px] border font-mono text-[15px] font-semibold',
                BADGE[g.band],
              )}
            >
              {g.code}
            </span>
            <p className="text-[13.5px] text-muted">{g.finding}</p>
          </article>
        ))}
      </div>
      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        The grade's main use is predicting spontaneous resolution and comparing series. Ureteral
        and calyceal dilatation do not always agree; when they are discordant, how the grade relates
        to scarring and resolution is uncertain.
      </p>
    </CalcCard>
  );
}
