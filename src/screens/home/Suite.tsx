import type { ComponentType } from 'react';
import { Section } from './section';
import { FEATURES, type FeatureIcon, type FeatureTag } from '@/data/marketing';
import type { ScreenLink } from '@/navigation';
import {
  CalculatorIcon,
  CalendarIcon,
  ConsentIcon,
  DrugIcon,
  GuidelineIcon,
  ImagingIcon,
  OnCallIcon,
  ScalpelIcon,
  TrainingIcon,
} from '@/components/icons';

const ICON: Record<FeatureIcon, ComponentType<{ className?: string }>> = {
  calculator: CalculatorIcon,
  guideline: GuidelineIcon,
  calendar: CalendarIcon,
  scalpel: ScalpelIcon,
  consent: ConsentIcon,
  drug: DrugIcon,
  oncall: OnCallIcon,
  imaging: ImagingIcon,
  training: TrainingIcon,
};

function Tag({ tag }: { tag: Exclude<FeatureTag, null> }) {
  const styles =
    tag === 'pro'
      ? 'bg-violet/[0.18] text-violet-soft'
      : 'bg-amber/[0.16] text-amber';
  return (
    <span className={`absolute right-4 top-4 rounded-[6px] px-2 py-1 text-[12px] font-medium   ${styles}`}>
      {tag}
    </span>
  );
}

/** "The Suite" feature grid — each card opens its tool. */
export function Suite({ onOpenLink }: { onOpenLink: (link: ScreenLink) => void }) {
  return (
    <Section
      id="features"
      eyebrow="The Suite"
      title="Tools that think like a urologist"
      lede="Each one encodes real guideline logic and colour-coded risk (teal for low, amber for moderate, crimson for high), and every clinical value links to its source."
    >
      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = ICON[f.icon];
          return (
          <button
            key={f.title}
            type="button"
            onClick={() => onOpenLink(f.link)}
            className="group relative overflow-hidden rounded-card border border-line bg-navy-2 p-7 text-left transition hover:-translate-y-[3px] hover:border-violet/50 focus-visible:border-violet focus-visible:outline-none"
          >
            {f.tag && <Tag tag={f.tag} />}
            <div className="mb-4 grid h-[44px] w-[44px] place-items-center rounded-[10px] bg-steel text-[20px] text-violet-soft">
              <Icon />
            </div>
            <h3 className="mb-2 text-[16px] font-medium">{f.title}</h3>
            <p className="text-[14px] text-muted">{f.blurb}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-violet-soft">
              Open
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </button>
          );
        })}
      </div>
    </Section>
  );
}
