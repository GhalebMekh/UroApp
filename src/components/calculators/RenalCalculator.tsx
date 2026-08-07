import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';

type Score = 1 | 2 | 3;
type Ap = 'a' | 'p' | 'x';

interface RenalState {
  r: Score | null;
  e: Score | null;
  n: Score | null;
  l: Score | null;
  ap: Ap;
  h: boolean;
}

function band(total: number): { band: RiskBand; label: string } {
  if (total <= 6) return { band: 'low', label: 'Low complexity (4–6)' };
  if (total <= 9) return { band: 'moderate', label: 'Moderate complexity (7–9)' };
  return { band: 'high', label: 'High complexity (10–12)' };
}

const opts = <T extends string | number>(items: [T, string][]) =>
  items.map(([value, label]) => ({ value, label }));

/** R.E.N.A.L. Nephrometry (Kutikov & Uzzo 2009). */
export function RenalCalculator() {
  const [s, setS] = useState<RenalState>({ r: null, e: null, n: null, l: null, ap: 'x', h: false });

  const complete = s.r !== null && s.e !== null && s.n !== null && s.l !== null;
  const total = (s.r ?? 0) + (s.e ?? 0) + (s.n ?? 0) + (s.l ?? 0);
  const result = complete ? band(total) : null;

  return (
    <CalcCard
      title="R.E.N.A.L. Nephrometry"
      subtitle="Anatomic complexity for nephron-sparing surgery planning"
      citation={CITATIONS.renal}
    >
      <SegmentedField<Score>
        label="R — Maximal tumour diameter"
        value={s.r}
        onChange={(r) => setS((p) => ({ ...p, r }))}
        options={opts<Score>([[1, '≤ 4 cm'], [2, '4 – 7 cm'], [3, '≥ 7 cm']])}
      />
      <SegmentedField<Score>
        label="E — Exophytic / endophytic properties"
        value={s.e}
        onChange={(e) => setS((p) => ({ ...p, e }))}
        options={opts<Score>([[1, '≥ 50% exophytic'], [2, '< 50% exophytic'], [3, 'Entirely endophytic']])}
      />
      <SegmentedField<Score>
        label="N — Nearness to collecting system or sinus"
        value={s.n}
        onChange={(n) => setS((p) => ({ ...p, n }))}
        options={opts<Score>([[1, '≥ 7 mm'], [2, '4 – 7 mm'], [3, '≤ 4 mm']])}
      />
      <SegmentedField<Ap>
        label="A — Anterior / posterior (descriptor, no points)"
        value={s.ap}
        onChange={(ap) => setS((p) => ({ ...p, ap }))}
        options={opts<Ap>([['a', 'Anterior (a)'], ['p', 'Posterior (p)'], ['x', 'Indeterminate (x)']])}
      />
      <SegmentedField<Score>
        label="L — Location relative to polar lines"
        value={s.l}
        onChange={(l) => setS((p) => ({ ...p, l }))}
        options={opts<Score>([
          [1, 'Entirely above or below'],
          [2, 'Crosses polar line'],
          [3, '>50% across / crosses midline / between lines'],
        ])}
      />
      <SegmentedField<'no' | 'yes'>
        label="Hilar — touches main renal artery or vein"
        value={s.h ? 'yes' : 'no'}
        onChange={(v) => setS((p) => ({ ...p, h: v === 'yes' }))}
        options={opts<'no' | 'yes'>([['no', 'No'], ['yes', 'Yes (h)']])}
      />

      <ResultRow
        score={result ? `${total}${s.ap}${s.h ? 'h' : ''}` : '—'}
        band={result?.band}
        caption={result ? result.label : 'Select all five scored components'}
      />
    </CalcCard>
  );
}
