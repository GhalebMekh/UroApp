import { useState } from 'react';
import { CalcCard, NumberField, ResultRow } from './primitives';
import { CITATIONS } from '@/data/citations';
import { bolusVolume, maintenanceFluids } from '@/lib/pediatricFluids';

/** Paediatric maintenance IV fluids (Holliday-Segar) + resuscitation bolus helper. */
export function PediatricFluids() {
  const [weight, setWeight] = useState('');
  const w = parseFloat(weight);
  const maint = maintenanceFluids(w);
  const bolus10 = bolusVolume(w, 10);
  const bolus20 = bolusVolume(w, 20);

  return (
    <CalcCard
      title="Paediatric maintenance fluids"
      subtitle="Holliday-Segar (4-2-1) maintenance + resuscitation bolus by weight"
      citation={CITATIONS.hollidaySegar}
    >
      <NumberField label="Weight" value={weight} onChange={setWeight} unit="kg" step="0.5" min="0" placeholder="e.g. 14" />

      <div className="mt-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-2">
        Maintenance
      </div>
      <ResultRow
        score={maint ? Math.round(maint.perHour) : '—'}
        band={maint ? 'low' : undefined}
        caption={maint ? `mL/hr  ·  ${Math.round(maint.perDay)} mL/day` : 'Enter the child’s weight'}
      />

      {maint && (
        <div className="mt-3 rounded-[10px] border border-line bg-navy px-3 py-2.5 text-[13px] text-muted">
          <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-2">
            Resuscitation bolus
          </div>
          <span className="font-mono text-ink">{Math.round(bolus10!)} mL</span> (10 mL/kg) ·{' '}
          <span className="font-mono text-ink">{Math.round(bolus20!)} mL</span> (20 mL/kg) isotonic
          crystalloid — give per your local APLS/PALS protocol and clinical context.
        </div>
      )}

      <p className="mt-3 text-[12px] text-amber">
        Maintenance only. Adjust for dehydration, losses, cardiac/renal status and electrolytes.
        Not a substitute for a paediatric prescribing reference.
      </p>
    </CalcCard>
  );
}
