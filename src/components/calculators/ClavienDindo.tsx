import { useState } from 'react';
import { CalcCard, ResultRow, SegmentedField } from './primitives';
import { CITATIONS } from '@/data/citations';
import { CD_DEFINITION, cdBand, cdLabel, gradeFromAnswers } from '@/lib/clavienDindo';

type YN = 'no' | 'yes';
const YES_NO = [
  { value: 'no' as const, label: 'No' },
  { value: 'yes' as const, label: 'Yes' },
];

/** Clavien–Dindo complication grade — asked from most to least severe. */
export function ClavienDindo() {
  const [died, setDied] = useState<YN | null>(null);
  const [icu, setIcu] = useState<YN | null>(null);
  const [multi, setMulti] = useState<YN | null>(null);
  const [intervention, setIntervention] = useState<YN | null>(null);
  const [ga, setGa] = useState<YN | null>(null);
  const [drugs, setDrugs] = useState<YN | null>(null);
  const [disability, setDisability] = useState<YN>('no');

  // Each question only appears once the more severe one above it is answered "no".
  const showIcu = died === 'no';
  const showMulti = showIcu && icu === 'yes';
  const showIntervention = showIcu && icu === 'no';
  const showGa = showIntervention && intervention === 'yes';
  const showDrugs = showIntervention && intervention === 'no';

  const complete =
    died === 'yes' ||
    (icu === 'yes' && multi !== null) ||
    (intervention === 'yes' && ga !== null) ||
    drugs !== null;

  const grade = complete
    ? gradeFromAnswers({
        died: died === 'yes',
        icu: icu === 'yes',
        multiOrgan: multi === 'yes',
        intervention: intervention === 'yes',
        generalAnaesthesia: ga === 'yes',
        otherDrugs: drugs === 'yes',
      })
    : null;

  return (
    <CalcCard
      title="Clavien–Dindo grade"
      subtitle="Surgical complication graded by the treatment it needed"
      citation={CITATIONS.clavienDindo}
    >
      <SegmentedField<YN> label="Did the patient die from the complication?" value={died} onChange={setDied} options={YES_NO} />
      {showIcu && (
        <SegmentedField<YN>
          label="Life-threatening and managed in IC/ICU? (includes stroke, brain or subarachnoid haemorrhage — not TIA)"
          value={icu}
          onChange={setIcu}
          options={YES_NO}
        />
      )}
      {showMulti && (
        <SegmentedField<YN> label="More than one organ failing?" value={multi} onChange={setMulti} options={YES_NO} />
      )}
      {showIntervention && (
        <SegmentedField<YN>
          label="Needed a surgical, endoscopic or radiological intervention?"
          value={intervention}
          onChange={setIntervention}
          options={YES_NO}
        />
      )}
      {showGa && (
        <SegmentedField<YN> label="Under general anaesthesia?" value={ga} onChange={setGa} options={YES_NO} />
      )}
      {showDrugs && (
        <SegmentedField<YN>
          label="Needed drugs beyond antiemetics, antipyretics, analgesics, diuretics, electrolytes or physiotherapy — or a transfusion or TPN?"
          value={drugs}
          onChange={setDrugs}
          options={YES_NO}
        />
      )}
      {grade && grade !== 'V' && (
        <SegmentedField<YN>
          label="Still present at discharge? (adds the “d” suffix — needs follow-up)"
          value={disability}
          onChange={setDisability}
          options={YES_NO}
        />
      )}

      <ResultRow
        score={grade ? cdLabel(grade, disability === 'yes' && grade !== 'V') : '—'}
        band={grade ? cdBand(grade) : undefined}
        caption={grade ? CD_DEFINITION[grade] : 'Answer from the top — the most severe treatment needed sets the grade.'}
      />

      <p className="mt-3 text-[12px] text-muted-2">
        Grades the treatment a complication needed, not how severe it felt. Does not cover
        intraoperative complications and may not suit paediatric urology.
      </p>
    </CalcCard>
  );
}
