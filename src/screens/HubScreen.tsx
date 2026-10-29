import type { Screen } from '@/navigation';
import { PageBody, PageHero } from '@/components/PageHero';
import { ChevronRightIcon } from '@/components/icons';

interface HubItem {
  id: Screen;
  label: string;
  note: string;
}

/** A grouping screen that lists its member workspaces as tappable rows. */
function Hub({
  eyebrow,
  title,
  blurb,
  items,
  onNavigate,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  items: HubItem[];
  onNavigate: (s: Screen) => void;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lede={blurb} />
      <PageBody narrow>
        <section className="rounded-card border border-line bg-navy-2 p-1.5">
          {items.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onNavigate(w.id)}
              className="flex min-h-[52px] w-full items-center gap-3 rounded-[12px] px-3 py-3 text-left transition-colors hover:bg-steel"
            >
              <span className="flex-1 text-[14.5px] font-semibold">{w.label}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-violet-soft">{w.note}</span>
              <ChevronRightIcon className="shrink-0 text-[16px] text-muted-2" />
            </button>
          ))}
        </section>
      </PageBody>
    </>
  );
}

const CLINICAL_ITEMS: HubItem[] = [
  { id: 'calculators', label: 'Calculators', note: 'Nomograms · risk' },
  { id: 'imaging', label: 'Imaging', note: 'PI-RADS · Bosniak' },
  { id: 'instruments', label: 'Instruments', note: 'Scopes · lasers' },
  { id: 'mdt', label: 'MDT case sheets', note: 'Tumour board' },
  { id: 'drugs', label: 'Drug interactions', note: 'Pharmacology' },
  { id: 'surveillance', label: 'Surveillance schedule', note: 'Follow-up' },
  { id: 'pediatrics', label: 'Pediatrics', note: 'UTD · enuresis · scrotum' },
];

const ACADEMIC_ITEMS: HubItem[] = [
  { id: 'guidelines', label: 'Guidelines', note: 'AUA · EAU' },
  { id: 'articles', label: 'Weekly reads', note: 'PubMed · weekly' },
  { id: 'conferences', label: 'Conferences', note: 'Dates · calendar' },
  { id: 'cme', label: 'CME / CPD tracker', note: 'Hours · cycle' },
  { id: 'rehearsal', label: 'Operative rehearsal', note: 'Step drill' },
  { id: 'scenarios', label: 'Intra-op scenarios', note: 'Decision case' },
];

export function ClinicalHubScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <Hub
      eyebrow="Point of care"
      title="Clinical"
      blurb="Bedside decision tools — validated calculators, imaging references, drug-interaction checks, follow-up schedules and paediatric dosing."
      items={CLINICAL_ITEMS}
      onNavigate={onNavigate}
    />
  );
}

export function AcademicHubScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <Hub
      eyebrow="Learning & reference"
      title="Academic"
      blurb="Study, reference and training — AUA/EAU guidelines, upcoming conferences, and operative rehearsal and decision scenarios."
      items={ACADEMIC_ITEMS}
      onNavigate={onNavigate}
    />
  );
}
