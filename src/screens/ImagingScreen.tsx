import { RadiologyReference } from '@/components/radiology/RadiologyReference';
import { PageBody, PageHero } from '@/components/PageHero';

/** Radiology reporting references — PI-RADS, Bosniak, VI-RADS (offline, Free). */
export function ImagingScreen() {
  return (
    <>
      <PageHero
        eyebrow="Imaging"
        title="Radiology references."
        lede="Category-by-category summaries of the structured reporting systems, each colour-coded by risk and linked to its primary source. Reference only — confirm against the full published system before reporting."
      />
      <PageBody>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <RadiologyReference />
        </div>
      </PageBody>
    </>
  );
}
