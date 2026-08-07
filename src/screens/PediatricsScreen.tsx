import { PediatricFluids } from '@/components/calculators/PediatricFluids';
import { PediatricAntibiotics } from '@/components/pediatrics/PediatricAntibiotics';
import { SfuHydronephrosis } from '@/components/pediatrics/SfuHydronephrosis';
import { UtiWorkup } from '@/components/pediatrics/UtiWorkup';

/** Pediatric essentials — fluids, dosing, hydronephrosis grading, UTI workup. */
export function PediatricsScreen() {
  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
        Pediatrics
      </div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        Pediatric essentials.
      </h2>
      <p className="max-w-xl text-[16.5px] text-muted">
        Weight-based fluids and dosing, SFU hydronephrosis grading, and the community-acquired UTI
        workup pathway.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PediatricFluids />
        <PediatricAntibiotics />
        <SfuHydronephrosis />
        <UtiWorkup />
      </div>
    </div>
  );
}
