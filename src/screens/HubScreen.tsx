import type { Screen } from '@/navigation';

interface HubItem {
  id: Screen;
  label: string;
  note: string;
}

/** A grouping screen that lists its member workspaces as tappable cards. */
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
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            {eyebrow}
          </div>
          <h2 className="font-display text-[28px] font-semibold">{title}</h2>
          <p className="mt-3 text-[14px] text-muted">{blurb}</p>
        </header>

        <section className="rounded-[16px] border border-line bg-navy-2 p-2">
          {items.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onNavigate(w.id)}
              className="flex min-h-[44px] w-full items-center justify-between rounded-[12px] px-3 py-3 text-left transition-colors hover:bg-steel"
            >
              <span className="text-[14px] font-semibold">{w.label}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-violet-soft">
                {w.note}
              </span>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}

const CLINICAL_ITEMS: HubItem[] = [
  { id: 'calculators', label: 'Calculators', note: 'Nomograms · risk' },
  { id: 'imaging', label: 'Imaging', note: 'PI-RADS · Bosniak' },
  { id: 'drugs', label: 'Drug interactions', note: 'Pharmacology' },
  { id: 'surveillance', label: 'Surveillance schedule', note: 'Follow-up' },
  { id: 'pediatrics', label: 'Pediatrics', note: 'Dosing · fluids' },
];

const ACADEMIC_ITEMS: HubItem[] = [
  { id: 'guidelines', label: 'Guidelines', note: 'AUA · EAU' },
  { id: 'articles', label: 'Weekly reads', note: 'PubMed Central' },
  { id: 'conferences', label: 'Conferences', note: 'Dates · calendar' },
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
