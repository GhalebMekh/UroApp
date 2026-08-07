import { CalcCard, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';
import { cn } from '@/lib/cn';

interface Grade {
  code: string;
  band: RiskBand;
  definition: string;
  sfr: string;
}

// Summarised grade definitions (Thomas 2011) — our wording, not verbatim.
const GRADES: Grade[] = [
  {
    code: 'I',
    band: 'low',
    definition: 'Solitary stone in the mid/lower pole, or a solitary pelvic stone, with simple anatomy.',
    sfr: '~81%',
  },
  {
    code: 'II',
    band: 'moderate',
    definition: 'Solitary upper-pole stone, OR multiple stones with simple anatomy, OR a solitary stone with abnormal anatomy.',
    sfr: '~72%',
  },
  {
    code: 'III',
    band: 'high',
    definition: 'Multiple stones with abnormal anatomy, OR a stone in a calyceal diverticulum, OR a partial staghorn.',
    sfr: '~35%',
  },
  {
    code: 'IV',
    band: 'high',
    definition: 'Complete staghorn calculus, OR any stone in a patient with spina bifida or spinal-cord injury.',
    sfr: '~29%',
  },
];

const BADGE: Record<RiskBand, string> = {
  none: 'bg-steel text-muted border-line',
  low: 'bg-teal/[0.16] text-teal border-teal/40',
  moderate: 'bg-amber/[0.16] text-amber border-amber/40',
  high: 'bg-crimson/[0.16] text-crimson border-crimson/40',
};

/** Guy's Stone Score — PCNL complexity grade reference (Thomas 2011). */
export function GuysStoneScore() {
  return (
    <CalcCard
      title="Guy's Stone Score"
      subtitle="PCNL complexity grade — predicts stone-free rate"
      citation={CITATIONS.guysStone}
    >
      <div className="space-y-2.5">
        {GRADES.map((g) => (
          <article key={g.code} className="rounded-[14px] border border-line bg-navy p-4">
            <div className="flex items-center gap-3">
              <span className={cn('grid h-9 min-w-[40px] place-items-center rounded-[9px] border px-2 font-mono text-[15px] font-semibold', BADGE[g.band])}>
                {g.code}
              </span>
              <div className="text-[12px] text-muted-2">
                Reported stone-free rate <span className="font-semibold text-ink">{g.sfr}</span>
              </div>
            </div>
            <p className="mt-3 text-[13.5px] text-muted">{g.definition}</p>
          </article>
        ))}
      </div>
      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Grade definitions summarised in UroApp's own words. Assign the grade from imaging; figures are
        the original cohort's stone-free rates.
      </p>
    </CalcCard>
  );
}
