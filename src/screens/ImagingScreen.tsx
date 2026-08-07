import { RadiologyReference } from '@/components/radiology/RadiologyReference';

/** Radiology reporting references — PI-RADS, Bosniak, VI-RADS (offline, Free). */
export function ImagingScreen() {
  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
        Imaging
      </div>
      <h2 className="mb-4 font-display text-[clamp(28px,4vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em]">
        Radiology references.
      </h2>
      <p className="max-w-xl text-[16.5px] text-muted">
        Category-by-category summaries of the structured reporting systems, each
        colour-coded by risk and linked to its primary source. Reference only —
        confirm against the full published system before reporting.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RadiologyReference />
      </div>
    </div>
  );
}
