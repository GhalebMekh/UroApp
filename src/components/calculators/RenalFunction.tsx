import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CITATIONS, type Citation } from '@/data/citations';
import { CitationNote } from '@/components/CitationNote';
import { NumberField, ResultRow, SegmentedField } from './primitives';
import {
  ckdEpi2021,
  ckdStage,
  cockcroftGault,
  creatinineToMgDl,
  crclBand,
  type CrUnit,
  type Sex,
} from '@/lib/renalFunction';

type Tab = 'egfr' | 'crcl';

/** Renal function — eGFR (CKD-EPI 2021) and Cockcroft-Gault CrCl. */
export function RenalFunction() {
  const [tab, setTab] = useState<Tab>('egfr');
  // Shared inputs across both tabs.
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('');
  const [cr, setCr] = useState('');
  const [unit, setUnit] = useState<CrUnit>('mgdl');
  const [weight, setWeight] = useState('');

  const scrMgDl = creatinineToMgDl(parseFloat(cr), unit);
  const ageNum = parseFloat(age);

  return (
    <section className="rounded-[20px] border border-line bg-navy-2 p-6">
      <h3 className="font-display text-[21px] font-semibold">Renal function</h3>
      <p className="mb-4 text-[13px] text-muted-2">
        eGFR (CKD-EPI 2021) and creatinine clearance — for staging and drug dosing
      </p>

      <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-[12px] border border-line bg-navy p-1">
        {([['egfr', 'eGFR (CKD-EPI)'], ['crcl', 'CrCl (Cockcroft-Gault)']] as const).map(
          ([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'min-h-[44px] rounded-[9px] px-2 py-2 text-[12px] font-semibold transition-colors',
                tab === id ? 'bg-violet/[0.18] text-violet-soft' : 'text-muted hover:text-ink',
              )}
            >
              {label}
            </button>
          ),
        )}
      </div>

      <SegmentedField<Sex>
        label="Sex"
        value={sex}
        onChange={setSex}
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ]}
      />
      <NumberField label="Age" value={age} onChange={setAge} unit="years" step="1" min="0" placeholder="e.g. 64" />
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <NumberField
          label="Serum creatinine"
          value={cr}
          onChange={setCr}
          unit={unit === 'mgdl' ? 'mg/dL' : 'µmol/L'}
          step="0.01"
          min="0"
          placeholder={unit === 'mgdl' ? 'e.g. 1.1' : 'e.g. 97'}
        />
        <div className="mb-3.5">
          <SegmentedField<CrUnit>
            label="Unit"
            value={unit}
            onChange={setUnit}
            options={[
              { value: 'mgdl', label: 'mg/dL' },
              { value: 'umol', label: 'µmol/L' },
            ]}
          />
        </div>
      </div>

      {tab === 'egfr' ? (
        <EgfrResult scrMgDl={scrMgDl} age={ageNum} sex={sex} />
      ) : (
        <CrclResult scrMgDl={scrMgDl} age={ageNum} sex={sex} weight={weight} setWeight={setWeight} />
      )}
    </section>
  );
}

function Footer({ context, citations }: { context: string; citations: Citation[] }) {
  return (
    <>
      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted">
        {context}
      </p>
      {citations.map((c) => (
        <CitationNote key={c.url} citation={c} />
      ))}
    </>
  );
}

function EgfrResult({ scrMgDl, age, sex }: { scrMgDl: number; age: number; sex: Sex }) {
  const egfr = ckdEpi2021(scrMgDl, age, sex);
  const stage = egfr !== null ? ckdStage(egfr) : null;
  return (
    <>
      <ResultRow
        score={egfr !== null ? egfr.toFixed(0) : '—'}
        band={stage?.band}
        caption={
          stage ? `mL/min/1.73m² · ${stage.stage} — ${stage.label}` : 'Enter sex, age and creatinine'
        }
      />
      <Footer
        context="2021 race-free CKD-EPI creatinine equation; CKD G-stage thresholds per KDIGO."
        citations={[CITATIONS.ckdEpi, CITATIONS.kdigoCkd]}
      />
    </>
  );
}

function CrclResult({
  scrMgDl,
  age,
  sex,
  weight,
  setWeight,
}: {
  scrMgDl: number;
  age: number;
  sex: Sex;
  weight: string;
  setWeight: (v: string) => void;
}) {
  const crcl = cockcroftGault(scrMgDl, age, parseFloat(weight), sex);
  return (
    <>
      <NumberField label="Body weight" value={weight} onChange={setWeight} unit="kg" step="0.5" min="0" placeholder="e.g. 78" />
      <ResultRow
        score={crcl !== null ? crcl.toFixed(0) : '—'}
        band={crcl !== null ? crclBand(crcl) : undefined}
        caption={crcl !== null ? 'mL/min · guides renal drug dosing' : 'Enter sex, age, creatinine and weight'}
      />
      <Footer
        context="Cockcroft-Gault using actual body weight; many drug labels specify this estimate. Consider adjusted weight in obesity."
        citations={[CITATIONS.cockcroftGault]}
      />
    </>
  );
}
