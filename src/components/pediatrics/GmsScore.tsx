import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField } from '@/components/calculators/primitives';
import { CitationNote } from '@/components/CitationNote';
import { CITATIONS } from '@/data/citations';
import { GLANS, MEATUS, SEVERITY_BAND, SHAFT, gmsSeverity, gmsTotal, type GmsPoint } from '@/lib/gms';

const POINTS: GmsPoint[] = [1, 2, 3, 4];

function Component({
  label,
  table,
  value,
  onChange,
}: {
  label: string;
  table: Record<GmsPoint, string>;
  value: GmsPoint | null;
  onChange: (v: GmsPoint) => void;
}) {
  return (
    <div className="mb-1">
      <SegmentedField<GmsPoint>
        label={label}
        value={value}
        onChange={onChange}
        options={POINTS.map((p) => ({ value: p, label: String(p) }))}
      />
      <p className="-mt-2 mb-3.5 min-h-[18px] text-[12.5px] text-muted">{value ? table[value] : 'Tap 1–4'}</p>
    </div>
  );
}

/** GMS hypospadias score (Merriman 2013). */
export function GmsScore() {
  const [g, setG] = useState<GmsPoint | null>(null);
  const [m, setM] = useState<GmsPoint | null>(null);
  const [s, setS] = useState<GmsPoint | null>(null);

  const total = g && m && s ? gmsTotal(g, m, s) : null;
  const severity = total ? gmsSeverity(total) : null;

  return (
    <CalcCard
      title="GMS hypospadias score"
      subtitle="Glans, meatus and shaft, each 1–4 — scored in theatre"
      citation={CITATIONS.gms2013}
    >
      <Component label="G — glans and urethral plate" table={GLANS} value={g} onChange={setG} />
      <Component label="M — meatal position" table={MEATUS} value={m} onChange={setM} />
      <Component label="S — shaft curvature" table={SHAFT} value={s} onChange={setS} />

      {total && severity ? (
        <ResultRow
          score={total}
          band={SEVERITY_BAND[severity]}
          caption={`${severity[0]!.toUpperCase()}${severity.slice(1)} hypospadias (mild 3–6, moderate 7–9, severe 10–12).`}
        />
      ) : (
        <p className="text-[13px] text-muted-2">Score all three components.</p>
      )}

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        In the original series, complications followed 5.6% of repairs with GMS 6 or less and 25% of
        those above 6. Score after degloving in theatre: office examination underestimates curvature,
        and a distal-looking meatus can sit on hypoplastic tissue (Campbell ch 45).
      </p>
      <CitationNote citation={CITATIONS.gmsReview2026} />
      <CitationNote citation={CITATIONS.predictH2025} />
    </CalcCard>
  );
}
