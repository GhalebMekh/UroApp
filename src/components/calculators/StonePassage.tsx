import { useState } from 'react';
import { CalcCard, ResultRow, SelectField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';

// Coll 2002 reports passage as a function of size AND, separately, location.
const SIZE = [
  { value: '1', label: '1 mm', rate: 87 },
  { value: '2-4', label: '2–4 mm', rate: 76 },
  { value: '5-7', label: '5–7 mm', rate: 60 },
  { value: '7-9', label: '7–9 mm', rate: 48 },
  { value: '9+', label: '> 9 mm', rate: 25 },
];
const LOCATION = [
  { value: 'proximal', label: 'Proximal ureter', rate: 48 },
  { value: 'mid', label: 'Mid ureter', rate: 60 },
  { value: 'distal', label: 'Distal ureter', rate: 75 },
  { value: 'uvj', label: 'Ureterovesical junction', rate: 79 },
];

function band(rate: number): RiskBand {
  if (rate >= 70) return 'low';
  if (rate >= 45) return 'moderate';
  return 'high';
}

/** Spontaneous ureteral stone passage probability (Coll 2002). */
export function StonePassage() {
  const [size, setSize] = useState('');
  const [loc, setLoc] = useState('');

  const sizeOpt = SIZE.find((o) => o.value === size);
  const locOpt = LOCATION.find((o) => o.value === loc);

  return (
    <CalcCard
      title="Ureteral stone passage"
      subtitle="Likelihood of spontaneous passage by stone width and location"
      citation={CITATIONS.stonePassage}
    >
      <SelectField label="Stone width (transverse)" value={size} onChange={setSize}>
        <option value="">Select…</option>
        {SIZE.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectField>
      <SelectField label="Stone location" value={loc} onChange={setLoc}>
        <option value="">Select…</option>
        {LOCATION.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectField>

      <div className="mt-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-2">By width</div>
      <ResultRow
        score={sizeOpt ? `${sizeOpt.rate}%` : '—'}
        band={sizeOpt ? band(sizeOpt.rate) : undefined}
        caption={sizeOpt ? 'spontaneous passage rate' : 'Select a stone width'}
      />

      <div className="mt-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-2">By location</div>
      <ResultRow
        score={locOpt ? `${locOpt.rate}%` : '—'}
        band={locOpt ? band(locOpt.rate) : undefined}
        caption={locOpt ? 'spontaneous passage rate' : 'Select a stone location'}
      />

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Width and location are reported as separate predictors in the source — interpret together.
        Smaller, more distal stones pass most often.
      </p>
    </CalcCard>
  );
}
