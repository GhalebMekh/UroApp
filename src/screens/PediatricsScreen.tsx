import type { ReactNode } from 'react';
import { PediatricFluids } from '@/components/calculators/PediatricFluids';
import { PediatricAntibiotics } from '@/components/pediatrics/PediatricAntibiotics';
import { SfuHydronephrosis } from '@/components/pediatrics/SfuHydronephrosis';
import { UtiWorkup } from '@/components/pediatrics/UtiWorkup';
import { VurGrading } from '@/components/pediatrics/VurGrading';
import { UtdClassification } from '@/components/pediatrics/UtdClassification';
import { HydroUpjPuv } from '@/components/pediatrics/HydroUpjPuv';
import { VoidingDysfunctionKit } from '@/components/pediatrics/VoidingDysfunctionKit';
import { EnuresisPathway } from '@/components/pediatrics/EnuresisPathway';
import { UdtPathway } from '@/components/pediatrics/UdtPathway';
import { GmsScore } from '@/components/pediatrics/GmsScore';
import { ScrotalPain } from '@/components/pediatrics/ScrotalPain';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h3 className="mb-4 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">{children}</div>
    </section>
  );
}

/** Pediatric urology — grading, pathways and ward essentials. */
export function PediatricsScreen() {
  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
        Pediatrics
      </div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        Pediatric urology.
      </h2>
      <p className="max-w-xl text-[16.5px] text-muted">
        Hydronephrosis and reflux grading, bladder and bowel dysfunction, the undescended testis,
        hypospadias, the acute scrotum, and weight-based ward essentials.
      </p>

      <Section title="Hydronephrosis & reflux">
        <UtdClassification />
        <HydroUpjPuv />
        <SfuHydronephrosis />
        <VurGrading />
      </Section>

      <Section title="Bladder, bowel & infection">
        <VoidingDysfunctionKit />
        <EnuresisPathway />
        <UtiWorkup />
      </Section>

      <Section title="Genitalia">
        <ScrotalPain />
        <UdtPathway />
        <GmsScore />
      </Section>

      <Section title="Ward essentials">
        <PediatricFluids />
        <PediatricAntibiotics />
      </Section>
    </div>
  );
}
