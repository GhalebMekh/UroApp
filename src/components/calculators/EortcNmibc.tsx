import { useState } from 'react';
import { CalcCard, ResultRow, SelectField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';

// EORTC weights (Sylvester 2006): each option carries recurrence + progression points.
interface Opt {
  value: string;
  label: string;
  rec: number;
  prog: number;
}
interface Field {
  key: string;
  label: string;
  options: Opt[];
}

const FIELDS: Field[] = [
  {
    key: 'tumors',
    label: 'Number of tumours',
    options: [
      { value: 'single', label: 'Single', rec: 0, prog: 0 },
      { value: '2to7', label: '2–7', rec: 3, prog: 3 },
      { value: '8plus', label: '≥ 8', rec: 6, prog: 3 },
    ],
  },
  {
    key: 'size',
    label: 'Tumour diameter',
    options: [
      { value: 'lt3', label: '< 3 cm', rec: 0, prog: 0 },
      { value: 'ge3', label: '≥ 3 cm', rec: 3, prog: 3 },
    ],
  },
  {
    key: 'prior',
    label: 'Prior recurrence rate',
    options: [
      { value: 'primary', label: 'Primary (first occurrence)', rec: 0, prog: 0 },
      { value: 'le1', label: '≤ 1 / year', rec: 2, prog: 2 },
      { value: 'gt1', label: '> 1 / year', rec: 4, prog: 2 },
    ],
  },
  {
    key: 't',
    label: 'T category',
    options: [
      { value: 'Ta', label: 'Ta', rec: 0, prog: 0 },
      { value: 'T1', label: 'T1', rec: 1, prog: 4 },
    ],
  },
  {
    key: 'cis',
    label: 'Concomitant CIS',
    options: [
      { value: 'no', label: 'No', rec: 0, prog: 0 },
      { value: 'yes', label: 'Yes', rec: 1, prog: 6 },
    ],
  },
  {
    key: 'grade',
    label: 'Grade (1973 WHO)',
    options: [
      { value: 'g1', label: 'G1', rec: 0, prog: 0 },
      { value: 'g2', label: 'G2', rec: 1, prog: 0 },
      { value: 'g3', label: 'G3', rec: 2, prog: 5 },
    ],
  },
];

interface Bucket {
  max: number;
  band: RiskBand;
  oneYr: string;
  fiveYr: string;
}

// Recurrence buckets (score 0–17) and progression buckets (0–23) → 1-yr / 5-yr risk.
const REC_BUCKETS: Bucket[] = [
  { max: 0, band: 'low', oneYr: '15%', fiveYr: '31%' },
  { max: 4, band: 'moderate', oneYr: '24%', fiveYr: '46%' },
  { max: 9, band: 'moderate', oneYr: '38%', fiveYr: '62%' },
  { max: 17, band: 'high', oneYr: '61%', fiveYr: '78%' },
];
const PROG_BUCKETS: Bucket[] = [
  { max: 0, band: 'low', oneYr: '0.2%', fiveYr: '0.8%' },
  { max: 6, band: 'low', oneYr: '1%', fiveYr: '6%' },
  { max: 13, band: 'moderate', oneYr: '5%', fiveYr: '17%' },
  { max: 23, band: 'high', oneYr: '17%', fiveYr: '45%' },
];

function bucketFor(score: number, buckets: Bucket[]): Bucket {
  return buckets.find((b) => score <= b.max) ?? buckets[buckets.length - 1]!;
}

/** EORTC NMIBC recurrence & progression risk (Sylvester 2006). */
export function EortcNmibc() {
  const [sel, setSel] = useState<Record<string, string>>({});

  const complete = FIELDS.every((f) => sel[f.key]);
  const totals = FIELDS.reduce(
    (acc, f) => {
      const opt = f.options.find((o) => o.value === sel[f.key]);
      if (opt) {
        acc.rec += opt.rec;
        acc.prog += opt.prog;
      }
      return acc;
    },
    { rec: 0, prog: 0 },
  );

  const rec = complete ? bucketFor(totals.rec, REC_BUCKETS) : null;
  const prog = complete ? bucketFor(totals.prog, PROG_BUCKETS) : null;

  return (
    <CalcCard
      title="EORTC NMIBC risk"
      subtitle="Recurrence & progression risk for Ta/T1 bladder cancer after TURBT"
      citation={CITATIONS.eortcNmibc}
    >
      {FIELDS.map((f) => (
        <SelectField
          key={f.key}
          label={f.label}
          value={sel[f.key] ?? ''}
          onChange={(v) => setSel((p) => ({ ...p, [f.key]: v }))}
        >
          <option value="">Select…</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>
      ))}

      <div className="mt-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-2">
        Recurrence
      </div>
      <ResultRow
        score={rec ? totals.rec : '—'}
        band={rec?.band}
        caption={rec ? `1-yr / 5-yr: ${rec.oneYr} / ${rec.fiveYr} (score 0–17)` : 'Select all six factors'}
      />

      <div className="mt-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-2">
        Progression
      </div>
      <ResultRow
        score={prog ? totals.prog : '—'}
        band={prog?.band}
        caption={prog ? `1-yr / 5-yr: ${prog.oneYr} / ${prog.fiveYr} (score 0–23)` : 'Select all six factors'}
      />
    </CalcCard>
  );
}
