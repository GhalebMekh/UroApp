import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField, type RiskBand } from './primitives';
import { CITATIONS } from '@/data/citations';
import { gleasonToGradeGroup, type GleasonPattern } from '@/lib/isupGradeGroup';

const PATTERN_OPTIONS: { value: GleasonPattern; label: string }[] = [
  { value: 3, label: 'Pattern 3' },
  { value: 4, label: 'Pattern 4' },
  { value: 5, label: 'Pattern 5' },
];

function bandFor(gg: 1 | 2 | 3 | 4 | 5): RiskBand {
  if (gg <= 1) return 'low';
  if (gg <= 3) return 'moderate';
  return 'high';
}

/** Gleason pattern -> ISUP/WHO Grade Group converter (Epstein et al. 2016). */
export function IsupGradeGroupConverter() {
  const [primary, setPrimary] = useState<GleasonPattern | null>(null);
  const [secondary, setSecondary] = useState<GleasonPattern | null>(null);

  const result = primary !== null && secondary !== null ? gleasonToGradeGroup(primary, secondary) : null;

  return (
    <CalcCard
      title="ISUP Grade Group"
      subtitle="Gleason pattern → WHO/ISUP Grade Group (1–5)"
      citation={CITATIONS.isupGradeGroup}
    >
      <SegmentedField<GleasonPattern>
        label="Primary (most extensive) pattern"
        value={primary}
        onChange={setPrimary}
        options={PATTERN_OPTIONS}
      />
      <SegmentedField<GleasonPattern>
        label="Secondary pattern"
        value={secondary}
        onChange={setSecondary}
        options={PATTERN_OPTIONS}
      />

      <ResultRow
        score={result ? `GG${result.gradeGroup}` : '—'}
        band={result ? bandFor(result.gradeGroup) : undefined}
        caption={result ? `Gleason ${primary}+${secondary} = ${result.gleasonScore}` : 'Select the primary and secondary pattern'}
      />

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Modern reporting uses patterns 3–5 only. Note 3+4 (GG2) and 4+3 (GG3) share a Gleason score
        of 7 but differ in Grade Group and prognosis.
      </p>
    </CalcCard>
  );
}
