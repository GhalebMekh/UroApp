import { useState } from 'react';
import { CalcCard, NumberField, SegmentedField } from '@/components/calculators/primitives';
import { CitationNote } from '@/components/CitationNote';
import { CITATIONS } from '@/data/citations';
import { cn } from '@/lib/cn';
import { udtPlan, type Palpability, type UdtInput, type UdtStep } from '@/lib/udt';

const TONE: Record<UdtStep['tone'], string> = {
  urgent: 'border-crimson/40 bg-crimson/[0.08] text-ink',
  action: 'border-violet/40 bg-violet/[0.08] text-ink',
  info: 'border-line bg-navy text-muted',
};

/** Undescended testis — the next step for one boy. */
export function UdtPathway() {
  const [age, setAge] = useState('');
  const [palpability, setPalpability] = useState<Palpability>('palpable');
  const [bilateral, setBilateral] = useState<'no' | 'yes'>('no');
  const [hypospadias, setHypospadias] = useState<UdtInput['hypospadias']>('none');
  const [acquired, setAcquired] = useState<'no' | 'yes'>('no');

  const months = Number.parseFloat(age);
  const valid = Number.isFinite(months) && months >= 0 && months <= 216;
  const steps = valid
    ? udtPlan({
        correctedAgeMonths: months,
        palpability,
        bilateral: bilateral === 'yes',
        hypospadias,
        acquired: acquired === 'yes',
      })
    : [];

  return (
    <CalcCard
      title="Undescended testis"
      subtitle="Next step by corrected age, palpability and associated findings"
      citation={CITATIONS.cwwUdt}
    >
      <NumberField label="Corrected age" value={age} onChange={setAge} unit="months" placeholder="corrected for prematurity" min="0" />
      <SegmentedField<Palpability>
        label="Testis"
        value={palpability}
        onChange={setPalpability}
        options={[
          { value: 'palpable', label: 'Palpable' },
          { value: 'nonpalpable', label: 'Nonpalpable' },
        ]}
      />
      <SegmentedField
        label="Both sides"
        value={bilateral}
        onChange={setBilateral}
        options={[
          { value: 'no' as const, label: 'Unilateral' },
          { value: 'yes' as const, label: 'Bilateral' },
        ]}
      />
      <SegmentedField<UdtInput['hypospadias']>
        label="Hypospadias"
        value={hypospadias}
        onChange={setHypospadias}
        options={[
          { value: 'none', label: 'None' },
          { value: 'distal', label: 'Distal' },
          { value: 'proximal', label: 'Proximal' },
        ]}
      />
      <SegmentedField
        label="Previously documented in the scrotum (acquired)"
        value={acquired}
        onChange={setAcquired}
        options={[
          { value: 'no' as const, label: 'No' },
          { value: 'yes' as const, label: 'Yes' },
        ]}
      />

      {valid ? (
        <ol className="mt-2 space-y-2">
          {steps.map((s) => (
            <li key={s.text} className={cn('rounded-[10px] border px-3 py-2.5 text-[13px]', TONE[s.tone])}>
              {s.text}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-[13px] text-muted-2">Enter the corrected age in months.</p>
      )}
      <p className="mt-3 text-[12px] text-muted-2">
        The full guideline summary is under Academic → Guidelines → Cryptorchidism.
      </p>
      <CitationNote citation={CITATIONS.auaCryptorchidism} />
    </CalcCard>
  );
}
