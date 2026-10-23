import { useState } from 'react';
import { CalcCard, NumberField, ResultRow, SegmentedField } from './primitives';
import { CitationNote } from '@/components/CitationNote';
import { CITATIONS } from '@/data/citations';
import {
  DEFAULT_ALBUMIN_G_L,
  calculateFreeT,
  ngDlToNmolL,
} from '@/lib/freeTestosterone';

type TotalUnit = 'nmol' | 'ngdl';

const fmt = (n: number, dp = 2) => n.toFixed(dp);

/**
 * Calculated free and bioavailable testosterone (Vermeulen 1999).
 * Deliberately reports no free-T cut-off: the AUA guideline declines to
 * endorse one, noting published thresholds span 4.6-7.0 ng/dL.
 */
export function FreeTestosterone() {
  const [unit, setUnit] = useState<TotalUnit>('nmol');
  const [total, setTotal] = useState('');
  const [shbg, setShbg] = useState('');
  const [albumin, setAlbumin] = useState('');

  const rawTotal = Number.parseFloat(total);
  const totalNmol = unit === 'ngdl' ? ngDlToNmolL(rawTotal) : rawTotal;
  const albuminGL = albumin.trim() ? Number.parseFloat(albumin) : DEFAULT_ALBUMIN_G_L;

  const result = calculateFreeT({
    totalT: totalNmol,
    shbg: Number.parseFloat(shbg),
    albuminGL,
  });

  return (
    <CalcCard
      title="Free & bioavailable testosterone"
      subtitle="Vermeulen calculation from total testosterone, SHBG and albumin"
      citation={CITATIONS.vermeulen}
    >
      <SegmentedField<TotalUnit>
        label="Total testosterone — units"
        value={unit}
        onChange={setUnit}
        options={[
          { value: 'nmol', label: 'nmol/L' },
          { value: 'ngdl', label: 'ng/dL' },
        ]}
      />

      <NumberField
        label="Total testosterone"
        value={total}
        onChange={setTotal}
        unit={unit === 'nmol' ? 'nmol/L' : 'ng/dL'}
        placeholder={unit === 'nmol' ? 'e.g. 20' : 'e.g. 577'}
        step="0.1"
        min="0"
      />
      <NumberField
        label="SHBG"
        value={shbg}
        onChange={setShbg}
        unit="nmol/L"
        placeholder="e.g. 30"
        step="0.1"
        min="0"
      />
      <NumberField
        label="Albumin (optional)"
        value={albumin}
        onChange={setAlbumin}
        unit="g/L"
        placeholder={`default ${DEFAULT_ALBUMIN_G_L}`}
        step="0.1"
        min="0"
      />

      {result ? (
        <>
          <ResultRow
            score={fmt(result.freeTPmol, 0)}
            caption={
              <>
                pmol/L free testosterone — {fmt(result.freeT, 3)} nmol/L,{' '}
                {fmt(result.freePercent, 2)}% of total
              </>
            }
          />
          <ResultRow
            score={fmt(result.bioavailableT, 2)}
            caption={
              <>
                nmol/L bioavailable (free + albumin-bound) —{' '}
                {fmt(result.bioavailablePercent, 1)}% of total
              </>
            }
          />
        </>
      ) : (
        <ResultRow score="—" caption="Enter total testosterone and SHBG." />
      )}

      <p className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        <span className="font-semibold text-amber">No free-T threshold is offered.</span> The AUA
        guideline declines to endorse one, noting published cut-offs range 4.6–7.0 ng/dL across
        studies. It sets the diagnostic line at a <span className="text-ink">total</span>{' '}
        testosterone below 300 ng/dL (≈10.4 nmol/L), and only alongside symptoms.
      </p>

      <p className="mt-2 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[12px] text-muted-2">
        Diagnosis needs <span className="text-ink">two</span> total testosterone measurements on
        separate occasions, both drawn in the early morning — the AUA's strongest recommendation
        here (Grade A).
      </p>

      <p className="mt-2 rounded-[10px] border border-crimson/40 bg-crimson/[0.08] px-3 py-2.5 text-[12px] text-crimson">
        Not valid in pregnancy. Oestradiol occupies much of the SHBG binding capacity, so
        immunoassayed SHBG overstates it and the calculated free T reads falsely low.
      </p>

      <p className="mt-2 text-[12px] text-muted-2">
        Why calculate at all: total testosterone tracks the binding proteins, so it misleads when
        SHBG is abnormal — low in obesity and diabetes, high with ageing and liver disease. The
        free androgen index is not a substitute; Vermeulen found its ratio to measured free T
        varies with SHBG itself.
      </p>

      <CitationNote citation={CITATIONS.auaTestosterone} />
    </CalcCard>
  );
}
