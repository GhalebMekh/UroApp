import { Section } from './section';
import { FEATURES, type FeatureTag } from '@/data/marketing';

function Tag({ tag }: { tag: Exclude<FeatureTag, null> }) {
  const styles =
    tag === 'pro'
      ? 'bg-violet/[0.18] text-violet-soft'
      : 'bg-amber/[0.16] text-amber';
  return (
    <span className={`absolute right-4 top-4 rounded-[6px] px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.05em] ${styles}`}>
      {tag}
    </span>
  );
}

/** "The Suite" feature grid. */
export function Suite() {
  return (
    <Section
      id="features"
      eyebrow="The Suite"
      title="Tools that think like a urologist."
      lede="Each one encodes real guideline logic and colour-coded risk — teal for low, amber for moderate, crimson for high — and every clinical value links to its source."
    >
      <div className="mt-12 grid grid-cols-1 gap-[18px] md:grid-cols-3">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className="relative overflow-hidden rounded-card border border-line bg-navy-2 p-[26px] transition hover:-translate-y-[3px] hover:border-violet/50"
          >
            {f.tag && <Tag tag={f.tag} />}
            <div className="mb-4 grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-steel text-[20px]">
              {f.icon}
            </div>
            <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.01em]">{f.title}</h3>
            <p className="text-[14px] text-muted">{f.blurb}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
