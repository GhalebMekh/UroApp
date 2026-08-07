import { useState } from 'react';
import {
  GUIDELINES,
  guidelineCategory,
  type Guideline,
  type GuidelineCategory,
} from '@/data/guidelines';
import { cn } from '@/lib/cn';

const GROUPS: { category: GuidelineCategory; label: string; blurb: string; accent: string }[] = [
  {
    category: 'oncological',
    label: 'Oncological',
    blurb: 'Cancer diagnosis, staging, treatment and surveillance pathways.',
    accent: 'text-violet-soft',
  },
  {
    category: 'non-oncological',
    label: 'Non-oncological',
    blurb: 'Benign, functional, reconstructive and andrology pathways.',
    accent: 'text-teal',
  },
];

/** One expandable guideline card with its society links and bundled PDFs. */
function GuidelineCard({
  guideline,
  expanded,
  onToggle,
}: {
  guideline: Guideline;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-navy-2">
      {/* Card header / quick algorithm */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-5 text-left transition-colors hover:bg-steel"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-[16px] font-semibold">{guideline.title}</h3>
            <p className="mt-1 text-[13px] text-muted">{guideline.condition}</p>
          </div>
          <div className="flex-shrink-0 text-violet-soft">{expanded ? '−' : '+'}</div>
        </div>
      </button>

      {/* Quick algorithm (visible when collapsed) */}
      {!expanded && (
        <div className="border-t border-line px-6 py-4">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-muted">
            {guideline.quickAlgorithm.trim()}
          </p>
        </div>
      )}

      {/* Source links: AUA / EAU guideline pages + bundled PDFs.
          Grouped by society — link then its offline PDF. */}
      {(guideline.auaUrl || guideline.eauUrl || guideline.pdfUrl || guideline.eauPdfUrl) && (
        <div className="flex flex-wrap gap-2 border-t border-line px-6 py-3">
          {guideline.auaUrl && (
            <a
              href={guideline.auaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-line bg-navy px-3 py-1.5 text-[12px] font-semibold text-violet-soft transition-colors hover:border-violet"
            >
              AUA guideline ↗
            </a>
          )}
          {guideline.pdfUrl && (
            <a
              href={guideline.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-line bg-navy px-3 py-1.5 text-[12px] font-semibold text-teal transition-colors hover:border-teal"
            >
              📄 AUA PDF
            </a>
          )}
          {guideline.eauUrl && (
            <a
              href={guideline.eauUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-line bg-navy px-3 py-1.5 text-[12px] font-semibold text-amber transition-colors hover:border-amber"
            >
              EAU guideline ↗
            </a>
          )}
          {guideline.eauPdfUrl && (
            <a
              href={guideline.eauPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-line bg-navy px-3 py-1.5 text-[12px] font-semibold text-teal transition-colors hover:border-teal"
            >
              📄 EAU PDF
            </a>
          )}
        </div>
      )}

      {/* Detailed sections (expandable) */}
      {expanded && (
        <div className="border-t border-line">
          {guideline.sections.map((section, sectionIdx) => (
            <div
              key={section.title}
              className={cn(
                'px-6 py-5',
                sectionIdx < guideline.sections.length - 1 && 'border-b border-line',
              )}
            >
              <h4 className="mb-4 text-[14px] font-semibold uppercase tracking-[0.05em] text-violet-soft">
                {section.title}
              </h4>
              <div className="space-y-4">
                {section.steps.map((step) => (
                  <div key={step.label} className="space-y-1.5">
                    <div className="text-[13px] font-semibold text-ink">{step.label}</div>
                    <p className="text-[13px] leading-relaxed text-muted">{step.description}</p>
                    {step.source && (
                      <a
                        href={step.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-[12px] font-semibold text-violet transition-colors hover:text-violet-soft"
                      >
                        {step.source.label} ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GuidelinesScreen() {
  const [category, setCategory] = useState<GuidelineCategory>('oncological');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggleGuideline(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const group = GROUPS.find((g) => g.category === category)!;
  const entries = GUIDELINES.filter((g) => guidelineCategory(g) === category);

  return (
    <div className="mx-auto max-w-wrap px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-soft">
            Clinical algorithms
          </div>
          <h2 className="font-display text-[28px] font-semibold">Guidelines</h2>
          <p className="mt-3 text-[14px] text-muted">
            Diagnostic and management algorithms summarized from AUA and EAU guidelines.
            Quick algorithms for rapid review; tap to expand for detailed workup steps.
          </p>
        </header>

        {/* Category toggle — both on one line; tap to reveal that group's guidelines. */}
        <div className="grid max-w-md grid-cols-2 gap-1.5 rounded-[12px] border border-line bg-navy p-1">
          {GROUPS.map((g) => {
            const active = g.category === category;
            const count = GUIDELINES.filter((x) => guidelineCategory(x) === g.category).length;
            return (
              <button
                key={g.category}
                type="button"
                onClick={() => setCategory(g.category)}
                aria-pressed={active}
                className={cn(
                  'min-h-[44px] rounded-[9px] px-3 py-2.5 text-[13px] font-semibold transition-colors',
                  active ? cn('bg-violet/[0.18]', g.accent) : 'text-muted hover:text-ink',
                )}
              >
                {g.label}
                <span className="ml-1.5 text-[11px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <p className="text-[13px] text-muted-2">{group.blurb}</p>

        <div className="space-y-4">
          {entries.map((guideline) => (
            <GuidelineCard
              key={guideline.id}
              guideline={guideline}
              expanded={!!expanded[guideline.id]}
              onToggle={() => toggleGuideline(guideline.id)}
            />
          ))}
        </div>

        {/* Footer note */}
        <div className="rounded-[12px] border border-line bg-navy px-5 py-4">
          <p className="text-[12px] text-muted">
            Every recommendation is sourced to primary literature (AUA/EAU guidelines, peer-reviewed
            trials). Guidelines are summaries; clinical context, local protocols, and patient
            preference always guide decision-making.
          </p>
        </div>
      </div>
    </div>
  );
}
