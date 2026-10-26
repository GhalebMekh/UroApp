import type { ComponentType } from 'react';
import type { ScreenLink } from '@/navigation';
import { hasAccess, useEntitlements, TIER_LABEL } from '@/lib/entitlements';
import { FEATURE_TIER, PAYWALL_ENABLED, type GatedFeature } from '@/lib/featureTiers';
import {
  CalculatorIcon,
  CalendarIcon,
  ConsentIcon,
  DrugIcon,
  GuidelineIcon,
  ImagingIcon,
  ScalpelIcon,
  TrainingIcon,
} from '@/components/icons';
import { DashCard } from './DashCard';

interface Tile {
  label: string;
  Icon: ComponentType<{ className?: string }>;
  link: ScreenLink;
  /** Set for paid workspaces, so the tile can show its tier while locked. */
  feature?: GatedFeature;
}

const TILES: Tile[] = [
  { label: 'Calculators', Icon: CalculatorIcon, link: { screen: 'calculators' } },
  { label: 'Guidelines', Icon: GuidelineIcon, link: { screen: 'guidelines' } },
  { label: 'Procedures', Icon: ScalpelIcon, link: { residency: { section: 'or', orTab: 'procedures' } } },
  { label: 'Consent', Icon: ConsentIcon, link: { residency: { section: 'or', orTab: 'consent' } }, feature: 'consent' },
  { label: 'Imaging', Icon: ImagingIcon, link: { screen: 'imaging' } },
  { label: 'Drugs', Icon: DrugIcon, link: { screen: 'drugs' } },
  { label: 'Follow-up', Icon: CalendarIcon, link: { screen: 'surveillance' }, feature: 'surveillance' },
  { label: 'Rehearsal', Icon: TrainingIcon, link: { screen: 'rehearsal' }, feature: 'rehearsal' },
];

/** Launcher for the most-used workspaces: 4 per row on a phone, one row of 8 when wide. */
export function QuickAccess({ onOpenLink, className }: { onOpenLink: (link: ScreenLink) => void; className?: string }) {
  const { tier } = useEntitlements();

  return (
    <DashCard title="Quick access" className={className}>
      <div className="grid grid-cols-4 gap-1 md:grid-cols-8">
        {TILES.map(({ label, Icon, link, feature }) => {
          const required = feature ? FEATURE_TIER[feature] : null;
          const locked = PAYWALL_ENABLED && required !== null && !hasAccess(tier, required);
          return (
            <button
              key={label}
              type="button"
              onClick={() => onOpenLink(link)}
              className="group relative flex min-h-[44px] flex-col items-center gap-2 rounded-[12px] px-1 py-2.5 text-center transition-colors hover:bg-steel"
            >
              <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-line bg-navy text-[20px] text-violet-soft transition-colors group-hover:border-violet/60">
                <Icon />
              </span>
              <span className="text-[11.5px] font-semibold leading-tight text-muted transition-colors group-hover:text-ink">
                {label}
              </span>
              {locked && required && (
                <span className="absolute right-1 top-1 rounded-[5px] bg-violet/[0.18] px-1 py-px text-[9px] font-semibold uppercase tracking-[0.04em] text-violet-soft">
                  {TIER_LABEL[required]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </DashCard>
  );
}
